import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '@/utils/format';

function useOverlayBehaviour(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    // Move focus into the dialog so keyboard users are not left behind it.
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])',
    );
    window.setTimeout(() => focusable?.focus(), 30);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return panelRef;
}

function Backdrop({ onClose, dark = false }: { onClose: () => void; dark?: boolean }) {
  return (
    <div
      aria-hidden="true"
      onClick={onClose}
      className={cx(
        'absolute inset-0 animate-fade-in backdrop-blur-[2px]',
        dark ? 'bg-ink-950/70' : 'bg-ink-950/45',
      )}
    />
  );
}

/** Centred dialog for confirmations and request details. */
export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  description,
  children,
  footer,
  size = 'md',
  dark = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  dark?: boolean;
}) {
  const panelRef = useOverlayBehaviour(open, onClose);
  const titleId = useId();
  const descId = useId();

  if (!open) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' } as const;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6">
      <div className="relative flex min-h-full w-full items-end justify-center sm:items-center">
        <Backdrop onClose={onClose} dark={dark} />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          className={cx(
            'relative w-full animate-scale-in rounded-t-[6px] border shadow-pop sm:rounded-[6px]',
            widths[size],
            dark ? 'border-white/12 bg-ink-850 text-cream-200' : 'border-cream-300 bg-ivory-50',
          )}
        >
          <header
            className={cx(
              'flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-7 sm:py-5',
              dark ? 'border-white/10' : 'border-cream-300',
            )}
          >
            <div className="min-w-0">
              {eyebrow ? (
                <p className={cx('eyebrow-sm mb-2', dark ? 'text-gold-400' : 'text-gold-600')}>
                  {eyebrow}
                </p>
              ) : null}
              <h2
                id={titleId}
                className={cx('display text-[1.4rem]', dark ? 'text-ivory-50' : 'text-ink-900')}
              >
                {title}
              </h2>
              {description ? (
                <p
                  id={descId}
                  className={cx('mt-1.5 text-[13.5px] leading-relaxed', dark ? 'text-warm-400' : 'text-warm-600')}
                >
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className={cx(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
                dark ? 'text-warm-400 hover:bg-white/10 hover:text-ivory-50' : 'text-warm-500 hover:bg-cream-200 hover:text-ink-900',
              )}
            >
              <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 stroke-current" strokeWidth="1.6" fill="none">
                <path d="m2 2 10 10M12 2 2 12" />
              </svg>
            </button>
          </header>

          <div className={cx('px-5 py-5 sm:px-7', dark ? 'text-cream-200' : 'text-ink-800')}>{children}</div>

          {footer ? (
            <footer
              className={cx(
                'flex flex-wrap items-center justify-end gap-2.5 border-t px-5 py-4 sm:px-7',
                dark ? 'border-white/10 bg-white/[0.03]' : 'border-cream-300 bg-white/60',
              )}
            >
              {footer}
            </footer>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Right-hand detail drawer used by department dashboards. */
export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  dark = false,
  width = 'max-w-[560px]',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  dark?: boolean;
  width?: string;
}) {
  const panelRef = useOverlayBehaviour(open, onClose);
  const titleId = useId();

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <div className="relative h-full">
        <Backdrop onClose={onClose} dark />
        <aside
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cx(
            'absolute inset-y-0 right-0 flex w-full animate-slide-in flex-col border-l shadow-pop',
            width,
            dark ? 'border-white/12 bg-ink-850 text-cream-200' : 'border-cream-300 bg-ivory-50',
          )}
        >
          <header
            className={cx(
              'flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6',
              dark ? 'border-white/10' : 'border-cream-300',
            )}
          >
            <div className="min-w-0">
              {eyebrow ? (
                <p className={cx('eyebrow-sm mb-1.5', dark ? 'text-gold-400' : 'text-gold-600')}>
                  {eyebrow}
                </p>
              ) : null}
              <h2 id={titleId} className={cx('display text-[1.35rem]', dark ? 'text-ivory-50' : 'text-ink-900')}>
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className={cx(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
                dark ? 'text-warm-400 hover:bg-white/10 hover:text-ivory-50' : 'text-warm-500 hover:bg-cream-200',
              )}
            >
              <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 stroke-current" strokeWidth="1.6" fill="none">
                <path d="m2 2 10 10M12 2 2 12" />
              </svg>
            </button>
          </header>

          <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

          {footer ? (
            <footer
              className={cx(
                'border-t px-5 py-4 sm:px-6',
                dark ? 'border-white/10 bg-white/[0.03]' : 'border-cream-300 bg-white/70',
              )}
            >
              {footer}
            </footer>
          ) : null}
        </aside>
      </div>
    </div>,
    document.body,
  );
}
