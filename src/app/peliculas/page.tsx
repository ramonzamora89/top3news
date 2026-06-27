import ArticleCard from '@/components/ArticleCard';
import { getArticlesByVertical } from '@/lib/content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Movies — top3news',
  description: 'The top 3 movie and entertainment stories today. News from Variety, Hollywood Reporter, and Screen Rant.',
  openGraph: {
    title: 'Movies — top3news',
    description: 'The top 3 movie and entertainment stories today.',
    url: 'https://top3.news/peliculas',
    siteName: 'top3news',
    images: [{ url: 'https://top3.news/og/peliculas.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Movies — top3news', description: 'The top 3 movie and entertainment stories today.', images: ['https://top3.news/og/peliculas.png'] },
};

export default function PeliculasPage() {
  const articles = getArticlesByVertical('peliculas');
  return (
    <div>
      <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-brand">
        <h1 className="text-3xl font-black text-gray-950 uppercase tracking-tight">Movies</h1>
      </div>
      {articles.length === 0
        ? <p className="text-gray-400 text-center py-16">No articles yet.</p>
        : articles.map((a) => <ArticleCard key={a.id} article={a} variant="compact" />)
      }
    </div>
  );
}
