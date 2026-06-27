import fs from 'fs';
import path from 'path';
import type { Article, AgendaEvent, Vertical, WeatherData, MarketData } from '@/types';

const contentDir = path.join(process.cwd(), 'content');

export function getArticlesByVertical(vertical: Vertical): Article[] {
  const filePath = path.join(contentDir, `${vertical}.json`);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as Article[];
  } catch {
    return [];
  }
}

export function getArticle(vertical: Vertical, slug: string): Article | null {
  const articles = getArticlesByVertical(vertical);
  return articles.find((a) => a.id === slug) ?? null;
}

export function getAllArticles(): Article[] {
  const verticals: Vertical[] = ['autos', 'tecnologia', 'peliculas', 'musica', 'comida'];
  return verticals.flatMap(getArticlesByVertical);
}

export function getLatestByVertical(vertical: Vertical, limit: number): Article[] {
  return getArticlesByVertical(vertical).slice(0, limit);
}

export function getAgendaEvents(): AgendaEvent[] {
  const filePath = path.join(contentDir, 'agenda.json');
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as AgendaEvent[];
  } catch {
    return [];
  }
}

export function getWeather(): WeatherData | null {
  try {
    const raw = fs.readFileSync(path.join(contentDir, 'weather.json'), 'utf-8');
    const d = JSON.parse(raw);
    return d?.temp ? (d as WeatherData) : null;
  } catch {
    return null;
  }
}

export function getMarket(): MarketData | null {
  try {
    const raw = fs.readFileSync(path.join(contentDir, 'market.json'), 'utf-8');
    const d = JSON.parse(raw);
    return d?.price ? (d as MarketData) : null;
  } catch {
    return null;
  }
}
