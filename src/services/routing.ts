import type { DepartmentId, Priority, ServiceId } from '@/types';

/**
 * Central request-routing configuration.
 *
 * Routing rules live in the mock-data layer (not inside components) so the
 * mapping can be reconfigured without touching UI code — mirroring how a
 * production service would read rules from server-side configuration.
 */
export interface RoutingRule {
  id: string;
  service: ServiceId;
  /**
   * Optional refinement key. A more specific rule (one with a `topic`) wins
   * over a general rule for the same service.
   */
  topic?: string;
  department: DepartmentId;
  type: string;
  defaultPriority: Priority;
  description: string;
}

export const ROUTING_RULES: RoutingRule[] = [
  {
    id: 'route.food',
    service: 'food',
    department: 'restaurant',
    type: 'Food & Beverage Order',
    defaultPriority: 'normal',
    description: 'In-room dining and table orders',
  },
  {
    id: 'route.reservations.dining',
    service: 'reservations',
    topic: 'dining',
    department: 'restaurant',
    type: 'Table Reservation',
    defaultPriority: 'normal',
    description: 'Restaurant table bookings',
  },
  {
    id: 'route.reservations.activity',
    service: 'reservations',
    department: 'concierge',
    type: 'Reservation & Activity Request',
    defaultPriority: 'normal',
    description: 'Events, activities and experiences',
  },
  {
    id: 'route.housekeeping',
    service: 'housekeeping',
    department: 'housekeeping',
    type: 'Housekeeping Request',
    defaultPriority: 'normal',
    description: 'Amenities, linen, cleaning and turndown',
  },
  {
    id: 'route.maintenance',
    service: 'maintenance',
    department: 'maintenance',
    type: 'Maintenance Ticket',
    defaultPriority: 'normal',
    description: 'Climate, lighting, plumbing and equipment faults',
  },
  {
    id: 'route.music',
    service: 'music',
    department: 'entertainment',
    type: 'Song Request',
    defaultPriority: 'normal',
    description: 'Song requests, dedications and votes',
  },
  {
    id: 'route.concierge',
    service: 'concierge',
    department: 'concierge',
    type: 'Concierge Enquiry',
    defaultPriority: 'normal',
    description: 'Hotel information and guest assistance',
  },
  {
    id: 'route.transport',
    service: 'transport',
    department: 'concierge',
    type: 'Transport Request',
    defaultPriority: 'high',
    description: 'Hotel cars, transfers and shuttles',
  },
  {
    id: 'route.feedback',
    service: 'feedback',
    department: 'concierge',
    type: 'Guest Feedback',
    defaultPriority: 'normal',
    description: 'Compliments, concerns and complaints',
  },
  {
    id: 'route.feedback.urgent',
    service: 'feedback',
    topic: 'concern',
    department: 'concierge',
    type: 'Guest Relations Concern',
    defaultPriority: 'high',
    description: 'Raised concerns routed with elevated priority',
  },
  {
    id: 'route.occasions',
    service: 'occasions',
    department: 'concierge',
    type: 'Special Occasion Request',
    defaultPriority: 'normal',
    description: 'Cakes, flowers and celebration arrangements',
  },
  {
    id: 'route.billing',
    service: 'billing',
    department: 'concierge',
    type: 'Bill Review Request',
    defaultPriority: 'normal',
    description: 'Illustrative folio review, no payment processing',
  },
  {
    id: 'route.spa',
    service: 'spa',
    department: 'spa',
    type: 'Spa Booking Request',
    defaultPriority: 'normal',
    description: 'Treatment and session requests',
  },
];

export interface RouteResolution {
  department: DepartmentId;
  type: string;
  priority: Priority;
  rule: RoutingRule;
}

/** Resolve the destination department for a guest submission. */
export function resolveRoute(service: ServiceId, topic?: string): RouteResolution {
  const candidates = ROUTING_RULES.filter((rule) => rule.service === service);

  const exact = topic ? candidates.find((rule) => rule.topic === topic) : undefined;
  const fallback = candidates.find((rule) => !rule.topic) ?? candidates[0];

  const rule = exact ?? fallback ?? {
    id: 'route.default',
    service,
    department: 'concierge' as DepartmentId,
    type: 'Guest Request',
    defaultPriority: 'normal' as Priority,
    description: 'Unmapped request routed to guest relations for triage',
  };

  return {
    department: rule.department,
    type: rule.type,
    priority: rule.defaultPriority,
    rule,
  };
}

/** Departments shown in the operations switcher, in presentation order. */
export const OPERATIONAL_DEPARTMENTS: DepartmentId[] = [
  'restaurant',
  'housekeeping',
  'maintenance',
  'entertainment',
  'concierge',
  'spa',
];
