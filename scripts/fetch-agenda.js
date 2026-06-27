// Runs on Thursdays (ET) or with --force flag.
// Sources: South Miami RSS, Miami & Beaches scrape, Eventbrite Miami scrape.

const Parser = require('rss-parser');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const AGENDA_FILE = path.join(__dirname, '..', 'content', 'agenda.json');

function isThursdayET() {
  if (process.argv.includes('--force')) {
    console.log('--force flag — running regardless of day\n');
    return true;
  }
  const etDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  return etDate.getDay() === 4;
}

function makeId(prefix, text) {
  return `${prefix}-${crypto.createHash('md5').update(text).digest('hex').slice(0, 8)}`;
}

function decodeEntities(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function cleanText(text) {
  return decodeEntities((text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
}

// ── 1. South Miami government RSS ────────────────────────────────────────────

async function fetchSouthMiamiRSS() {
  const parser = new Parser();
  const feeds = [
    { id: 'sm-events', name: 'South Miami Special Events', url: 'https://www.southmiamifl.gov/RSSFeed.aspx?ModID=58&CID=Special-Events-Calendar-23' },
    { id: 'sm-parks',  name: 'South Miami Parks & Rec',   url: 'https://www.southmiamifl.gov/RSSFeed.aspx?ModID=58&CID=Parks-and-Recreation-Department-24' },
  ];

  const events = [];
  for (const feed of feeds) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const now = new Date().toISOString();
      parsed.items.slice(0, 10).forEach((item) => {
        if (!item.title) return;
        events.push({
          id: makeId(feed.id, item.title + (item.pubDate || '')),
          title: cleanText(item.title),
          description: cleanText(item.contentSnippet || item.content || '').slice(0, 300),
          url: item.link || undefined,
          eventDate: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
          source: feed.name,
          fetchedAt: now,
        });
      });
      console.log(`✓ ${feed.name}: ${parsed.items.length} events`);
    } catch (err) {
      console.warn(`⚠ ${feed.name}: ${err.message}`);
    }
  }
  return events;
}

// ── 2. Miami & Beaches — RSS-based category pages ────────────────────────────
// Note: the main events page is JS-rendered. We scrape their static category
// pages which expose event links in the HTML before hydration.

async function fetchMiamiBeaches() {
  const categoryUrls = [
    'https://www.miamiandbeaches.com/events/concerts-music-events',
    'https://www.miamiandbeaches.com/events/sporting-events',
    'https://www.miamiandbeaches.com/events/art-culture',
    'https://www.miamiandbeaches.com/events/food-drink',
  ];

  const now = new Date().toISOString();
  const events = [];
  const seenUrls = new Set();

  for (const catUrl of categoryUrls) {
    try {
      const res = await fetch(catUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);

      // Look for JSON-LD structured data first
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const data = JSON.parse($(el).html() || '{}');
          const items = Array.isArray(data) ? data :
            data['@type'] === 'ItemList' ? (data.itemListElement || []).map((i) => i.item) : [data];
          items.forEach((item) => {
            if (!item || item['@type'] !== 'Event') return;
            const title = cleanText(item.name);
            const url = item.url || catUrl;
            if (!title || seenUrls.has(url)) return;
            seenUrls.add(url);
            events.push({
              id: makeId('mb', title + (item.startDate || '')),
              title,
              description: cleanText(item.description || '').slice(0, 250) || undefined,
              url,
              eventDate: item.startDate ? new Date(item.startDate).toISOString() : undefined,
              source: 'Miami & Beaches',
              fetchedAt: now,
            });
          });
        } catch {}
      });
    } catch (err) {
      console.warn(`  ⚠ MB category ${catUrl.split('/').pop()}: ${err.message}`);
    }
  }

  console.log(`✓ Miami & Beaches: ${events.length} events`);
  return events;
}

// ── 3. Eventbrite Miami scrape ────────────────────────────────────────────────

async function fetchEventbrite() {
  const url = 'https://www.eventbrite.com/d/fl--miami/events/';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const now = new Date().toISOString();
    const events = [];

    // Eventbrite uses structured data — extract JSON-LD events
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || '{}');
        const items = Array.isArray(data) ? data : data['@type'] === 'ItemList' ? (data.itemListElement || []).map((i) => i.item) : [data];
        items.forEach((item) => {
          if (!item || item['@type'] !== 'Event') return;
          const title = cleanText(item.name);
          if (!title) return;
          events.push({
            id: makeId('eb', title + (item.startDate || '')),
            title,
            description: cleanText(item.description || '').slice(0, 250),
            url: item.url || url,
            eventDate: item.startDate ? new Date(item.startDate).toISOString() : undefined,
            source: 'Eventbrite',
            fetchedAt: now,
          });
        });
      } catch {}
    });

    // Fallback: scrape event cards directly
    if (events.length === 0) {
      const cardSels = ['[class*="event-card"]', '[data-testid*="event"]', '.search-event-card-wrapper', 'article'];
      for (const sel of cardSels) {
        const cards = $(sel);
        if (cards.length < 2) continue;
        cards.slice(0, 12).each((_, el) => {
          const title = cleanText($(el).find('h2, h3, [class*="title"], [class*="name"]').first().text());
          if (!title || title.length < 5) return;
          const link = $(el).find('a[href*="eventbrite.com"]').first().attr('href') ||
                       $(el).closest('a[href]').attr('href') || url;
          const date = cleanText($(el).find('[class*="date"], time').first().text());
          events.push({
            id: makeId('eb', title),
            title,
            description: date || undefined,
            url: link,
            source: 'Eventbrite',
            fetchedAt: now,
          });
        });
        if (events.length > 0) break;
      }
    }

    console.log(`✓ Eventbrite Miami: ${events.length} events`);
    return events;
  } catch (err) {
    console.warn(`⚠ Eventbrite: ${err.message}`);
    return [];
  }
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!isThursdayET()) {
    console.log('Not Thursday (ET) — skipping agenda fetch. Use --force to override.');
    return;
  }

  console.log('Fetching weekend agenda for Miami...\n');

  const [smEvents, mbEvents, ebEvents] = await Promise.all([
    fetchSouthMiamiRSS(),
    fetchMiamiBeaches(),
    fetchEventbrite(),
  ]);

  const allEvents = [...smEvents, ...mbEvents, ...ebEvents];

  // Deduplicate by title similarity
  const seen = new Set();
  const unique = allEvents.filter((e) => {
    const key = e.title.toLowerCase().replace(/\s+/g, ' ').slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort: events with dates first (ascending), undated last
  unique.sort((a, b) => {
    if (a.eventDate && b.eventDate) return new Date(a.eventDate) - new Date(b.eventDate);
    if (a.eventDate) return -1;
    if (b.eventDate) return 1;
    return 0;
  });

  if (unique.length === 0) {
    console.warn('\n⚠ No agenda events found — keeping previous content');
    return;
  }

  fs.writeFileSync(AGENDA_FILE, JSON.stringify(unique, null, 2), 'utf-8');
  console.log(`\n✓ agenda.json: ${unique.length} events saved (${smEvents.length} South Miami, ${mbEvents.length} Miami & Beaches, ${ebEvents.length} Eventbrite)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
