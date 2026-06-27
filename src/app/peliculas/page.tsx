import ArticleCard from '@/components/ArticleCard';
import { getArticlesByVertical } from '@/lib/content';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Movies — top3news' };

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
