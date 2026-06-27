import AgendaCard from '@/components/AgendaCard';
import { getAgendaEvents } from '@/lib/content';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Cultural Agenda — top3news' };

export default function AgendaPage() {
  const events = getAgendaEvents();
  return (
    <div>
      <div className="mb-8 pb-4 border-b-2 border-amber-500">
        <h1 className="text-3xl font-black text-gray-950 uppercase tracking-tight">Cultural Agenda</h1>
        <p className="text-sm text-gray-500 mt-1">Miami · South Miami · Events and activities this week — updated every Thursday</p>
      </div>
      {events.length === 0
        ? <p className="text-gray-400 text-center py-16">The agenda is published every Thursday.</p>
        : <div className="space-y-0 divide-y divide-gray-100">{events.map((e) => <AgendaCard key={e.id} event={e} />)}</div>
      }
    </div>
  );
}
