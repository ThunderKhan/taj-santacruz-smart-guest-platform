import { useMemo, useState } from 'react';
import { Clock, Minus, Plus, ShoppingBag, ChevronRight, Wrench, ConciergeBell, CarFront, AudioLines, Flower2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRequests } from '@/store/RequestsProvider';
import { useHomePath, useServicePath } from '@/hooks/useHomePath';
import { MENU_CATEGORIES, MENU_ITEMS } from '@/data/menu';
import { Button } from '@/components/ui/Button';
import { Panel, SectionHeading } from '@/components/ui/Panel';
import { Modal } from '@/components/ui/Overlay';
import { Notice } from '@/components/ui/Feedback';
import { ServiceShell } from './ServiceShell';
import { RequestSuccess } from './RequestSuccess';
import type { MenuItem, RequestLineItem, ServiceId } from '@/types';
import { inr } from '@/utils/format';

/** Kitchen copy — sample operating detail, not verified property information. */
const KITCHEN = {
  name: 'All Day Dining · Kitchen',
  serviceHours: '6:30 AM – 11:30 PM',
  etaMinutes: 28,
  serviceChargePercent: 0.075,
} as const;

const CATEGORY_META: Array<{ key: ServiceId; label: string; icon: typeof Wrench; hint: string }> = [
  { key: 'housekeeping', label: 'Housekeeping', icon: Wrench, hint: 'Towels, linen, amenities' },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench, hint: 'Anything not working' },
  { key: 'concierge', label: 'Concierge', icon: ConciergeBell, hint: 'Plans, dining, requests' },
  { key: 'transport', label: 'Transportation', icon: CarFront, hint: 'Airport and car transfers' },
  { key: 'music', label: 'Live music', icon: AudioLines, hint: 'Song requests for the lounge' },
  { key: 'spa', label: 'Spa', icon: Flower2, hint: 'Treatments and therapists' },
];

/**
 * In-room dining ordering: browse the sample menu, build a tray, review the
 * estimate, then send it to the restaurant queue in shared state.
 */
export function FoodOrder() {
  const { createRequest } = useRequests();
  const homePath = useHomePath();
  const servicePath = useServicePath();
  const [category, setCategory] = useState<string>('all');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [reviewing, setReviewing] = useState(false);
  const [placedRef, setPlacedRef] = useState<string | null>(null);

  const items = useMemo(
    () => (category === 'all' ? MENU_ITEMS : MENU_ITEMS.filter((item) => item.category === category)),
    [category],
  );

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({
          item: MENU_ITEMS.find((entry) => entry.id === id) as MenuItem,
          qty,
        })),
    [cart],
  );

  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.item.price * line.qty, 0);
  const serviceLine = Math.round(subtotal * KITCHEN.serviceChargePercent);
  const total = subtotal + serviceLine;

  const change = (id: string, delta: number) =>
    setCart((current) => {
      const next = { ...current };
      const value = Math.max(0, (next[id] ?? 0) + delta);
      if (value === 0) delete next[id];
      else next[id] = value;
      return next;
    });

  const submitOrder = () => {
    if (!lines.length) return;
    const lineItems: RequestLineItem[] = lines.map((line) => ({
      label: line.item.name,
      qty: line.qty,
      price: line.item.price,
    }));

    const request = createRequest({
      service: 'food',
      title: `In-room dining — ${count} item${count > 1 ? 's' : ''}`,
      description: 'À la carte order placed from the guest service interface.',
      lineItems,
      value: total,
      meta: {
        Course: 'À la carte',
        Delivery: 'In-room',
        'Kitchen estimate': `${KITCHEN.etaMinutes} min`,
      },
    });

    setCart({});
    setReviewing(false);
    setPlacedRef(request.ref);
  };

  if (placedRef) {
    return (
      <RequestSuccess
        requestRef={placedRef}
        anotherLabel="Order something else"
        onMakeAnother={() => setPlacedRef(null)}
      />
    );
  }

  return (
    <ServiceShell
      eyebrow={KITCHEN.name}
      title="In-room dining"
      description={`Sample à la carte menu served to your location between ${KITCHEN.serviceHours}. The kitchen quotes around ${KITCHEN.etaMinutes} minutes, and you can follow every order from pass to delivery.`}
      actions={
        <Link
          to={`${homePath}/my-requests`}
          className="inline-flex h-11 items-center gap-2 rounded-[3px] border border-warm-300 bg-white px-4 text-[13.5px] font-medium text-ink-900 transition-colors hover:border-warm-400"
        >
          <Clock className="h-4 w-4 text-gold-600" strokeWidth={1.7} />
          Track orders
        </Link>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div>
          <div className="flex flex-wrap gap-2">
            {[{ id: 'all' as const, name: 'Everything' }, ...MENU_CATEGORIES].map((entry) => {
              const active = entry.id === category;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setCategory(entry.id)}
                  className={
                    active
                      ? 'rounded-full border border-ink-950 bg-ink-950 px-4 py-2 text-[12.5px] font-medium tracking-wide text-ivory-50 transition'
                      : 'rounded-full border border-warm-300 bg-white px-4 py-2 text-[12.5px] font-medium tracking-wide text-warm-700 transition hover:border-warm-400 hover:text-ink-900'
                  }
                >
                  {entry.name}
                </button>
              );
            })}
          </div>

          <ul className="mt-6 divide-y divide-cream-300 border-y border-cream-300">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="display text-[18px] text-ink-900">{item.name}</p>
                    {item.signature ? (
                      <span className="rounded-full border border-gold-500 bg-gold-200/60 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-800">
                        Signature
                      </span>
                    ) : null}
                    <span className="tnum ml-auto text-[14.5px] font-semibold text-ink-900">
                      {inr(item.price)}
                    </span>
                  </div>
                  <p className="mt-1 max-w-xl text-[13.5px] leading-relaxed text-warm-600">
                    {item.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {item.dietary.map((entry) => (
                      <span key={entry} className="chip">
                        {entry}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 pt-1">
                  {cart[item.id] ? (
                    <div className="inline-flex items-center rounded-[3px] border border-warm-300 bg-white">
                      <button
                        type="button"
                        aria-label={`Remove one ${item.name}`}
                        onClick={() => change(item.id, -1)}
                        className="grid h-9 w-9 place-items-center text-warm-700 transition-colors hover:bg-warm-50"
                      >
                        <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                      <span className="tnum w-7 text-center text-[14px] font-semibold text-ink-900">
                        {cart[item.id]}
                      </span>
                      <button
                        type="button"
                        aria-label={`Add one ${item.name}`}
                        onClick={() => change(item.id, 1)}
                        className="grid h-9 w-9 place-items-center text-warm-700 transition-colors hover:bg-warm-50"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => change(item.id, 1)}
                      className="h-9 rounded-[3px] border border-warm-300 bg-white px-4 text-[13px] font-medium text-ink-900 transition-colors hover:border-ink-900 hover:bg-ink-900 hover:text-ivory-50"
                    >
                      Add
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <SectionHeading
              eyebrow="While you wait"
              title="Other desks a tap away"
              description="Requests from any service land in the same shared queue — no need to call."
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {CATEGORY_META.map(({ key, label, icon: Icon, hint }) => (
                <Link
                  key={key}
                  to={servicePath(key)}
                  className="group flex items-center gap-3 rounded-[4px] border border-cream-300 bg-white px-4 py-3 shadow-hairline transition-[border-color,box-shadow] hover:border-gold-500/70 hover:shadow-lift"
                >
                  <Icon className="h-4 w-4 shrink-0 text-gold-600" strokeWidth={1.6} />
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-medium text-ink-900">{label}</span>
                    <span className="block text-[12px] text-warm-500">{hint}</span>
                  </span>
                  <ChevronRight
                    className="ml-auto h-4 w-4 shrink-0 text-warm-400 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={1.6}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Order tray */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Panel dark>
            <p className="eyebrow text-gold-400">Your tray</p>
            <h2 className="display mt-3 text-[1.5rem] text-ivory-50">
              {count > 0 ? `${count} item${count > 1 ? 's' : ''} selected` : 'Nothing added yet'}
            </h2>

            {lines.length === 0 ? (
              <div className="mt-4 flex items-start gap-3 rounded-[3px] border border-white/10 bg-white/[0.04] px-4 py-3.5">
                <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" strokeWidth={1.6} />
                <p className="text-[13px] leading-relaxed text-warm-400">
                  Add dishes from the sample menu — the tray totals update as you go, and nothing is
                  sent until you review the order.
                </p>
              </div>
            ) : (
              <>
                <ul className="mt-4 space-y-2.5 border-t border-white/10 pt-4">
                  {lines.map((line) => (
                    <li key={line.item.id} className="flex items-baseline gap-3 text-[13.5px]">
                      <span className="tnum w-6 shrink-0 text-gold-400">{line.qty}×</span>
                      <span className="min-w-0 flex-1 truncate text-cream-200">{line.item.name}</span>
                      <span className="tnum shrink-0 text-cream-200">
                        {inr(line.item.price * line.qty)}
                      </span>
                    </li>
                  ))}
                </ul>

                <dl className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-[13px]">
                  <div className="flex justify-between text-warm-400">
                    <dt>Subtotal</dt>
                    <dd className="tnum">{inr(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-warm-400">
                    <dt>Service charge (sample {KITCHEN.serviceChargePercent * 100}%)</dt>
                    <dd className="tnum">{inr(serviceLine)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-white/10 pt-2.5 text-[16px] text-ivory-50">
                    <dt>Estimated total</dt>
                    <dd className="tnum font-semibold">{inr(total)}</dd>
                  </div>
                </dl>

                <Button
                  variant="gold"
                  fullWidth
                  className="mt-4"
                  onClick={() => setReviewing(true)}
                >
                  Review & send order
                </Button>
                <button
                  type="button"
                  onClick={() => setCart({})}
                  className="mt-2 w-full rounded-[3px] py-2 text-[13px] text-warm-400 transition-colors hover:text-cream-200"
                >
                  Clear tray
                </button>
              </>
            )}

            <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-[12.5px] text-warm-400">
              <Clock className="h-3.5 w-3.5 text-gold-400" strokeWidth={1.7} />
              Kitchen estimate {KITCHEN.etaMinutes} minutes
            </div>
          </Panel>

          <Notice className="mt-4" tone="gold" title="Demo pricing">
            <p>
              Every price is sample data. No payment is taken anywhere in this prototype — the folio
              is settled at check-out like a normal stay.
            </p>
          </Notice>
        </div>
      </div>

      <Modal
        open={reviewing}
        onClose={() => setReviewing(false)}
        title="Review your order"
        eyebrow="Confirm & send"
        description="Check the tray before it goes to the kitchen pass."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setReviewing(false)}>
              Keep editing
            </Button>
            <Button variant="gold" size="sm" onClick={submitOrder}>
              Send to kitchen
            </Button>
          </>
        }
      >
        <ul className="divide-y divide-cream-300">
          {lines.map((line) => (
            <li key={line.item.id} className="flex items-baseline gap-3 py-2.5 text-[14px]">
              <span className="tnum w-6 shrink-0 text-gold-700">{line.qty}×</span>
              <span className="min-w-0 flex-1 text-ink-800">{line.item.name}</span>
              <span className="tnum text-ink-900">{inr(line.item.price * line.qty)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-baseline justify-between border-t border-cream-300 pt-3 text-[15px] font-semibold text-ink-900">
          <span>Estimated total</span>
          <span className="tnum">{inr(total)}</span>
        </div>

        <Notice className="mt-4">
          <p>
            The order is routed to the restaurant queue with reference TSH-48xx. Switch to the
            Restaurant dashboard to watch it move from Submitted to Completed.
          </p>
        </Notice>
      </Modal>
    </ServiceShell>
  );
}
