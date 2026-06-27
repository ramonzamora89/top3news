import Link from 'next/link';
import { getArticlesByVertical, getAgendaEvents } from '@/lib/content';
import { VERTICAL_LABELS } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import VerticalPixelArt from '@/components/VerticalPixelArt';
import AgendaCard from '@/components/AgendaCard';
import type { Article, Vertical } from '@/types';

const VERTICALS: Vertical[] = ['tecnologia', 'autos', 'peliculas', 'musica', 'comida'];

function HeroItem({ article }: { article: Article }) {
  return (
    <Link
      href={`/${article.vertical}/${article.id}`}
      className="group block pb-4 border-b border-gray-100"
      style={{ color: 'inherit', textDecoration: 'none' }}
    >
      <p className="text-xs text-gray-400 mb-1 font-medium">
        {article.source} · {formatRelativeTime(article.publishedAt)}
      </p>
      <h3 className="text-base font-black text-gray-950 group-hover:text-brand leading-snug transition-colors">
        {article.title}
      </h3>
      {(article.whatHappening || article.summary) && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
          {article.whatHappening || article.summary}
        </p>
      )}
    </Link>
  );
}

function SecondaryItem({ article }: { article: Article }) {
  return (
    <Link
      href={`/${article.vertical}/${article.id}`}
      className="group block"
      style={{ color: 'inherit', textDecoration: 'none' }}
    >
      <p className="text-xs text-gray-400 mb-0.5 font-medium">
        {article.source} · {formatRelativeTime(article.publishedAt)}
      </p>
      <h3 className="text-sm font-bold text-gray-900 group-hover:text-brand leading-snug transition-colors">
        {article.title}
      </h3>
    </Link>
  );
}

function VerticalSection({ vertical }: { vertical: Vertical }) {
  const articles = getArticlesByVertical(vertical).slice(0, 3);
  const label = VERTICAL_LABELS[vertical];
  const [hero, ...rest] = articles;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-[152px_1fr] gap-8 py-10 border-b border-gray-200 last:border-0">
      {/* Left: 8-bit pixel art anchor */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-36 h-28">
          <VerticalPixelArt vertical={vertical} />
        </div>
        <span className="font-pixel text-brand text-[9px] text-center leading-loose">{label}</span>
      </div>

      {/* Right: top 3 layout */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-brand">
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-950">{label}</h2>
          <Link
            href={`/${vertical}`}
            className="text-xs font-bold text-brand hover:text-brand-dark uppercase tracking-wide"
            style={{ textDecoration: 'none' }}
          >
            See all →
          </Link>
        </div>

        {articles.length === 0 ? (
          <p className="text-gray-400 text-sm py-4">No articles yet. Check back soon.</p>
        ) : (
          <>
            {/* Hero — #1 */}
            {hero && <HeroItem article={hero} />}

            {/* Secondary — #2 and #3 side by side */}
            {rest.length > 0 && (
              <div className="grid grid-cols-2 gap-4 pt-4">
                {rest.map((a) => <SecondaryItem key={a.id} article={a} />)}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  const agendaEvents = getAgendaEvents().slice(0, 3);
  const hasContent = VERTICALS.some((v) => getArticlesByVertical(v).length > 0);

  return (
    <div>
      {!hasContent && (
        <div className="text-center py-24 text-gray-400">
          <div className="font-pixel text-brand text-xs mb-6">top3news</div>
          <p className="font-bold text-gray-600 text-lg mb-2">Loading news...</p>
          <p className="text-sm">
            Run <code className="bg-gray-100 text-brand px-2 py-0.5">npm run fetch</code> to populate the site.
          </p>
        </div>
      )}

      {VERTICALS.map((v) => <VerticalSection key={v} vertical={v} />)}

      {agendaEvents.length > 0 && (
        <section className="pt-10">
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-amber-500">
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-950">Cultural Agenda</h2>
            <Link
              href="/agenda"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 uppercase tracking-wide"
              style={{ textDecoration: 'none' }}
            >
              See all →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {agendaEvents.map((e) => <AgendaCard key={e.id} event={e} />)}
          </div>
        </section>
      )}
    </div>
  );
}
