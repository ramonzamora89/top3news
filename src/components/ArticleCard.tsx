import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/types';
import { VERTICAL_LABELS } from '@/types';
import { formatRelativeTime, truncate } from '@/lib/utils';

type Variant = 'hero' | 'secondary' | 'compact';

interface Props {
  article: Article;
  variant?: Variant;
}

export default function ArticleCard({ article, variant = 'compact' }: Props) {
  if (variant === 'hero') return <HeroCard article={article} />;
  if (variant === 'secondary') return <SecondaryCard article={article} />;
  return <CompactCard article={article} />;
}

/* ── Hero Card ──────────────────────────────────────────────────── */
function HeroCard({ article }: { article: Article }) {
  const href = `/${article.vertical}/${article.id}`;
  const ago = formatRelativeTime(article.publishedAt);
  const [firstSentence] = splitSummary(article.summary);

  return (
    <article className="group">
      {article.imageUrl ? (
        <Link href={href} className="block relative w-full overflow-hidden bg-gray-100 no-brand-link" style={{ aspectRatio: '16/9', textDecoration: 'none' }}>
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        </Link>
      ) : (
        <div className="w-full bg-gray-100 border-l-4 border-brand" style={{ aspectRatio: '16/9' }} />
      )}

      <div className="pt-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold bg-brand text-white px-2 py-0.5 uppercase tracking-wider">
            {VERTICAL_LABELS[article.vertical]}
          </span>
          <span className="text-xs text-gray-400">{article.source} · {ago}</span>
        </div>

        <Link href={href} className="no-brand-link" style={{ textDecoration: 'none' }}>
          <h2 className="text-xl md:text-2xl font-black text-gray-950 leading-tight group-hover:text-brand transition-colors mb-3">
            {article.title}
          </h2>
        </Link>

        {firstSentence && (
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            <strong className="text-gray-800">Why it matters:</strong>{' '}
            {truncate(firstSentence, 200)}
          </p>
        )}

        <Link href={href} className="text-xs font-bold text-brand hover:text-brand-dark uppercase tracking-wide">
          Read more →
        </Link>
      </div>
    </article>
  );
}

/* ── Secondary Card ─────────────────────────────────────────────── */
function SecondaryCard({ article }: { article: Article }) {
  const href = `/${article.vertical}/${article.id}`;
  const ago = formatRelativeTime(article.publishedAt);

  return (
    <article className="group flex gap-3 py-4 border-t border-gray-100">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-xs font-bold text-brand uppercase tracking-wide">{article.source}</span>
          <span className="text-xs text-gray-400">· {ago}</span>
        </div>
        <Link href={href} className="no-brand-link" style={{ textDecoration: 'none' }}>
          <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-brand transition-colors line-clamp-3">
            {article.title}
          </h3>
        </Link>
        <Link href={href} className="inline-block mt-2 text-xs font-bold text-brand hover:text-brand-dark">
          Read →
        </Link>
      </div>

      {article.imageUrl && (
        <Link href={href} className="flex-shrink-0 w-20 h-20 relative overflow-hidden bg-gray-100 no-brand-link" style={{ textDecoration: 'none' }}>
          <Image src={article.imageUrl} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
        </Link>
      )}
    </article>
  );
}

/* ── Compact Card (list pages) ──────────────────────────────────── */
function CompactCard({ article }: { article: Article }) {
  const href = `/${article.vertical}/${article.id}`;
  const ago = formatRelativeTime(article.publishedAt);
  const preview = article.whatHappening || (() => { const [s] = splitSummary(article.summary); return s; })();

  return (
    <article className="group flex gap-4 py-5 border-b border-gray-100">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold bg-brand text-white px-2 py-0.5 uppercase tracking-wider">
            {VERTICAL_LABELS[article.vertical]}
          </span>
          <span className="text-xs text-gray-400">{article.source} · {ago}</span>
        </div>
        <Link href={href} className="no-brand-link" style={{ textDecoration: 'none' }}>
          <h2 className="text-base md:text-lg font-black text-gray-950 leading-snug group-hover:text-brand transition-colors mb-2">
            {article.title}
          </h2>
        </Link>
        {preview && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
            {truncate(preview, 180)}
          </p>
        )}
        <Link href={href} className="inline-block mt-2 text-xs font-bold text-brand hover:text-brand-dark uppercase tracking-wide">
          Read more →
        </Link>
      </div>

      {article.imageUrl && (
        <Link href={href} className="flex-shrink-0 relative overflow-hidden bg-gray-100 no-brand-link" style={{ width: 120, height: 90, textDecoration: 'none' }}>
          <Image src={article.imageUrl} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
        </Link>
      )}
    </article>
  );
}

function splitSummary(summary: string): [string, string] {
  if (!summary) return ['', ''];
  const dot = summary.search(/[.!?]\s/);
  if (dot === -1 || dot > 200) return [summary, ''];
  return [summary.slice(0, dot + 1), summary.slice(dot + 2)];
}
