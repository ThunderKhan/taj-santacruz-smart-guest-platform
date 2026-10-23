import { useMemo, useState } from 'react';
import { FileText, Receipt, ShieldCheck } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { Button } from '@/components/ui/Button';
import { Panel, SectionHeading } from '@/components/ui/Panel';
import { Notice } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { ServiceShell } from './ServiceShell';
import { RequestSuccess } from './RequestSuccess';
import { inr } from '@/utils/format';

interface FolioLine {
  label: string;
  detail: string;
  amount: number;
}

/**
 * Illustrative room folio. All figures are fabricated sample data — the module
 * exists to demonstrate a *review* request, never a payment flow.
 */
const FOLIO: FolioLine[] = [
  { label: 'Room — Deluxe Sea View', detail: '2 nights · sample rate', amount: 24000 },
  { label: 'In-room dining', detail: 'TSH-4705 · evening service', amount: 2145 },
  { label: 'Spa — Aromatherapy Massage', detail: '60 min · sample treatment', amount: 6500 },
  { label: 'Airport transfer', detail: 'Sedan · sample fare', amount: 1800 },
  { label: 'Minibar', detail: '4 items', amount: 1450 },
  { label: 'Laundry & pressing', detail: '6 pieces', amount: 1290 },
  { label: 'Restaurant — Table 08', detail: 'Sample table order', amount: 4820 },
];

const TAX_RATE = 0.18;

/**
 * Billing review: inspect a sample folio and raise a review request. There is
 * no payment capability anywhere in this prototype.
 */
export function BillingReview() {
  const { createRequest, session } = useRequests();
  const [placedRef, setPlacedRef] = useState<string | null>(null);

  const totals = useMemo(() => {
    const subtotal = FOLIO.reduce((sum, line) => sum + line.amount, 0);
    const tax = Math.round(subtotal * TAX_RATE);
    return { subtotal, tax, total: subtotal + tax };
  }, []);

  const request = () => {
    const created = createRequest({
      service: 'billing',
      title: 'Bill review request',
      description: 'Guest asked for a walkthrough of the illustrative folio charges.',
      guestNote: 'Please explain the charges before check-out.',
      meta: {
        Charges: `${FOLIO.length} line items`,
        Total: inr(totals.total),
        Period: 'Sample stay window',
        Guest: session.guestName,
      },
    });
    setPlacedRef(created.ref);
  };

  if (placedRef) {
    return (
      <RequestSuccess
        requestRef={placedRef}
        anotherLabel="Back to billing review"
        onMakeAnother={() => setPlacedRef(null)}
      />
    );
  }

  return (
    <ServiceShell
      eyebrow="Billing review · demonstration only"
      title="Review your charges"
      description="A read-only walkthrough of a sample folio. You can ask the front desk to explain any line — no payment, card or settlement flow exists in this prototype."
      banner="/images/svc-billing.jpg"
      bannerAlt="Front desk billing counter"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div>
          <Panel padded={false}>
            <header className="flex flex-wrap items-end justify-between gap-3 border-b border-cream-300 px-5 py-4 sm:px-6">
              <div>
                <p className="eyebrow-sm text-warm-500">Sample folio</p>
                <h3 className="display mt-2 text-[1.5rem] text-ink-900">
                  {session.guestName} · Room stay
                </h3>
              </div>
              <Badge tone="neutral">Sample data</Badge>
            </header>

            <ul className="divide-y divide-cream-300">
              {FOLIO.map((line) => (
                <li key={line.label} className="flex items-baseline gap-4 px-5 py-3.5 sm:px-6">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] text-ink-900">{line.label}</span>
                    <span className="mt-0.5 block text-[12.5px] text-warm-500">{line.detail}</span>
                  </span>
                  <span className="tnum shrink-0 text-[14.5px] font-medium text-ink-900">
                    {inr(line.amount)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="border-t border-cream-300 bg-ivory-100/70 px-5 py-4 text-[14px] sm:px-6">
              <div className="flex justify-between py-1 text-warm-600">
                <dt>Subtotal</dt>
                <dd className="tnum">{inr(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between py-1 text-warm-600">
                <dt>Taxes & service (sample {Math.round(TAX_RATE * 100)}%)</dt>
                <dd className="tnum">{inr(totals.tax)}</dd>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-cream-300 pt-3 text-[17px] font-semibold text-ink-900">
                <dt>Indicative total</dt>
                <dd className="tnum">{inr(totals.total)}</dd>
              </div>
            </dl>
          </Panel>

          <Notice className="mt-5" tone="clay" title="No payments in this prototype">
            <p>
              This screen is a review surface only. It does not process cards, generate invoices,
              connect to a property management system, or transmit any billing data anywhere.
            </p>
          </Notice>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <Panel>
            <p className="eyebrow-sm text-warm-500">Need it explained?</p>
            <h3 className="display mt-2 text-[1.45rem] text-ink-900">Request a bill walkthrough</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-warm-600">
              A guest relations officer will go through each line with you — in person or through the
              request timeline — before check-out.
            </p>

            <div className="mt-4 flex items-start gap-2.5 rounded-[3px] border border-cream-300 bg-ivory-100 px-3.5 py-3 text-[12.5px] leading-relaxed text-warm-600">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" strokeWidth={1.7} />
              The request captures {FOLIO.length} line items and the indicative total so the desk can
              prepare the walkthrough in advance.
            </div>

            <Button variant="gold" fullWidth className="mt-4" onClick={request}>
              <Receipt className="h-4 w-4" strokeWidth={1.7} />
              Ask for a bill review
            </Button>
          </Panel>

          <div className="mt-4 flex items-start gap-2.5 rounded-[3px] border border-sage-500/40 bg-sage-500/12 px-4 py-3 text-[12.5px] leading-relaxed text-forest-700">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.7} />
            No card details, bank details or payment instructions are collected anywhere in this
            prototype.
          </div>

          <div className="mt-4">
            <SectionHeading
              eyebrow="Also here"
              title="Related requests"
              description="Dining, spa and transport charges above come from the shared demo queue."
            />
            <ul className="mt-3 space-y-2 text-[13px] text-warm-600">
              <li className="flex justify-between gap-3">
                <span>In-room dining · TSH-4705</span>
                <span className="tnum text-ink-800">{inr(2145)}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Spa treatment · TSH-4708</span>
                <span className="tnum text-ink-800">{inr(6500)}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Airport transfer · TSH-4707</span>
                <span className="tnum text-ink-800">{inr(1800)}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ServiceShell>
  );
}
