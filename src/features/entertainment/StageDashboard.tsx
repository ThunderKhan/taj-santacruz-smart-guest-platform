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
  Heart,
} from "lucide-react";
import { useRequests } from "@/store/RequestsProvider";
import { PERFORMER, DEFAULT_MUSIC_RULES } from "@/data/music";
import { QRCodeSVG } from "qrcode.react";
import { relativeTime } from "@/utils/format";
import type { ServiceRequest } from "@/types";

type Tab = "new" | "queue" | "history" | "settings" | "qr";
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
  const [tab, setTab] = useState<Tab>("new");
  const [query, setQuery] = useState("");
  const matches = (r: ServiceRequest) =>
    `${r.meta.Track ?? r.title} ${r.meta.Artist ?? ""} ${r.location}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  const [copied, setCopied] = useState(false);
  const music = requests.filter((r) => r.service === "music");
  const incoming = music.filter((r) => r.status === "submitted");
  // Keep the performance order stable as likes arrive. Include older accepted/held demo requests.
  const queue = music
    .filter(
      (r) =>
        r.status === "accepted" ||
        (r.status === "in_progress" && r.stage === "queued"),
    )
    .sort((a, b) => a.updatedAt - b.updatedAt || a.id.localeCompare(b.id));
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
    { id: "new", label: "New", count: incoming.length },
    { id: "queue", label: "Queue", count: queue.length },
    { id: "history", label: "History", count: history.length },
  ];
  function accept(r: ServiceRequest) {
    transition(r.id, "in_progress", {
      by: actor,
      stage: "queued",
      note: "Accepted by the band and added to the queue.",
    });
  }
  function start(r: ServiceRequest) {
    if (playing) return;
    if (r.status === "accepted")
      transition(r.id, "in_progress", {
        by: actor,
        stage: "playing",
        note: "Now playing on stage.",
      });
    else setStage(r.id, "playing", { note: "Now playing on stage." });
  }
  function card(r: ServiceRequest, index?: number) {
    const isNew = r.status === "submitted";
    const isQueued =
      r.status === "accepted" ||
      (r.status === "in_progress" && r.stage === "queued");
    return (
      <article className="music-request-card singer-workflow-row" key={r.id}>
        <div className="singer-track-heading">
          {index !== undefined ? (
            <span className="singer-queue-number">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : null}
          <div>
            <h3>{r.meta.Track ?? r.title}</h3>
            <p className="music-muted">
              {r.meta.Artist} · {r.location}
            </p>
          </div>
          <span className="singer-likes" aria-label={`${r.votes ?? 0} hearts`}>
            <Heart size={14} />
            {r.votes ?? 0}
          </span>
        </div>
        {r.meta["Preferred play time"] &&
        r.meta["Preferred play time"] !== "Any time" ? (
          <p className="music-preferred-time">
            <Clock3 size={15} />
            Preferred · {r.meta["Preferred play time"]}
            <span>Guest preference</span>
          </p>
        ) : null}
        {isNew ? (
          <div className="music-actions singer-quick-actions">
            <button
              className="music-secondary"
              aria-label={`Decline ${r.meta.Track ?? r.title}`}
              onClick={() => reject(r)}
            >
              Decline
            </button>
            <button
              className="music-primary"
              aria-label={`Accept ${r.meta.Track ?? r.title} and add to queue`}
              onClick={() => accept(r)}
            >
              <Check size={17} />
              Accept & queue
            </button>
          </div>
        ) : null}
        {isQueued ? (
          <div className="singer-queue-actions">
            <span className="music-muted">
              {index === 0 ? "Up next" : "In queue"}
            </span>
            <button
              className={index === 0 ? "music-primary" : "music-secondary"}
              disabled={Boolean(playing)}
              title={
                playing ? "Finish the current song first" : "Start this song"
              }
              onClick={() => start(r)}
            >
              <Play size={16} />
              Play now
            </button>
          </div>
        ) : null}
        {!isNew && !isQueued ? (
          <p className="singer-history-status">
            {r.status === "completed"
              ? "Played"
              : r.status === "rejected"
                ? "Declined"
                : "Cancelled"}{" "}
            · {relativeTime(r.updatedAt)}
          </p>
        ) : null}
        {r.guestNote || isQueued ? (
          <details className="singer-request-details">
            <summary>
              {r.guestNote ? "Dedication & options" : "Options"}
            </summary>
            {r.guestNote ? (
              <div className="music-dedication">
                <p>“{r.guestNote}”</p>
                {isNew || isQueued ? (
                  <button
                    className="music-text-button"
                    onClick={() =>
                      setDedicationHidden(r.id, !r.dedicationHidden)
                    }
                  >
                    {r.dedicationHidden
                      ? "Approve dedication"
                      : "Hold dedication"}
                  </button>
                ) : null}
              </div>
            ) : null}
            {isQueued ? (
              <button className="music-text-button" onClick={() => reject(r)}>
                Remove from queue
              </button>
            ) : null}
          </details>
        ) : null}
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
          {visible.map((request) =>
            card(
              request,
              ranked
                ? items.findIndex((item) => item.id === request.id)
                : undefined,
            ),
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
            <strong>{queue.length}</strong>
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
      <section
        className="music-onstage singer-now-playing"
        aria-label="Now playing"
      >
        <div>
          <span className="music-live">
            <i />
            {playing ? "NOW PLAYING" : "READY FOR THE NEXT SONG"}
          </span>
          <h2>
            {playing
              ? (playing.meta.Track ?? playing.title)
              : queue[0]
                ? (queue[0].meta.Track ?? queue[0].title)
                : "The stage is clear"}
          </h2>
          <p>
            {playing
              ? `${playing.meta.Artist ?? ""} · ${playing.location}`
              : queue.length
                ? "First in your queue"
                : "Accept a request below to get started."}
          </p>
        </div>
        {playing ? (
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
        ) : queue[0] ? (
          <button className="music-primary" onClick={() => start(queue[0])}>
            <Play size={17} />
            Play next
          </button>
        ) : null}
      </section>
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
                tabIndex={tab === t.id ? 0 : -1}
                onKeyDown={(event) => {
                  if (
                    !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                      event.key,
                    )
                  )
                    return;
                  event.preventDefault();
                  const current = tabs.findIndex((item) => item.id === t.id);
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? tabs.length - 1
                        : (current +
                            (event.key === "ArrowRight" ? 1 : -1) +
                            tabs.length) %
                          tabs.length;
                  setTab(tabs[next].id);
                  document.getElementById(`tab-${tabs[next].id}`)?.focus();
                }}
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
            <p className="singer-workflow-hint">
              {tab === "new"
                ? "Accept adds a song straight to your queue. Decline moves it to history."
                : tab === "queue"
                  ? "Songs stay in acceptance order. Finish the current song, then play the next."
                  : "Past requests, kept out of your working queue."}
            </p>
            {tab === "new"
              ? partition("New requests", incoming)
              : tab === "queue"
                ? partition("Your queue", queue, true)
                : partition("History", history)}
          </section>
        </>
      )}
      <nav className="music-console-dock" aria-label="Live music tools">
        <button
          aria-current={
            ["new", "queue", "history"].includes(tab) ? "page" : undefined
          }
          onClick={() => setTab("new")}
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
