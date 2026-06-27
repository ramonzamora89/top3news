// Scrapes Netflix Tudum and HBO Max for movie/show news
// Adds results to content/peliculas.json (deduplicated)

const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTENT_FILE = path.join(__dirname, '..', 'content', 'peliculas.json');

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

function makeId(title, url) {
  const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 6);
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 74);
  return `${slug}-${hash}`;
}

async function scrapeNetflixTudum() {
  const url = 'https://www.netflix.com/tudum/articles';
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS });
    if (!res.ok) {
      console.warn(`⚠ Netflix Tudum HTTP ${res.status}`);
      return [];
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const articles = [];

    $('article, [class*="article"], [class*="card"], [class*="Card"]').each((_, el) => {
      const anchor = $(el).find('a[href]').first();
      let href = anchor.attr('href') || '';
      if (!href) return;
      const articleUrl = href.startsWith('http') ? href : `https://www.netflix.com${href}`;
      if (!articleUrl.includes('netflix.com')) return;

      const title = $(el).find('h1, h2, h3, [class*="title"], [class*="Title"]').first().text().trim();
      const summary = $(el).find('p, [class*="description"], [class*="Description"]').first().text().trim();
      const img = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src');

      if (!title) return;

      articles.push({
        id: makeId(title, articleUrl),
        title,
        summary: summary.slice(0, 280),
        url: articleUrl,
        source: 'Netflix Tudum',
        sourceId: 'netflix-tudum',
        vertical: 'peliculas',
        publishedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        imageUrl: img || undefined,
        lang: 'en',
      });
    });

    if (articles.length === 0) {
      console.warn('⚠ Netflix Tudum: 0 articles — selectors may be stale');
    } else {
      console.log(`✓ Netflix Tudum: ${articles.length} articles`);
    }
    return articles;
  } catch (err) {
    console.warn(`⚠ Netflix Tudum scraper failed: ${err.message}`);
    return [];
  }
}

async function scrapeHBOMax() {
  const url = 'https://www.max.com/articles';
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS });
    if (!res.ok) {
      console.warn(`⚠ HBO Max HTTP ${res.status}`);
      return [];
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const articles = [];

    $('article, [class*="article"], [class*="card"], [class*="Card"], [class*="item"]').each((_, el) => {
      const anchor = $(el).find('a[href]').first();
      let href = anchor.attr('href') || '';
      if (!href) return;
      const articleUrl = href.startsWith('http') ? href : `https://www.max.com${href}`;
      if (!articleUrl.includes('max.com')) return;

      const title = $(el).find('h1, h2, h3, [class*="title"], [class*="Title"]').first().text().trim();
      const summary = $(el).find('p, [class*="description"]').first().text().trim();
      const img = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src');

      if (!title) return;

      articles.push({
        id: makeId(title, articleUrl),
        title,
        summary: summary.slice(0, 280),
        url: articleUrl,
        source: 'Max (HBO)',
        sourceId: 'hbomax',
        vertical: 'peliculas',
        publishedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        imageUrl: img || undefined,
        lang: 'en',
      });
    });

    if (articles.length === 0) {
      console.warn('⚠ HBO Max: 0 articles — selectors may be stale');
    } else {
      console.log(`✓ HBO Max: ${articles.length} articles`);
    }
    return articles;
  } catch (err) {
    console.warn(`⚠ HBO Max scraper failed: ${err.message}`);
    return [];
  }
}

async function main() {
  console.log('\nScraping streaming sites...\n');

  const [tudum, hbo] = await Promise.all([scrapeNetflixTudum(), scrapeHBOMax()]);
  const scraped = [...tudum, ...hbo];

  if (scraped.length === 0) {
    console.log('No scraped articles — skipping update');
    return;
  }

  let existing = [];
  try {
    existing = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
  } catch {
    existing = [];
  }

  const existingUrls = new Set(existing.map((a) => a.url));
  const fresh = scraped.filter((a) => !existingUrls.has(a.url));

  const combined = [...fresh, ...existing];
  const deduped = Array.from(new Map(combined.map((a) => [a.url, a])).values());
  const trimmed = deduped.slice(0, 30);

  fs.writeFileSync(CONTENT_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  console.log(`\n✓ peliculas.json: added ${fresh.length} scraped articles (total: ${trimmed.length})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
