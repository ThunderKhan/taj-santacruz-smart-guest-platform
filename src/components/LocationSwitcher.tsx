import { useState } from 'react';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import { LOCATIONS, findLocation } from '@/data/property';
import { useRequests } from '@/store/RequestsProvider';
import { Modal } from '@/components/ui/Overlay';
import { Notice } from '@/components/ui/Feedback';
import { cx } from '@/utils/format';

/**
 * Location context control.
 *
 * In production the location would be implied by the scanned QR code. Here it
 * is an explicit presenter tool so the same demonstration can be replayed from
 * a room, a restaurant table or a lounge.
 */
export function LocationControl({
  dark = false,
  size = 'md',
  className,
}: {
  dark?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const { location, setLocation } = useRequests();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Change demo location. Current location: ${location.label}`}
        className={cx(
          'inline-flex max-w-full items-center gap-2 rounded-full border px-3 transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600',
          size === 'sm' ? 'h-8 text-[12.5px]' : 'h-10 text-[13.5px]',
          dark
            ? 'border-white/20 bg-white/[0.07] text-cream-200 hover:border-white/40'
            : 'border-warm-300 bg-white text-ink-800 hover:border-warm-400',
          className,
        )}
      >
        <MapPin className={cx('shrink-0 text-gold-600', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} strokeWidth={1.7} />
        <span className="truncate font-medium">{location.label}</span>
        <ChevronDown
          className={cx('shrink-0', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4', dark ? 'text-warm-400' : 'text-warm-500')}
          strokeWidth={1.7}
        />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Demo location"
        eyebrow="Presenter control"
        description="Switch the location context used for new requests."
        footer={
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={cx(
              'h-10 rounded-[3px] px-5 text-sm font-medium transition-colors',
              'bg-ink-900 text-ivory-50 hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600',
            )}
          >
            Done
          </button>
        }
      >
        <Notice tone="gold" title="Demonstration tool">
          <p>
            Guests would arrive here by scanning a location-specific QR code. Location alone is
            never treated as proof of guest identity, and no personal details are collected.
          </p>
        </Notice>

        <ul className="mt-4 divide-y divide-cream-300 border-y border-cream-300">
          {LOCATIONS.map((entry) => {
            const active = entry.id === location.id;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => {
                    setLocation(entry.id);
                    setOpen(false);
                  }}
                  className={cx(
                    'flex w-full items-center gap-3 px-1 py-3.5 text-left transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600',
                    active ? 'bg-gold-200/35' : 'hover:bg-warm-50',
                  )}
                >
                  <MapPin
                    className={cx('h-4 w-4 shrink-0', active ? 'text-gold-700' : 'text-warm-400')}
                    strokeWidth={1.7}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-medium text-ink-900">{entry.label}</span>
                    <span className="mt-0.5 block text-[12.5px] text-warm-600">{entry.detail}</span>
                  </span>
                  {active ? (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gold-700">
                      <Check className="h-4 w-4" strokeWidth={2} />
                      Current
                    </span>
                  ) : (
                    <span className="eyebrow-sm text-warm-400">{entry.kind}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>
    </>
  );
}

/** Read-only contextual label used in request confirmations. */
export function LocationLabel({ locationId, className }: { locationId: string; className?: string }) {
  const entry = findLocation(locationId);
  return <span className={className}>{entry.label}</span>;
}
