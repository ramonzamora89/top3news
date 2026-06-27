import ArticleCard from '@/components/ArticleCard';
import { getArticlesByVertical } from '@/lib/content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Food — top3news',
  description: 'The top 3 food and dining stories from Miami today. News from Eater Miami, Digest Miami, and more.',
  openGraph: {
    title: 'Food — top3news',
    description: 'The top 3 food and dining stories from Miami today.',
    url: 'https://top3.news/comida',
    siteName: 'top3news',
    images: [{ url: 'https://top3.news/og/comida.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Food — top3news', description: 'The top 3 food and dining stories from Miami today.', images: ['https://top3.news/og/comida.png'] },
};

export default function ComidaPage() {
  const articles = getArticlesByVertical('comida');
  return (
    <div>
      <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-brand">
        <h1 className="text-3xl font-black text-gray-950 uppercase tracking-tight">Food</h1>
      </div>
      {articles.length === 0
        ? <p className="text-gray-400 text-center py-16">No articles yet.</p>
        : articles.map((a) => <ArticleCard key={a.id} article={a} variant="compact" />)
      }
    </div>
  );
}
