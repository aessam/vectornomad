// Dev-only Arabic post editor. Injects /editor and /editor/api when running `astro dev`.
// Nothing from here reaches the build or the deployed site.
export default function editor() {
  return {
    name: 'arabic-editor',
    hooks: {
      'astro:config:setup': ({ command, injectRoute, logger }) => {
        if (command !== 'dev') return;
        injectRoute({ pattern: '/editor', entrypoint: './src/editor/Editor.astro', prerender: false });
        injectRoute({ pattern: '/editor/api', entrypoint: './src/editor/api.ts', prerender: false });
        injectRoute({ pattern: '/editor/api/images', entrypoint: './src/editor/images.ts', prerender: false });
        logger.info('Arabic editor at /editor (dev only)');
      },
    },
  };
}
