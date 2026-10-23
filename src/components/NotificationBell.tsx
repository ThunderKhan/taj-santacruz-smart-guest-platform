import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import type { DepartmentId, NotificationAudience } from '@/types';
import { useScopedNotifications, useRequests } from '@/store/RequestsProvider';
import { cx, relativeTime, clockTime } from '@/utils/format';
import { CountChip } from '@/components/ui/Badge';

/** In-app notification centre. Reflects real prototype events only. */
export function NotificationBell({
  audience,
  department,
  dark = false,
}: {
  audience: NotificationAudience;
  department?: DepartmentId;
  dark?: boolean;
}) {
  const { markNotificationsRead } = useRequests();
  const notifications = useScopedNotifications(audience, department);
  const [open, setOpen] = useState(false);
  const containerRef = useOutsideClick(() => setOpen(false));

  const unread = notifications.filter((notification) => !notification.read).length;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        className={cx(
          'relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600',
          dark
            ? 'border-white/15 text-cream-200 hover:border-white/30 hover:bg-white/10'
            : 'border-cream-300 bg-white text-warm-600 hover:border-warm-300 hover:text-ink-900',
        )}
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1">
            <CountChip value={unread} dark={dark} strong />
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className={cx(
            'absolute right-0 top-[calc(100%+8px)] z-[70] w-[min(92vw,360px)] overflow-hidden rounded-[4px] border shadow-pop animate-scale-in',
            dark ? 'border-white/12 bg-ink-850' : 'border-cream-300 bg-white',
          )}
        >
          <header
            className={cx(
              'flex items-center justify-between gap-3 border-b px-4 py-3',
              dark ? 'border-white/10' : 'border-cream-300',
            )}
          >
            <p className={cx('eyebrow-sm', dark ? 'text-warm-400' : 'text-warm-500')}>Activity</p>
            <button
              type="button"
              onClick={() => markNotificationsRead(department ? { department } : { all: audience === 'guest' })}
              disabled={unread === 0}
              className={cx(
                'inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors disabled:opacity-40',
                dark ? 'text-gold-400 hover:text-gold-300' : 'text-gold-700 hover:text-gold-600',
              )}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
              Mark all read
            </button>
          </header>

          <ul className="scroll-slim max-h-[52vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <li
                className={cx(
                  'px-4 py-8 text-center text-[13px]',
                  dark ? 'text-warm-500' : 'text-warm-500',
                )}
              >
                No activity yet. New events will appear here.
              </li>
            ) : (
              notifications.slice(0, 25).map((notification) => (
                <li
                  key={notification.id}
                  className={cx(
                    'border-b px-4 py-3 last:border-b-0',
                    dark ? 'border-white/8' : 'border-cream-300',
                    !notification.read && (dark ? 'bg-white/[0.05]' : 'bg-gold-200/25'),
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {!notification.read ? (
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"
                      />
                    ) : (
                      <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p
                        className={cx(
                          'text-[13px] font-semibold leading-snug',
                          dark ? 'text-ivory-50' : 'text-ink-900',
                        )}
                      >
                        {notification.title}
                      </p>
                      <p
                        className={cx(
                          'mt-0.5 text-[12.5px] leading-snug',
                          dark ? 'text-warm-400' : 'text-warm-600',
                        )}
                      >
                        {notification.body}
                      </p>
                      <p
                        className={cx(
                          'mt-1 text-[11.5px] tabular-nums',
                          dark ? 'text-warm-500' : 'text-warm-500',
                        )}
                        title={clockTime(notification.at)}
                      >
                        {relativeTime(notification.at)}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/** Minimal outside-click helper for popovers. */
function useOutsideClick(onOutside: () => void) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return undefined;
    const handler = (event: MouseEvent) => {
      if (!ref.contains(event.target as Node)) onOutside();
    };
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOutside();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [ref, onOutside]);

  return setRef;
}
