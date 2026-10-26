import { Link } from 'react-router-dom';
import { Compass, House, RotateCcw } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { PROPERTY } from '@/data/property';

/**
 * Unknown routes — kept inside the guest chrome so the demonstration never
 * lands on a bare browser error page.
 */
export function NotFound() {
  const { resetDemo } = useRequests();

  return (
    <div className="mx-auto flex min-h-[62dvh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="eyebrow text-gold-600">404 · Not found</p>
      <h1 className="display mt-4 text-[clamp(2rem,6vw,3rem)] text-ink-900">
        This page is not part of the demonstration
      </h1>
      <div className="gold-hairline mt-5 w-24" />
      <p className="mt-5 text-[14.5px] leading-relaxed text-warm-600">
        The prototype exposes the guest QR experience, the tablet kiosk, the staff desk and the
        singer console. {PROPERTY.disclosure}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          to="/guest"
          className="inline-flex h-11 items-center gap-2 rounded-[3px] bg-ink-900 px-5 text-[14px] font-medium text-ivory-50 transition-colors hover:bg-ink-800"
        >
          <House className="h-4 w-4" strokeWidth={1.7} />
          Guest services
        </Link>
        <Link
          to="/kiosk"
          className="inline-flex h-11 items-center gap-2 rounded-[3px] border border-warm-300 bg-white px-5 text-[14px] font-medium text-ink-900 transition-colors hover:border-warm-400"
        >
          <Compass className="h-4 w-4 text-gold-600" strokeWidth={1.7} />
          Tablet mode
        </Link>
        <Link
          to="/login"
          className="inline-flex h-11 items-center gap-2 rounded-[3px] border border-warm-300 bg-white px-5 text-[14px] font-medium text-ink-900 transition-colors hover:border-warm-400"
        >
          Staff &amp; singer sign-in
        </Link>
        <button
          type="button"
          onClick={resetDemo}
          className="inline-flex h-11 items-center gap-2 rounded-[3px] px-4 text-[14px] font-medium text-warm-600 transition-colors hover:text-ink-900"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={1.7} />
          Reset demo data
        </button>
      </div>
    </div>
  );
}
