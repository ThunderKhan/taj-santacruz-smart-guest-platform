import { useState } from 'react';
import { CalendarDays, Clock, MapPin, Send, TriangleAlert, Users } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { Button } from '@/components/ui/Button';
import { Badge, EnquiryStatusBadge } from '@/components/ui/Badge';
import { KeyValue, Panel, SectionHeading } from '@/components/ui/Panel';
import { SelectInput, TextArea } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Feedback';
import { EnquiryTimeline } from '@/components/ui/Timeline';
import { Drawer } from '@/components/ui/Overlay';
import { EVENT_PACKAGES, packageLabel } from '@/data/celebrations';
import { staffFor } from '@/data/departments';
import {
  enquiryActions,
  enquiryNextHint,
  enquiryStatusLabel,
  isEnquiryTerminal,
} from '@/services/enquiryEngine';
import { fullTimestamp, isoDateLabel, relativeTime } from '@/utils/format';
import type { CelebrationEnquiry, EnquiryStatus } from '@/types';

/**
 * Enquiry detail drawer for the events & banquet desk.
 *
 * Staff advance the workflow (New → Under Review → Need More Information →
 * Proposal Sent → Confirmed / Closed), add internal notes, assign a colleague
 * and attach a sample package. Confirmed and closed are end states; every
 * status is visible to the guest with matching wording, so the note field is
 * marked internal.
 */
export function EnquiryDrawer({
  enquiry,
  onClose,
}: {
  enquiry: CelebrationEnquiry | null;
  onClose: () => void;
}) {
  const { setEnquiryStatus, addEnquiryNote, assignEnquiry, proposeEnquiryPackage } = useRequests();
  const [note, setNote] = useState('');
  const [packageId, setPackageId] = useState('');

  const handleClose = () => {
    setNote('');
    setPackageId('');
    onClose();
  };

  if (!enquiry) return null;

  const actions = enquiryActions(enquiry.status);
  const terminal = isEnquiryTerminal(enquiry.status);
  const staff = staffFor('events');

  const submitNote = () => {
    if (!note.trim()) return;
    addEnquiryNote(enquiry.id, note.trim());
    setNote('');
  };

  const recordProposal = () => {
    if (!packageId) return;
    proposeEnquiryPackage(enquiry.id, packageLabel(packageId));
    setPackageId('');
  };

  return (
    <Drawer
      open
      onClose={handleClose}
      eyebrow={`Enquiry ${enquiry.ref}`}
      title={`${enquiry.occasion} · ${enquiry.venue}`}
      width="max-w-[620px]"
    >
      {/* Status header ---------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-3 border-b border-cream-300 pb-4">
        <EnquiryStatusBadge status={enquiry.status} />
        <span className="text-[13px] text-warm-600">
          Updated {relativeTime(enquiry.updatedAt)} · {fullTimestamp(enquiry.submittedAt)}
        </span>
        {enquiry.seeded ? <Badge tone="neutral">Demo</Badge> : null}
      </div>

      {terminal ? (
        <Notice
          tone={enquiry.status === 'confirmed' ? 'sage' : 'neutral'}
          title={
            enquiry.status === 'confirmed'
              ? 'Confirmed — demonstration only'
              : 'Enquiry closed'
          }
          className="mt-4"
        >
          <p>
            {enquiryNextHint(enquiry)} Nothing beyond this point exists in the prototype: no signed
            proposal, no deposit and no calendar hold.
          </p>
        </Notice>
      ) : (
        <div className="mt-4">
          <p className="eyebrow-sm text-warm-500">Move to</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {actions.map((status: EnquiryStatus) => (
              <Button
                key={status}
                size="sm"
                variant={status === 'closed' ? 'outline' : status === 'confirmed' ? 'gold' : 'outline'}
                onClick={() => {
                  setEnquiryStatus(enquiry.id, status);
                }}
              >
                {enquiryStatusLabel(status)}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-warm-500">
            {enquiryNextHint(enquiry)}
          </p>
        </div>
      )}

      {/* Facts ------------------------------------------------------------- */}
      <div className="mt-5 grid gap-x-6 sm:grid-cols-2">
        <KeyValue label="Event date">
          <CalendarDays className="mr-1 inline h-3.5 w-3.5 text-gold-600" strokeWidth={1.7} />
          {isoDateLabel(enquiry.eventDate)} · {enquiry.startTime}
        </KeyValue>
        <KeyValue label="Duration">
          <Clock className="mr-1 inline h-3.5 w-3.5 text-gold-600" strokeWidth={1.7} />
          Approx. {enquiry.durationHours} hours
        </KeyValue>
        <KeyValue label="Guests">
          <Users className="mr-1 inline h-3.5 w-3.5 text-gold-600" strokeWidth={1.7} />
          ~{enquiry.guests} guests
        </KeyValue>
        <KeyValue label="Venue">
          <MapPin className="mr-1 inline h-3.5 w-3.5 text-gold-600" strokeWidth={1.7} />
          {enquiry.venue}
        </KeyValue>
        <KeyValue label="Entertainment">{enquiry.entertainment}</KeyValue>
        <KeyValue label="Music style">{enquiry.genre}</KeyValue>
        <KeyValue label="Raised by">{enquiry.guestLabel}</KeyValue>
        <KeyValue label="Assigned to">
          {enquiry.assignedTo ?? <span className="text-warm-500">Unassigned</span>}
        </KeyValue>
      </div>

      {enquiry.specialRequests ? (
        <div className="mt-4 rounded-[3px] border border-cream-300 bg-ivory-100 px-4 py-3">
          <p className="eyebrow-sm text-warm-600">Special requests, songs & dedications</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-warm-700">
            {enquiry.specialRequests}
          </p>
        </div>
      ) : null}

      {enquiry.notes ? (
        <div className="mt-3 rounded-[3px] border border-cream-300 bg-ivory-100 px-4 py-3">
          <p className="eyebrow-sm text-warm-600">Guest notes</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-warm-700">{enquiry.notes}</p>
        </div>
      ) : null}

      {/* Assignment ------------------------------------------------------- */}
      <Panel className="mt-5">
        <SectionHeading
          eyebrow="Ownership"
          title="Assignment"
          description="One colleague leads the enquiry; the whole desk can still see it."
        />
        <div className="mt-3 max-w-xs">
          <SelectInput
            value={enquiry.assignedTo ?? ''}
            onChange={(event) => {
              if (event.target.value) assignEnquiry(enquiry.id, event.target.value);
            }}
            aria-label="Assign this enquiry"
          >
            <option value="">Unassigned</option>
            {staff.map((person) => (
              <option key={person.id} value={person.name}>
                {person.name} · {person.role}
              </option>
            ))}
          </SelectInput>
        </div>
      </Panel>

      {/* Sample package --------------------------------------------------- */}
      <Panel className="mt-4">
        <SectionHeading
          eyebrow="Proposal"
          title="Sample package"
          description="Attaching a package records a proposal — indicative figures only, never a quotation."
        />
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <SelectInput
              value={packageId}
              onChange={(event) => setPackageId(event.target.value)}
              aria-label="Choose a sample package"
            >
              <option value="">Choose a sample package…</option>
              {EVENT_PACKAGES.map((pack) => (
                <option key={pack.id} value={pack.id}>
                  {pack.name} · {pack.duration}
                </option>
              ))}
            </SelectInput>
          </div>
          <Button
            variant="gold"
            onClick={recordProposal}
            disabled={!packageId}
            title={packageId ? 'Record this proposal' : 'Choose a package first'}
          >
            <Send className="h-4 w-4" strokeWidth={1.8} />
            Record proposal
          </Button>
        </div>

        {enquiry.proposedPackage ? (
          <div className="mt-4 rounded-[3px] border border-sage-500/40 bg-sage-500/12 px-4 py-3">
            <p className="eyebrow-sm text-forest-700">Currently proposed</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-forest-700">
              {enquiry.proposedPackage}
            </p>
          </div>
        ) : (
          <p className="mt-3 flex items-start gap-2 text-[12.5px] leading-relaxed text-warm-500">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" strokeWidth={1.8} />
            No package attached yet — the guest is told a proposal is not a confirmed booking.
          </p>
        )}
      </Panel>

      {/* Internal notes ---------------------------------------------------- */}
      <Panel className="mt-4">
        <SectionHeading
          eyebrow="Desk notes"
          title="Internal notes"
          description="Staff-only context. Never shown to the guest on their screen."
        />

        {enquiry.internalNotes.length > 0 ? (
          <ul className="mt-3 space-y-2.5 border-t border-cream-300 pt-3">
            {enquiry.internalNotes.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] text-warm-500">
                    {entry.by} · {relativeTime(entry.at)}
                  </span>
                  <span className="mt-0.5 block text-[13.5px] leading-relaxed text-warm-700">
                    {entry.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[13px] text-warm-500">No internal notes yet.</p>
        )}

        <div className="mt-4">
          <TextArea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add a note for the events desk…"
            aria-label="Internal note"
            maxLength={280}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-[12px] text-warm-500">{note.length}/280 characters</p>
            <Button size="sm" variant="outline" onClick={submitNote} disabled={!note.trim()}>
              Save note
            </Button>
          </div>
        </div>
      </Panel>

      {/* Timeline ---------------------------------------------------------- */}
      <div className="mt-5 border-t border-cream-300 pt-5">
        <p className="eyebrow-sm text-warm-500">Status history</p>
        <div className="mt-4">
          <EnquiryTimeline history={enquiry.history} dense />
        </div>
      </div>
    </Drawer>
  );
}
