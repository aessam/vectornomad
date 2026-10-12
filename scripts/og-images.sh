#!/usr/bin/env bash
# Render social cards (1200x630 PNG) from the site's own /og/ pages with headless Chrome.
# Output: public/og/site.png and public/og/ar/<slug>.png. Commit them; CI does not render.
#   scripts/og-images.sh [--no-build]
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT=4399
build=1; [[ "${1:-}" == "--no-build" ]] && build=0

# Gates
[[ -x "$CHROME" ]] || { echo "Chrome not found at $CHROME" >&2; exit 1; }
[[ -d node_modules ]] || { echo "run npm install first" >&2; exit 1; }
if [[ $build -eq 1 ]]; then npm run --silent build >/dev/null || { echo "build failed" >&2; exit 1; }; fi
[[ -d dist/og ]] || { echo "dist/og missing, build first" >&2; exit 1; }
! lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1 || { echo "port $PORT busy" >&2; exit 1; }

npx --no-install astro preview --port $PORT --host 127.0.0.1 >/tmp/og-preview.log 2>&1 &
pid=$!
trap 'kill $pid 2>/dev/null || true' EXIT
for i in $(seq 1 40); do curl -s -o /dev/null "http://127.0.0.1:$PORT/og/site/" && break; sleep 0.25; done
curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/og/site/" | grep -q 200 || { echo "preview did not start" >&2; cat /tmp/og-preview.log >&2; exit 1; }

shot() { # route, out
  local tmp; tmp=$(mktemp -d)
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=1200,630 --virtual-time-budget=4000 --screenshot="$tmp/shot.png" \
    "http://127.0.0.1:$PORT$1" >/dev/null 2>&1 || { echo "FAIL $1" >&2; return 1; }
  local dims; dims=$(magick identify -format '%wx%h' "$tmp/shot.png")
  [[ "$dims" == "1200x630" ]] || { echo "FAIL $1: got $dims" >&2; return 1; }
  mkdir -p "$(dirname "$2")"
  if [[ "$2" == *.jpg ]]; then magick "$tmp/shot.png" -quality 86 -sampling-factor 4:2:0 -strip "$2"; rm "$tmp/shot.png"; else mv "$tmp/shot.png" "$2"; fi
  rmdir "$tmp"
  printf '%-48s → %s (%s)\n' "$1" "$2" "$(stat -f%z "$2" | awk '{printf "%d KB", $1/1024}')"
}

fail=0
shot /og/site/ public/og/site.png || fail=1
mkdir -p public/og/ar
# One card per published Arabic post; stale cards for deleted posts are removed.
find public/og/ar \( -name '*.png' -o -name '*.jpg' \) -delete 2>/dev/null || true
for f in src/content/ar/*.md; do
  [[ -f "$f" ]] || continue
  grep -q '^draft: true' "$f" && continue
  slug=$(basename "$f" .md)
  shot "/og/ar/$slug/" "public/og/ar/$slug.jpg" || fail=1
done
[[ $fail -eq 0 ]] || { echo "some cards failed" >&2; exit 1; }
