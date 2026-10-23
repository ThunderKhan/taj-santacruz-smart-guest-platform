import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, ScanLine, Sparkles } from 'lucide-react';
import { ServiceCatalogue } from '@/features/guest/ServiceCatalogue';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { DemoQRCode } from '@/components/DemoQRCode';
import { useRequests } from '@/store/RequestsProvider';
import { PROPERTY } from '@/data/property';

/**
 * Hotel tablet / kiosk landing.
 *
 * Deliberately larger and calmer than the phone-sized QR experience: one screen
 * a guest can read from arm's length with big, obvious touch targets.
 */
export function KioskHome() {
  const { location, session, requests } = useRequests();
  const open = requests.filter(
    (request) => request.guestRef === session.guestRef && request.status !== 'completed',
  ).length;

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-ink-950">
        <ImageWithFallback
          src="/images/hero-room.jpg"
          alt=""
          className="absolute inset-0 h-full w-full"
          imgClassName="object-center"
          eager
        />
        <div aria-hidden="true" className="absolute inset-0 photo-scrim" />

        <div className="relative mx-auto max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14">
          <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div>
              <p className="eyebrow flex flex-wrap items-center gap-2.5 text-gold-400">
                <span>{PROPERTY.name}</span>
                <span aria-hidden="true" className="h-3 w-px bg-white/25" />
                <span className="text-warm-400">{PROPERTY.city}</span>
                <span aria-hidden="true" className="hidden h-3 w-px bg-white/25 sm:block" />
                <span className="hidden text-warm-400 sm:inline">Tablet presentation mode</span>
              </p>

              <h1 className="display mt-5 max-w-3xl text-[clamp(2.1rem,5vw,3.4rem)] text-ivory-50">
                Good to see you.
                <span className="mt-1 block text-cream-300">Touch a service to begin.</span>
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-[14.5px] text-ivory-100">
                  <MapPin className="h-4 w-4 text-gold-400" strokeWidth={1.7} />
                  <span className="font-medium">{location.label}</span>
                  <span aria-hidden="true" className="h-3 w-px bg-white/25" />
                  <span className="text-cream-300/85">{location.detail}</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-[13.5px] text-warm-300">
                  <Sparkles className="h-4 w-4 text-gold-500" strokeWidth={1.7} />
                  {open > 0 ? `${open} request${open > 1 ? 's' : ''} in progress` : 'No open requests'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 rounded-[4px] border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm lg:items-end">
              <div className="flex items-center gap-4">
                <div className="rounded-[3px] border border-white/20 bg-ivory-50 p-2">
                  <DemoQRCode value={`${typeof window === 'undefined' ? '' : window.location.origin}/kiosk`} size={104} />
                </div>
                <div className="text-left lg:text-right">
                  <p className="eyebrow-sm text-warm-400">Prefer your own phone?</p>
                  <p className="mt-2 max-w-[220px] text-[13.5px] leading-relaxed text-cream-200">
                    Scan to open the same services on your device — this code points at the local
                    prototype only.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/15 px-3.5 py-2 text-[13px] font-medium text-gold-300">
                <ScanLine className="h-4 w-4" strokeWidth={1.7} />
                Demonstration QR
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-cream-300 pb-5">
          <div>
            <p className="eyebrow text-gold-600">Service directory</p>
            <h2 className="display mt-3 text-[clamp(1.6rem,3vw,2.2rem)] text-ink-900">
              Everything, one touch away
            </h2>
          </div>
          <Link
            to="/kiosk/my-requests"
            className="inline-flex h-11 items-center gap-2 rounded-[3px] border border-warm-300 bg-white px-5 text-[14px] font-medium text-ink-900 transition-colors hover:border-warm-400"
          >
            View my requests
            <ArrowRight className="h-4 w-4 text-gold-600" strokeWidth={1.8} />
          </Link>
        </div>

        <div className="mt-6">
          <ServiceCatalogue large />
        </div>

        <p className="mt-6 text-[12.5px] leading-relaxed text-warm-500">
          Demonstration content only — menus, prices, availability, timings and local recommendations
          are illustrative sample data. {PROPERTY.disclosure}
        </p>
      </section>
    </div>
  );
}
