import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import type {
  AppNotification,
  GuestSession,
  HotelLocation,
  NotificationAudience,
  RequestSource,
  RequestStatus,
  ServiceRequest,
} from '@/types';
import { DEFAULT_LOCATION_ID, LOCATIONS, findLocation } from '@/data/property';
import { buildSeed, DEMO_GUEST_NAME, DEMO_GUEST_REF } from '@/data/requests';
import {
  applyTransition,
  buildRequest,
  canTransition,
  statusLabel,
  type NewRequestInput,
  type TransitionOptions,
} from '@/services/requestEngine';

/* -------------------------------------------------------------------------- */
/* Persistence                                                                */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = 'smart-guest-platform:v1';
const STATE_VERSION = 1;
/** Re-anchor seeded timestamps if the prototype has been left idle this long. */
const REANCHOR_AFTER_MS = 14 * 60 * 60 * 1000;

interface PersistedState {
  version: number;
  seededAt: number;
  sequence: number;
  session: GuestSession;
  requests: ServiceRequest[];
  notifications: AppNotification[];
  ribbonCollapsed: boolean;
}

function shiftTimestamps(state: PersistedState, delta: number): PersistedState {
  return {
    ...state,
    seededAt: state.seededAt + delta,
    requests: state.requests.map((request) => ({
      ...request,
      submittedAt: request.submittedAt + delta,
      updatedAt: request.updatedAt + delta,
      history: request.history.map((event) => ({ ...event, at: event.at + delta })),
    })),
    notifications: state.notifications.map((notification) => ({
      ...notification,
      at: notification.at + delta,
    })),
  };
}

function createInitialState(now: number): PersistedState {
  const seed = buildSeed(now);
  return {
    version: STATE_VERSION,
    seededAt: now,
    sequence: seed.sequence,
    session: {
      guestRef: DEMO_GUEST_REF,
      guestName: DEMO_GUEST_NAME,
      locationId: DEFAULT_LOCATION_ID,
      entry: 'qr',
    },
    requests: seed.requests,
    notifications: seed.notifications,
    ribbonCollapsed: false,
  };
}

function loadState(now: number): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState(now);

    const parsed = JSON.parse(raw) as PersistedState;
    if (
      !parsed ||
      parsed.version !== STATE_VERSION ||
      !Array.isArray(parsed.requests) ||
      parsed.requests.length === 0
    ) {
      return createInitialState(now);
    }

    const idleFor = now - parsed.seededAt;
    if (idleFor > REANCHOR_AFTER_MS) return shiftTimestamps(parsed, idleFor);
    return parsed;
  } catch {
    // Corrupt storage must never break the demo — fall back to a fresh seed.
    return createInitialState(now);
  }
}

function saveState(state: PersistedState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode). The prototype still works in memory.
  }
}

/* -------------------------------------------------------------------------- */
/* Reducer                                                                    */
/* -------------------------------------------------------------------------- */

interface AssignOptions {
  staff: string;
  by: string;
  note?: string;
}

type Action =
  | { type: 'create'; request: ServiceRequest; now: number }
  | { type: 'transition'; id: string; status: RequestStatus; options: TransitionOptions; now: number }
  | { type: 'assign'; id: string; options: AssignOptions; now: number }
  | { type: 'vote'; id: string }
  | { type: 'setLocation'; locationId: string }
  | { type: 'setEntry'; entry: RequestSource }
  | { type: 'markRead'; all?: boolean; department?: string }
  | { type: 'setRibbon'; collapsed: boolean }
  | { type: 'reset'; now: number };

function notify(
  existing: AppNotification[],
  entries: AppNotification[],
): AppNotification[] {
  return [...entries, ...existing].slice(0, 60);
}

function staffNotification(
  request: ServiceRequest,
  title: string,
  body: string,
  now: number,
): AppNotification {
  return {
    id: `n_${now}_${request.ref}_s`,
    title,
    body,
    at: now,
    read: false,
    audience: 'staff',
    department: request.department,
    ref: request.ref,
  };
}

function guestNotification(
  request: ServiceRequest,
  title: string,
  body: string,
  now: number,
): AppNotification {
  return {
    id: `n_${now}_${request.ref}_g`,
    title,
    body,
    at: now,
    read: false,
    audience: 'guest',
    guestRef: request.guestRef,
    ref: request.ref,
  };
}

function reducer(state: PersistedState, action: Action): PersistedState {
  switch (action.type) {
    case 'create': {
      const request = action.request;
      const body = `${request.title} · ${request.location}`;
      return {
        ...state,
        sequence: state.sequence + 1,
        requests: [request, ...state.requests],
        notifications: notify(state.notifications, [
          staffNotification(request, `New ${request.type}`, body, action.now),
          guestNotification(
            request,
            `Request ${request.ref} submitted`,
            'Your request has been routed and is awaiting acceptance.',
            action.now,
          ),
        ]),
      };
    }

    case 'transition': {
      const target = state.requests.find((request) => request.id === action.id);
      if (!target || !canTransition(target.status, action.status)) return state;

      const updated = applyTransition(target, action.status, action.options, action.now);
      const label = statusLabel(updated);

      const guestBody =
        action.status === 'completed'
          ? action.options.note ?? `${updated.title} has been completed.`
          : action.options.note ?? `Status updated to ${label}.`;

      const entries: AppNotification[] = [
        staffNotification(
          updated,
          `${updated.ref} · ${label}`,
          `${updated.title} · ${updated.location}`,
          action.now,
        ),
      ];

      if (updated.guestRef === state.session.guestRef) {
        entries.push(
          guestNotification(updated, `${updated.ref} · ${label}`, guestBody, action.now),
        );
      }

      return {
        ...state,
        requests: state.requests.map((request) => (request.id === action.id ? updated : request)),
        notifications: notify(state.notifications, entries),
      };
    }

    case 'assign': {
      const target = state.requests.find((request) => request.id === action.id);
      if (!target) return state;

      const updated: ServiceRequest = {
        ...target,
        assignedTo: action.options.staff,
        updatedAt: action.now,
        history: [
          ...target.history,
          {
            status: target.status,
            at: action.now,
            by: action.options.by,
            note: action.options.note ?? `Assigned to ${action.options.staff}`,
          },
        ],
      };

      return {
        ...state,
        requests: state.requests.map((request) => (request.id === action.id ? updated : request)),
        notifications: notify(state.notifications, [
          staffNotification(
            updated,
            `${updated.ref} assigned to ${action.options.staff}`,
            updated.title,
            action.now,
          ),
        ]),
      };
    }

    case 'vote': {
      return {
        ...state,
        requests: state.requests.map((request) =>
          request.id === action.id
            ? {
                ...request,
                guestVoted: !request.guestVoted,
                votes: Math.max(0, (request.votes ?? 0) + (request.guestVoted ? -1 : 1)),
              }
            : request,
        ),
      };
    }

    case 'setLocation': {
      if (!LOCATIONS.some((location) => location.id === action.locationId)) return state;
      return { ...state, session: { ...state.session, locationId: action.locationId } };
    }

    case 'setEntry':
      return { ...state, session: { ...state.session, entry: action.entry } };

    case 'markRead': {
      return {
        ...state,
        notifications: state.notifications.map((notification) => {
          if (notification.read) return notification;
          if (action.all) return { ...notification, read: true };
          if (action.department && notification.department === action.department) {
            return { ...notification, read: true };
          }
          if (!action.department && notification.audience === 'guest') {
            return { ...notification, read: true };
          }
          return notification;
        }),
      };
    }

    case 'setRibbon':
      return { ...state, ribbonCollapsed: action.collapsed };

    case 'reset':
      return createInitialState(action.now);

    default:
      return state;
  }
}

/* -------------------------------------------------------------------------- */
/* Toasts                                                                     */
/* -------------------------------------------------------------------------- */

export type ToastTone = 'success' | 'info' | 'warn' | 'error';

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  body?: string;
}

/* -------------------------------------------------------------------------- */
/* Context API                                                                */
/* -------------------------------------------------------------------------- */

export interface RequestsApi {
  requests: ServiceRequest[];
  session: GuestSession;
  location: HotelLocation;
  notifications: AppNotification[];
  toasts: Toast[];
  ribbonCollapsed: boolean;
  createRequest: (input: NewRequestInput) => ServiceRequest;
  transition: (
    id: string,
    status: RequestStatus,
    options?: Partial<TransitionOptions>,
  ) => boolean;
  assign: (id: string, options: AssignOptions) => void;
  toggleVote: (id: string) => void;
  setLocation: (locationId: string) => void;
  setEntry: (entry: RequestSource) => void;
  markNotificationsRead: (scope?: { all?: boolean; department?: string }) => void;
  dismissToast: (id: string) => void;
  resetDemo: () => void;
  setRibbonCollapsed: (collapsed: boolean) => void;
  getByRef: (ref: string) => ServiceRequest | undefined;
  /** Re-renders the elapsed-time column without touching persisted state. */
  tick: number;
}

const RequestsContext = createContext<RequestsApi | null>(null);

const STAFF_ACTOR = 'Operations · Duty desk';

export function RequestsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState(Date.now()));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    saveState(state);
  }, [state]);

  /* Gentle pulse so elapsed times and relative stamps stay honest. */
  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [...current, { ...toast, id }].slice(-4));
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 5200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const createRequest = useCallback(
    (input: NewRequestInput): ServiceRequest => {
      const now = Date.now();
      const location = findLocation(state.session.locationId);
      const request = buildRequest(input, {
        sequence: state.sequence,
        session: state.session,
        location,
        now,
      });
      dispatch({ type: 'create', request, now });
      pushToast({
        tone: 'success',
        title: `Reference ${request.ref} created`,
        body: `Routed to ${request.type}.`,
      });
      return request;
    },
    [state.sequence, state.session, pushToast],
  );

  const transition = useCallback(
    (id: string, status: RequestStatus, options: Partial<TransitionOptions> = {}) => {
      const target = state.requests.find((request) => request.id === id);
      if (!target) return false;
      if (!canTransition(target.status, status)) {
        pushToast({
          tone: 'warn',
          title: 'Status not allowed',
          body: `${target.ref} is already ${statusLabel(target)}.`,
        });
        return false;
      }

      const now = Date.now();
      dispatch({
        type: 'transition',
        id,
        status,
        options: { by: STAFF_ACTOR, ...options },
        now,
      });
      pushToast({
        tone: 'success',
        title: `${target.ref} · ${statusLabel({ status })}`,
        body: options.note ?? target.title,
      });
      return true;
    },
    [state.requests, pushToast],
  );

  const assign = useCallback(
    (id: string, options: AssignOptions) => {
      dispatch({ type: 'assign', id, options, now: Date.now() });
      pushToast({
        tone: 'info',
        title: 'Assignment updated',
        body: `${options.staff} has been assigned.`,
      });
    },
    [pushToast],
  );

  const toggleVote = useCallback(
    (id: string) => {
      dispatch({ type: 'vote', id });
    },
    [],
  );

  const resetDemo = useCallback(() => {
    dispatch({ type: 'reset', now: Date.now() });
    setToasts([]);
    pushToast({
      tone: 'info',
      title: 'Demo data restored',
      body: 'All requests have returned to their seeded state.',
    });
  }, [pushToast]);

  const markNotificationsRead = useCallback(
    (scope?: { all?: boolean; department?: string }) => {
      dispatch({ type: 'markRead', ...scope });
    },
    [],
  );

  const value = useMemo<RequestsApi>(() => {
    const location = findLocation(state.session.locationId);
    return {
      requests: state.requests,
      session: state.session,
      location,
      notifications: state.notifications,
      toasts,
      ribbonCollapsed: state.ribbonCollapsed,
      createRequest,
      transition,
      assign,
      toggleVote,
      setLocation: (locationId: string) => dispatch({ type: 'setLocation', locationId }),
      setEntry: (entry: RequestSource) => dispatch({ type: 'setEntry', entry }),
      markNotificationsRead,
      dismissToast,
      resetDemo,
      setRibbonCollapsed: (collapsed: boolean) => dispatch({ type: 'setRibbon', collapsed }),
      getByRef: (ref: string) => state.requests.find((request) => request.ref === ref),
      tick,
    };
  }, [
    state,
    toasts,
    createRequest,
    transition,
    assign,
    toggleVote,
    markNotificationsRead,
    dismissToast,
    resetDemo,
    tick,
  ]);

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}

export function useRequests(): RequestsApi {
  const context = useContext(RequestsContext);
  if (!context) throw new Error('useRequests must be used inside <RequestsProvider>');
  return context;
}

/** Notifications scoped to whichever experience is currently rendered. */
export function useScopedNotifications(
  audience: NotificationAudience,
  department?: string,
): AppNotification[] {
  const { notifications } = useRequests();
  return useMemo(
    () =>
      notifications.filter((notification) => {
        if (notification.audience !== audience) return false;
        if (audience === 'staff') return !department || notification.department === department;
        return true;
      }),
    [notifications, audience, department],
  );
}
