import type { AgendaEvent } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AgendaCard({ event }: { event: AgendaEvent }) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-1 self-stretch bg-amber-500 rounded" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            {event.eventDate && (
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">
                {formatDate(event.eventDate)}
              </p>
            )}
            {event.source && (
              <span className="text-[10px] text-gray-400 font-medium">{event.source}</span>
            )}
          </div>
          <h3 className="font-bold text-gray-950 leading-snug mb-1">{event.title}</h3>
          {event.description && (
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{event.description}</p>
          )}
          {event.url && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs font-bold text-brand hover:text-brand-dark uppercase tracking-wide"
              style={{ textDecoration: 'none' }}
            >
              See event →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
