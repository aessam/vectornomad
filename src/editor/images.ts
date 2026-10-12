import type { APIRoute } from 'astro';
import { readdir, writeFile, stat, unlink } from 'node:fs/promises';
import { resolve, basename, extname } from 'node:path';
import { sameOrigin } from './guard';

// Images live in public/images/ar and are referenced as /images/ar/<name> from Markdown.
const DIR = resolve('public/images/ar');
// No SVG: it can carry scripts and these files are served on the public site.
const OK = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']);
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

const safeName = (name: string) => {
  const ext = extname(name).toLowerCase() === '.jpeg' ? '.jpg' : extname(name).toLowerCase();
  let stem = basename(name, extname(name)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  // Phone exports arrive as UUIDs. Give them a date-based name instead.
  if (!stem || /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(stem)) stem = `img-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 6)}`;
  return { ext, file: `${stem}${ext}` };
};

export const GET: APIRoute = async ({ request }) => {
  const denied = sameOrigin(request);
  if (denied) return denied;
  const names = (await readdir(DIR)).filter((n) => OK.has(extname(n).toLowerCase()));
  const files = await Promise.all(names.map(async (n) => ({ file: n, size: (await stat(resolve(DIR, n))).size, mtime: (await stat(resolve(DIR, n))).mtimeMs })));
  files.sort((a, b) => b.mtime - a.mtime);
  return json(files.map(({ file, size }) => ({ file, url: `/images/ar/${file}`, size })));
};

export const POST: APIRoute = async ({ request }) => {
  const denied = sameOrigin(request);
  if (denied) return denied;
  const form = await request.formData();
  const f = form.get('file');
  if (!(f instanceof File)) return json({ error: 'no file' }, 400);
  const { ext, file } = safeName(f.name);
  if (!OK.has(ext)) return json({ error: `unsupported type ${ext || '(none)'}` }, 400);
  if (f.size > 8 * 1024 * 1024) return json({ error: 'larger than 8 MB, resize it first' }, 400);
  await writeFile(resolve(DIR, file), Buffer.from(await f.arrayBuffer()));
  return json({ ok: true, file, url: `/images/ar/${file}` });
};

export const DELETE: APIRoute = async ({ url, request }) => {
  const denied = sameOrigin(request);
  if (denied) return denied;
  const name = basename(url.searchParams.get('file') ?? '');
  if (!name || !OK.has(extname(name).toLowerCase())) return json({ error: 'bad file name' }, 400);
  await unlink(resolve(DIR, name));
  return json({ ok: true });
};
