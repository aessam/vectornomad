import { defineConfig, fontProviders } from 'astro/config';
import { site } from './site.config.mjs';
import editor from './src/editor/integration.mjs';

export default defineConfig({
  integrations: [editor()],
  site: site.url,
  base: site.base,
  // v7 default is 'jsx', which strips whitespace between inline elements.
  // Mixed-direction lines (LTR spans inside RTL sentences) need that whitespace.
  compressHTML: true,
  fonts: [
    {
      name: 'Amiri',
      cssVariable: '--font-amiri',
      provider: fontProviders.google(),
      weights: [400, 700],
      styles: ['normal', 'italic'],
      subsets: ['arabic', 'latin'],
      fallbacks: ['serif'],
    },
    {
      name: 'Crimson Pro',
      cssVariable: '--font-crimson',
      provider: fontProviders.google(),
      weights: [400, 500, 600, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['serif'],
    },
    {
      name: 'IBM Plex Mono',
      cssVariable: '--font-plex-mono',
      provider: fontProviders.google(),
      weights: [500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
    },
  ],
});
