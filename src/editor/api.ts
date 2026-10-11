import type { APIRoute } from 'astro';
import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve, basename } from 'node:path';

const DIR = resolve('src/content/ar');
const SAFE = /^[a-z0-9][a-z0-9-]{0,80}\.md$/;
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

type Doc = { file: string; title: string; date: string; summary: string; draft: boolean; body: string };

function parse(file: string, text: string): Doc {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const fm: Record<string, string> = {};
  if (m) for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, '$1');
  }
  return {
    file,
    title: fm.title ?? '',
    date: fm.date ?? '',
    summary: fm.summary ?? '',
    draft: fm.draft === 'true',
    body: m ? m[2].replace(/^\n/, '') : text,
  };
}

const quote = (s: string) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
function serialize(d: Doc): string {
  const lines = ['---', `title: ${quote(d.title)}`, `date: ${d.date}`];
  if (d.summary) lines.push(`summary: ${quote(d.summary)}`);
  if (d.draft) lines.push('draft: true');
  lines.push('---', '', d.body.replace(/\s+$/, ''), '');
  return lines.join('\n');
}

function safe(file: string): string {
  const name = basename(file);
  if (!SAFE.test(name)) throw new Error(`bad file name: ${file}. Use lowercase letters, digits and dashes, ending in .md`);
  return resolve(DIR, name);
}

export const GET: APIRoute = async ({ url }) => {
  const file = url.searchParams.get('file');
  if (file) {
    const text = await readFile(safe(file), 'utf8');
    return json(parse(file, text));
  }
  const names = (await readdir(DIR)).filter((n) => n.endsWith('.md')).sort().reverse();
  const docs = await Promise.all(names.map(async (n) => { const d = parse(n, await readFile(resolve(DIR, n), 'utf8')); return { file: n, title: d.title, date: d.date, draft: d.draft }; }));
  return json(docs);
};

export const POST: APIRoute = async ({ request }) => {
  const d = (await request.json()) as Doc;
  if (!d.title?.trim()) return json({ error: 'title is required' }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return json({ error: 'date must be YYYY-MM-DD' }, 400);
  let path: string;
  try { path = safe(d.file); } catch (e) { return json({ error: (e as Error).message }, 400); }
  await writeFile(path, serialize(d), 'utf8');
  return json({ ok: true, file: basename(path) });
};

export const DELETE: APIRoute = async ({ url }) => {
  const file = url.searchParams.get('file') ?? '';
  try { await unlink(safe(file)); } catch (e) { return json({ error: (e as Error).message }, 400); }
  return json({ ok: true });
};
