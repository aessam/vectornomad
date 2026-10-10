// Single source of truth for everything the build needs to know about you.
// Fill the empty strings. `npm run fetch` refuses to run while any feed is empty.
export const site = {
  // User page: https://USERNAME.github.io with base '/'.
  // Project page: https://USERNAME.github.io with base '/REPO'.
  // Custom domain: https://example.com with base '/' and a public/CNAME file.
  url: 'https://USERNAME.github.io',
  base: '/',
  name: 'Ahmed Essam',
  tagline: 'Engineering, culture, and coffee.',
  intro: 'قهوة عصام, a podcast and videos in Arabic. Articles on Medium in English. Essays in Arabic, and links worth keeping.',

  feeds: {
    // Full RSS URL of the podcast (from your host: Transistor, Simplecast, Anchor...).
    podcast: 'https://feeds.simplecast.com/Bh4o49Be',
    // The UC... id from your channel URL. Feed is youtube.com/feeds/videos.xml?channel_id=UC...
    youtubeChannelId: 'UCOlq9nrbWzOd7tcQHG130TQ',
    // Medium handle without the @. Feed is medium.com/feed/@handle
    mediumUser: 'aessam',
  },

  // Shown on /about and /podcast. Leave empty to hide.
  social: {
    youtube: 'https://www.youtube.com/@essamcafe',
    medium: 'https://medium.com/@aessam',
    linkedin: 'https://www.linkedin.com/in/aessam/',
    twitter: 'https://twitter.com/ahmd3ssam',
    applePodcasts: 'https://podcasts.apple.com/us/podcast/id1519535081',
    spotify: '',
  },

  // How many of each the hub (home page) shows.
  hub: { episodes: 1, videos: 3, articles: 2, arabic: 2, links: 3 },
  // How many items the fetch script keeps per feed.
  keep: 50,
};
