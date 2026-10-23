import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, ScanLine } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { DemoQRCode } from '@/components/DemoQRCode';
import { ServiceCatalogue } from './ServiceCatalogue';
import { Notice, EmptyState } from '@/components/ui/Feedback';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { useRequests } from '@/store/RequestsProvider';
import { PROPERTY } from '@/data/property';
import { relativeTime } from '@/utils/format';
import { isTerminal } from '@/services/requestEngine';

function greetingForHour(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning.';
  if (hour < 17) return 'Good afternoon.';
  return 'Good evening.';
}

/**
 * Guest home — the first screen a guest reaches after scanning a QR code or
 * picking up the in-room tablet.
 */
export function GuestHome() {
  const { session, requests, location } = useRequests();

  const mine = useMemo(
    () =>
      requests
        .filter((request) => request.guestRef === session.guestRef)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [requests, session.guestRef],
  );

  const active = mine.filter((request) => !isTerminal(request.status));
  const recent = mine.slice(0, 4);

  const qrValue = useMemo(() => {
    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    return `${origin}/guest?loc=${location.id}`;
  }, [location.id]);

  const greeting = greetingForHour(new Date());

  return (
    <div>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative isolate overflow-hidden bg-ink-950">
        <ImageWithFallback
          src="/images/lobby-grand.jpg"
          alt=""
          className="absolute inset-0 h-full w-full"
          imgClassName="object-center"
          eager
        />
        <div aria-hidden="true" className="absolute inset-0 photo-scrim" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent"
        />

        <div className="relative mx-auto flex min-h-[440px] max-w-[1320px] flex-col justify-end px-4 pb-10 pt-16 sm:min-h-[520px] sm:px-6 sm:pb-14 sm:pt-24 lg:px-8">
          <p className="eyebrow flex flex-wrap items-center gap-2.5 text-gold-400">
            <span>{PROPERTY.name}</span>
            <span aria-hidden="true" className="h-3 w-px bg-white/25" />
            <span className="text-warm-400">{PROPERTY.city}</span>
            <span aria-hidden="true" className="hidden h-3 w-px bg-white/25 sm:block" />
            <span className="hidden text-warm-400 sm:inline">Concept demonstration</span>
          </p>

          <h1 className="display mt-5 max-w-3xl text-[clamp(2.3rem,6vw,4rem)] text-ivory-50">
            {greeting}
            <span className="mt-1 block text-cream-300">How may we assist you today?</span>
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[13.5px] text-ivory-100 backdrop-blur-sm">
              <MapPin className="h-4 w-4 text-gold-400" strokeWidth={1.7} />
              <span className="font-medium">{location.label}</span>
              <span aria-hidden="true" className="h-3 w-px bg-white/25" />
              <span className="text-cream-300/85">{location.detail}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-[12.5px] text-warm-300">
              <ScanLine className="h-4 w-4 text-gold-500" strokeWidth={1.6} />
              Entered by QR · demo session
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#services"
              className="inline-flex h-[52px] items-center gap-2.5 rounded-[3px] bg-gold-500 px-7 text-[15px] font-semibold text-ink-950 shadow-lift transition-colors hover:bg-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
            >
              Discover services
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </a>
            <Link
              to="/guest/my-requests"
              className="inline-flex h-[52px] items-center gap-2.5 rounded-[3px] border border-white/30 bg-white/[0.08] px-7 text-[15px] font-medium text-ivory-100 backdrop-blur-sm transition-colors hover:border-white/50 hover:bg-white/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
            >
              <Clock className="h-4 w-4 text-gold-400" strokeWidth={1.7} />
              My requests
              {active.length > 0 ? (
                <span className="rounded-full bg-gold-500 px-2 py-[1px] text-[11px] font-bold tabular-nums text-ink-950">
                  {active.length}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Directory */}
      <section id="services" className="mx-auto max-w-[1320px] scroll-mt-24 px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-cream-300 pb-6">
          <div className="max-w-xl">
            <p className="eyebrow text-gold-600">Service directory</p>
            <h2 className="display mt-3 text-[clamp(1.7rem,3.4vw,2.4rem)] text-ink-900">
              Everything, one request away
            </h2>
            <div className="gold-hairline mt-4 max-w-[92px]" />
          </div>
          <p className="max-w-md text-[14px] leading-relaxed text-warm-600">
            Choose a service and it is routed straight to the team responsible. You can follow
            every request from submission to completion without calling the desk.
          </p>
        </div>

        <div className="mt-7">
          <ServiceCatalogue />
        </div>
      </section>

      {/* --------------------------------------------- Activity + entry context */}
      <section className="mx-auto mt-14 max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          {/* Recent requests */}
          <div className="rounded-[4px] border border-cream-300 bg-white shadow-hairline">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-300 px-5 py-4 sm:px-6">
              <div>
                <p className="eyebrow-sm text-warm-500">Your session</p>
                <h3 className="display mt-2 text-[1.3rem] text-ink-900">Recent requests</h3>
              </div>
              <Link
                to="/guest/my-requests"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gold-700 transition-colors hover:text-gold-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </header>

            {recent.length === 0 ? (
              <EmptyState
                compact
                title="No requests yet"
                body="Anything you request from the service directory will appear here with a live status."
              />
            ) : (
              <ul className="divide-y divide-cream-300">
                {recent.map((request) => (
                  <li key={request.id}>
                    <Link
                      to={`/guest/my-requests/${request.ref}`}
                      className="group flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-warm-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-600 sm:px-6"
                    >
                      <span className="w-[86px] shrink-0 text-[12.5px] font-semibold tabular-nums tracking-[0.05em] text-warm-500">
                        {request.ref}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-medium text-ink-900">
                          {request.title}
                        </span>
                        <span className="mt-0.5 block text-[12.5px] text-warm-500">
                          {request.location} · {relativeTime(request.updatedAt)}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <PriorityBadge priority={request.priority} />
                        <StatusBadge status={request.status} stage={request.stage} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* QR entry context */}
          <div className="rounded-[4px] border border-cream-300 bg-ivory-100 p-5 sm:p-6">
            <p className="eyebrow text-gold-600">How you arrived</p>
            <h3 className="display mt-3 text-[1.3rem] text-ink-900">Location QR context</h3>

            <div className="mt-5 flex flex-col items-center gap-5 rounded-[4px] border border-cream-300 bg-white p-5 sm:flex-row sm:items-start">
              <div className="shrink-0 rounded-[3px] border border-cream-300 bg-ivory-50 p-2">
                <DemoQRCode value={qrValue} size={132} />
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <p className="text-[14.5px] font-semibold text-ink-900">{location.label}</p>
                <p className="mt-1 text-[13px] text-warm-600">{location.detail}</p>
                <p className="mt-3 break-all rounded-[3px] bg-cream-200 px-2 py-1.5 text-[11.5px] text-warm-600">
                  {qrValue}
                </p>
              </div>
            </div>

            <Notice tone="gold" title="Demonstration element" className="mt-4">
              <p>
                This code is illustrative. It simply points at this local prototype route so the
                QR entry flow can be demonstrated — it is not a live operational QR system and
                carries no guest identity.
              </p>
            </Notice>
          </div>
        </div>
      </section>
    </div>
  );
}
