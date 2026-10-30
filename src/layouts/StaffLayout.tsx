import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Users } from 'lucide-react';
import { departmentName } from '@/data/departments';
import { useRequests } from '@/store/RequestsProvider';
import { useAuth } from '@/store/AuthProvider';
import { useRibbonOffset } from '@/hooks/useRibbonOffset';
import { Wordmark } from '@/components/Brand';
import { NotificationBell } from '@/components/NotificationBell';
import { CountChip } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DEPARTMENT_ICONS } from '@/features/departments/departmentMeta';
import { isTerminal } from '@/services/requestEngine';
import { isEnquiryTerminal } from '@/services/enquiryEngine';
import { PROPERTY } from '@/data/property';
import { cx } from '@/utils/format';

/**
 * Dark operations console for the signed-in staff role.
 *
 * Two desks only: the celebration **event enquiries** pipeline and the
 * **musicians** who can be assigned to them. Live music requests are owned by
 * the performers in their own console — the events desk never sees them, so
 * staff control everything *except* the live music queue.
 */
export function StaffLayout() {
  const offset = useRibbonOffset();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active: 'events' | 'musicians' = pathname.startsWith('/staff/musicians')
    ? 'musicians'
    : 'events';
  const { requests, enquiries, musicians } = useRequests();
  const { session, signOut } = useAuth();

  const openEnquiries = enquiries.filter((enquiry) => !isEnquiryTerminal(enquiry.status));

  const desks = [
    {
      id: 'events',
      to: '/staff/events',
      label: 'Event enquiries',
      Icon: DEPARTMENT_ICONS.events,
      count: openEnquiries.length,
    },
    {
      id: 'musicians',
      to: '/staff/musicians',
      label: 'Musicians',
      Icon: Users,
      count: musicians.length,
    },
  ] as const;

  const title = active === 'events' ? departmentName('events') : 'Musicians';
  const totalOpen =
    requests.filter((request) => !isTerminal(request.status)).length + openEnquiries.length;

  return (
    <div className="min-h-dvh bg-ink-900 text-cream-200">
      <header
        className="sticky z-50 border-b border-white/10 bg-ink-950"
        style={{ top: offset }}
      >
        <div className="mx-auto flex h-14 max-w-[1560px] items-center gap-4 px-4 sm:px-6">
          <Link
            to="/staff"
            className="shrink-0 rounded-[3px] transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
          >
            <Wordmark dark compact />
          </Link>

          <span aria-hidden="true" className="hidden h-6 w-px bg-white/12 lg:block" />

          <div className="hidden min-w-0 lg:block">
            <p className="eyebrow-sm text-warm-500">Staff console</p>
            <p className="truncate text-[14px] font-medium text-ivory-50">
              {title}
              {session ? ` · ${session.displayName}` : ''}
            </p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2.5">
            <span className="hidden items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[12px] text-warm-400 sm:inline-flex">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sage-400 animate-soft-pulse" />
              <span className="tabular-nums">{totalOpen} open across all teams</span>
            </span>
            <NotificationBell audience="staff" dark />
            <Button
              variant="outlineDark"
              size="sm"
              onClick={async () => {
                try {
                  await signOut();
                  navigate('/login', { replace: true });
                } catch {
                  window.alert('Music sign-out failed. Please try again.');
                }
              }}
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1560px]">
        {/* Department rail */}
        <aside
          className="sticky hidden w-[248px] shrink-0 self-start border-r border-white/10 lg:block"
          style={{ top: offset + 56 }}
        >
          <nav aria-label="Desks" className="py-5">
            <p className="eyebrow-sm px-5 pb-3 text-warm-500">Desks</p>
            <ul>
              {desks.map(({ id, to, label, Icon, count }) => {
                const current = id === active;
                return (
                  <li key={id}>
                    <NavLink
                      to={to}
                      className={cx(
                        'relative flex items-center gap-3 px-5 py-3 text-[14px] transition-colors',
                        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-500',
                        current
                          ? 'bg-white/[0.07] text-ivory-50'
                          : 'text-warm-400 hover:bg-white/[0.04] hover:text-cream-200',
                      )}
                    >
                      {current ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 left-0 w-[2px] bg-gold-500"
                        />
                      ) : null}
                      <Icon
                        className={cx('h-4 w-4 shrink-0', current ? 'text-gold-400' : 'text-warm-500')}
                        strokeWidth={1.6}
                      />
                      <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
                      {count > 0 ? <CountChip value={count} dark /> : null}
                    </NavLink>
                  </li>
                );
              })}
            </ul>

            <div className="mx-5 mt-5 border-t border-white/10 pt-4">
              <p className="text-[11.5px] leading-relaxed text-warm-500">
                Staff own celebration enquiries, packages and musician accounts. Live music requests
                are worked by the performers in their own console. Demo sign-in only — production
                deployments require authenticated accounts and server-side authorisation.
              </p>
            </div>
          </nav>
        </aside>

        {/* Active queue */}
        <div className="min-w-0 flex-1">
          {/* Mobile department strip */}
          <nav
            aria-label="Desks"
            className="flex gap-1 overflow-x-auto border-b border-white/10 px-3 py-2 no-scrollbar lg:hidden"
          >
            {desks.map(({ id, to, label, Icon, count }) => {
              const current = id === active;
              return (
                <NavLink
                  key={id}
                  to={to}
                  className={cx(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-[3px] px-2.5 py-1.5 text-[12.5px] font-medium transition-colors',
                    current
                      ? 'bg-gold-500 text-ink-950'
                      : 'text-warm-400 hover:bg-white/10 hover:text-cream-200',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.7} />
                  {label}
                  {count > 0 ? <CountChip value={count} dark={!current} /> : null}
                </NavLink>
              );
            })}
          </nav>

          <Outlet />
        </div>
      </div>

      <footer className="border-t border-white/10 bg-ink-950">
        <div className="mx-auto flex max-w-[1560px] flex-col gap-2 px-4 py-5 text-[11.5px] text-warm-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="eyebrow-sm text-warm-500">
            {PROPERTY.name} · {PROPERTY.descriptor}
          </span>
          <span>Prototype environment · simulated staff access, not production authentication</span>
        </div>
      </footer>
    </div>
  );
}
