// Posts one article to the top3news Facebook Page.
// Picks the most recent unposted article, rotating by vertical based on the hour.
// Marks articles with fbPosted: true after publishing.

const fs = require('fs');
const path = require('path');

const PAGE_ID    = process.env.FB_PAGE_ID;
const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const DRY_RUN    = process.argv.includes('--dry-run');
const BASE_URL   = 'https://top3.news';
const CONTENT_DIR = path.join(__dirname, '..', 'content');

const VERTICALS = ['tecnologia', 'autos', 'peliculas', 'musica', 'comida'];

const EMOJI  = { autos: '🚗', tecnologia: '💻', peliculas: '🎬', musica: '🎵', comida: '🍔' };
const LABELS = { autos: 'Autos', tecnologia: 'Technology', peliculas: 'Movies', musica: 'Music', comida: 'Food' };
const TAGS   = { autos: '#Autos #Cars', tecnologia: '#Technology #Tech', peliculas: '#Movies #Film', musica: '#Music', comida: '#Food #MiamiFood' };

// Each UTC hour maps to a vertical — spreads posts evenly across 9 daily slots
const HOUR_TO_VERTICAL = { 11:'tecnologia', 13:'autos', 15:'peliculas', 17:'musica', 19:'comida', 21:'tecnologia', 23:'autos', 1:'peliculas', 3:'musica' };

function getArticles(vertical) {
  try { return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, `${vertical}.json`), 'utf-8')); }
  catch { return []; }
}

function pickArticle() {
  const hour = new Date().getUTCHours();
  const preferred = HOUR_TO_VERTICAL[hour];

  // Try preferred vertical first, then any unposted
  const order = preferred
    ? [preferred, ...VERTICALS.filter(v => v !== preferred)]
    : VERTICALS;

  for (const v of order) {
    const unposted = getArticles(v)
      .filter(a => !a.fbPosted && (a.whatHappening || a.summary))
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    if (unposted.length > 0) return unposted[0];
  }
  return null;
}

function buildMessage(article) {
  const body = article.whatHappening || article.summary || '';
  const whyLine = article.whyMatters ? `\n💡 ${article.whyMatters}` : '';
  const url = `${BASE_URL}/${article.vertical}/${article.id}`;

  return [
    `${EMOJI[article.vertical]} ${LABELS[article.vertical].toUpperCase()} | top3news`,
    '',
    article.title,
    '',
    body,
    whyLine,
    '',
    `🔗 ${url}`,
    '',
    `#top3news ${TAGS[article.vertical]} #Miami`,
  ].join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function markPosted(article) {
  const file = path.join(CONTENT_DIR, `${article.vertical}.json`);
  const articles = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const idx = articles.findIndex(a => a.id === article.id);
  if (idx !== -1) { articles[idx].fbPosted = true; fs.writeFileSync(file, JSON.stringify(articles, null, 2)); }
}

async function postToFacebook(message, link) {
  const res = await fetch(`https://graph.facebook.com/v21.0/${PAGE_ID}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, link, access_token: PAGE_TOKEN }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error?.message || `HTTP ${res.status}`);
  return data;
}

async function main() {
  if (!PAGE_ID || !PAGE_TOKEN) {
    if (DRY_RUN) { console.log('[dry-run] No FB credentials — would post if configured.'); process.exit(0); }
    console.error('Missing FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN — skipping.');
    process.exit(0);
  }

  const article = pickArticle();
  if (!article) { console.log('No unposted articles available.'); process.exit(0); }

  const message = buildMessage(article);
  const link    = `${BASE_URL}/${article.vertical}/${article.id}`;

  console.log('─────────────────────────────────');
  console.log('Article :', article.title.slice(0, 70));
  console.log('Vertical:', article.vertical);
  console.log('URL     :', link);
  console.log('─────────────────────────────────');
  console.log(message);
  console.log('─────────────────────────────────');

  if (DRY_RUN) { console.log('\n[dry-run] Not posting.'); process.exit(0); }

  const result = await postToFacebook(message, link);
  console.log(`\n✓ Posted! Facebook post ID: ${result.id}`);
  markPosted(article);
}

main().catch(err => { console.error('✗', err.message); process.exit(1); });
