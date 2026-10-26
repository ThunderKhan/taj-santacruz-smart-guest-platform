import type {
  GuestSession,
  HotelLocation,
  Priority,
  RequestLineItem,
  RequestSource,
  RequestStage,
  RequestStatus,
  ServiceId,
  ServiceRequest,
  StatusEvent,
} from '@/types';
import { PROPERTY } from '@/data/property';
import { serviceTitle } from '@/data/services';
import { resolveRoute } from './routing';

export const REFERENCE_PREFIX = 'TSH';
export const FIRST_REFERENCE_NUMBER = 4800;

/** Canonical lifecycle order — all departments share this underlying model. */
export const STATUS_FLOW: RequestStatus[] = [
  'submitted',
  'accepted',
  'in_progress',
  'completed',
];

export const TERMINAL_STATUSES: RequestStatus[] = ['completed', 'rejected', 'cancelled'];

export function isTerminal(status: RequestStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/**
 * Forward-only transitions. Departments may move a request ahead by more than
 * one step (a supervisor can jump straight to completed), but never backwards.
 */
export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  if (from === to) return false;
  if (isTerminal(from)) return false;
  if (to === 'rejected' || to === 'cancelled') return true;
  return STATUS_FLOW.indexOf(to) > STATUS_FLOW.indexOf(from);
}

export function nextActionable(from: RequestStatus): RequestStatus | null {
  const index = STATUS_FLOW.indexOf(from);
  if (index < 0 || index >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[index + 1];
}

export function makeReference(sequence: number): string {
  return `${REFERENCE_PREFIX}-${sequence}`;
}

export interface NewRequestInput {
  service: ServiceId;
  title: string;
  description: string;
  /** Optional routing refinement (see routing.ts). */
  topic?: string;
  meta?: Record<string, string>;
  lineItems?: RequestLineItem[];
  priority?: Priority;
  guestNote?: string;
  value?: number;
  source?: RequestSource;
  stage?: RequestStage;
  votes?: number;
}

export interface BuildContext {
  sequence: number;
  session: GuestSession;
  location: HotelLocation;
  now: number;
}

/**
 * Pure constructor for a submitted request. Every guest submission flows
 * through this function so routing, references and history stay consistent.
 */
export function buildRequest(input: NewRequestInput, context: BuildContext): ServiceRequest {
  const route = resolveRoute(input.service, input.topic);
  const priority = input.priority ?? route.priority;
  const source = input.source ?? context.session.entry;

  const history: StatusEvent[] = [
    {
      status: 'submitted',
      at: context.now,
      by: `Guest · ${context.location.label}`,
      stage: input.stage,
      note: 'Submitted from the guest service interface',
    },
  ];

  return {
    id: `req_${context.now.toString(36)}_${context.sequence}`,
    ref: makeReference(context.sequence),
    service: input.service,
    type: route.type,
    department: route.department,
    property: PROPERTY.name,
    locationId: context.location.id,
    location: context.location.label,
    guestRef: context.session.guestRef,
    guestLabel: context.location.kind === 'room' ? context.location.label : `Guest · ${context.location.label}`,
    title: input.title,
    description: input.description,
    meta: input.meta ?? {},
    lineItems: input.lineItems ?? [],
    priority,
    status: 'submitted',
    stage: input.stage,
    source,
    submittedAt: context.now,
    updatedAt: context.now,
    assignedTo: null,
    history,
    guestNote: input.guestNote,
    value: input.value,
    seeded: false,
    votes: input.votes ?? 0,
    guestVoted: false,
  };
}

export interface TransitionOptions {
  by: string;
  note?: string;
  stage?: RequestStage;
  assignedTo?: string;
  resolutionNote?: string;
}

/** Apply a status change and append an immutable history entry. */
export function applyTransition(
  request: ServiceRequest,
  status: RequestStatus,
  options: TransitionOptions,
  now: number,
): ServiceRequest {
  const history: StatusEvent[] = [
    ...request.history,
    {
      status,
      at: now,
      by: options.by,
      stage: options.stage,
      note: options.note,
    },
  ];

  return {
    ...request,
    status,
    stage: options.stage ?? (status === 'completed' ? undefined : request.stage),
    assignedTo: options.assignedTo ?? request.assignedTo,
    resolutionNote: options.resolutionNote ?? request.resolutionNote,
    updatedAt: now,
    history,
  };
}

/** Human-facing status wording, refined per service where it reads better. */
export function statusLabel(request: Pick<ServiceRequest, 'status' | 'stage'>): string {
  if (request.status === 'in_progress') {
    if (request.stage === 'preparing') return 'Preparing';
    if (request.stage === 'ready') return 'Ready';
    if (request.stage === 'queued') return 'Queued';
    if (request.stage === 'playing') return 'Playing';
    return 'In progress';
  }
  if (request.status === 'completed' && request.stage === 'played') return 'Played';
  if (request.status === 'submitted') return 'Submitted';
  if (request.status === 'accepted') {
    return request.stage === 'deferred' ? 'Deferred' : 'Accepted';
  }
  if (request.status === 'completed') return 'Completed';
  if (request.status === 'rejected') return 'Rejected';
  if (request.status === 'cancelled') return 'Cancelled';
  return request.status;
}

/** Next guest-visible milestone description. */
export function nextStepHint(request: ServiceRequest): string {
  const music = request.service === 'music';

  switch (request.status) {
    case 'submitted':
      return music
        ? 'Your request is with the performer — it moves into the queue once accepted.'
        : `${request.department === 'restaurant' ? 'Restaurant' : 'The team'} has been notified and will accept shortly.`;
    case 'accepted':
      if (music) {
        return request.stage === 'deferred'
          ? 'The performer has set this request aside and may bring it back in a later set.'
          : 'The performer has approved your request — it joins the queue in vote order.';
      }
      return 'The department has accepted your request.';
    case 'in_progress':
      if (music) {
        if (request.stage === 'playing') return 'Your track is playing now.';
        if (request.stage === 'queued') return 'Your track is in the queue — votes move it up the running order.';
        return 'Your request is being worked on.';
      }
      return request.stage === 'preparing'
        ? 'Your order is being prepared.'
        : 'Your request is being worked on.';
    case 'completed':
      return music && request.stage === 'played'
        ? 'Performed this evening — thank you for the request.'
        : 'This request has been completed.';
    case 'rejected':
      return music
        ? 'The performer has politely declined this track — usually because it sits outside the planned set. You are welcome to request another.'
        : 'This request was declined. Please contact the team for alternatives.';
    case 'cancelled':
      return 'This request was cancelled.';
    default:
      return '';
  }
}

/** Priority label helper used by badges across staff and management views. */
export function priorityLabel(priority: Priority): string {
  switch (priority) {
    case 'urgent':
      return 'Urgent';
    case 'high':
      return 'High';
    case 'low':
      return 'Low';
    default:
      return 'Normal';
  }
}

/** Convenience for the guest confirmation screen. */
export function serviceAndType(service: ServiceId, type: string): string {
  return `${serviceTitle(service)} · ${type}`;
}
