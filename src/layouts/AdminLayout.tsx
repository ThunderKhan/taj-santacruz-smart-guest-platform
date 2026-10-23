import { Link, Outlet } from 'react-router-dom';
import { useRequests } from '@/store/RequestsProvider';
import { useRibbonOffset } from '@/hooks/useRibbonOffset';
import { Wordmark } from '@/components/Brand';
import { NotificationBell } from '@/components/NotificationBell';
import { PROPERTY } from '@/data/property';

/** Chrome for the hotel management overview. */
export function AdminLayout() {
  const offset = useRibbonOffset();
  const { requests } = useRequests();

  return (
    <div className="min-h-dvh bg-warm-50">
      <header
        className="sticky z-50 border-b border-white/10 bg-ink-900 text-cream-200"
        style={{ top: offset }}
      >
        <div className="mx-auto flex h-16 max-w-[1560px] items-center gap-5 px-4 sm:px-6 lg:px-8">
          <Link
            to="/admin"
            className="shrink-0 rounded-[3px] transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
          >
            <Wordmark dark compact />
          </Link>

          <span aria-hidden="true" className="hidden h-6 w-px bg-white/15 sm:block" />

          <div className="hidden min-w-0 sm:block">
            <p className="eyebrow-sm text-warm-500">Hotel management</p>
            <p className="truncate text-[14px] font-medium text-ivory-50">
              Property-wide service overview
            </p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[12px] text-warm-400 md:inline-flex">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold-500" />
              {requests.length} requests in session
            </span>
            <NotificationBell audience="staff" dark />
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-cream-300 bg-ivory-100">
        <div className="mx-auto flex max-w-[1560px] flex-col gap-2 px-4 py-6 text-[11.5px] text-warm-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span className="eyebrow-sm text-warm-500">
            {PROPERTY.name} · {PROPERTY.descriptor}
          </span>
          <span>
            Live figures are computed from prototype requests. Series marked “sample history” are
            illustrative only.
          </span>
        </div>
      </footer>
    </div>
  );
}
