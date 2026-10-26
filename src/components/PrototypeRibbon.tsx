import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AudioLines, ChevronDown, ClipboardList, RotateCcw, Sparkles, Tablet } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { useAuth } from '@/store/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Overlay';
import { cx } from '@/utils/format';
import { PROPERTY } from '@/data/property';

type Area = 'guest' | 'staff' | 'musician';

const AREAS: Array<{
  id: Area;
  label: string;
  short: string;
  path: string;
  Icon: typeof Sparkles;
}> = [
  { id: 'guest', label: 'Guest experience', short: 'Guest', path: '/guest', Icon: Sparkles },
  { id: 'staff', label: 'Staff desk', short: 'Staff', path: '/staff', Icon: ClipboardList },
  { id: 'musician', label: 'Singer console', short: 'Singer', path: '/musician', Icon: AudioLines },
];

/**
 * Presenter ribbon.
 *
 * Sits above every route so a presenter can switch between the demo
 * experiences: the guest QR journey plus the two signed-in consoles (staff and
 * performer — each with its own demo sign-in). Deliberately styled as a review
 * tool, and it carries the prototype disclosure.
 */
export function PrototypeRibbon() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ribbonCollapsed, setRibbonCollapsed, resetDemo } = useRequests();
  const { session } = useAuth();
  const [confirmReset, setConfirmReset] = useState(false);
  const lastStaffPath = useRef('/staff');
  const lastMusicianPath = useRef('/musician');

  const isStaff = location.pathname.startsWith('/staff');
  const isMusician = location.pathname.startsWith('/musician');
  const isKiosk = location.pathname.startsWith('/kiosk');
  const area: Area = isStaff ? 'staff' : isMusician ? 'musician' : 'guest';

  useEffect(() => {
    if (isStaff) lastStaffPath.current = location.pathname;
    if (isMusician) lastMusicianPath.current = location.pathname;
  }, [isStaff, isMusician, location.pathname]);

  const go = (target: Area) => {
    // Unguarded visits land on the demo sign-in; guarded ones go straight in.
    if (target === 'guest') navigate('/guest');
    else if (target === 'staff') navigate(session?.role === 'staff' ? lastStaffPath.current : '/login');
    else navigate(session?.role === 'musician' ? lastMusicianPath.current : '/login');
  };

  if (ribbonCollapsed) {
    return (
      <button
        type="button"
        onClick={() => setRibbonCollapsed(false)}
        className="fixed bottom-4 left-4 z-[70] flex items-center gap-2 rounded-full border border-white/15 bg-ink-950/95 py-2 pl-3 pr-3.5 text-cream-200 shadow-pop backdrop-blur transition-colors hover:border-gold-500/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold-500" />
        <span className="eyebrow-sm">Concept demo</span>
        <ChevronDown className="h-3.5 w-3.5 -rotate-90" strokeWidth={1.8} />
      </button>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-[60] border-b border-white/10 bg-ink-950">
        <div className="flex h-9 items-center gap-2 px-2 sm:gap-4 sm:px-4">
          {/* Identity / disclosure */}
          <div className="flex min-w-0 items-center gap-2">
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
            <span className="eyebrow-sm whitespace-nowrap text-cream-200">
              <span className="hidden sm:inline">Concept prototype</span>
              <span className="sm:hidden">Prototype</span>
            </span>
            <span aria-hidden="true" className="hidden h-3 w-px bg-white/15 lg:block" />
            <span className="hidden truncate text-[11.5px] text-warm-500 lg:block">
              {PROPERTY.name} · independent concept demo
            </span>
          </div>

          {/* Experience switcher */}
          <nav
            aria-label="Demo experience switcher"
            className="mx-auto flex shrink-0 items-center gap-0.5 rounded-[3px] border border-white/12 bg-white/[0.05] p-0.5"
          >
            {AREAS.map((entry) => {
              const active = entry.id === area;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => go(entry.id)}
                  aria-current={active ? 'page' : undefined}
                  title={entry.label}
                  className={cx(
                    'flex items-center gap-1.5 rounded-[2px] px-2 py-1 text-[11.5px] font-medium tracking-[0.02em] transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-500',
                    active
                      ? 'bg-gold-500 text-ink-950'
                      : 'text-warm-400 hover:bg-white/10 hover:text-cream-200',
                  )}
                >
                  <entry.Icon className="h-3.5 w-3.5" strokeWidth={1.7} />
                  <span className="hidden lg:inline">{entry.label}</span>
                  <span className="lg:hidden">{entry.short}</span>
                </button>
              );
            })}
          </nav>

          {/* Presenter tools */}
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => navigate('/kiosk')}
              title="Open the tablet / kiosk presentation mode"
              className={cx(
                'flex items-center gap-1.5 rounded-[3px] px-2 py-1.5 text-[11.5px] font-medium transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-500',
                isKiosk
                  ? 'bg-white/12 text-ivory-50'
                  : 'text-warm-400 hover:bg-white/10 hover:text-cream-200',
              )}
            >
              <Tablet className="h-3.5 w-3.5" strokeWidth={1.7} />
              <span className="hidden md:inline">Tablet mode</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              title="Restore the seeded demo data"
              aria-label="Reset demo data"
              className="flex h-7 w-7 items-center justify-center rounded-[3px] text-warm-400 transition-colors hover:bg-white/10 hover:text-cream-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-500"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.7} />
            </button>

            <button
              type="button"
              onClick={() => setRibbonCollapsed(true)}
              aria-label="Hide the prototype ribbon"
              className="flex h-7 w-7 items-center justify-center rounded-[3px] text-warm-400 transition-colors hover:bg-white/10 hover:text-cream-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-500"
            >
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Restore the seeded demo data?"
        eyebrow="Presenter tool"
        description="Every request created during the demonstration returns to its original seeded status. This cannot be undone."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
              Keep current state
            </Button>
            <Button
              variant="ink"
              size="sm"
              onClick={() => {
                resetDemo();
                setConfirmReset(false);
              }}
            >
              <RotateCcw className="h-4 w-4" strokeWidth={1.7} />
              Reset demo data
            </Button>
          </>
        }
      >
        <p className="text-[14px] leading-relaxed text-warm-600">
          Use this between presentation runs so the song requests, queue, votes, dedications and
          celebration enquiries all return to the same seeded starting point.
        </p>
      </Modal>
    </>
  );
}
