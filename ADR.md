# ADR

## 2026-10-10 DSCN-1: Astro, static output, GitHub Actions build, GitHub Pages hosting
Context: five content sources, three with public RSS, no server wanted.
Options: Astro; Eleventy; Swift (Ignite, Publish); plain script.
Rationale: Astro content collections give typed JSON and Markdown loaders, zero JS by default, built-in self-hosted fonts. Pages has no server, so feeds must be fetched at build; Actions is free on a public repo.
Consequences: site is only as fresh as the last build (daily cron plus push plus manual run). CI is red until feeds are configured. Scheduled workflows pause after 60 days without commits.

## 2026-10-10 DSCN-2: OPT-6 Hub first layout
Context: four directions mocked on a canvas (single stream, wall grid, hub first, Arabic-first bilingual).
Rationale: user choice. Home shows the latest of each source; the merged stream is one nav step down.
Consequences: Arabic lives as an RTL section inside an LTR home, and as its own RTL pages under /ar.

## 2026-10-10 DSCN-3: Amiri for Arabic, Crimson Pro for English, IBM Plex Mono for meta, all self-hosted
Context: user wants Amiri. Amiri is a Naskh book face; its Latin glyphs derive from Crimson, so Crimson Pro is the matching Latin.
Rationale: one typographic voice across both languages. Astro's fonts API copies the files into the build, so no third-party font requests at read time.
Consequences: Amiri needs larger size and looser leading than a sans (20px body, 1.9 to 2.0 line-height). Nav in Amiri at 19px.

## 2026-10-10 FND-1: iframes are not an option for Medium and LinkedIn articles
Evidence: medium.com sends `x-frame-options: SAMEORIGIN`; linkedin.com sends `frame-ancestors 'self'`. Only `linkedin.com/embed/feed/update/` allows any origin.
Decision: Medium and LinkedIn articles render as preview cards. Podcast uses native `<audio>` on the RSS enclosure. YouTube uses a thumbnail facade that swaps to `youtube-nocookie.com` on click.
