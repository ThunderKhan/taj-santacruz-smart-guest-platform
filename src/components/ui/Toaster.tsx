import { Check, Info, TriangleAlert, X } from 'lucide-react';
import { useRequests, type ToastTone } from '@/store/RequestsProvider';
import { cx } from '@/utils/format';

const TONE: Record<ToastTone, { wrap: string; icon: string; Icon: typeof Check }> = {
  success: { wrap: 'border-sage-500/45 bg-white', icon: 'bg-sage-500/15 text-sage-600', Icon: Check },
  info: { wrap: 'border-ink-700/25 bg-white', icon: 'bg-ink-700/10 text-ink-700', Icon: Info },
  warn: { wrap: 'border-brass-500/50 bg-white', icon: 'bg-brass-500/15 text-clay-600', Icon: TriangleAlert },
  error: { wrap: 'border-clay-500/50 bg-white', icon: 'bg-clay-500/15 text-clay-600', Icon: X },
};

/** In-app feedback for real prototype events. No browser alert boxes. */
export function Toaster() {
  const { toasts, dismissToast } = useRequests();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-[95] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[360px]"
    >
      {toasts.map((toast) => {
        const tone = TONE[toast.tone];
        const Icon = tone.Icon;
        return (
          <div
            key={toast.id}
            role="status"
            className={cx(
              'pointer-events-auto flex items-start gap-3 rounded-[4px] border px-4 py-3 shadow-pop animate-slide-in',
              tone.wrap,
            )}
          >
            <span
              aria-hidden="true"
              className={cx('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full', tone.icon)}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold text-ink-900">{toast.title}</p>
              {toast.body ? (
                <p className="mt-0.5 text-[12.5px] leading-snug text-warm-600">{toast.body}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="-mr-1 -mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-warm-400 transition-colors hover:bg-warm-100 hover:text-ink-900"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.7} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
