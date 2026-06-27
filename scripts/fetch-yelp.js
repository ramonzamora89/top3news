// Fetches Miami food content from curated local RSS feeds.
// Sources: Eater Miami, Miami Food Pug, Digest Miami, Miami Curated, Miami Take

const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const FILE = path.join(CONTENT_DIR, 'comida.json');
const MAX_ITEMS = 30;

const FOOD_FEEDS = [
  { id: 'eater-miami',    name: 'Eater Miami',    url: 'https://miami.eater.com/rss/index.xml' },
  { id: 'digest-miami',   name: 'Digest Miami',   url: 'https://www.digestmiami.com/category/best-miami-restaurants/feed/' },
  { id: 'miamifoodpug',  name: 'Miami Food Pug', url: 'https://miamifoodpug.com/feed/' },
  { id: 'miami-curated',  name: 'Miami Curated',  url: 'https://www.miamicurated.com/category/food/feed/' },
  { id: 'miami-take',     name: 'Miami Take',     url: 'https://miamitake.com/category/food/feed/' },
];

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
function cleanText(t, max = 280) {
  const s = decodeEntities((t || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
  return s.length > max ? s.slice(0, max).replace(/\s\S*$/, '') + '…' : s;
}

async function fetchFeed(feed) {
  const parser = new Parser({
    customFields: { item: [['media:content', 'media:content', { keepArray: false }]] },
  });
  const now = new Date().toISOString();
  try {
    const parsed = await parser.parseURL(feed.url);
    const items = parsed.items.slice(0, 8).map((item) => {
      let imageUrl = item.enclosure?.url || item['media:content']?.url;
      if (!imageUrl) {
        const m = (item['content:encoded'] || item.content || '').match(/<img[^>]+src="([^"]+)"/);
        if (m) imageUrl = m[1];
      }
      return {
        id: makeId(item.title || '', item.link || now),
        title: cleanText(item.title),
        summary: cleanText(item.contentSnippet || item['content:encoded'] || ''),
        url: item.link || '',
        source: feed.name,
        sourceId: feed.id,
        vertical: 'comida',
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : now,
        fetchedAt: now,
        imageUrl: imageUrl || undefined,
        lang: 'en',
      };
    }).filter((a) => a.title && a.url);
    console.log(`✓ ${feed.name}: ${items.length} articles`);
    return items;
  } catch (err) {
    console.warn(`⚠ ${feed.name}: ${err.message}`);
    return [];
  }
}

async function main() {
  console.log('Fetching Miami food feeds...\n');

  const results = await Promise.all(FOOD_FEEDS.map(fetchFeed));
  const fresh = results.flat();

  // Merge with existing — keep old articles not seen in fresh batch
  let existing = [];
  try { existing = JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch {}

  const freshUrls = new Set(fresh.map((a) => a.url));
  const kept = existing.filter((a) => !freshUrls.has(a.url));
  const combined = [...fresh, ...kept].slice(0, MAX_ITEMS);

  fs.writeFileSync(FILE, JSON.stringify(combined, null, 2));
  console.log(`\n✓ comida.json: ${combined.length} articles total`);
}

main().catch((err) => { console.error(err); process.exit(1); });
