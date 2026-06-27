import ArticleCard from '@/components/ArticleCard';
import { getArticlesByVertical } from '@/lib/content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Technology — top3news',
  description: 'The top 3 tech stories today. News from The Verge, TechCrunch, and Wired.',
  openGraph: {
    title: 'Technology — top3news',
    description: 'The top 3 tech stories today.',
    url: 'https://top3.news/tecnologia',
    siteName: 'top3news',
    images: [{ url: 'https://top3.news/og/tecnologia.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Technology — top3news', description: 'The top 3 tech stories today.', images: ['https://top3.news/og/tecnologia.png'] },
};

export default function TecnologiaPage() {
  const articles = getArticlesByVertical('tecnologia');
  return (
    <div>
      <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-brand">
        <h1 className="text-3xl font-black text-gray-950 uppercase tracking-tight">Technology</h1>
      </div>
      {articles.length === 0
        ? <p className="text-gray-400 text-center py-16">No articles yet.</p>
        : articles.map((a) => <ArticleCard key={a.id} article={a} variant="compact" />)
      }
    </div>
  );
}
