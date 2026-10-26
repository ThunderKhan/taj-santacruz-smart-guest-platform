import { Link, NavLink, Outlet } from 'react-router-dom';
import { ClipboardList, Home } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { useRibbonOffset } from '@/hooks/useRibbonOffset';
import { Wordmark } from '@/components/Brand';
import { LocationControl } from '@/components/LocationSwitcher';
import { NotificationBell } from '@/components/NotificationBell';
import { CountChip } from '@/components/ui/Badge';
import { PROPERTY } from '@/data/property';
import { isTerminal } from '@/services/requestEngine';
import { cx } from '@/utils/format';

/**
 * Chrome for the guest-facing QR / tablet experience.
 * Warm ivory surfaces, generous spacing, and a discreet route back home.
 */
export function GuestLayout() {
  const offset = useRibbonOffset();
  const { session, requests, location } = useRequests();

  const mine = requests.filter((request) => request.guestRef === session.guestRef);
  const openCount = mine.filter((request) => !isTerminal(request.status)).length;

  const navItems = [
    { to: '/guest', label: 'Home', end: true },
    { to: '/guest/my-requests', label: 'My requests', end: false },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-ivory-50">
      <header
        className="sticky z-50 border-b border-cream-300 bg-ivory-50/92 backdrop-blur-md"
        style={{ top: offset }}
      >
        <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-3 px-4 sm:gap-5 sm:px-6 lg:px-8">
          <Link
            to="/guest"
            className="shrink-0 rounded-[3px] transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
          >
            <Wordmark compact />
          </Link>

          <div className="hidden shrink-0 md:block">
            <LocationControl />
          </div>

          <nav aria-label="Guest" className="ml-auto hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cx(
                    'inline-flex h-9 items-center gap-1.5 rounded-[3px] px-3 text-[13.5px] font-medium transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600',
                    isActive
                      ? 'bg-ink-900 text-ivory-50'
                      : 'text-warm-600 hover:bg-cream-200 hover:text-ink-900',
                  )
                }
              >
                {item.label === 'Home' ? (
                  <Home className="h-4 w-4" strokeWidth={1.6} />
                ) : (
                  <ClipboardList className="h-4 w-4" strokeWidth={1.6} />
                )}
                {item.label}
                {item.label === 'My requests' && openCount > 0 ? (
                  <CountChip value={openCount} />
                ) : null}
              </NavLink>
            ))}
          </nav>

          {/* Mobile cluster: allowed to shrink so narrow phones never scroll sideways */}
          <div className="ml-auto flex min-w-0 items-center justify-end gap-2 sm:ml-0 md:ml-0">
            <div className="min-w-0 md:hidden">
              <LocationControl size="sm" />
            </div>
            <NotificationBell audience="guest" />
            <Link
              to="/guest/my-requests"
              className="inline-flex h-9 items-center gap-1.5 rounded-[3px] border border-cream-300 bg-white px-2.5 text-[13px] font-medium text-ink-800 transition-colors hover:border-warm-300 hover:text-ink-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600 sm:hidden"
              aria-label="My requests"
            >
              <ClipboardList className="h-4 w-4" strokeWidth={1.6} />
              {openCount > 0 ? <CountChip value={openCount} /> : null}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-cream-300 bg-ivory-100">
        <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-md">
              <Wordmark compact />
              <p className="mt-4 text-[13px] leading-relaxed text-warm-600">
                {PROPERTY.disclosure}
              </p>
              <p className="mt-3 text-[12.5px] leading-relaxed text-warm-500">
                Demonstration content only — menus, prices, availability, timings and local
                recommendations are illustrative sample data and have not been verified against a
                real property.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-10 gap-y-6 text-[13px]">
              <div>
                <p className="eyebrow-sm mb-3 text-warm-500">Experiences</p>
                <ul className="space-y-2 text-warm-700">
                  <li>
                    <Link to="/guest/music" className="hover:text-ink-900">Live Music Requests</Link>
                  </li>
                  <li>
                    <Link to="/guest/occasions" className="hover:text-ink-900">Plan a Celebration</Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="eyebrow-sm mb-3 text-warm-500">Your stay</p>
                <ul className="space-y-2 text-warm-700">
                  <li>
                    <Link to="/guest" className="hover:text-ink-900">Home</Link>
                  </li>
                  <li>
                    <Link to="/guest/my-requests" className="hover:text-ink-900">My requests</Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="eyebrow-sm mb-3 text-warm-500">At {PROPERTY.name}</p>
                <ul className="space-y-2 text-warm-700">
                  <li>Current context</li>
                  <li className="font-medium text-ink-900">{location.label}</li>
                  <li className="text-warm-500">{location.detail}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-3 border-t border-cream-300 pt-6 text-[11.5px] text-warm-500 sm:flex-row sm:items-center sm:justify-between">
            <span className="eyebrow-sm text-warm-500">
              Smart Hotel Guest Service Platform · Concept prototype
            </span>
            <span>No real guest data, payments or bookings are processed by this prototype.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
