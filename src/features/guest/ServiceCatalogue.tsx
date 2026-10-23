import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { SERVICES } from '@/data/services';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { SERVICE_ICONS } from '@/features/guest/serviceIcons';
import { useRequests } from '@/store/RequestsProvider';
import { useHomePath, useServicePath } from '@/hooks/useHomePath';
import { isTerminal } from '@/services/requestEngine';
import { cx } from '@/utils/format';

/**
 * Guest service directory.
 *
 * The first tile is deliberately treated as a feature rather than repeating an
 * identical card twelve times — the catalogue reads as a curated concierge
 * index instead of a generic grid.
 */
export function ServiceCatalogue({ large = false }: { large?: boolean }) {
  const [feature, ...rest] = SERVICES;
  const FeatureIcon = SERVICE_ICONS[feature.id];
  const servicePath = useServicePath();

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Feature tile */}
      <Link
        to={servicePath(feature.id)}
        className={cx(
          'group grid overflow-hidden rounded-[4px] border border-cream-300 bg-white shadow-hairline transition-[border-color,box-shadow] duration-200',
          'hover:border-warm-300 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600',
          'sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]',
          large && 'sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]',
        )}
      >
        <div className="relative aspect-[16/10] overflow-hidden sm:aspect-auto sm:min-h-[240px]">
          <ImageWithFallback
            src={feature.image ?? ''}
            alt=""
            className="absolute inset-0 h-full w-full"
            imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            eager
          />
          <div aria-hidden="true" className="absolute inset-0 photo-scrim" />
          <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-ink-950/55 text-gold-300 backdrop-blur-sm">
            <FeatureIcon className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </span>
        </div>

        <div className="flex flex-col justify-center gap-3 p-5 sm:p-7">
          <p className="eyebrow text-gold-600">Featured service</p>
          <h3 className="display text-[clamp(1.5rem,3vw,2rem)] text-ink-900">{feature.title}</h3>
          <p className="max-w-md text-[14.5px] leading-relaxed text-warm-600">{feature.blurb}</p>
          <span
            className={cx(
              'mt-1 inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink-900',
              'transition-transform duration-200 group-hover:translate-x-1',
            )}
          >
            Browse the menu
            <ArrowRight className="h-4 w-4 text-gold-600" strokeWidth={1.8} />
          </span>
        </div>
      </Link>

      {/* Directory grid */}
      <div
        className={cx(
          'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3',
          large ? 'lg:grid-cols-4' : 'lg:grid-cols-4',
        )}
      >
        {rest.map((service) => {
          const Icon = SERVICE_ICONS[service.id];
          return (
            <Link
              key={service.id}
              to={servicePath(service.id)}
              className={cx(
                'group relative block overflow-hidden rounded-[4px] border border-cream-300 bg-ink-900',
                'transition-[border-color,box-shadow,transform] duration-200 hover:shadow-lift',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600',
                large && 'min-h-[188px]',
              )}
            >
              <div className={cx('relative aspect-[4/3] overflow-hidden', large && 'aspect-[16/10]')}>
                <ImageWithFallback
                  src={service.image ?? ''}
                  alt=""
                  className="absolute inset-0 h-full w-full"
                  imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                <div aria-hidden="true" className="absolute inset-0 photo-scrim" />
                <span className="absolute left-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-ink-950/55 text-gold-300 backdrop-blur-sm sm:h-8 sm:w-8">
                  <Icon
                    className="h-[15px] w-[15px] sm:h-4 sm:w-4"
                    strokeWidth={1.6}
                  />
                </span>
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5">
                  <p className="text-[13.5px] font-semibold leading-tight text-ivory-50 sm:text-[14.5px]">
                    {service.title}
                  </p>
                  <p
                    className={cx(
                      'mt-1 hidden text-[12px] leading-snug text-cream-200/85 line-clamp-2 sm:block',
                      large && 'sm:text-[12.5px]',
                    )}
                  >
                    {service.blurb}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}

        <RequestsTile large={large} />
      </div>
    </div>
  );
}

/** Distinct tile for tracking — no photograph, so it reads as a utility. */
function RequestsTile({ large }: { large: boolean }) {
  const { session, requests } = useRequests();
  const homePath = useHomePath();
  const mine = requests.filter((request) => request.guestRef === session.guestRef);
  const open = mine.filter((request) => !isTerminal(request.status)).length;

  return (
    <Link
      to={`${homePath}/my-requests`}
      className={cx(
        'group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-[4px] border border-ink-800 bg-ink-900 p-3.5 sm:p-4',
        'transition-[border-color,box-shadow] duration-200 hover:border-gold-600/60 hover:shadow-lift',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600',
        large && 'aspect-[16/10] min-h-[188px] sm:aspect-auto',
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rotate-45 border border-white/10" />
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/15 text-gold-300 sm:h-8 sm:w-8">
        <ClipboardList className="h-[15px] w-[15px] sm:h-4 sm:w-4" strokeWidth={1.6} />
      </span>
      <span className="relative">
        <span className="block text-[13.5px] font-semibold leading-tight text-ivory-50 sm:text-[14.5px]">
          My Requests
        </span>
        <span className="mt-1 block text-[12px] leading-snug text-warm-400">
          {open > 0 ? `${open} in progress now` : `${mine.length} on this stay`}
        </span>
      </span>
    </Link>
  );
}
