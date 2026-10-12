#!/usr/bin/env bash
# Prepare photos for the site: resize, convert to sRGB, strip every bit of metadata (EXIF incl. GPS,
# IPTC, ICC, thumbnails), then embed an XMP block naming VectorNomad.com as creator and rights holder.
#
#   scripts/prep-images.sh [--max 2000] [--quality 82] [--out DIR] [--keep-originals DIR] FILE...
#
# Default: writes <stem>.jpg next to the source (lowercase stem, dashes), moves the original to
# brand/photo-originals/ (gitignored) unless --keep-originals says otherwise. Fails loud per file.
set -euo pipefail
cd "$(dirname "$0")/.."

MAX=2000; QUALITY=82; OUT=""; ORIG="brand/photo-originals"
AUTHOR="VectorNomad.com"
SRGB="/System/Library/ColorSync/Profiles/sRGB Profile.icc"
files=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --max) MAX="$2"; shift 2 ;;
    --quality) QUALITY="$2"; shift 2 ;;
    --out) OUT="$2"; shift 2 ;;
    --keep-originals) ORIG="$2"; shift 2 ;;
    -h|--help) sed -n '2,9p' "$0"; exit 0 ;;
    *) files+=("$1"); shift ;;
  esac
done

# Gates
command -v magick >/dev/null || { echo "magick (ImageMagick 7) missing: brew install imagemagick" >&2; exit 1; }
[[ -f "$SRGB" ]] || { echo "sRGB profile not found at $SRGB" >&2; exit 1; }
[[ ${#files[@]} -gt 0 ]] || { echo "no files given" >&2; exit 2; }
for f in "${files[@]}"; do [[ -f "$f" ]] || { echo "not a file: $f" >&2; exit 1; }; done
mkdir -p "$ORIG"

xmp=$(mktemp -t author).xmp
cat > "$xmp" <<XMP
<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/">
<dc:creator><rdf:Seq><rdf:li>$AUTHOR</rdf:li></rdf:Seq></dc:creator>
<dc:rights><rdf:Alt><rdf:li xml:lang="x-default">© $AUTHOR</rdf:li></rdf:Alt></dc:rights>
<xmpRights:WebStatement>https://vectornomad.com</xmpRights:WebStatement>
</rdf:Description></rdf:RDF></x:xmpmeta>
<?xpacket end="w"?>
XMP
trap 'rm -f "$xmp"' EXIT

fail=0
for src in "${files[@]}"; do
  dir=$(dirname "$src"); base=$(basename "$src"); stem="${base%.*}"
  slug=$(printf '%s' "$stem" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')
  [[ -n "$slug" ]] || slug="image"
  outdir="${OUT:-$dir}"; mkdir -p "$outdir"
  out="$outdir/$slug.jpg"
  tmp=$(mktemp -t prep).jpg
  before=$(stat -f%z "$src")
  # Decoder chosen from the extension, never from content sniffing. Limits bound memory on a hostile file.
  case "${base##*.}" in
    jpg|jpeg|JPG|JPEG) coder=jpeg ;; png|PNG) coder=png ;; gif|GIF) coder=gif ;; webp|WEBP) coder=webp ;; avif|AVIF) coder=avif ;;
    heic|HEIC|heif|HEIF) coder=heic ;;
    *) echo "FAIL $src: unsupported extension" >&2; fail=1; continue ;;
  esac
  if ! magick -limit memory 1GiB -limit map 2GiB -limit area 256MP -limit width 20000 -limit height 20000 "$coder:$src" -auto-orient -profile "$SRGB" -resize "${MAX}x${MAX}>" -strip \
       -profile "xmp:$xmp" -set comment "© $AUTHOR" -quality "$QUALITY" -sampling-factor 4:2:0 -interlace JPEG "$tmp"; then
    echo "FAIL $src: magick error" >&2; fail=1; continue
  fi
  # Verify before anything is moved: no EXIF at all, author present.
  exif=$(magick identify -format '%[EXIF:*]' "$tmp" | wc -l | tr -d ' ')
  author=$(strings "$tmp" | grep -c "$AUTHOR" || true)
  if [[ "$exif" != "0" || "$author" -lt 2 ]]; then
    echo "FAIL $src: verification (exif lines=$exif, author hits=$author)" >&2; rm -f "$tmp"; fail=1; continue
  fi
  if [[ "$(cd "$dir" && pwd)/$base" != "$(cd "$outdir" && pwd)/$slug.jpg" ]]; then
    mv "$src" "$ORIG/$base"
  else
    cp "$src" "$ORIG/$base"
  fi
  mv "$tmp" "$out"
  after=$(stat -f%z "$out")
  printf '%s → %s  %s → %s  %s\n' "$base" "$(basename "$out")" "$((before/1024))KB" "$((after/1024))KB" "$(magick identify -format '%wx%h' "$out")"
done
[[ $fail -eq 0 ]] || { echo "some files failed" >&2; exit 1; }
