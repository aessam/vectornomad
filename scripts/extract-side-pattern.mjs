// Extract the decorative side strips from the 1280x720 brand banner as standalone SVGs.
// Usage: node scripts/extract-side-pattern.mjs [brand/09 Qahwet 3esam Banner-1280 x 720.svg]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const src = process.argv[2] ?? 'brand/09 Qahwet 3esam Banner-1280 x 720.svg';
const svg = readFileSync(src, 'utf8');
const els = [...svg.matchAll(/<(path|polygon)\b[^>]*>/g)].map((m) => m[0]);

const startX = (el) => {
  const d = (el.match(/\bd="([^"]+)"/) || el.match(/\bpoints="([^"]+)"/) || [])[1];
  const m = d?.match(/^M?\s*(-?[\d.]+)[,\s]+(-?[\d.]+)/);
  return m ? +m[1] : NaN;
};
const left = els.filter((el) => startX(el) < 215);
if (left.length < 40) throw new Error(`expected the left strip, got ${left.length} elements`);

const STRIP_W = 170; // viewBox x 50..220 covers every left-strip element
const H = 720;
const style = `<style>.cls-5{fill:#16b9a7}.cls-7{fill:#e6e7e8;opacity:.55}</style>`;
const body = left.join('');
const make = (mirror) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${STRIP_W} ${H}" preserveAspectRatio="xMidYMin slice">${style}<rect width="${STRIP_W}" height="${H}" fill="#184377"/><g transform="${mirror ? `translate(${STRIP_W},0) scale(-1,1) ` : ''}translate(-50,0)">${body}</g></svg>\n`;

mkdirSync('public/brand', { recursive: true });
writeFileSync('public/brand/side-left.svg', make(false));
writeFileSync('public/brand/side-right.svg', make(true));
console.log(`side strips: ${left.length} elements each → public/brand/side-left.svg, side-right.svg`);
