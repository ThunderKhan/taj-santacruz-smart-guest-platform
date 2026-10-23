import { useEffect, useState } from 'react';
import { cx } from '@/utils/format';

/**
 * Image with an art-directed fallback.
 *
 * All photography ships inside `public/images/`, but if a file is missing the
 * prototype degrades to a deliberate surface rather than a broken-image box.
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  imgClassName,
  mark = true,
  eager = false,
  tone = 'ink',
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  mark?: boolean;
  eager?: boolean;
  tone?: 'ink' | 'cream';
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cx(
          'flex items-center justify-center overflow-hidden',
          tone === 'ink'
            ? 'bg-gradient-to-br from-ink-900 via-ink-800 to-ink-700'
            : 'bg-gradient-to-br from-cream-200 via-ivory-100 to-warm-100',
          className,
        )}
      >
        {mark ? (
          <svg
            viewBox="0 0 64 64"
            aria-hidden="true"
            className={cx('h-8 w-8', tone === 'ink' ? 'text-gold-500' : 'text-gold-600')}
          >
            <path d="M32 12 L46 32 L32 52 L18 32 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M32 22 L39 32 L32 42 L25 32 Z" fill="currentColor" />
          </svg>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cx('overflow-hidden', className)}>
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailed(true)}
        className={cx('h-full w-full object-cover', imgClassName)}
      />
    </div>
  );
}
