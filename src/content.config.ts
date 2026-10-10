import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// Auto-filled by scripts/fetch-feeds.mjs (CI runs it every build).
const episodes = defineCollection({
  loader: file('src/data/feeds/episodes.json'),
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    date: z.coerce.date(),
    audio: z.string().url(),
    duration: z.string().optional(),
    image: z.string().url().optional(),
    summary: z.string().optional(),
  }),
});

const videos = defineCollection({
  loader: file('src/data/feeds/videos.json'),
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    date: z.coerce.date(),
    videoId: z.string(),
    thumbnail: z.string().url().optional(),
    description: z.string().optional(),
  }),
});

const articles = defineCollection({
  loader: file('src/data/feeds/articles.json'),
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    date: z.coerce.date(),
    image: z.string().url().optional(),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

// Hand-written. One Markdown file per item.
const links = defineCollection({
  loader: glob({ base: './src/content/links', pattern: '**/*.md' }),
  schema: z.object({
    kind: z.enum(['mine', 'like']),
    url: z.string().url(),
    title: z.string(),
    date: z.coerce.date(),
    note: z.string().optional(),
    image: z.string().optional(), // path under public/, e.g. /images/links/foo.jpg
    source: z.string().optional(), // shown as the meta label; defaults to the URL host
    tags: z.array(z.string()).default([]),
  }),
});

const ar = defineCollection({
  loader: glob({ base: './src/content/ar', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { episodes, videos, articles, links, ar };
