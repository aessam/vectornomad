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
Context: user wants Amiri. Amiri is a Naskh book face. Crimson Pro chosen as a matching old-style serif for English (the Amiri README does not document its Latin source; the Crimson derivation is unconfirmed).
Alternative, one line: point `html { font-family }` at `--font-amiri` to use Amiri's own Latin everywhere.
Rationale: one typographic voice across both languages. Astro's fonts API copies the files into the build, so no third-party font requests at read time.
Consequences: Amiri needs larger size and looser leading than a sans (20px body, 1.9 to 2.0 line-height). Nav in Amiri at 19px.

## 2026-10-10 FND-1: iframes are not an option for Medium and LinkedIn articles
Evidence: medium.com sends `x-frame-options: SAMEORIGIN`; linkedin.com sends `frame-ancestors 'self'`. Only `linkedin.com/embed/feed/update/` allows any origin.
Decision: Medium and LinkedIn articles render as preview cards. Podcast uses native `<audio>` on the RSS enclosure. YouTube uses a thumbnail facade that swaps to `youtube-nocookie.com` on click.

## 2026-10-10 DSCN-4: قهوة عصام brand palette and logo on the site
Context: brand files from the 2020 identity (Madar Studio): navy #184377, teal #16B9A7, coral #F06263, white, with shade and tint ramps in Color Palette.pdf.
Decision: navy is the text accent and button color (9:1 on white). Teal and coral are reserved for non-text UI: play buttons, badges. Dark mode uses the navy shade #0C1524 as ground and the teal tint #5CC2B4 as accent. Square logo SVG in the header and as favicon.
Consequences: `brand/` source files stay out of git (gitignored); only `public/brand/logo.svg` and `public/favicon.svg` ship. Fonts unchanged (Amiri, Crimson Pro); the brand's display serif is close enough to Crimson Pro.

## 2026-10-10 DSCN-5: One tile component, App Store Today / Apple Podcasts pattern
Context: five card components each invented their own layout; the article card collapsed in a flex row and the set looked inconsistent.
Decision: `Card.astro` is the only card shell (media, eyebrow, body, footer slots; `stack` or `row` layout; `card` or `tint` tone). No borders, 20px radius, media bleeds to the edge at a fixed aspect ratio, soft shadow, 2px hover lift, whole tile is the link. Page ground moves to a navy-tinted off-white (#F5F7FA) so white tiles read as tiles; dark mode uses flat elevated fills with a hairline instead of shadow.
Consequences: wrappers are a few lines each. Any new content type gets a tile for free. The video tile keeps the facade button as its control, so its title is not a stretched link.

## 2026-10-10 DSCN-6: Brand banner hero, uncropped artwork, glass tiles
Context: the square artwork was being cropped in tiles, losing the banner's side pattern; tiles read flat.
Decision: `scripts/extract-side-pattern.mjs` pulls the side strips out of the 1280x720 banner SVG into `public/brand/side-left.svg` and `side-right.svg`. The hero is a navy banner with those strips at both edges, sized to the section so nothing tiles (the pattern is hand-drawn and not periodic). Episode artwork uses `object-fit: contain` on the brand navy, which is the artwork's own ground, so it is never cropped. Every tile is glass: translucent gradient, 24px backdrop blur, hairline edge and inner highlight, over a faint brand-colored mesh on the page ground.
Consequences: strips are hidden under 560px to keep the hero readable. Backdrop blur is GPU work; 11 tiles on the hub is fine, a 50-item stream page is the thing to watch.

## 2026-10-10 DSCN-7: Personal seal as site mark and favicon
Context: the header and favicon used the podcast logo. The site is personal; the podcast is one section of it.
Decision: `brand/AhmedEssamSeal.png` (hand-lettered أحمد عصام, ink on paper) is the site mark. Header uses a luminance mask of the ink (`public/brand/seal-mask.png`, 7 KB) painted in `currentColor`, so it is navy in light mode and white in dark mode with one file. Favicon and apple-touch-icon are the paper version, which reads as a stamp on any tab colour. The podcast logo SVG is removed from `public/`; the brand lives in the hero banner and the side strips.
Consequences: regenerate with ImageMagick from the source PNG (`-alpha off -colorspace Gray -negate -level 35%,88%`); the source alpha channel must be dropped first or the mask comes out blank.
