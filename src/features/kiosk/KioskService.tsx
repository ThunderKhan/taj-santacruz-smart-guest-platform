import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, TriangleAlert } from 'lucide-react';
import { FOCUS_SERVICE_IDS, SERVICES } from '@/data/services';
import { SERVICE_ICONS } from '@/features/guest/serviceIcons';
import { MusicRequests } from '@/features/guest/MusicRequests';
import { CelebrationEnquiry } from '@/features/guest/CelebrationEnquiry';
import { Notice } from '@/components/ui/Feedback';
import type { ServiceId } from '@/types';

/**
 * The tablet reuses the very same service modules as the QR experience — one
 * implementation, two entry points, one shared request state.
 *
 * Only the two focus experiences are offered here; every other catalogue entry
 * reports "not available" rather than exposing the hidden hotel services.
 */
const KIOSK_VIEWS: Partial<Record<ServiceId, () => ReactElement>> = {
  music: MusicRequests,
  occasions: CelebrationEnquiry,
};

export function KioskService() {
  const { service } = useParams<{ service: string }>();
  const definition = SERVICES.find((entry) => entry.id === service);
  const inFocus = service ? FOCUS_SERVICE_IDS.includes(service as ServiceId) : false;
  const View = service && inFocus ? KIOSK_VIEWS[service as ServiceId] : null;

  if (!definition || !View) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center sm:px-8">
        <p className="eyebrow text-gold-600">Tablet mode</p>
        <h1 className="display mt-4 text-[2rem] text-ink-900">Service not available</h1>
        <p className="mt-4 text-[14.5px] leading-relaxed text-warm-600">
          That service is not part of this demonstration. Return to the tablet home screen and pick
          one of the available experiences.
        </p>
        <Link
          to="/kiosk"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-[3px] bg-ink-900 px-5 text-[14px] font-medium text-ivory-50"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.7} />
          Experience home
        </Link>
      </div>
    );
  }

  const Icon = SERVICE_ICONS[definition.id];

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-6 sm:px-8">
      <div className="flex flex-wrap items-center gap-4 rounded-[4px] border border-cream-300 bg-ivory-100 px-4 py-3.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold-500/40 bg-gold-200/60 text-gold-700">
          <Icon className="h-4 w-4" strokeWidth={1.7} />
        </span>
        <p className="min-w-0 flex-1 text-[13.5px] leading-relaxed text-warm-600">
          <span className="font-medium text-ink-900">{definition.title}</span> — the same module a
          guest reaches by scanning a room QR code. Both entry points write to one shared request
          state.
        </p>
        <span className="eyebrow-sm text-warm-500">Tablet service</span>
      </div>

      <div className="mt-5">
        <View />
      </div>

      <p className="mt-6 flex items-start gap-2 text-[12.5px] leading-relaxed text-warm-500">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-brass-500" strokeWidth={1.7} />
        Demonstration content only — no real bookings, payments or guest data are processed.
      </p>
      <Notice className="mt-3" tone="gold" title="Presenter tip">
        <p>
          Use the ribbon at the top to jump between this tablet, the guest QR experience, the two
          staff dashboards and the management overview — all of them share this session's data.
        </p>
      </Notice>
    </div>
  );
}
