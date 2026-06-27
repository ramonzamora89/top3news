export type Vertical = 'autos' | 'tecnologia' | 'peliculas' | 'musica' | 'comida';

export interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  sourceId: string;
  vertical: Vertical;
  publishedAt: string;
  fetchedAt: string;
  imageUrl?: string;
  lang: 'es' | 'en';
  whatHappening?: string;
  whoInvolved?: string;
  whyMatters?: string;
  enhanced?: boolean;
}

export interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  url?: string;
  eventDate?: string;
  source?: string;
  fetchedAt: string;
}

export interface WeatherData {
  temp: number;
  description: string;
  emoji: string;
  city: string;
  fetchedAt: string;
}

export interface MarketData {
  price: number;
  change: number;
  changePercent: number;
  up: boolean;
  fetchedAt: string;
}

export const VERTICAL_LABELS: Record<Vertical, string> = {
  autos: 'Autos',
  tecnologia: 'Technology',
  peliculas: 'Movies',
  musica: 'Music',
  comida: 'Food',
};

export const VERTICAL_COLORS: Record<Vertical, string> = {
  autos: 'bg-brand text-white',
  tecnologia: 'bg-brand text-white',
  peliculas: 'bg-brand text-white',
  musica: 'bg-brand text-white',
  comida: 'bg-brand text-white',
};
