// Run: node scripts/fetch-rss.js [morning|midday|evening]
// Fetches RSS feeds and updates content/*.json, content/weather.json, content/market.json

const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FEEDS = [
  // AUTOS
  { id: 'caranddriver',  name: 'Car and Driver', url: 'https://www.caranddriver.com/rss/all.xml/', vertical: 'autos', priority: 1, lang: 'en' },
  { id: 'autoblog',      name: 'Autoblog',        url: 'https://www.autoblog.com/rss.xml',          vertical: 'autos', priority: 2, lang: 'en' },
  { id: 'roadandtrack',  name: 'Road & Track',    url: 'https://www.roadandtrack.com/rss/all.xml/', vertical: 'autos', priority: 3, lang: 'en' },

  // TECHNOLOGY
  { id: 'the-verge',   name: 'The Verge',   url: 'https://www.theverge.com/rss/index.xml', vertical: 'tecnologia', priority: 1, lang: 'en',
    denyKeywords: ['superhero', 'Marvel', 'DC Comics', 'DC Studios', 'box office', 'movie review', 'film review', 'comic book', 'Batman', 'Superman', 'Spider-Man', 'Avengers', 'Justice League'] },
  { id: 'techcrunch',  name: 'TechCrunch',  url: 'https://techcrunch.com/feed/',            vertical: 'tecnologia', priority: 2, lang: 'en' },
  { id: 'wired',       name: 'Wired',       url: 'https://www.wired.com/feed/rss',          vertical: 'tecnologia', priority: 3, lang: 'en' },

  // MOVIES
  { id: 'variety',    name: 'Variety',             url: 'https://variety.com/feed/',                    vertical: 'peliculas', priority: 1, lang: 'en' },
  { id: 'thr',        name: 'Hollywood Reporter',  url: 'https://www.hollywoodreporter.com/feed/',      vertical: 'peliculas', priority: 2, lang: 'en' },
  { id: 'screen-rant', name: 'Screen Rant',        url: 'https://screenrant.com/feed/',                 vertical: 'peliculas', priority: 3, lang: 'en' },

  // MUSIC
  { id: 'rolling-stone', name: 'Rolling Stone', url: 'https://www.rollingstone.com/music/music-news/feed/', vertical: 'musica', priority: 1, lang: 'en' },
  { id: 'pitchfork',     name: 'Pitchfork',     url: 'https://pitchfork.com/rss/news/',                     vertical: 'musica', priority: 2, lang: 'en' },
  { id: 'nme',           name: 'NME',           url: 'https://www.nme.com/feed',                             vertical: 'musica', priority: 3, lang: 'en' },
];

const BATCH_SIZES = { morning: 2, midday: 1, evening: 1 };
const MAX_ARTICLES = 30;
const CONTENT_DIR = path.join(__dirname, '..', 'content');

// ── helpers ──────────────────────────────────────────────────────────────────

function getBatch() {
  const arg = process.argv[2];
  if (arg && BATCH_SIZES[arg] !== undefined) return arg;
  const hour = new Date().getUTCHours();
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 14 && hour < 18) return 'midday';
  return 'evening';
}

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim().slice(0, 80);
}

function makeId(title, date) {
  const hash = crypto.createHash('md5').update(title + date).digest('hex').slice(0, 6);
  return `${slugify(title)}-${hash}`;
}

function extractImage(item) {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item['media:content']?.url) return item['media:content'].url;
  if (item['media:thumbnail']?.url) return item['media:thumbnail'].url;
  const content = item['content:encoded'] || item.content || '';
  const match = content.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : undefined;
}

function decodeEntities(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function cleanSummary(text, maxLen = 280) {
  if (!text) return '';
  const stripped = decodeEntities(text.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
  return stripped.length > maxLen ? stripped.slice(0, maxLen).replace(/\s\S*$/, '') + '…' : stripped;
}

function readJSON(filename) {
  try { return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf-8')); }
  catch { return filename.endsWith('.json') && filename !== 'weather.json' && filename !== 'market.json' ? [] : {}; }
}

function writeJSON(filename, data) {
  fs.writeFileSync(path.join(CONTENT_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
}

// ── weather (wttr.in — no API key needed) ────────────────────────────────────

function weatherEmoji(code) {
  if (code <= 113) return '☀️';
  if (code <= 116) return '⛅';
  if (code <= 122) return '☁️';
  if (code <= 260) return '🌫️';
  if (code <= 281) return '🌦️';
  if (code <= 377) return '🌧️';
  return '⛈️';
}

async function fetchWeather() {
  try {
    const res = await fetch('https://wttr.in/Miami?format=j1', {
      headers: { 'User-Agent': 'top3news/1.0' },
    });
    const data = await res.json();
    const c = data.current_condition[0];
    const code = parseInt(c.weatherCode, 10);
    const weather = {
      temp: parseInt(c.temp_F, 10),
      description: c.weatherDesc[0].value,
      emoji: weatherEmoji(code),
      city: 'Miami',
      fetchedAt: new Date().toISOString(),
    };
    writeJSON('weather.json', weather);
    console.log(`✓ weather: ${weather.emoji} ${weather.temp}°F in ${weather.city}`);
  } catch (err) {
    console.warn(`⚠ Weather fetch failed: ${err.message}`);
  }
}

// ── market (Yahoo Finance — server-side, no CORS) ────────────────────────────

async function fetchMarket() {
  try {
    const res = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=1d',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) throw new Error('no meta');
    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose;
    const market = {
      price: Math.round(price),
      change: +(price - prev).toFixed(2),
      changePercent: +(((price - prev) / prev) * 100).toFixed(2),
      up: price >= prev,
      fetchedAt: new Date().toISOString(),
    };
    writeJSON('market.json', market);
    console.log(`✓ S&P 500: ${market.up ? '▲' : '▼'} ${market.price.toLocaleString()} (${market.changePercent}%)`);
  } catch (err) {
    console.warn(`⚠ Market fetch failed: ${err.message}`);
  }
}

// ── RSS feeds ─────────────────────────────────────────────────────────────────

async function fetchFeed(feed) {
  const parser = new Parser({
    customFields: {
      item: [
        ['media:content', 'media:content', { keepArray: false }],
        ['media:thumbnail', 'media:thumbnail', { keepArray: false }],
        ['content:encoded', 'content:encoded'],
      ],
    },
  });
  try {
    const parsed = await parser.parseURL(feed.url);
    const now = new Date().toISOString();
    return parsed.items.slice(0, 10).map((item) => ({
      id: makeId(item.title || '', item.pubDate || now),
      title: decodeEntities((item.title || '').trim()),
      summary: cleanSummary(item.contentSnippet || item['content:encoded'] || item.content || ''),
      url: item.link || item.guid || '',
      source: feed.name,
      sourceId: feed.id,
      vertical: feed.vertical,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : now,
      fetchedAt: now,
      imageUrl: extractImage(item),
      lang: feed.lang,
    })).filter((a) => {
      if (!a.title || !a.url) return false;
      if (feed.denyKeywords) {
        const title = a.title.toLowerCase();
        if (feed.denyKeywords.some((kw) => title.includes(kw.toLowerCase()))) return false;
      }
      return true;
    });
  } catch (err) {
    console.warn(`⚠ Failed to fetch ${feed.name}: ${err.message}`);
    return [];
  }
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  const batch = getBatch();
  const articlesPerVertical = BATCH_SIZES[batch];
  console.log(`\nBatch: ${batch} (${articlesPerVertical} articles/vertical)\n`);

  // Weather + market always refresh on every run
  await Promise.all([fetchWeather(), fetchMarket()]);
  console.log('');

  const verticals = ['autos', 'tecnologia', 'peliculas', 'musica'];

  for (const vertical of verticals) {
    const existing = readJSON(`${vertical}.json`);
    const existingUrls = new Set(existing.map((a) => a.url));
    const verticalFeeds = FEEDS.filter((f) => f.vertical === vertical).sort((a, b) => a.priority - b.priority);

    let newArticles = [];
    for (const feed of verticalFeeds) {
      if (newArticles.length >= articlesPerVertical) break;
      const items = await fetchFeed(feed);
      newArticles.push(...items.filter((a) => !existingUrls.has(a.url)));
    }

    const combined = [...newArticles.slice(0, articlesPerVertical), ...existing];
    const deduped = Array.from(new Map(combined.map((a) => [a.url, a])).values());
    writeJSON(`${vertical}.json`, deduped.slice(0, MAX_ARTICLES));
    console.log(`✓ ${vertical}: ${deduped.slice(0, MAX_ARTICLES).length} articles`);
  }

  console.log('\nDone.');
}

main().catch((err) => { console.error(err); process.exit(1); });
