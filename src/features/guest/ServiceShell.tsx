import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { useHomePath } from '@/hooks/useHomePath';
import { useRequests } from '@/store/RequestsProvider';
import { cx } from '@/utils/format';

/**
 * Editorial page header shared by every guest service module.
 *
 * Deliberately text-led rather than a repeated photo banner, so the catalogue
 * remains the one place where imagery sets the tone. Pages that benefit from a
 * photograph can pass `banner`.
 */
export function ServiceShell({
  eyebrow,
  title,
  description,
  actions,
  banner,
  bannerAlt,
  children,
  wide = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  banner?: string;
  bannerAlt?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const homePath = useHomePath();
  const { location } = useRequests();

  return (
    <div>
      <div className="border-b border-cream-300 bg-ivory-100/70">
        <div
          className={cx(
            'mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-8',
            wide ? 'max-w-[1560px]' : 'max-w-[1160px]',
          )}
        >
          <Link
            to={homePath}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-warm-600 transition-colors hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.7} />
            All services
            <span aria-hidden="true" className="ml-1 text-warm-400">·</span>
            <span className="text-warm-500">{location.label}</span>
          </Link>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
            <div className="min-w-0 max-w-2xl">
              <p className="eyebrow text-gold-600">{eyebrow}</p>
              <h1 className="display mt-3 text-[clamp(1.9rem,4vw,2.7rem)] text-ink-900">{title}</h1>
              <div className="gold-hairline mt-4 max-w-[92px]" />
              <p className="mt-4 text-[15px] leading-relaxed text-warm-600">{description}</p>
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
        </div>
      </div>

      {banner ? (
        <div className="relative h-[190px] w-full overflow-hidden sm:h-[240px]">
          <ImageWithFallback
            src={banner}
            alt={bannerAlt ?? ''}
            className="h-full w-full"
            imgClassName="object-center"
          />
          <div aria-hidden="true" className="absolute inset-0 photo-scrim" />
        </div>
      ) : null}

      <div
        className={cx(
          'mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-8',
          wide ? 'max-w-[1560px]' : 'max-w-[1160px]',
        )}
      >
        {children}
      </div>
    </div>
  );
}
