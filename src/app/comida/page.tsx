import Link from 'next/link';
import Image from 'next/image';
import { getArticlesByVertical } from '@/lib/content';
import { formatRelativeTime } from '@/lib/utils';
import type { Metadata } from 'next';
import type { Article } from '@/types';

export const metadata: Metadata = { title: 'Food — top3news' };

function RestaurantCard({ article }: { article: Article }) {
  return (
    <div className="border border-gray-100 hover:border-brand transition-colors p-4 flex gap-4">
      {article.imageUrl && (
        <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 overflow-hidden">
          <Image src={article.imageUrl} alt={article.title} fill className="object-cover" unoptimized />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-gray-950 hover:text-brand leading-snug block mb-0.5"
          style={{ textDecoration: 'none' }}
        >
          {article.title}
        </a>
        <p className="text-xs text-gray-500 mb-1">{article.summary}</p>
        {article.whoInvolved && (
          <p className="text-xs text-gray-400">{article.whoInvolved}</p>
        )}
      </div>
    </div>
  );
}

function ArticleItem({ article }: { article: Article }) {
  return (
    <Link
      href={`/comida/${article.id}`}
      className="block py-3 border-b border-gray-100 last:border-0 hover:text-brand transition-colors"
      style={{ color: 'inherit', textDecoration: 'none' }}
    >
      <p className="text-xs text-gray-400 mb-0.5">{article.source} · {formatRelativeTime(article.publishedAt)}</p>
      <p className="font-bold text-sm text-gray-900 leading-snug">{article.title}</p>
    </Link>
  );
}

export default function ComidaPage() {
  const all = getArticlesByVertical('comida');
  const restaurants = all.filter((a) => a.sourceId === 'yelp');
  const news = all.filter((a) => a.sourceId !== 'yelp');

  return (
    <div>
      <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-brand">
        <h1 className="text-3xl font-black text-gray-950 uppercase tracking-tight">Food</h1>
      </div>

      {restaurants.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-brand mb-4">Top Restaurants in Miami</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {restaurants.map((r) => <RestaurantCard key={r.id} article={r} />)}
          </div>
        </section>
      )}

      {news.length > 0 && (
        <section>
          <h2 className="text-sm font-black uppercase tracking-widest text-brand mb-4">Food News</h2>
          {news.map((a) => <ArticleItem key={a.id} article={a} />)}
        </section>
      )}

      {all.length === 0 && (
        <p className="text-gray-400 text-center py-16">
          No food content yet. Set <code className="bg-gray-100 px-1">YELP_API_KEY</code> and run{' '}
          <code className="bg-gray-100 px-1">npm run fetch:food</code>.
        </p>
      )}
    </div>
  );
}
