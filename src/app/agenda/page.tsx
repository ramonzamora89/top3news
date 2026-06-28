import AgendaCard from '@/components/AgendaCard';
import { getAgendaEvents } from '@/lib/content';
import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  const events = getAgendaEvents();
  return {
    title: 'Cultural Agenda — top3news',
    description: 'Miami events, South Miami activities, and cultural programming — updated every Thursday.',
    ...(events.length === 0 && { robots: { index: false, follow: false } }),
  };
}

export default function AgendaPage() {
  const events = getAgendaEvents();
  return (
    <div>
      <div className="mb-8 pb-4 border-b-2 border-amber-500">
        <h1 className="text-3xl font-black text-gray-950 uppercase tracking-tight">Cultural Agenda</h1>
        <p className="text-sm text-gray-500 mt-1">Miami · South Miami · Events and activities this week — updated every Thursday</p>
      </div>
      {events.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-2xl font-black text-amber-500 mb-4">Coming Thursday</p>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            Every Thursday we curate the best events, exhibits, concerts, food festivals, and cultural activities happening in Miami and South Miami. Check back then for the full weekly agenda.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-2xl mx-auto">
            <div className="bg-amber-50 p-4 border border-amber-200">
              <p className="font-black text-sm text-amber-700 uppercase mb-1">Live Music</p>
              <p className="text-xs text-gray-600">Concerts, open mics, and DJ sets across Miami venues.</p>
            </div>
            <div className="bg-amber-50 p-4 border border-amber-200">
              <p className="font-black text-sm text-amber-700 uppercase mb-1">Food &amp; Drinks</p>
              <p className="text-xs text-gray-600">Pop-ups, tastings, and restaurant openings in South Florida.</p>
            </div>
            <div className="bg-amber-50 p-4 border border-amber-200">
              <p className="font-black text-sm text-amber-700 uppercase mb-1">Arts &amp; Culture</p>
              <p className="text-xs text-gray-600">Gallery openings, film screenings, and community events.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-gray-100">
          {events.map((e) => <AgendaCard key={e.id} event={e} />)}
        </div>
      )}
    </div>
  );
}
