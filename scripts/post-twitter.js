// Posts one article to @Top_3_News on X (Twitter).
// Picks the most recent unposted article, rotating by vertical based on the hour.
// Marks articles with twitterPosted: true after publishing.

const fs = require('fs');
const path = require('path');
const { TwitterApi } = require('twitter-api-v2');

const DRY_RUN    = process.argv.includes('--dry-run');
const BASE_URL   = 'https://top3.news';
const CONTENT_DIR = path.join(__dirname, '..', 'content');

const VERTICALS = ['tecnologia', 'autos', 'peliculas', 'musica', 'comida'];

const EMOJI  = { autos: '🚗', tecnologia: '💻', peliculas: '🎬', musica: '🎵', comida: '🍔' };
const LABELS = { autos: 'Autos', tecnologia: 'Technology', peliculas: 'Movies', musica: 'Music', comida: 'Food' };
const TAGS   = { autos: '#Autos #Cars', tecnologia: '#Technology #Tech', peliculas: '#Movies #Film', musica: '#Music', comida: '#Food #MiamiFood' };

// Each UTC hour maps to a vertical — matches Facebook schedule
const HOUR_TO_VERTICAL = { 11:'tecnologia', 13:'autos', 15:'peliculas', 17:'musica', 19:'comida', 21:'tecnologia', 23:'autos', 1:'peliculas', 3:'musica' };

function getArticles(vertical) {
  try { return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, `${vertical}.json`), 'utf-8')); }
  catch { return []; }
}

function pickArticle() {
  const hour = new Date().getUTCHours();
  const preferred = HOUR_TO_VERTICAL[hour];

  const order = preferred
    ? [preferred, ...VERTICALS.filter(v => v !== preferred)]
    : VERTICALS;

  for (const v of order) {
    const unposted = getArticles(v)
      .filter(a => !a.twitterPosted && (a.whatHappening || a.summary))
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    if (unposted.length > 0) return unposted[0];
  }
  return null;
}

function buildTweet(article) {
  const url   = `${BASE_URL}/${article.vertical}/${article.id}`;
  const emoji = EMOJI[article.vertical];
  const label = LABELS[article.vertical].toUpperCase();
  const tags  = `#top3news ${TAGS[article.vertical]}`;

  // URL counts as 23 chars on X regardless of length
  const fixedPart = `${emoji} ${label} | top3news\n\n\n\n${url}\n\n${tags}`;
  const fixedLen  = fixedPart.length - url.length + 23;
  const titleBudget = 280 - fixedLen - 2; // 2 for \n\n before title

  const title = article.title.length > titleBudget
    ? article.title.slice(0, titleBudget - 1) + '…'
    : article.title;

  return [
    `${emoji} ${label} | top3news`,
    '',
    title,
    '',
    url,
    '',
    tags,
  ].join('\n').trim();
}

function markPosted(article) {
  const file = path.join(CONTENT_DIR, `${article.vertical}.json`);
  const articles = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const idx = articles.findIndex(a => a.id === article.id);
  if (idx !== -1) { articles[idx].twitterPosted = true; fs.writeFileSync(file, JSON.stringify(articles, null, 2)); }
}

async function postToTwitter(text) {
  const client = new TwitterApi({
    appKey:            process.env.TWITTER_API_KEY,
    appSecret:         process.env.TWITTER_API_SECRET,
    accessToken:       process.env.TWITTER_ACCESS_TOKEN,
    accessSecret:      process.env.TWITTER_ACCESS_SECRET,
  });
  const result = await client.v2.tweet(text);
  return result.data;
}

async function main() {
  const hasCredentials = process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET
    && process.env.TWITTER_ACCESS_TOKEN && process.env.TWITTER_ACCESS_SECRET;

  if (!hasCredentials) {
    if (DRY_RUN) { console.log('[dry-run] No Twitter credentials — would post if configured.'); process.exit(0); }
    console.error('Missing Twitter credentials — skipping.');
    process.exit(0);
  }

  const article = pickArticle();
  if (!article) { console.log('No unposted articles available.'); process.exit(0); }

  const tweet = buildTweet(article);
  const url   = `${BASE_URL}/${article.vertical}/${article.id}`;

  console.log('─────────────────────────────────');
  console.log('Article :', article.title.slice(0, 70));
  console.log('Vertical:', article.vertical);
  console.log('URL     :', url);
  console.log('Chars   :', tweet.length);
  console.log('─────────────────────────────────');
  console.log(tweet);
  console.log('─────────────────────────────────');

  if (DRY_RUN) { console.log('\n[dry-run] Not posting.'); process.exit(0); }

  const result = await postToTwitter(tweet);
  console.log(`\n✓ Posted! Tweet ID: ${result.id}`);
  markPosted(article);
}

main().catch(err => { console.error('✗', err.message); process.exit(1); });
