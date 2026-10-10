#!/usr/bin/env bash
# Smoke test the feed parser against saved feed XML files, without touching src/data.
# Usage: scripts/smoke-feeds.sh <dir with podcast.xml youtube.xml medium.xml>
set -euo pipefail
dir="${1:?usage: smoke-feeds.sh <dir>}"
for f in podcast.xml youtube.xml medium.xml; do
  [[ -s "$dir/$f" ]] || { echo "missing or empty: $dir/$f" >&2; exit 1; }
done
out="$(mktemp -d)"
FEED_PODCAST_URL="file:$dir/podcast.xml" \
FEED_YOUTUBE_URL="file:$dir/youtube.xml" \
FEED_MEDIUM_URL="file:$dir/medium.xml" \
node scripts/fetch-feeds.mjs --out "$out"
echo "--- first item of each ---"
for f in episodes videos articles; do
  echo "== $f ($(node -e "console.log(require('$out/$f.json').length)") items)"
  node -e "const a=require('$out/$f.json'); console.log(JSON.stringify(a[0], null, 2))"
done
echo "ok: $out"
