# MyWebsite

Static hub for the podcast, YouTube, Medium, Arabic essays and links. Astro, built by GitHub Actions, served by GitHub Pages.

## One-time setup
1. Fill `site.config.mjs`: `url`, `base`, the three feeds, social links.
2. Repo Settings → Pages → Source: GitHub Actions.
3. Push to `main`. The workflow fetches feeds, builds, deploys. It also runs daily.

## Daily use
- New episode, video or Medium article: nothing to do. Daily rebuild picks it up. Or click Run workflow.
- Arabic post: add `src/content/ar/YYYY-MM-DD-slug.md` with frontmatter `title`, `date`, optional `summary`.
- Link or pick: add `src/content/links/slug.md` with `kind` (`mine` or `like`), `url`, `title`, `date`, optional `note`, `image`, `source`, `tags`.
- Commit. The push rebuilds.

## Local
```
npm install
npm run fetch      # needs feeds configured; CI runs this every build
npm run build
npm run preview
```
`npm run build` without `fetch` uses the placeholder JSON in `src/data/feeds/`.
Parser smoke test against saved XML: `scripts/smoke-feeds.sh <dir>`.
