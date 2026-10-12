# MyWebsite

Static hub for the podcast, YouTube, Medium, Arabic essays and links. Astro, built by GitHub Actions, served by GitHub Pages.

## One-time setup
1. Fill `site.config.mjs`: `url`, `base`, the three feeds, social links.
2. Repo Settings → Pages → Source: GitHub Actions.
3. Push to `main`. The workflow builds and deploys. Nothing runs on a schedule.

## Publishing
- New episode, video or Medium article: run `scripts/publish.sh`. It fetches the feeds, builds locally, commits the snapshot and pushes. CI builds from the committed JSON and never touches the network.
- `scripts/publish.sh --no-push` to look before pushing, `-m "message"` to name the commit.
- Arabic post: add `src/content/ar/YYYY-MM-DD-slug.md` with frontmatter `title`, `date`, optional `summary`.
- Link or pick: add `src/content/links/slug.md` with `kind` (`mine` or `like`), `url`, `title`, `date`, optional `note`, `image`, `source`, `tags`.
- Commit. The push rebuilds.

## Local
```
npm install
npm run fetch      # refresh src/data/feeds/*.json from the live feeds
npm run build
npm run preview
```
`npm run build` uses whatever is committed in `src/data/feeds/`.
Parser smoke test against saved XML: `scripts/smoke-feeds.sh <dir>`.

## Arabic editor (local only)
```
npm run dev
```
Open http://localhost:4322/editor. It lists `src/content/ar`, edits title, date, summary, draft and body in Amiri at the site's size, right-to-left, with a live preview. Save writes the Markdown file; ⌘S works. Images: upload or pick from `public/images/ar/`, click to insert at the cursor. The editor exists only under `astro dev`; the production build has no trace of it and nothing is exposed on the internet. Publish is still a commit and push.

## Photos
`scripts/prep-images.sh FILE...` resizes to 2000 px, converts to sRGB, strips all metadata (EXIF, GPS, ICC, IPTC) and embeds VectorNomad.com as creator and rights holder. Originals move to `brand/photo-originals/` (not in git). The editor's upload runs it automatically.
