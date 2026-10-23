import { seededRandom } from '@/utils/format';

/**
 * Illustrative historical series.
 *
 * These values are STATIC SAMPLE HISTORY used to give the management dashboard
 * realistic context. They are clearly labelled in the interface and are
 * independent of anything created during a demonstration. Live charts are
 * computed from the prototype's own request state instead.
 */

export interface DaySeriesPoint {
  label: string;
  requests: number;
  completed: number;
  date: string;
}

function buildDailySeries(): DaySeriesPoint[] {
  const random = seededRandom(20260123);
  const points: DaySeriesPoint[] = [];
  const now = new Date();

  for (let index = 13; index >= 0; index -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - index);
    day.setHours(0, 0, 0, 0);

    const weekday = day.getDay();
    const weekendLift = weekday === 5 || weekday === 6 ? 1.18 : weekday === 0 ? 1.08 : 1;
    const base = 96 + random() * 34;
    const requests = Math.round(base * weekendLift);
    const completionRate = 0.88 + random() * 0.1;

    points.push({
      label: day.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: day.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      requests,
      completed: Math.min(requests, Math.round(requests * completionRate)),
    });
  }
  return points;
}

export const DAILY_VOLUME_14D: DaySeriesPoint[] = buildDailySeries();

export interface FeedbackPoint {
  label: string;
  rating: number;
  responses: number;
}

function buildFeedbackSeries(): FeedbackPoint[] {
  const random = seededRandom(778812);
  const now = new Date();
  return Array.from({ length: 8 }, (_, index) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (7 - index) * 7);
    return {
      label: day.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      rating: Number((4.32 + random() * 0.42).toFixed(2)),
      responses: Math.round(38 + random() * 34),
    };
  });
}

export const FEEDBACK_TREND: FeedbackPoint[] = buildFeedbackSeries();

/** Static operational targets — illustrative, not measured from the prototype. */
export const SERVICE_TARGETS = {
  responseTargetMinutes: 8,
  completionTargetMinutes: 32,
  csatTarget: 4.6,
  acceptanceRateTarget: 0.96,
} as const;

/** Static department baselines for the "vs sample target" comparisons. */
export interface DepartmentBaseline {
  department: string;
  avgMinutes: number;
  targetMinutes: number;
}

export const DEPARTMENT_BASELINES: DepartmentBaseline[] = [
  { department: 'Restaurant', avgMinutes: 27, targetMinutes: 30 },
  { department: 'Housekeeping', avgMinutes: 19, targetMinutes: 22 },
  { department: 'Maintenance', avgMinutes: 48, targetMinutes: 45 },
  { department: 'Entertainment', avgMinutes: 6, targetMinutes: 8 },
  { department: 'Concierge', avgMinutes: 24, targetMinutes: 25 },
  { department: 'Spa', avgMinutes: 21, targetMinutes: 24 },
];

/** Complimentary copy for the management insights rail. */
export interface ServiceInsight {
  id: string;
  title: string;
  detail: string;
  tone: 'positive' | 'attention' | 'neutral';
}

export const SERVICE_INSIGHTS: ServiceInsight[] = [
  {
    id: 'i-1',
    title: 'Entertainment responds fastest',
    detail: 'Song requests are acknowledged inside the target window most evenings.',
    tone: 'positive',
  },
  {
    id: 'i-2',
    title: 'Engineering carries the longest tail',
    detail: 'Repair tickets frequently exceed the illustrative 45-minute target — worth reviewing technician cover.',
    tone: 'attention',
  },
  {
    id: 'i-3',
    title: 'Dedication requests lift engagement',
    detail: 'Requests with a dedication message attract noticeably more guest votes.',
    tone: 'neutral',
  },
  {
    id: 'i-4',
    title: 'Evening peak sits between 7 and 9 PM',
    detail: 'Sample history shows the heaviest service load before the second live set.',
    tone: 'neutral',
  },
];
