import ArticleCard from '@/components/ArticleCard';
import { getArticlesByVertical } from '@/lib/content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Music — top3news',
  description: 'The top 3 music stories today. News from Rolling Stone, Pitchfork, and NME.',
  openGraph: {
    title: 'Music — top3news',
    description: 'The top 3 music stories today.',
    url: 'https://top3.news/musica',
    siteName: 'top3news',
    images: [{ url: 'https://top3.news/og/musica.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Music — top3news', description: 'The top 3 music stories today.', images: ['https://top3.news/og/musica.png'] },
};

export default function MusicaPage() {
  const articles = getArticlesByVertical('musica');
  return (
    <div>
      <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-brand">
        <h1 className="text-3xl font-black text-gray-950 uppercase tracking-tight">Music</h1>
      </div>
      {articles.length === 0
        ? <p className="text-gray-400 text-center py-16">No articles yet.</p>
        : articles.map((a) => <ArticleCard key={a.id} article={a} variant="compact" />)
      }
    </div>
  );
}
