#!/usr/bin/env bash
# Publish from this machine: fetch feeds, build, commit the snapshot, push. CI only builds.
# Usage: scripts/publish.sh [-m "message"] [--no-push]
set -euo pipefail
cd "$(dirname "$0")/.."

msg="Update feeds $(date +%Y-%m-%d)"
push=1
while [[ $# -gt 0 ]]; do
  case "$1" in
    -m) msg="$2"; shift 2 ;;
    --no-push) push=0; shift ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

# Gate 1: environment
command -v node >/dev/null || { echo "node missing" >&2; exit 1; }
[[ -d node_modules ]] || { echo "run npm install first" >&2; exit 1; }
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "not a git repo" >&2; exit 1; }
branch=$(git rev-parse --abbrev-ref HEAD)
[[ "$branch" == "main" ]] || { echo "on '$branch', publish from main" >&2; exit 1; }

# Gate 2: nothing unrelated is half-done. Only the feed snapshot may be dirty.
dirty=$(git status --porcelain | grep -v '^.. src/data/feeds/' || true)
[[ -z "$dirty" ]] || { echo "uncommitted changes outside src/data/feeds, commit or stash them first:" >&2; echo "$dirty" >&2; exit 1; }

# Fetch. Loud on failure; a feed that fails keeps its committed snapshot (see fetch-feeds.mjs).
npm run --silent fetch

# Build locally before anything is pushed.
npm run --silent build >/dev/null
echo "build ok"

# Commit only if the snapshot changed.
if git diff --quiet -- src/data/feeds; then
  echo "feeds unchanged, nothing to publish"
  exit 0
fi
git --no-pager diff --stat -- src/data/feeds
git add src/data/feeds
git commit -q -m "$msg"
echo "committed: $msg"

if [[ $push -eq 1 ]]; then
  git push origin main
  echo "pushed. CI builds and deploys from the committed snapshot."
else
  echo "not pushed (--no-push)"
fi
