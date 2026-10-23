import type { SpaTreatment, TimeSlot } from '@/types';

/** Illustrative treatment menu — not a verified spa price list. */
export const SPA_TREATMENTS: SpaTreatment[] = [
  {
    id: 'sp-01',
    name: 'Signature Aromatherapy Massage',
    description: 'Full-body restorative massage with a bespoke blend of essential oils.',
    duration: 60,
    price: 6500,
    tag: 'Most requested',
  },
  {
    id: 'sp-02',
    name: 'Deep Tissue Recovery',
    description: 'Firm, focused pressure for travellers recovering from long flights.',
    duration: 75,
    price: 7800,
  },
  {
    id: 'sp-03',
    name: 'Abhyanga Warm Oil Ritual',
    description: 'Traditional four-hand oil therapy followed by a steam wrap.',
    duration: 90,
    price: 9200,
    tag: 'Ayurvedic',
  },
  {
    id: 'sp-04',
    name: 'Express Back, Neck & Shoulders',
    description: 'A concentrated treatment designed between meetings or flights.',
    duration: 30,
    price: 3400,
  },
  {
    id: 'sp-05',
    name: 'Hydrating Facial',
    description: 'Gentle cleanse, exfoliation and moisture infusion for travel-weary skin.',
    duration: 60,
    price: 5900,
  },
  {
    id: 'sp-06',
    name: 'Sun Salutation Yoga Session',
    description: 'Guided one-to-one Hatha flow in the wellness studio.',
    duration: 60,
    price: 2800,
  },
];

/** Illustrative availability for the current day. */
export const SPA_SLOTS: TimeSlot[] = [
  { id: 'slot-1', time: '10:00 AM', available: false },
  { id: 'slot-2', time: '11:30 AM', available: true },
  { id: 'slot-3', time: '1:00 PM', available: true },
  { id: 'slot-4', time: '2:30 PM', available: false },
  { id: 'slot-5', time: '4:00 PM', available: true },
  { id: 'slot-6', time: '5:30 PM', available: true },
  { id: 'slot-7', time: '7:00 PM', available: true },
  { id: 'slot-8', time: '8:30 PM', available: false },
];
