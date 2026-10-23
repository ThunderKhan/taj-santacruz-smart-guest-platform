import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { SuccessPanel, Notice } from '@/components/ui/Feedback';
import { StatusBadge } from '@/components/ui/Badge';
import { RequestTimeline } from '@/components/ui/Timeline';
import { useRequests } from '@/store/RequestsProvider';
import { useHomePath } from '@/hooks/useHomePath';
import { departmentName } from '@/data/departments';
import { nextStepHint, statusLabel } from '@/services/requestEngine';
import { relativeTime } from '@/utils/format';
import type { ServiceRequest } from '@/types';

/**
 * Shared confirmation state shown after any guest submission.
 *
 * It reads the request back out of live shared state, so when a department
 * accepts or completes it, this screen changes without a refresh.
 */
export function RequestSuccess({
  requestRef,
  onMakeAnother,
  anotherLabel = 'Make another request',
}: {
  requestRef: string;
  onMakeAnother?: () => void;
  anotherLabel?: string;
}) {
  const { getByRef } = useRequests();
  const homePath = useHomePath();
  const request = getByRef(requestRef);

  if (!request) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <SuccessPanel
        reference={request.ref}
        title={request.title}
        body={`Routed to ${departmentName(request.department)}. ${nextStepHint(request)}`}
      >
        <div className="flex flex-wrap justify-center gap-2.5">
          <Link
            to={`${homePath}/my-requests/${request.ref}`}
            className="inline-flex h-11 items-center gap-2 rounded-[3px] bg-ink-900 px-5 text-[14px] font-medium text-ivory-50 transition-colors hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
          >
            Track this request
            <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
          </Link>
          {onMakeAnother ? (
            <button
              type="button"
              onClick={onMakeAnother}
              className="inline-flex h-11 items-center gap-2 rounded-[3px] border border-warm-300 bg-white px-5 text-[14px] font-medium text-ink-900 transition-colors hover:border-warm-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
            >
              <ClipboardList className="h-4 w-4" strokeWidth={1.6} />
              {anotherLabel}
            </button>
          ) : null}
        </div>
      </SuccessPanel>

      <LiveStatus request={request} />
    </div>
  );
}

/** Compact live status + timeline for a request the guest just created. */
export function LiveStatus({ request }: { request: ServiceRequest }) {
  const { tick } = useRequests();
  void tick;

  return (
    <div className="mt-5 rounded-[4px] border border-cream-300 bg-white p-5 shadow-hairline sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-300 pb-4">
        <div className="min-w-0">
          <p className="eyebrow-sm text-warm-500">Live status</p>
          <p className="mt-2 text-[15px] font-semibold text-ink-900">
            {statusLabel({ status: request.status, stage: request.stage })}
          </p>
          <p className="mt-1 text-[13px] text-warm-600">
            {request.assignedTo ? `Assigned to ${request.assignedTo} · ` : ''}
            updated {relativeTime(request.updatedAt)}
          </p>
        </div>
        <StatusBadge status={request.status} stage={request.stage} />
      </div>

      <div className="pt-5">
        <RequestTimeline history={request.history} dense />
      </div>

      <Notice className="mt-1">
        <p>
          Status updates are written to the shared prototype state — switch to the department
          dashboard and back to see this move forward.
        </p>
      </Notice>
    </div>
  );
}
