import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/store/AuthProvider";
import { isEnquiryTerminal } from "@/services/enquiryEngine";
import {
  AudioLines,
  CalendarDays,
  Check,
  Clock3,
  Pause,
  Play,
  QrCode,
  Settings,
  Search,
  ThumbsUp,
} from "lucide-react";
import { useRequests } from "@/store/RequestsProvider";
import { PERFORMER, DEFAULT_MUSIC_RULES } from "@/data/music";
import { QRCodeSVG } from "qrcode.react";
import { relativeTime } from "@/utils/format";
import type { ServiceRequest } from "@/types";

type Tab = "all" | "new" | "queue" | "history" | "settings" | "qr";
export function StageDashboard() {
  const {
    requests,
    enquiries,
    transition,
    setStage,
    setDedicationHidden,
    musicRules,
    updateMusicRules,
  } = useRequests();
  const { session } = useAuth();
  const myEventsCount = enquiries.filter(
    (enquiry) =>
      enquiry.assignedMusicianId === session?.musicianId &&
      !isEnquiryTerminal(enquiry.status),
  ).length;
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const matches = (r: ServiceRequest) =>
    `${r.meta.Track ?? r.title} ${r.meta.Artist ?? ""} ${r.location}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  const [copied, setCopied] = useState(false);
  const music = requests.filter((r) => r.service === "music");
  const incoming = music.filter((r) => r.status === "submitted");
  const accepted = music.filter((r) => r.status === "accepted");
  const queue = music
    .filter((r) => r.status === "in_progress" && r.stage === "queued")
    .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
  const playing = music.find(
    (r) => r.status === "in_progress" && r.stage === "playing",
  );
  const history = music
    .filter((r) => ["completed", "rejected", "cancelled"].includes(r.status))
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const url = `${window.location.origin}/guest/music?loc=lounge-table-04`;
  const actor = "Performer · live console";
  function reject(r: ServiceRequest) {
    transition(r.id, "rejected", {
      by: actor,
      note: "Unable to perform this song in tonight’s set. Please choose another from our repertoire.",
    });
  }
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "all", label: "All", count: music.length },
    { id: "new", label: "New", count: incoming.length },
    { id: "queue", label: "To play", count: accepted.length + queue.length },
    { id: "history", label: "History", count: history.length },
  ];
  function card(r: ServiceRequest, index?: number) {
    const isNew = r.status === "submitted";
    const isAccepted = r.status === "accepted";
    const isQueued = r.stage === "queued" && r.status === "in_progress";
    return (
      <article
        className={`music-request-card ${isNew ? "" : "is-approved"}`}
        key={r.id}
      >
        <div className="music-card-top">
          <p className="music-kicker">
            {index !== undefined
              ? `${String(index + 1).padStart(2, "0")} · `
              : ""}
            {r.status === "completed"
              ? "PLAYED"
              : r.status === "rejected"
                ? "DECLINED"
                : r.status === "cancelled"
                  ? "CANCELLED"
                  : r.stage === "deferred"
                    ? "HELD FOR LATER"
                    : "SONG REQUEST"}
          </p>
          <span className="music-pill">
            <ThumbsUp size={13} />
            {r.votes ?? 0} votes · ×
            {
              music.filter(
                (other) =>
                  other.meta.Track === r.meta.Track &&
                  !["completed", "rejected", "cancelled"].includes(
                    other.status,
                  ),
              ).length
            }{" "}
            requests
          </span>
        </div>
        <h3>{r.meta.Track ?? r.title}</h3>
        <p className="music-muted">{r.meta.Artist}</p>
        {r.meta["Preferred play time"] &&
        r.meta["Preferred play time"] !== "Any time" ? (
          <p className="music-preferred-time">
            <Clock3 size={16} aria-hidden="true" />
            Preferred · {r.meta["Preferred play time"]}
            <span>Guest preference</span>
          </p>
        ) : null}
        {r.guestNote ? (
          <div className="music-dedication">
            <p>“{r.guestNote}”</p>
            <button
              className="music-text-button"
              onClick={() => setDedicationHidden(r.id, !r.dedicationHidden)}
            >
              {r.dedicationHidden ? "Approve dedication" : "Hold dedication"}
            </button>
          </div>
        ) : null}
        <div className="music-card-meta">
          <span>
            {r.location} · {relativeTime(r.submittedAt)}
          </span>
          <span>
            {r.status === "completed"
              ? "Played"
              : r.status === "rejected"
                ? "Declined"
                : r.status === "cancelled"
                  ? "Cancelled"
                  : isNew
                    ? "Awaiting approval"
                    : r.stage === "deferred"
                      ? "Deferred"
                      : isAccepted
                        ? "Accepted"
                        : "Queued"}
          </span>
        </div>
        <div className="music-actions">
          {isNew ? (
            <>
              <button className="music-secondary" onClick={() => reject(r)}>
                Decline
              </button>
              <button
                className="music-primary"
                onClick={() =>
                  transition(r.id, "accepted", {
                    by: actor,
                    note: "Your song has been accepted by the band.",
                  })
                }
              >
                <Check size={17} />
                Accept request
              </button>
              <button
                className="music-text-button"
                onClick={() =>
                  transition(r.id, "accepted", {
                    by: actor,
                    stage: "deferred",
                    note: "Held for a later set.",
                  })
                }
              >
                Hold for later
              </button>
            </>
          ) : null}
          {isAccepted ? (
            <>
              <button className="music-secondary" onClick={() => reject(r)}>
                Decline
              </button>
              <button
                className="music-primary"
                onClick={() =>
                  transition(r.id, "in_progress", {
                    by: actor,
                    stage: "queued",
                    note: "Added to the live queue.",
                  })
                }
              >
                Add to queue
              </button>
            </>
          ) : null}
          {isQueued ? (
            <>
              <button className="music-secondary" onClick={() => reject(r)}>
                Remove
              </button>
              <button
                className="music-primary"
                disabled={Boolean(playing)}
                title={
                  playing
                    ? "Mark the current song played first"
                    : "Play this song"
                }
                onClick={() =>
                  setStage(r.id, "playing", { note: "Now playing on stage." })
                }
              >
                <Play size={17} />
                Play now
              </button>
            </>
          ) : null}
        </div>
      </article>
    );
  }
  function partition(title: string, items: ServiceRequest[], ranked = false) {
    const visible = items.filter(matches);
    return (
      <section className="music-song-partition" aria-label={title}>
        <div className="music-section-heading">
          <h3>{title}</h3>
          <span className="music-pill">{visible.length}</span>
        </div>
        <div className="music-request-grid">
          {visible.map((request, index) =>
            card(request, ranked ? index : undefined),
          )}
        </div>
        {!visible.length ? (
          <p className="music-muted music-partition-empty">
            {query.trim()
              ? "No matching songs in this section."
              : "No songs here yet."}
          </p>
        ) : null}
      </section>
    );
  }
  return (
    <main className="music-console music-singer-centered">
      <header className="music-page-heading">
        <div>
          <p className="music-kicker">PERFORMER CONSOLE</p>
          <h1>
            {tab === "settings"
              ? "Tonight’s settings"
              : tab === "qr"
                ? "Share the evening"
                : "Live activity"}
          </h1>
          <p>
            {PERFORMER.venue} · {PERFORMER.name}
          </p>
        </div>
        <span className="music-pill">
          <i className={`music-dot ${musicRules.paused ? "is-paused" : ""}`} />
          {musicRules.paused ? "Requests paused" : "Live session"}
        </span>
      </header>
      <section className="music-console-summary">
        <div>
          <p className="music-kicker">TONIGHT AT THE LOBBY LOUNGE</p>
          <h2>
            Let the room
            <br />
            set the mood.
          </h2>
          <p>You choose the songs. We’ll keep the requests in order.</p>
          <Link className="music-summary-events" to="/musician/events">
            <CalendarDays size={17} aria-hidden="true" />
            My events<span>{myEventsCount}</span>
          </Link>
        </div>
        <div className="music-summary-stats">
          <div>
            <strong>{incoming.length}</strong>
            <small>NEW REQUESTS</small>
          </div>
          <div>
            <strong>{accepted.length + queue.length}</strong>
            <small>TO PLAY</small>
          </div>
          <div>
            <strong>
              {music.filter((r) => r.status === "completed").length}
            </strong>
            <small>PLAYED</small>
          </div>
        </div>
      </section>
      {playing ? (
        <section className="music-onstage">
          <div>
            <span className="music-live">
              <i /> ON STAGE NOW
            </span>
            <h2>{playing.meta.Track ?? playing.title}</h2>
            <p>
              {playing.meta.Artist} · {playing.location}
            </p>
          </div>
          <button
            className="music-primary"
            onClick={() =>
              transition(playing.id, "completed", {
                by: actor,
                stage: "played",
                note: "Performed this evening.",
              })
            }
          >
            <Check size={17} />
            Mark played
          </button>
        </section>
      ) : null}
      {tab === "settings" ? (
        <section className="music-settings">
          <p className="music-kicker">YOU’RE IN CONTROL</p>
          <h2>What guests can do</h2>
          <div className="music-setting-row">
            <div>
              <strong>Song requests</strong>
              <small>
                {musicRules.paused
                  ? "Closed for new requests"
                  : "Open to guests · free"}
              </small>
            </div>
            <button
              className="music-switch"
              role="switch"
              aria-label="Allow song requests"
              aria-checked={!musicRules.paused}
              onClick={() => updateMusicRules({ paused: !musicRules.paused })}
            >
              <span />
            </button>
          </div>
          <div className="music-setting-row">
            <div>
              <strong>Audience voting</strong>
              <small>Let the room show what it wants to hear</small>
            </div>
            <button
              className="music-switch"
              role="switch"
              aria-label="Allow audience voting"
              aria-checked={musicRules.votingEnabled}
              onClick={() =>
                updateMusicRules({ votingEnabled: !musicRules.votingEnabled })
              }
            >
              <span />
            </button>
          </div>
          <button
            className="music-secondary"
            onClick={() => updateMusicRules({ ...DEFAULT_MUSIC_RULES })}
          >
            Restore default settings
          </button>
        </section>
      ) : tab === "qr" ? (
        <section className="music-qr">
          <span className="music-live">
            <i /> GUEST ENTRY
          </span>
          <h2>One scan. A song for you.</h2>
          <div className="music-qr-image">
            <QRCodeSVG
              value={url}
              size={200}
              marginSize={1}
              title="Open the Lobby Lounge guest music page"
            />
          </div>
          <p>Scan to browse tonight’s songs and send a request.</p>
          <a
            className="music-primary"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            Open guest request page
          </a>
          <button
            className="music-secondary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? "Link copied" : "Copy guest link"}
          </button>
          <p className="music-fineprint">
            Demo state is shared between tabs on this browser. Separate devices
            do not sync.
          </p>
        </section>
      ) : (
        <>
          <label className="music-search">
            <Search size={20} />
            <input
              aria-label="Search singer requests"
              placeholder="Search song, artist, or table…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div
            className="music-tabs"
            role="tablist"
            aria-label="Request status"
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-controls="live-request-panel"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
              >
                <strong>{t.count}</strong>
                {t.label}
              </button>
            ))}
          </div>
          <section
            id="live-request-panel"
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            className="music-activity"
          >
            <div className="music-section-heading">
              <h2>
                {tab === "all"
                  ? "All song requests"
                  : tab === "new"
                    ? "Waiting for approval"
                    : tab === "queue"
                      ? "Accepted, still to play"
                      : "The evening so far"}
              </h2>
              <span className="music-muted">
                {tab === "queue"
                  ? "Queue ranked by audience votes"
                  : "Updates automatically"}
              </span>
            </div>
            {tab === "all" ? (
              <>
                {partition("New requests", incoming)}
                {partition(
                  "Accepted · ready to queue",
                  accepted.filter((r) => r.stage !== "deferred"),
                )}
                {partition(
                  "Held for later",
                  accepted.filter((r) => r.stage === "deferred"),
                )}
                {partition("Upcoming queue", queue, true)}
                {partition("History", history)}
              </>
            ) : tab === "new" ? (
              partition("New requests", incoming)
            ) : tab === "queue" ? (
              <>
                {partition(
                  "Accepted · ready to queue",
                  accepted.filter((r) => r.stage !== "deferred"),
                )}
                {partition(
                  "Held for later",
                  accepted.filter((r) => r.stage === "deferred"),
                )}
                {partition("Upcoming queue", queue, true)}
              </>
            ) : (
              partition("History", history)
            )}
          </section>
        </>
      )}
      <nav className="music-console-dock" aria-label="Live music tools">
        <button
          aria-current={
            ["all", "new", "queue", "history"].includes(tab)
              ? "page"
              : undefined
          }
          onClick={() => setTab("all")}
        >
          <AudioLines size={18} />
          <span>Console</span>
        </button>
        <button
          aria-current={tab === "settings" ? "page" : undefined}
          onClick={() => setTab("settings")}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <button
          aria-current={tab === "qr" ? "page" : undefined}
          onClick={() => setTab("qr")}
        >
          <QrCode size={18} />
          <span>Guest QR</span>
        </button>
        <button
          onClick={() => updateMusicRules({ paused: !musicRules.paused })}
        >
          {musicRules.paused ? <Play size={18} /> : <Pause size={18} />}
          <span>{musicRules.paused ? "Resume" : "Pause"}</span>
        </button>
      </nav>
    </main>
  );
}
