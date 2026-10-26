import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { FOCUS_SERVICES } from '@/data/services';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { SERVICE_ICONS } from '@/features/guest/serviceIcons';
import { useRequests } from '@/store/RequestsProvider';
import { useHomePath, useServicePath } from '@/hooks/useHomePath';
import { isTerminal } from '@/services/requestEngine';
import { cx } from '@/utils/format';

/**
 * Focused guest directory: the two experiences this prototype centres on —
 * live music requests and celebration enquiries — plus a shortcut into
 * "My requests". Every other hotel service stays in the codebase and in the
 * data layer, but is deliberately not offered on the guest journey.
 */
export function ServiceCatalogue({ large = false }: { large?: boolean }) {
  const servicePath = useServicePath();

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
        {FOCUS_SERVICES.map((service, index) => {
          const Icon = SERVICE_ICONS[service.id];
          const first = index === 0;
          return (
            <Link
              key={service.id}
              to={servicePath(service.id)}
              className={cx(
                'group flex flex-col overflow-hidden rounded-[4px] border border-cream-300 bg-ink-900 shadow-hairline transition-[border-color,box-shadow] duration-200',
                'hover:border-warm-300 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600',
                large && 'min-h-[280px]',
              )}
            >
              <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[21/9]">
                <ImageWithFallback
                  src={service.image ?? ''}
                  alt=""
                  className="absolute inset-0 h-full w-full"
                  imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  eager={first}
                />
                <div aria-hidden="true" className="absolute inset-0 photo-scrim" />
                <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-ink-950/55 text-gold-300 backdrop-blur-sm">
                  <Icon className="h-4.5 w-4.5" strokeWidth={1.6} aria-hidden="true" />
                </span>
                <p className="eyebrow-sm absolute bottom-3 left-4 text-gold-300">
                  {first ? 'Tonight · live set' : 'Plan ahead · enquiry'}
                </p>
              </div>

              <div className="flex flex-1 flex-col gap-2.5 p-5 sm:p-6">
                <h3 className="display text-[clamp(1.35rem,2.4vw,1.8rem)] text-ivory-50">
                  {service.title}
                </h3>
                <p className="text-[13.5px] leading-relaxed text-cream-200/85">{service.blurb}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-2 text-[13.5px] font-semibold text-gold-300 transition-transform duration-200 group-hover:translate-x-1">
                  {first ? 'Open live requests' : 'Plan a celebration'}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <RequestsTile standalone />
    </div>
  );
}

/** Quiet shortcut into the consolidated request tracker. */
function RequestsTile({ standalone = false }: { standalone?: boolean }) {
  const { requests, session } = useRequests();
  const homePath = useHomePath();

  const mine = requests.filter((request) => request.guestRef === session.guestRef);
  const open = mine.filter((request) => !isTerminal(request.status)).length;

  if (standalone) {
    return (
      <Link
        to={`${homePath}/my-requests`}
        className="group flex items-center gap-4 rounded-[4px] border border-cream-300 bg-white px-5 py-4 shadow-hairline transition-[border-color,box-shadow] duration-200 hover:border-warm-300 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-900 text-gold-300">
          <ClipboardList className="h-4.5 w-4.5" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-[14.5px] font-semibold text-ink-900">My requests</span>
          <span className="block text-[13px] text-warm-600">
            Track song requests and celebration enquiries in one place.
          </span>
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-2">
          {open > 0 ? (
            <span className="rounded-full bg-gold-500 px-2.5 py-0.5 text-[12px] font-semibold tabular-nums text-ink-950">
              {open} open
            </span>
          ) : null}
          <ArrowRight
            className="h-4.5 w-4.5 text-warm-500 transition-transform duration-200 group-hover:translate-x-0.5"
            strokeWidth={1.7}
            aria-hidden="true"
          />
        </span>
      </Link>
    );
  }

  return (
    <Link
      to={`${homePath}/my-requests`}
      className="group flex aspect-[4/3] flex-col items-center justify-center gap-2.5 rounded-[4px] border border-cream-300 bg-white p-6 text-center shadow-hairline transition-[border-color,box-shadow] duration-200 hover:border-warm-300 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 text-gold-300">
        <ClipboardList className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <span className="text-[15px] font-semibold text-ink-900">My requests</span>
      <span className="text-[13px] leading-relaxed text-warm-600">
        Track song requests and celebration enquiries in one place.
      </span>
      {open > 0 ? (
        <span className="rounded-full bg-gold-500 px-2.5 py-0.5 text-[12px] font-semibold tabular-nums text-ink-950">
          {open} open
        </span>
      ) : null}
    </Link>
  );
}
