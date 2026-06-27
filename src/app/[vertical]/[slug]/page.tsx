import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAllArticles, getArticle } from '@/lib/content';
import { VERTICAL_LABELS } from '@/types';
import { formatDate } from '@/lib/utils';
import type { Vertical } from '@/types';

const VALID_VERTICALS: Vertical[] = ['autos', 'tecnologia', 'peliculas', 'musica'];

interface Props {
  params: { vertical: string; slug: string };
}

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ vertical: a.vertical, slug: a.id }));
}

export function generateMetadata({ params }: Props) {
  const vertical = params.vertical as Vertical;
  if (!VALID_VERTICALS.includes(vertical)) return {};
  const article = getArticle(vertical, params.slug);
  if (!article) return {};
  return { title: `${article.title} — top3news`, description: article.whatHappening ?? article.summary };
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">{label}</p>
      <p className="text-base text-gray-800 leading-relaxed">{children}</p>
    </div>
  );
}

export default function ArticlePage({ params }: Props) {
  const vertical = params.vertical as Vertical;
  if (!VALID_VERTICALS.includes(vertical)) notFound();
  const article = getArticle(vertical, params.slug);
  if (!article) notFound();

  const hasEnhanced = article.whatHappening || article.whoInvolved || article.whyMatters;

  return (
    <article className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/${vertical}`}
          className="text-sm font-bold text-brand hover:text-brand-dark uppercase tracking-wide"
          style={{ textDecoration: 'none' }}
        >
          ← {VERTICAL_LABELS[vertical]}
        </Link>
      </div>

      <header className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold bg-brand text-white px-2 py-0.5 uppercase tracking-wider">
            {VERTICAL_LABELS[vertical]}
          </span>
          <span className="text-sm text-gray-400">
            {article.source} · {formatDate(article.publishedAt)}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-950 leading-tight">{article.title}</h1>
      </header>

      {article.imageUrl && (
        <div className="relative w-full overflow-hidden mb-8 bg-gray-100" style={{ aspectRatio: '16/9' }}>
          <Image src={article.imageUrl} alt={article.title} fill className="object-cover" unoptimized />
        </div>
      )}

      <div className="border-l-4 border-brand pl-5 py-4 mb-8 bg-orange-50">
        {hasEnhanced ? (
          <>
            {article.whatHappening && <Section label="What's happening">{article.whatHappening}</Section>}
            {article.whoInvolved && <Section label="Who's involved">{article.whoInvolved}</Section>}
            {article.whyMatters && <Section label="Why it matters">{article.whyMatters}</Section>}
          </>
        ) : (
          <>
            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">Why it matters</p>
            <p className="text-base text-gray-800 leading-relaxed">{article.summary}</p>
          </>
        )}
      </div>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-brand text-white text-sm font-bold px-6 py-3 hover:bg-brand-dark transition-colors uppercase tracking-wide"
        style={{ textDecoration: 'none' }}
      >
        Read full story on {article.source} ↗
      </a>
    </article>
  );
}
