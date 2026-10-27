import { VSPHFooter } from "@/components/VSPHFooter";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { useRequests } from "@/store/RequestsProvider";
import { useAuth } from "@/store/AuthProvider";
import { useRibbonOffset } from "@/hooks/useRibbonOffset";
import { Wordmark } from "@/components/Brand";
import { NotificationBell } from "@/components/NotificationBell";
import { Button } from "@/components/ui/Button";
import { PROPERTY } from "@/data/property";

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
  const route = useLocation();
  const { session, signOut } = useAuth();
  const { musicians } = useRequests();

  const musician = musicians.find((entry) => entry.id === session?.musicianId);

  return (
    <div
      className={`min-h-dvh bg-ivory-50 text-ink-900${route.pathname === "/musician/live" ? " musician-live-shell" : ""}`}
    >
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
              aria-label="Sign out"
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

      <div className="musician-centered-content">
        {route.pathname === "/musician/events" ? (
          <Link className="musician-back-link" to="/musician/live">
            <ArrowLeft size={16} />
            Back to live music
          </Link>
        ) : null}
        <Outlet />
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
