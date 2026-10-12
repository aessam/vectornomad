import type { APIRoute } from 'astro';
import { readdir, writeFile, stat, unlink } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);
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

// The bytes must be what the extension claims, or ImageMagick may pick a different decoder.
function sniff(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return '.jpg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return '.png';
  if (buf.subarray(0, 6).toString('latin1') === 'GIF87a' || buf.subarray(0, 6).toString('latin1') === 'GIF89a') return '.gif';
  if (buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return '.webp';
  if (buf.subarray(4, 8).toString('latin1') === 'ftyp' && /^(avif|avis)/.test(buf.subarray(8, 12).toString('latin1'))) return '.avif';
  return null;
}

export const POST: APIRoute = async ({ request }) => {
  const denied = sameOrigin(request);
  if (denied) return denied;
  const form = await request.formData();
  const f = form.get('file');
  if (!(f instanceof File)) return json({ error: 'no file' }, 400);
  const { ext, file } = safeName(f.name);
  if (!OK.has(ext)) return json({ error: `unsupported type ${ext || '(none)'}` }, 400);
  if (f.size > 40 * 1024 * 1024) return json({ error: 'larger than 40 MB' }, 400);
  const bytes = Buffer.from(await f.arrayBuffer());
  const real = sniff(bytes);
  if (real !== ext) return json({ error: `content is ${real ?? 'not an image'}, name says ${ext}` }, 400);
  const raw = resolve(DIR, file);
  await writeFile(raw, bytes);
  // Resize, strip metadata (GPS included), set VectorNomad.com as author. Originals go to brand/photo-originals.
  try {
    await run('bash', ['scripts/prep-images.sh', raw]);
  } catch (e) {
    await unlink(raw).catch(() => {});
    return json({ error: `prep-images failed: ${(e as { stderr?: string }).stderr ?? (e as Error).message}` }, 500);
  }
  const final = `${basename(file, extname(file))}.jpg`;
  return json({ ok: true, file: final, url: `/images/ar/${final}` });
};

export const DELETE: APIRoute = async ({ url, request }) => {
  const denied = sameOrigin(request);
  if (denied) return denied;
  const name = basename(url.searchParams.get('file') ?? '');
  if (!name || !OK.has(extname(name).toLowerCase())) return json({ error: 'bad file name' }, 400);
  await unlink(resolve(DIR, name));
  return json({ ok: true });
};
