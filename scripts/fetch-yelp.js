// Fetches top restaurants in Miami from Yelp Fusion API.
// Requires YELP_API_KEY — get a free key at https://www.yelp.com/developers
// Also adds Eater Miami food news via RSS.

const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const FILE = path.join(CONTENT_DIR, 'comida.json');
const MAX_ITEMS = 30;

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim().slice(0, 80);
}
function makeId(text, seed) {
  const hash = crypto.createHash('md5').update(seed).digest('hex').slice(0, 6);
  return `${slugify(text)}-${hash}`;
}
function decodeEntities(t) {
  return (t || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

// ── 1. Yelp Fusion API ────────────────────────────────────────────────────────

async function fetchYelpRestaurants() {
  const key = process.env.YELP_API_KEY;
  if (!key) {
    console.warn('⚠ YELP_API_KEY not set — skipping Yelp restaurants');
    return [];
  }

  const params = new URLSearchParams({
    location: 'Miami, FL',
    categories: 'restaurants',
    sort_by: 'review_count',
    limit: '15',
    radius: '20000',
  });

  const res = await fetch(`https://api.yelp.com/v3/businesses/search?${params}`, {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Yelp API HTTP ${res.status}`);
  const data = await res.json();

  const now = new Date().toISOString();
  return (data.businesses || []).map((biz) => {
    const rating = biz.rating?.toFixed(1) ?? '?';
    const reviews = (biz.review_count ?? 0).toLocaleString();
    const cats = biz.categories?.map((c) => c.title).join(', ') ?? '';
    const price = biz.price ?? '';
    const area = biz.location?.city ?? 'Miami';
    const addr = biz.location?.address1 ?? '';

    return {
      id: makeId(biz.name, biz.id),
      title: biz.name,
      summary: [rating + '★', reviews + ' reviews', cats, price, area].filter(Boolean).join(' · '),
      url: biz.url,
      source: 'Yelp',
      sourceId: 'yelp',
      vertical: 'comida',
      publishedAt: now,
      fetchedAt: now,
      imageUrl: biz.image_url || undefined,
      lang: 'en',
      whatHappening: `${biz.name} is one of Miami's most visited restaurants with ${reviews} Yelp reviews${cats ? ' — ' + cats : ''}.`,
      whoInvolved: [addr, area].filter(Boolean).join(', '),
      whyMatters: `Rated ${rating}★${price ? ' · ' + price + ' price range' : ''} — a crowd-tested pick in Miami.`,
      enhanced: true,
    };
  });
}

// ── 2. Eater Miami RSS ────────────────────────────────────────────────────────

async function fetchEaterMiami() {
  const parser = new Parser();
  const now = new Date().toISOString();
  try {
    const feed = await parser.parseURL('https://miami.eater.com/rss/index.xml');
    return feed.items.slice(0, 10).map((item) => ({
      id: makeId(item.title || '', item.link || now),
      title: decodeEntities((item.title || '').trim()),
      summary: decodeEntities((item.contentSnippet || '').replace(/<[^>]+>/g, '').slice(0, 280)),
      url: item.link || '',
      source: 'Eater Miami',
      sourceId: 'eater-miami',
      vertical: 'comida',
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : now,
      fetchedAt: now,
      lang: 'en',
    })).filter((a) => a.title && a.url);
  } catch (err) {
    console.warn(`⚠ Eater Miami RSS: ${err.message}`);
    return [];
  }
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching food content...');

  const [restaurants, news] = await Promise.all([
    fetchYelpRestaurants().catch((e) => { console.warn('⚠ Yelp:', e.message); return []; }),
    fetchEaterMiami(),
  ]);

  // Load existing, keep Yelp fresh (replace) but accumulate Eater news
  let existing = [];
  try { existing = JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch {}

  const existingNews = existing.filter((a) => a.sourceId !== 'yelp');
  const existingUrls = new Set(existingNews.map((a) => a.url));
  const newNews = news.filter((a) => !existingUrls.has(a.url));

  const combined = [...restaurants, ...newNews, ...existingNews].slice(0, MAX_ITEMS);
  fs.writeFileSync(FILE, JSON.stringify(combined, null, 2));

  console.log(`✓ comida: ${restaurants.length} restaurants (Yelp) + ${newNews.length} new articles (Eater Miami)`);
}

main().catch((err) => { console.error(err); process.exit(1); });
