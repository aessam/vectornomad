// Pulls the three public feeds and writes normalized JSON for Astro's content collections.
// Fails loud: any missing config, non-200, parse error or empty feed exits non-zero.
//
//   node scripts/fetch-feeds.mjs [--out <dir>]
//
// Env overrides (used by scripts/smoke-feeds.sh): FEED_PODCAST_URL, FEED_YOUTUBE_URL,
// FEED_MEDIUM_URL. A value starting with "file:" is read from disk instead of fetched.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import { site } from '../site.config.mjs';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const OUT_DIR = resolve(outIdx >= 0 ? args[outIdx + 1] : 'src/data/feeds');
const KEEP = site.keep ?? 50;
const UA = 'Mozilla/5.0 (compatible; MyWebsite feed fetcher; +https://github.com)';

const f = site.feeds;
const urls = {
  podcast: process.env.FEED_PODCAST_URL || f.podcast,
  youtube: process.env.FEED_YOUTUBE_URL || (f.youtubeChannelId && `https://www.youtube.com/feeds/videos.xml?channel_id=${f.youtubeChannelId}`),
  medium: process.env.FEED_MEDIUM_URL || (f.mediumUser && `https://medium.com/feed/@${f.mediumUser}`),
};

const missing = Object.entries(urls).filter(([, u]) => !u).map(([k]) => k);
if (missing.length) {
  console.error(`fetch-feeds: unconfigured feeds: ${missing.join(', ')}. Fill site.config.mjs → feeds.`);
  process.exit(1);
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  isArray: (name) => name === 'item' || name === 'entry' || name === 'category',
});

async function load(name, url) {
  let text;
  if (url.startsWith('file:')) {
    text = await readFile(url.slice(5), 'utf8');
  } else {
    const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' } });
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status} for ${url}`);
    text = await res.text();
  }
  if (!text.trim().startsWith('<')) throw new Error(`${name}: response is not XML (${text.slice(0, 80)})`);
  return parser.parse(text);
}

const str = (v) => (v == null ? '' : typeof v === 'object' ? str(v['#text']) : String(v)).trim();
const stripHtml = (html) => str(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
// Medium appends a 1x1 tracking pixel (medium.com/_/stat). Skip it and any other 1px image.
const firstImg = (html) => {
  for (const m of str(html).matchAll(/<img\b([^>]*)>/g)) {
    const attrs = m[1];
    const src = (attrs.match(/\bsrc="([^"]+)"/) || [])[1];
    if (!src || /\/_\/stat\b/.test(src) || /\bwidth="1"/.test(attrs)) continue;
    return src;
  }
  return undefined;
};
const excerpt = (text, n = 220) => (text.length <= n ? text : text.slice(0, n).replace(/\s+\S*$/, '') + '…');
// Show notes are often Markdown with links. Keep prose only.
const prose = (text) =>
  text
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[#*_`>]+/g, ' ')
    .replace(/^\s*ملخص الحلقة\s*[:：-]?\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
const iso = (d, name) => {
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) throw new Error(`${name}: bad date "${d}"`);
  return t.toISOString();
};
const slug = (s) => str(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

function episodes(doc) {
  const channel = doc?.rss?.channel;
  const items = channel?.item;
  if (!items?.length) throw new Error('podcast: no <item> in feed');
  // Episode art only when the episode has its own. The site uses the brand banner otherwise.
  return items.slice(0, KEEP).map((it) => {
    const audio = it.enclosure?.['@_url'];
    if (!audio) throw new Error(`podcast: episode "${str(it.title)}" has no enclosure`);
    const duration = str(it['itunes:duration']);
    return {
      id: slug(str(it.guid) || str(it.title)),
      title: str(it.title),
      url: str(it.link) || audio,
      date: iso(str(it.pubDate), 'podcast'),
      audio,
      duration: duration || undefined,
      image: it['itunes:image']?.['@_href'] || it['media:thumbnail']?.['@_url'] || undefined,
      summary: excerpt(prose(stripHtml(it['itunes:summary'] || it.description || ''))),
    };
  });
}

function videos(doc) {
  const entries = doc?.feed?.entry;
  if (!entries?.length) throw new Error('youtube: no <entry> in feed');
  return entries.slice(0, KEEP).map((e) => {
    const videoId = str(e['yt:videoId']);
    if (!videoId) throw new Error(`youtube: entry "${str(e.title)}" has no yt:videoId`);
    const g = e['media:group'] || {};
    return {
      id: videoId,
      title: str(e.title),
      url: `https://www.youtube.com/watch?v=${videoId}`,
      date: iso(str(e.published), 'youtube'),
      videoId,
      thumbnail: g['media:thumbnail']?.['@_url'] || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      description: excerpt(str(g['media:description'])),
    };
  });
}

function articles(doc) {
  const items = doc?.rss?.channel?.item;
  if (!items?.length) throw new Error('medium: no <item> in feed');
  return items.slice(0, KEEP).map((it) => {
    const html = it['content:encoded'] || it.description || '';
    const link = str(it.link).replace(/\?source=.*$/, '');
    const title = str(it.title);
    // Medium repeats the title as the first <h3> of content:encoded. Drop it from the excerpt.
    // Compare with collapsed whitespace: Medium titles carry hair spaces (U+200A) and the body uses nbsp.
    // Drop figure captions first ("Photo by X on Unsplash") so they do not lead the excerpt.
    let text = stripHtml(str(html).replace(/<figcaption[\s\S]*?<\/figcaption>/gi, ' '));
    const normTitle = title.replace(/\s+/g, ' ');
    if (text.startsWith(normTitle)) text = text.slice(normTitle.length).trim();
    return {
      id: slug(str(it.guid) || link),
      title,
      url: link,
      date: iso(str(it.pubDate), 'medium'),
      image: firstImg(html),
      excerpt: excerpt(text),
      tags: (it.category || []).map(str).filter(Boolean),
    };
  });
}

const jobs = [
  ['episodes', 'podcast', episodes],
  ['videos', 'youtube', videos],
  ['articles', 'medium', articles],
];

await mkdir(OUT_DIR, { recursive: true });
let failed = false;
for (const [file, key, normalize] of jobs) {
  try {
    const doc = await load(key, urls[key]);
    const rows = normalize(doc);
    await writeFile(resolve(OUT_DIR, `${file}.json`), JSON.stringify(rows, null, 2) + '\n');
    console.log(`fetch-feeds: ${file}: ${rows.length} items from ${urls[key]}`);
  } catch (err) {
    failed = true;
    console.error(`fetch-feeds: FAILED ${file}: ${err.message}`);
  }
}
if (failed) process.exit(1);
