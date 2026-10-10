# Experiment Log

## 2026-10-10 Frame-blocking headers
```
curl -sIL -A "Mozilla/5.0" https://medium.com/@medium | grep -i frame      → x-frame-options: SAMEORIGIN
curl -sIL -A "Mozilla/5.0" https://www.linkedin.com/pulse/ | grep -i frame  → frame-ancestors 'self' *.www.linkedin.com:*
curl -sIL https://www.linkedin.com/embed/feed/update/urn:li:share:7000000000000000000 → frame-ancestors *
```

## 2026-10-10 Feed samples for the parser (scratchpad/feeds/)
```
GET https://medium.com/feed/@medium                                         → 200, 111 KB, 10 items
GET https://www.youtube.com/feeds/videos.xml?channel_id=UCwRXb5dUK4cvsHbx-rGzSgw → 200, 31 KB, 15 entries
GET https://feeds.simplecast.com/54nAGcIl                                   → 200, 20 MB, 3002 items
```

## 2026-10-10 Parser smoke test
```
scripts/smoke-feeds.sh <scratchpad>/feeds
→ episodes 50, videos 15, articles 10. Enclosure, itunes:duration, itunes:image, yt:videoId, media:thumbnail all parsed.
```

## 2026-10-10 First build
```
npm run build  (Node 25.9.0, astro 7.3.8, fast-xml-parser 5.11.2)
→ 10 pages, 11 font files copied, 2.08 s
```
