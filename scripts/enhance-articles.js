#!/usr/bin/env node
/**
 * Calls Claude API to generate structured Smart Brevity content for new articles.
 * Adds: whatHappening, whoInvolved, whyMatters, articleBody, linkAnchorText fields.
 * Looks up Wikipedia background for named entities in the story before writing articleBody.
 * Skips articles already marked enhanced: true.
 */

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const CONTENT_DIR = path.join(__dirname, '..', 'content');
const VERTICALS = ['autos', 'tecnologia', 'peliculas', 'musica', 'comida'];

function stripJsonFences(raw) {
  return raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

async function getWikiTopics(article) {
  const prompt = `Given this news item, list up to 2 real-world named entities (a specific person, company, product, or organization — NOT the publication itself) for which a Wikipedia background lookup would meaningfully inform the story.

Title: ${article.title}
Summary: ${article.summary || ''}

Return ONLY a JSON array of strings (Wikipedia page title format, e.g. ["McLaren Automotive"]). Return [] if nothing clearly qualifies.`;

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });
    const topics = JSON.parse(stripJsonFences(msg.content[0].text));
    return Array.isArray(topics) ? topics : [];
  } catch {
    return [];
  }
}

async function fetchWikiContext(topics) {
  const parts = [];
  for (const topic of topics) {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic.replace(/ /g, '_'))}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'top3news/1.0 (https://top3.news)' } });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.extract) parts.push(`${data.title}: ${data.extract.slice(0, 500)}`);
    } catch {
      // Skip topics that fail to resolve — not worth failing the whole article over.
    }
  }
  return parts.join('\n\n');
}

async function enhanceArticle(article) {
  const topics = await getWikiTopics(article);
  const wikiContext = await fetchWikiContext(topics);

  const prompt = `You are a news editor. Given a news item, produce a structured breakdown as JSON.

Title: ${article.title}
Source: ${article.source}
Summary: ${article.summary || ''}
${wikiContext ? `\nBackground context (from Wikipedia — use ONLY if clearly relevant to this specific story; ignore anything that doesn't fit):\n${wikiContext}\n` : ''}
Return ONLY valid JSON (no markdown, no code fences) with exactly these fields:
{
  "whatHappening": "2-3 punchy sentences describing what is happening right now, present tense",
  "whoInvolved": "Key people, companies, or organizations involved — 1-2 sentences with relevant background on who they are",
  "whyMatters": "Why this matters or what the impact is — 2-3 sentences covering short and long-term implications",
  "articleBody": "A traditional news-article body of 4-6 paragraphs (roughly 450-650 words total), written in flowing prose — not bullet fragments. Separate paragraphs with a literal \\n\\n. Cover the event itself, relevant background, and why it matters, in a natural narrative order. Weave in concrete facts from the Wikipedia background context above where relevant, instead of vague industry-trend commentary. Do NOT use generic filler phrases like 'raises questions about the intersection of', 'underscores broader trends', 'reflects a broader pattern', or similar reflective padding — if you run out of concrete, sourced detail, end the paragraph rather than padding it with generalities. Include exactly one natural attribution to the source somewhere in the text, phrased like 'according to ANCHOR' or 'ANCHOR reports' — ANCHOR should be the source name or a short variation of it. Do not invent quotes, statistics, names, or facts beyond what is implied by the title, summary, or Wikipedia background given above.",
  "linkAnchorText": "The exact short phrase (2-5 words, e.g. 'according to Variety') used for the source attribution inside articleBody. Must appear verbatim as a substring of articleBody."
}`;

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  return JSON.parse(stripJsonFences(msg.content[0].text));
}

async function processVertical(vertical) {
  const filePath = path.join(CONTENT_DIR, `${vertical}.json`);
  if (!fs.existsSync(filePath)) return;

  const articles = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const pending = articles.filter((a) => !a.enhanced);

  if (pending.length === 0) {
    console.log(`✓ ${vertical}: no new articles to enhance`);
    return;
  }

  let enhanced = 0;
  for (const article of pending) {
    try {
      const result = await enhanceArticle(article);
      article.whatHappening = result.whatHappening;
      article.whoInvolved = result.whoInvolved;
      article.whyMatters = result.whyMatters;
      article.articleBody = result.articleBody;
      article.linkAnchorText = result.linkAnchorText;
      article.enhanced = true;
      enhanced++;
      // Small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.warn(`  ⚠ could not enhance "${article.title.slice(0, 40)}...": ${err.message}`);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
  console.log(`✓ ${vertical}: enhanced ${enhanced}/${pending.length} articles`);
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('✗ ANTHROPIC_API_KEY not set — skipping enhancement');
    process.exit(0);
  }

  console.log('Enhancing articles with Claude...\n');
  for (const v of VERTICALS) {
    await processVertical(v);
  }
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
