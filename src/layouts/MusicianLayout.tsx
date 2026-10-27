import { VSPHFooter } from "@/components/VSPHFooter";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { AudioLines, CalendarDays, LogOut } from "lucide-react";
import { useRequests } from "@/store/RequestsProvider";
import { useAuth } from "@/store/AuthProvider";
import { useRibbonOffset } from "@/hooks/useRibbonOffset";
import { Wordmark } from "@/components/Brand";
import { NotificationBell } from "@/components/NotificationBell";
import { CountChip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { isTerminal } from "@/services/requestEngine";
import { isEnquiryTerminal } from "@/services/enquiryEngine";
import { PROPERTY } from "@/data/property";
import { cx } from "@/utils/format";

/**
 * Dark operations console for the signed-in performer.
 *
 * Two sections only: the live music queue they work during service, and the
 * celebration events the events desk has assigned to them (read-only).
 * Staff never see live music requests — ownership sits with the performer.
 */
export function MusicianLayout() {
  const offset = useRibbonOffset();
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const { requests, enquiries, musicians } = useRequests();

  const musician = musicians.find((entry) => entry.id === session?.musicianId);

  const incomingCount = requests.filter(
    (request) =>
      request.status === "submitted" || request.status === "accepted",
  ).length;
  const onStageCount = requests.filter(
    (request) => !isTerminal(request.status) && request.stage === "queued",
  ).length;
  const myEventsCount = enquiries.filter(
    (enquiry) =>
      enquiry.assignedMusicianId === session?.musicianId &&
      !isEnquiryTerminal(enquiry.status),
  ).length;

  const sections = [
    {
      to: "/musician/live",
      label: "Live music",
      Icon: AudioLines,
      count: incomingCount + onStageCount,
    },
    {
      to: "/musician/events",
      label: "My events",
      Icon: CalendarDays,
      count: myEventsCount,
    },
  ] as const;

  return (
    <div className="min-h-dvh bg-ivory-50 text-ink-900">
      <header
        className="sticky z-50 border-b border-white/10 bg-ink-950"
        style={{ top: offset }}
      >
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
          <Link
            to="/musician/live"
            className="shrink-0 rounded-[3px] transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
          >
            <Wordmark dark compact />
          </Link>

          <span
            aria-hidden="true"
            className="hidden h-6 w-px bg-white/12 lg:block"
          />

          <div className="hidden min-w-0 lg:block">
            <p className="eyebrow-sm text-warm-500">Singer console</p>
            <p className="truncate text-[14px] font-medium text-ivory-50">
              {session?.displayName ?? "Performer"}
              {musician ? ` · ${musician.role}` : ""}
            </p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2.5">
            <NotificationBell audience="staff" dark />
            <Button
              variant="outlineDark"
              size="sm"
              onClick={() => {
                signOut();
                navigate("/login", { replace: true });
              }}
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Section rail */}
        <aside
          className="bg-ink-950 sticky hidden w-[236px] shrink-0 self-start border-r border-white/10 lg:block"
          style={{ top: offset + 56 }}
        >
          <nav aria-label="Console sections" className="py-5">
            <p className="eyebrow-sm px-5 pb-3 text-warm-500">My stage</p>
            <ul>
              {sections.map(({ to, label, Icon, count }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      cx(
                        "relative flex items-center gap-3 px-5 py-3 text-[14px] transition-colors",
                        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-500",
                        isActive
                          ? "bg-white/[0.07] text-ivory-50"
                          : "text-warm-400 hover:bg-white/[0.04] hover:text-cream-200",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-0 left-0 w-[2px] bg-gold-500"
                          />
                        ) : null}
                        <Icon
                          className={cx(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-gold-400" : "text-warm-500",
                          )}
                          strokeWidth={1.6}
                        />
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {label}
                        </span>
                        {count > 0 ? <CountChip value={count} dark /> : null}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mx-5 mt-5 border-t border-white/10 pt-4">
              <p className="text-[11.5px] leading-relaxed text-warm-500">
                Live music requests are owned by performers in this prototype —
                the events desk manages celebrations and musician accounts.
              </p>
            </div>
          </nav>
        </aside>

        {/* Active console */}
        <div className="min-w-0 flex-1">
          {/* Mobile section strip */}
          <nav
            aria-label="Console sections"
            className="bg-ink-950 flex gap-1 overflow-x-auto border-b border-white/10 px-3 py-2 no-scrollbar lg:hidden"
          >
            {sections.map(({ to, label, Icon, count }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cx(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-[3px] px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
                    isActive
                      ? "bg-gold-500 text-ink-950"
                      : "text-warm-400 hover:bg-white/10 hover:text-cream-200",
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.7} />
                {label}
                {count > 0 ? <CountChip value={count} dark /> : null}
              </NavLink>
            ))}
          </nav>

          <Outlet />
        </div>
      </div>

      <footer className="border-t border-white/10 bg-ink-950">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-5 text-[11.5px] text-warm-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="eyebrow-sm text-warm-500">
            {PROPERTY.name} · {PROPERTY.descriptor}
          </span>
          <span>
            Prototype environment · simulated sign-in, not production
            authentication
          </span>
        </div>
      </footer>
      <VSPHFooter />
    </div>
  );
}
