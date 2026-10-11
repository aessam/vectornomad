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
