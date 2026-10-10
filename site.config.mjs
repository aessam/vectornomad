// Single source of truth for everything the build needs to know about you.
// Fill the empty strings. `npm run fetch` refuses to run while any feed is empty.
export const site = {
  // User page: https://USERNAME.github.io with base '/'.
  // Project page: https://USERNAME.github.io with base '/REPO'.
  // Custom domain: https://example.com with base '/' and a public/CNAME file.
  url: 'https://USERNAME.github.io',
  base: '/',
  name: 'Ahmed Essam',
  tagline: 'Apple engineering, in public.',
  intro: 'A podcast, videos, articles in English, and essays in Arabic.',

  feeds: {
    // Full RSS URL of the podcast (from your host: Transistor, Simplecast, Anchor...).
    podcast: '',
    // The UC... id from your channel URL. Feed is youtube.com/feeds/videos.xml?channel_id=UC...
    youtubeChannelId: '',
    // Medium handle without the @. Feed is medium.com/feed/@handle
    mediumUser: '',
  },

  // Shown on /about and /podcast. Leave empty to hide.
  social: {
    youtube: '',
    medium: '',
    linkedin: '',
    twitter: '',
    applePodcasts: '',
    spotify: '',
  },

  // How many of each the hub (home page) shows.
  hub: { episodes: 1, videos: 3, articles: 2, arabic: 2, links: 3 },
  // How many items the fetch script keeps per feed.
  keep: 50,
};
