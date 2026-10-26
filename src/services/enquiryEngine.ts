import type {
  CelebrationEnquiry,
  EnquiryStatus,
  GuestSession,
  HotelLocation,
  RequestSource,
} from '@/types';

/**
 * Celebration enquiry engine.
 *
 * A separate, smaller lifecycle next to the request engine: enquiries run
 * New → Under Review → Need More Information → Proposal Sent → Confirmed or
 * Closed. All rules live here (mock-data layer) so the workflow can be
 * reconfigured without touching dashboard code.
 */

export const ENQUIRY_REFERENCE_PREFIX = 'CEL';
/** Seeded enquiries occupy CEL-3210…; live submissions start here. */
export const FIRST_ENQUIRY_REFERENCE = 3300;

const ALLOWED_TRANSITIONS: Record<EnquiryStatus, EnquiryStatus[]> = {
  new: ['under_review', 'closed'],
  under_review: ['needs_info', 'proposal_sent', 'closed'],
  needs_info: ['under_review', 'proposal_sent', 'closed'],
  proposal_sent: ['confirmed', 'closed'],
  confirmed: [],
  closed: [],
};

/** Forward-only enquiry workflow — confirmed and closed are end states. */
export function canEnquiryTransition(from: EnquiryStatus, to: EnquiryStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Statuses a staff member may pick from the current state. */
export function enquiryActions(from: EnquiryStatus): EnquiryStatus[] {
  return ALLOWED_TRANSITIONS[from];
}

export function isEnquiryTerminal(status: EnquiryStatus): boolean {
  return ALLOWED_TRANSITIONS[status].length === 0;
}

/** Guest- and staff-facing status wording. */
export function enquiryStatusLabel(status: EnquiryStatus): string {
  switch (status) {
    case 'new':
      return 'New';
    case 'under_review':
      return 'Under Review';
    case 'needs_info':
      return 'Need More Information';
    case 'proposal_sent':
      return 'Proposal Sent';
    case 'confirmed':
      return 'Confirmed';
    case 'closed':
      return 'Closed';
    default:
      return status;
  }
}

/** Short action label used by the events dashboard buttons. */
export function enquiryActionLabel(status: EnquiryStatus): string {
  return enquiryStatusLabel(status);
}

/** What the guest is told happens next, shown on their confirmation screen. */
export function enquiryNextHint(enquiry: Pick<CelebrationEnquiry, 'status'>): string {
  switch (enquiry.status) {
    case 'new':
      return 'The events team has your enquiry and will begin reviewing it shortly.';
    case 'under_review':
      return 'The events team is reviewing your dates, venue and entertainment options.';
    case 'needs_info':
      return 'The team needs a little more information before it can prepare a proposal.';
    case 'proposal_sent':
      return 'A sample package has been proposed. Availability, pricing and final arrangements are confirmed by the events team — an enquiry alone never holds a date.';
    case 'confirmed':
      return 'Marked confirmed in this demonstration only. In a production system this step would follow a signed proposal and payment terms — neither exists here.';
    case 'closed':
      return 'This enquiry has been closed. You are welcome to send a new one at any time.';
    default:
      return '';
  }
}

export function makeEnquiryReference(sequence: number): string {
  return `${ENQUIRY_REFERENCE_PREFIX}-${sequence}`;
}

export interface NewEnquiryInput {
  occasion: string;
  eventDate: string;
  startTime: string;
  durationHours: number;
  guests: number;
  venue: string;
  entertainment: string;
  genre: string;
  specialRequests?: string;
  notes?: string;
  source?: RequestSource;
}

export interface EnquiryContext {
  sequence: number;
  session: GuestSession;
  location: HotelLocation;
  now: number;
}

/** Pure constructor for a submitted enquiry — mirrors `buildRequest`. */
export function buildEnquiry(
  input: NewEnquiryInput,
  context: EnquiryContext,
): CelebrationEnquiry {
  return {
    id: `enq_${context.now.toString(36)}_${context.sequence}`,
    ref: makeEnquiryReference(context.sequence),
    occasion: input.occasion,
    eventDate: input.eventDate,
    startTime: input.startTime,
    durationHours: input.durationHours,
    guests: input.guests,
    venue: input.venue,
    entertainment: input.entertainment,
    genre: input.genre,
    specialRequests: input.specialRequests?.trim() ?? '',
    notes: input.notes?.trim() ?? '',
    guestRef: context.session.guestRef,
    guestLabel:
      context.location.kind === 'room'
        ? context.location.label
        : `Guest · ${context.location.label}`,
    location: context.location.label,
    source: input.source ?? context.session.entry,
    status: 'new',
    submittedAt: context.now,
    updatedAt: context.now,
    assignedTo: null,
    assignedMusicianId: null,
    assignedMusician: null,
    proposedPackage: null,
    internalNotes: [],
    history: [
      {
        status: 'new',
        at: context.now,
        by: `Guest · ${context.location.label}`,
        note: 'Enquiry received — not a confirmed booking',
      },
    ],
    seeded: false,
  };
}
