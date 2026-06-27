import Link from 'next/link';
import SP500Widget from './SP500Widget';
import WeatherWidget from './WeatherWidget';

const NAV_LINKS = [
  { href: '/autos', label: 'Autos' },
  { href: '/tecnologia', label: 'Technology' },
  { href: '/peliculas', label: 'Movies' },
  { href: '/musica', label: 'Music' },
  { href: '/agenda', label: 'Agenda' },
];

export default function Header() {
  return (
    <header className="bg-black border-b-2 border-brand sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-4">

          {/* 8-bit logo */}
          <Link
            href="/"
            className="flex-shrink-0 no-brand-link"
            style={{ textDecoration: 'none' }}
          >
            <span
              className="font-pixel text-brand leading-none"
              style={{ fontSize: '13px', letterSpacing: '-0.5px' }}
            >
              top3
            </span>
            <span
              className="font-pixel text-white leading-none"
              style={{ fontSize: '13px', letterSpacing: '-0.5px' }}
            >
              news
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-300 hover:text-brand px-3 py-1.5 rounded transition-colors no-brand-link"
                style={{ textDecoration: 'none' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Widgets */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <WeatherWidget />
            <div className="h-4 w-px bg-gray-700 hidden sm:block" />
            <SP500Widget />
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex gap-0 pb-2 overflow-x-auto scrollbar-hide">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-gray-400 hover:text-brand px-3 py-1 rounded transition-colors whitespace-nowrap no-brand-link"
              style={{ textDecoration: 'none' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
