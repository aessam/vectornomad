# Lessons Learned

## 2026-10-10 Medium RSS: HEAD returns 403, GET returns 200
A `curl -I` on medium.com looked like a block. A GET with a browser user agent returns the feed. Check with the verb you will actually use.

## 2026-10-10 Medium feed content ends with a 1x1 tracking pixel and starts with the title
`content:encoded` has `<img src="https://medium.com/_/stat?...">` as its last image and `<h3>title</h3>` as its first element. Cover extraction skips `/_/stat` and width="1"; excerpt strips a leading title.

## 2026-10-10 Astro 7 defaults that matter here
`compressHTML` defaults to `'jsx'`, which removes whitespace between inline elements. Mixed-direction meta lines need the spaces, so it is set to `true`. The Rust compiler rejects unclosed tags, so every element is closed.

## 2026-10-10 Dates are formatted at build time in UTC
`fmtDate` runs in the Actions runner, so a post published late evening local time can show the next calendar day. Acceptable for now; pass a fixed `timeZone` to `Intl.DateTimeFormat` if it bothers you.

## 2026-10-11 YouTube feed endpoint returned 404 for every channel during the first deploy
`youtube.com/feeds/videos.xml?channel_id=…` worked at 14:00 and returned 404 for all channels at 18:30, locally and from Actions, regardless of headers. The channel page still advertised the same feed URL. Resolution: the fetch script retries once with a browser user agent, then falls back to the committed JSON snapshot with a GitHub `::warning` annotation. It exits non-zero only when there is no snapshot. The committed feed JSON is the checkpoint.

## 2026-10-11 First deploy: environment branch policy and Cloudflare proxy
1. The `github-pages` environment was created with a branch policy allowing only `development`, so the deploy job was rejected for `main`. Fix: add `main` to the environment's deployment branch policies (API: POST .../environments/github-pages/deployment-branch-policies).
2. With Cloudflare's proxy on, GitHub cannot verify the domain and serves its `*.github.io` wildcard for the hostname, which browsers flag as unsafe. Proxy off alone was not enough: GitHub's checker kept a stale "proxied" answer. Removing and re-adding the custom domain forced a fresh check; the certificate went authorization_pending → approved in under a minute and reached the edge a minute later. A CDN-cached 404 for `/` from the proxied window cleared on its own after max-age 600.

## 2026-10-12 Dev content store ignores a schema change
Adding `image` to the `ar` schema while `astro dev` was running left existing entries without the field. A restart did not help, and neither did re-saving the file: `.astro/data-store.json` kept the old parsed data. A production build re-synced and was correct. Fix in dev: remove `.astro/` and restart. The date shift (11th shown for a post dated the 12th) was build-machine timezone; `fmtDate` now formats in UTC.

## 2026-10-12 `astro preview` ignores SIGTERM and reparents to launchd
Backgrounded from a script, the preview server survived `kill`, `kill -- -pgid` and the script's exit, holding the port for the next run. Cleanup now sends TERM, waits half a second, then SIGKILLs whatever still listens on the port. Also: the astro binary is `node_modules/astro/bin/astro.mjs`, not `astro.js`.
