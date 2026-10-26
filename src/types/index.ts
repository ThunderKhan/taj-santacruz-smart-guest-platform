/* ============================================================================
 * Shared domain types for the Smart Hotel Guest Service Platform prototype.
 *
 * NOTE: This is a frontend prototype. These types describe the shape of the
 * simulated data layer only — there is no production schema behind them.
 * ==========================================================================*/

/** Guest-facing service catalogue identifiers. */
export type ServiceId =
  | 'food'
  | 'music'
  | 'housekeeping'
  | 'maintenance'
  | 'concierge'
  | 'spa'
  | 'transport'
  | 'feedback'
  | 'occasions'
  | 'reservations'
  | 'billing';

/** Operational departments that receive routed requests. */
export type DepartmentId =
  | 'restaurant'
  | 'housekeeping'
  | 'maintenance'
  | 'entertainment'
  | 'events'
  | 'concierge'
  | 'spa';

/**
 * Canonical request lifecycle.
 * Departments may display finer wording (e.g. "Preparing", "Ready") via
 * `stage`, but every request moves through this same underlying model.
 */
export type RequestStatus =
  | 'submitted'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'cancelled';

/** Optional department-specific granularity layered on top of `status`. */
export type RequestStage =
  | 'preparing'
  | 'ready'
  | 'queued'
  | 'playing'
  | 'played'
  /** Entertainment: accepted but deliberately held back for a later set. */
  | 'deferred';

export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export type RequestSource = 'qr' | 'kiosk' | 'tablet';

export type LocationKind = 'room' | 'table' | 'lounge' | 'public';

/* -------------------------------------------------------------------------- */
/* Locations & session                                                        */
/* -------------------------------------------------------------------------- */

export interface HotelLocation {
  id: string;
  /** Human-readable contextual label shown to the guest. */
  label: string;
  kind: LocationKind;
  /** Secondary descriptor, e.g. "Level 5 · Deluxe Sea View". */
  detail: string;
  /** QR code value — points at this local prototype route only. */
  qrTarget: string;
}

export interface GuestSession {
  /** Fictitious session reference. Not an identity credential. */
  guestRef: string;
  /** Fictitious display name used in mock data. */
  guestName: string;
  locationId: string;
  /** How the guest arrived — QR scan or hotel tablet. */
  entry: RequestSource;
}

/* -------------------------------------------------------------------------- */
/* Requests                                                                   */
/* -------------------------------------------------------------------------- */

export interface StatusEvent {
  status: RequestStatus;
  at: number;
  /** Actor label, e.g. "Front Desk · A. Kulkarni" or "Guest · Room 502". */
  by: string;
  stage?: RequestStage;
  note?: string;
}

export interface RequestLineItem {
  label: string;
  qty?: number;
  /** Illustrative price in INR. Sample data only. */
  price?: number;
  note?: string;
}

export interface ServiceRequest {
  /** Internal stable id. */
  id: string;
  /** Guest-facing reference number, e.g. "TSH-4821". */
  ref: string;
  service: ServiceId;
  /** Human-readable request type, e.g. "Housekeeping · Amenity request". */
  type: string;
  department: DepartmentId;
  property: string;
  locationId: string;
  location: string;
  guestRef: string;
  guestLabel: string;
  title: string;
  description: string;
  /** Structured payload shown in the detail panel. */
  meta: Record<string, string>;
  lineItems: RequestLineItem[];
  priority: Priority;
  status: RequestStatus;
  stage?: RequestStage;
  source: RequestSource;
  submittedAt: number;
  updatedAt: number;
  /** Assigned staff member display name. */
  assignedTo: string | null;
  history: StatusEvent[];
  /** Guest-visible free text captured at submission. */
  guestNote?: string;
  /** Staff-visible completion / resolution note. */
  resolutionNote?: string;
  /** Illustrative order value in INR. Sample data only. */
  value?: number;
  /** True for the seeded demonstration records. */
  seeded: boolean;
  /** Entertainment: votes cast by other guests. */
  votes?: number;
  /** Entertainment: whether the demo guest already voted. */
  guestVoted?: boolean;
  /** Entertainment: dedications can be held back from the public queue view. */
  dedicationHidden?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Departments & staff                                                        */
/* -------------------------------------------------------------------------- */

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export interface Department {
  id: DepartmentId;
  name: string;
  /** Short operational subtitle shown in headers. */
  subtitle: string;
  location: string;
  staff: StaffMember[];
  /** Services routed to this department. */
  services: ServiceId[];
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

export type NotificationAudience = 'guest' | 'staff';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  at: number;
  read: boolean;
  audience: NotificationAudience;
  /** Staff notifications are scoped to one department. */
  department?: DepartmentId;
  /** Guest notifications are scoped to the demo guest's session. */
  guestRef?: string;
  ref?: string;
}

/* -------------------------------------------------------------------------- */
/* Catalogue entries                                                          */
/* -------------------------------------------------------------------------- */

export interface ServiceDefinition {
  id: ServiceId;
  title: string;
  blurb: string;
  route: string;
  /** Lucide icon key resolved in the catalogue renderer. */
  icon: string;
  image?: string;
  /** Small ordinal used to give the catalogue a deliberate rhythm. */
  order: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  dietary: string[];
  signature?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  note: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  category: SongCategory;
}

/** Guest browsing categories shown on the live music screen. */
export type SongCategory =
  | 'bollywood'
  | 'english-pop'
  | 'romantic'
  | 'jazz'
  | 'classics'
  | 'party';

export interface SpaTreatment {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  tag?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

/* -------------------------------------------------------------------------- */
/* Celebration enquiries                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Events / banquet enquiry workflow.
 *
 * Deliberately separate from the canonical request lifecycle: an enquiry is a
 * sales conversation with its own states, not a task in an operations queue.
 */
export type EnquiryStatus =
  | 'new'
  | 'under_review'
  | 'needs_info'
  | 'proposal_sent'
  | 'confirmed'
  | 'closed';

export interface EnquiryEvent {
  status: EnquiryStatus;
  at: number;
  /** Actor label, e.g. "Events desk · S. Kapoor" or "Guest · Room 502". */
  by: string;
  note?: string;
}

/** Staff-only annotation attached to an enquiry. Never shown to guests. */
export interface EnquiryNote {
  id: string;
  at: number;
  by: string;
  body: string;
}

export interface CelebrationEnquiry {
  /** Internal stable id. */
  id: string;
  /** Guest-facing reference, e.g. "CEL-3301". */
  ref: string;
  occasion: string;
  /** ISO calendar date, e.g. "2026-12-14". */
  eventDate: string;
  /** 24-hour clock start time, e.g. "19:30". */
  startTime: string;
  /** Approximate event duration in hours. */
  durationHours: number;
  guests: number;
  venue: string;
  entertainment: string;
  genre: string;
  /** Special requests, favourite songs, dedications, announcements. */
  specialRequests: string;
  /** Optional free-form notes from the guest. */
  notes: string;
  guestRef: string;
  guestLabel: string;
  location: string;
  source: RequestSource;
  status: EnquiryStatus;
  submittedAt: number;
  updatedAt: number;
  assignedTo: string | null;
  /** Display label of the sample package proposed to the guest, if any. */
  proposedPackage: string | null;
  internalNotes: EnquiryNote[];
  history: EnquiryEvent[];
  /** True for the seeded demonstration records. */
  seeded: boolean;
}

/* -------------------------------------------------------------------------- */
/* Demo configuration                                                         */
/* -------------------------------------------------------------------------- */

/** Demo-only rules a performer can adjust from the stage dashboard. */
export interface MusicRules {
  /** Pause incoming song requests without closing the guest screen. */
  paused: boolean;
  /** Maximum open song requests per guest session. */
  requestLimit: number;
  /** Whether guests may vote on the approved queue. */
  votingEnabled: boolean;
}
