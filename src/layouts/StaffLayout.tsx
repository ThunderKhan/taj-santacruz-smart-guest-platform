import { Link, NavLink, Outlet } from 'react-router-dom';
import { DEPARTMENTS, departmentName } from '@/data/departments';
import { useRequests } from '@/store/RequestsProvider';
import { useRibbonOffset } from '@/hooks/useRibbonOffset';
import { useActiveDepartment } from '@/hooks/useActiveDepartment';
import { Wordmark } from '@/components/Brand';
import { NotificationBell } from '@/components/NotificationBell';
import { CountChip } from '@/components/ui/Badge';
import { DEPARTMENT_ICONS, DEPARTMENT_SHORT } from '@/features/departments/departmentMeta';
import { isTerminal } from '@/services/requestEngine';
import { PROPERTY } from '@/data/property';
import { cx } from '@/utils/format';

/**
 * Dark operations console shared by all six department dashboards.
 * Midnight navy chrome with a fixed department rail — purpose-built for staff
 * rather than a light consumer layout shrunk down.
 */
export function StaffLayout() {
  const offset = useRibbonOffset();
  const active = useActiveDepartment();
  const { requests } = useRequests();

  const openCount = (department: string) =>
    requests.filter(
      (request) =>
        request.department === department &&
        (request.status === 'submitted' || request.status === 'accepted'),
    ).length;

  const totalOpen = requests.filter(
    (request) => !isTerminal(request.status),
  ).length;

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
            <p className="eyebrow-sm text-warm-500">Department operations</p>
            <p className="truncate text-[14px] font-medium text-ivory-50">
              {departmentName(active)}
            </p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2.5">
            <span className="hidden items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[12px] text-warm-400 sm:inline-flex">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sage-400 animate-soft-pulse" />
              <span className="tabular-nums">{totalOpen} open across all teams</span>
            </span>
            <NotificationBell audience="staff" dark />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1560px]">
        {/* Department rail */}
        <aside
          className="sticky hidden w-[248px] shrink-0 self-start border-r border-white/10 lg:block"
          style={{ top: offset + 56 }}
        >
          <nav aria-label="Departments" className="py-5">
            <p className="eyebrow-sm px-5 pb-3 text-warm-500">Queues</p>
            <ul>
              {DEPARTMENTS.map((department) => {
                const Icon = DEPARTMENT_ICONS[department.id];
                const current = department.id === active;
                const count = openCount(department.id);
                return (
                  <li key={department.id}>
                    <NavLink
                      to={`/staff/${department.id}`}
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
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {DEPARTMENT_SHORT[department.id]}
                      </span>
                      {count > 0 ? <CountChip value={count} dark /> : null}
                    </NavLink>
                  </li>
                );
              })}
            </ul>

            <div className="mx-5 mt-5 border-t border-white/10 pt-4">
              <p className="text-[11.5px] leading-relaxed text-warm-500">
                Simulated staff access for demonstration only. Production deployments require
                authenticated accounts, role-based permissions and server-side authorisation.
              </p>
            </div>
          </nav>
        </aside>

        {/* Active queue */}
        <div className="min-w-0 flex-1">
          {/* Mobile department strip */}
          <nav
            aria-label="Departments"
            className="flex gap-1 overflow-x-auto border-b border-white/10 px-3 py-2 no-scrollbar lg:hidden"
          >
            {DEPARTMENTS.map((department) => {
              const Icon = DEPARTMENT_ICONS[department.id];
              const current = department.id === active;
              const count = openCount(department.id);
              return (
                <NavLink
                  key={department.id}
                  to={`/staff/${department.id}`}
                  className={cx(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-[3px] px-2.5 py-1.5 text-[12.5px] font-medium transition-colors',
                    current
                      ? 'bg-gold-500 text-ink-950'
                      : 'text-warm-400 hover:bg-white/10 hover:text-cream-200',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.7} />
                  {DEPARTMENT_SHORT[department.id]}
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
