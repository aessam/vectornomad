# Lessons Learned

## 2026-10-10 Medium RSS: HEAD returns 403, GET returns 200
A `curl -I` on medium.com looked like a block. A GET with a browser user agent returns the feed. Check with the verb you will actually use.

## 2026-10-10 Medium feed content ends with a 1x1 tracking pixel and starts with the title
`content:encoded` has `<img src="https://medium.com/_/stat?...">` as its last image and `<h3>title</h3>` as its first element. Cover extraction skips `/_/stat` and width="1"; excerpt strips a leading title.

## 2026-10-10 Astro 7 defaults that matter here
`compressHTML` defaults to `'jsx'`, which removes whitespace between inline elements. Mixed-direction meta lines need the spaces, so it is set to `true`. The Rust compiler rejects unclosed tags, so every element is closed.

## 2026-10-10 Dates are formatted at build time in UTC
`fmtDate` runs in the Actions runner, so a post published late evening local time can show the next calendar day. Acceptable for now; pass a fixed `timeZone` to `Intl.DateTimeFormat` if it bothers you.
