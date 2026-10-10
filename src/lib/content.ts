import { getCollection, type CollectionEntry } from 'astro:content';

const byDateDesc = <T extends { data: { date: Date } }>(a: T, b: T) => b.data.date.getTime() - a.data.date.getTime();

export const episodes = async () => (await getCollection('episodes')).sort(byDateDesc);
export const videos = async () => (await getCollection('videos')).sort(byDateDesc);
export const articles = async () => (await getCollection('articles')).sort(byDateDesc);
export const links = async () => (await getCollection('links')).sort(byDateDesc);
export const arabic = async () => (await getCollection('ar', (e) => !e.data.draft)).sort(byDateDesc);

export type StreamItem =
  | { kind: 'episode'; date: Date; entry: CollectionEntry<'episodes'> }
  | { kind: 'video'; date: Date; entry: CollectionEntry<'videos'> }
  | { kind: 'article'; date: Date; entry: CollectionEntry<'articles'> }
  | { kind: 'link'; date: Date; entry: CollectionEntry<'links'> }
  | { kind: 'ar'; date: Date; entry: CollectionEntry<'ar'> };

export async function stream(): Promise<StreamItem[]> {
  const [e, v, a, l, r] = await Promise.all([episodes(), videos(), articles(), links(), arabic()]);
  const items: StreamItem[] = [
    ...e.map((entry) => ({ kind: 'episode' as const, date: entry.data.date, entry })),
    ...v.map((entry) => ({ kind: 'video' as const, date: entry.data.date, entry })),
    ...a.map((entry) => ({ kind: 'article' as const, date: entry.data.date, entry })),
    ...l.map((entry) => ({ kind: 'link' as const, date: entry.data.date, entry })),
    ...r.map((entry) => ({ kind: 'ar' as const, date: entry.data.date, entry })),
  ];
  return items.sort((x, y) => y.date.getTime() - x.date.getTime());
}
