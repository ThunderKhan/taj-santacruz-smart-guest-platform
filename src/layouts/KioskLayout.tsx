import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ArrowLeft, House, RotateCcw } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { useRibbonOffset } from '@/hooks/useRibbonOffset';
import { Wordmark } from '@/components/Brand';
import { LocationControl } from '@/components/LocationSwitcher';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Overlay';
import { PROPERTY } from '@/data/property';
import { cx } from '@/utils/format';

/**
 * Hotel tablet / kiosk presentation mode.
 *
 * Large touch targets, persistent home and back controls, an always-visible
 * location context, and an obvious way to restart the demonstration.
 */
export function KioskLayout() {
  const offset = useRibbonOffset();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { resetDemo, location } = useRequests();
  const [confirmRestart, setConfirmRestart] = useState(false);

  const atHome = pathname === '/kiosk';

  const touch =
    'inline-flex items-center justify-center gap-2.5 rounded-[4px] border px-6 text-[15px] font-medium ' +
    'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600 ' +
    'disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="flex min-h-dvh flex-col bg-ivory-100">
      <header
        className="sticky z-50 border-b border-cream-300 bg-ivory-50/95 backdrop-blur"
        style={{ top: offset }}
      >
        <div className="mx-auto flex min-h-[76px] max-w-[1400px] flex-wrap items-center gap-4 px-5 py-3 sm:px-8">
          <Link
            to="/kiosk"
            className="rounded-[3px] transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
          >
            <Wordmark />
          </Link>

          <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-gold-500/45 bg-gold-200/50 px-3 py-1.5 text-[12px] font-medium text-gold-800 sm:inline-flex">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold-600" />
              Tablet presentation mode
            </span>
            <LocationControl />
            <Button variant="ink" size="md" onClick={() => setConfirmRestart(true)}>
              <RotateCcw className="h-4 w-4" strokeWidth={1.7} />
              <span className="hidden sm:inline">Restart demo</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="sticky bottom-0 z-40 border-t border-cream-300 bg-ivory-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-stretch gap-3 px-5 py-3 sm:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={atHome}
            className={cx(touch, 'min-w-[132px] flex-1 border-warm-300 bg-white text-ink-900 hover:border-warm-400')}
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.7} />
            Back
          </button>
          <Link
            to="/kiosk"
            className={cx(
              touch,
              atHome
                ? 'min-w-[160px] flex-1 border-transparent bg-cream-300 text-warm-600'
                : 'min-w-[160px] flex-1 border-ink-900 bg-ink-900 text-ivory-50 hover:bg-ink-800',
            )}
            aria-current={atHome ? 'page' : undefined}
          >
            <House className="h-5 w-5" strokeWidth={1.7} />
            Home
          </Link>
        </div>
        <p className="pb-2 text-center text-[11.5px] text-warm-500">
          {location.label} · {location.detail} — touch an experience to begin
        </p>
      </footer>

      <Modal
        open={confirmRestart}
        onClose={() => setConfirmRestart(false)}
        title="Restart the demonstration?"
        eyebrow="Tablet session"
        description="Requests created during this session return to their seeded state."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmRestart(false)}>
              Cancel
            </Button>
            <Button
              variant="ink"
              size="sm"
              onClick={() => {
                resetDemo();
                setConfirmRestart(false);
                navigate('/kiosk');
              }}
            >
              <RotateCcw className="h-4 w-4" strokeWidth={1.7} />
              Restart
            </Button>
          </>
        }
      >
        <p className="text-[14px] leading-relaxed text-warm-600">
          This clears everything created during the demonstration and restores the seeded song
          requests and celebration enquiries. {PROPERTY.name} service content is unchanged.
        </p>
      </Modal>
    </div>
  );
}
