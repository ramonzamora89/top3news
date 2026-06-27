import type { Vertical } from '@/types';

export type FeedType = 'rss' | 'scrape';
export type ScraperKey = 'netflix' | 'hbomax';

export interface FeedSource {
  id: string;
  name: string;
  type: FeedType;
  url: string;
  vertical: Vertical;
  scraper?: ScraperKey;
  priority: number;
  enabled: boolean;
  lang: 'es' | 'en';
}

export const FEEDS: FeedSource[] = [
  // ── AUTOS ────────────────────────────────────────────────────────────────
  {
    id: 'motorpasion',
    name: 'Motorpasión',
    type: 'rss',
    url: 'https://www.motorpasion.com/index.xml',
    vertical: 'autos',
    priority: 1,
    enabled: true,
    lang: 'es',
  },
  {
    id: 'caranddriver',
    name: 'Car and Driver',
    type: 'rss',
    url: 'https://www.caranddriver.com/rss/all.xml/',
    vertical: 'autos',
    priority: 2,
    enabled: true,
    lang: 'en',
  },
  {
    id: 'autoblog',
    name: 'Autoblog',
    type: 'rss',
    url: 'https://www.autoblog.com/rss.xml',
    vertical: 'autos',
    priority: 3,
    enabled: true,
    lang: 'en',
  },

  // ── TECNOLOGÍA ────────────────────────────────────────────────────────────
  {
    id: 'xataka',
    name: 'Xataka',
    type: 'rss',
    url: 'https://www.xataka.com/index.xml',
    vertical: 'tecnologia',
    priority: 1,
    enabled: true,
    lang: 'es',
  },
  {
    id: 'gizmodo-es',
    name: 'Gizmodo ES',
    type: 'rss',
    url: 'https://es.gizmodo.com/rss',
    vertical: 'tecnologia',
    priority: 2,
    enabled: true,
    lang: 'es',
  },
  {
    id: 'the-verge',
    name: 'The Verge',
    type: 'rss',
    url: 'https://www.theverge.com/rss/index.xml',
    vertical: 'tecnologia',
    priority: 3,
    enabled: true,
    lang: 'en',
  },

  // ── PELÍCULAS ─────────────────────────────────────────────────────────────
  {
    id: 'variety',
    name: 'Variety',
    type: 'rss',
    url: 'https://variety.com/feed/',
    vertical: 'peliculas',
    priority: 1,
    enabled: true,
    lang: 'en',
  },
  {
    id: 'screen-rant',
    name: 'Screen Rant',
    type: 'rss',
    url: 'https://screenrant.com/feed/',
    vertical: 'peliculas',
    priority: 2,
    enabled: true,
    lang: 'en',
  },
  {
    id: 'spotify-news',
    name: 'Spotify Newsroom',
    type: 'rss',
    url: 'https://newsroom.spotify.com/feed/',
    vertical: 'peliculas',
    priority: 3,
    enabled: true,
    lang: 'en',
  },
  {
    id: 'netflix-tudum',
    name: 'Netflix Tudum',
    type: 'scrape',
    url: 'https://www.netflix.com/tudum/articles',
    scraper: 'netflix',
    vertical: 'peliculas',
    priority: 4,
    enabled: true,
    lang: 'en',
  },
  {
    id: 'hbomax',
    name: 'Max (HBO)',
    type: 'scrape',
    url: 'https://www.max.com/articles',
    scraper: 'hbomax',
    vertical: 'peliculas',
    priority: 5,
    enabled: true,
    lang: 'en',
  },

  // ── MÚSICA ────────────────────────────────────────────────────────────────
  {
    id: 'rolling-stone',
    name: 'Rolling Stone',
    type: 'rss',
    url: 'https://www.rollingstone.com/music/music-news/feed/',
    vertical: 'musica',
    priority: 1,
    enabled: true,
    lang: 'en',
  },
  {
    id: 'pitchfork',
    name: 'Pitchfork',
    type: 'rss',
    url: 'https://pitchfork.com/rss/news/',
    vertical: 'musica',
    priority: 2,
    enabled: true,
    lang: 'en',
  },
  {
    id: 'los40',
    name: 'Los40',
    type: 'rss',
    url: 'https://los40.com/rss/',
    vertical: 'musica',
    priority: 3,
    enabled: true,
    lang: 'es',
  },
];

export const AGENDA_FEEDS = [
  {
    id: 'southmiami-events',
    name: 'South Miami Special Events',
    url: 'https://www.southmiamifl.gov/RSSFeed.aspx?ModID=58&CID=Special-Events-Calendar-23',
  },
  {
    id: 'southmiami-parks',
    name: 'South Miami Parks & Recreation',
    url: 'https://www.southmiamifl.gov/RSSFeed.aspx?ModID=58&CID=Parks-and-Recreation-Department-24',
  },
];

export const BATCH_SIZES: Record<string, number> = {
  morning: 2,
  midday: 1,
  evening: 1,
};

export const MAX_ARTICLES_PER_VERTICAL = 30;
