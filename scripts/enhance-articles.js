#!/usr/bin/env node
/**
 * Calls Claude API to generate structured Smart Brevity content for new articles.
 * Adds: whatHappening, whoInvolved, whyMatters fields.
 * Skips articles already marked enhanced: true.
 */

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const CONTENT_DIR = path.join(__dirname, '..', 'content');
const VERTICALS = ['autos', 'tecnologia', 'peliculas', 'musica'];

async function enhanceArticle(article) {
  const prompt = `You are a news editor using Smart Brevity style. Given a news article, produce a structured breakdown as JSON.

Title: ${article.title}
Source: ${article.source}
Summary: ${article.summary || ''}

Return ONLY valid JSON (no markdown, no code fences) with exactly these fields:
{
  "whatHappening": "1-2 punchy sentences describing what is happening right now, present tense",
  "whoInvolved": "Key people, companies, or organizations involved — 1 sentence",
  "whyMatters": "Why this matters or what the impact is — 1-2 sentences"
}`;

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 350,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  return JSON.parse(text);
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
