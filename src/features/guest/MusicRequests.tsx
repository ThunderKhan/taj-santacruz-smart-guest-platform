import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  AudioLines,
  Check,
  Disc3,
  Heart,
  Plus,
  Search,
  ThumbsUp,
} from "lucide-react";
import { useRequests } from "@/store/RequestsProvider";
import { useHomePath } from "@/hooks/useHomePath";
import { LocationControl } from "@/components/LocationSwitcher";
import { StatusBadge } from "@/components/ui/Badge";
import {
  PERFORMER,
  NOW_PLAYING,
  SONG_CATALOGUE,
  SONG_CATEGORIES,
} from "@/data/music";
import { isTerminal } from "@/services/requestEngine";
import type { Song, SongCategory } from "@/types";

export function MusicRequests() {
  const { requests, session, location, createRequest, toggleVote, musicRules } =
    useRequests();
  const home = useHomePath();
  const [view, setView] = useState<"search" | "mine" | "queue">("search");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SongCategory | "all">("all");
  const [selected, setSelected] = useState<Song | null>(null);
  const [dedication, setDedication] = useState("");
  const [message, setMessage] = useState("");
  const music = requests.filter((r) => r.service === "music");
  const mine = music
    .filter((r) => r.guestRef === session.guestRef)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const queue = music
    .filter((r) => r.status === "in_progress" && r.stage === "queued")
    .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
  const playing = music.find(
    (r) => r.status === "in_progress" && r.stage === "playing",
  );
  const played = music.filter((r) => r.status === "completed");
  const open = mine.filter((r) => !isTerminal(r.status)).length;
  const blocked = musicRules.paused || open >= musicRules.requestLimit;
  const results = SONG_CATALOGUE.filter(
    (s) =>
      (category === "all" || s.category === category) &&
      `${s.title} ${s.artist} ${s.genre}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  ).slice(0, 12);
  const taken = (song: Song) =>
    mine.some((r) => r.meta.Track === song.title && !isTerminal(r.status));
  function submit() {
    if (!selected || blocked || taken(selected)) return;
    createRequest({
      service: "music",
      title: `Song request — ${selected.title}`,
      description: `Requested from ${location.label} at ${PERFORMER.venue}.`,
      guestNote: dedication.trim() || undefined,
      votes: 1,
      meta: {
        Track: selected.title,
        Artist: selected.artist,
        Genre: selected.genre,
        Dedication: dedication.trim() ? "Yes" : "No",
      },
    });
    setMessage(
      `${selected.title} sent to the band. Follow its status in My requests.`,
    );
    setSelected(null);
    setDedication("");
    setView("mine");
  }
  return (
    <main className="music-page music-centered">
      <header className="music-page-heading">
        <div>
          <p className="music-kicker">TAJ SANTACRUZ · LIVE EXPERIENCES</p>
          <h1>Your evening. Your soundtrack.</h1>
          <p>A little request. A memorable night.</p>
        </div>
        <LocationControl />
      </header>
      <div className="music-guest-grid">
        <div className="music-guest-main">
          <section className="music-hero">
            <div className="music-hero-copy">
              <span className="music-live">
                <i /> LIVE AT THE LOBBY LOUNGE
              </span>
              <h2>{playing?.meta.Track ?? NOW_PLAYING.title}</h2>
              <p>{playing?.meta.Artist ?? NOW_PLAYING.artist}</p>
              <div className="music-hero-footer">
                <AudioLines size={26} />
                <span>
                  {PERFORMER.name}
                  <small>Tonight’s resident ensemble</small>
                </span>
              </div>
            </div>
            <img
              src="/images/music-stage.jpg"
              alt="Live music stage at the lounge"
            />
          </section>
          <nav className="music-workflow-nav" aria-label="Guest music sections">
            <button
              aria-current={view === "search" ? "page" : undefined}
              onClick={() => setView("search")}
            >
              Request a song
            </button>
            <button
              aria-current={view === "mine" ? "page" : undefined}
              onClick={() => setView("mine")}
            >
              My requests <span>{mine.length}</span>
            </button>
            <button
              aria-current={view === "queue" ? "page" : undefined}
              onClick={() => setView("queue")}
            >
              Live queue <span>{queue.length}</span>
            </button>
          </nav>
          {blocked ? (
            <p className="music-notice">
              {musicRules.paused
                ? "The band is taking a break from new requests. You can still browse and vote."
                : "Your request limit is reached. You can request again once one is completed."}
            </p>
          ) : null}
          <div role="status" aria-live="polite">
            {message ? (
              <p className="music-notice">
                <Check size={18} />
                {message}
              </p>
            ) : null}
          </div>
          {view === "search" ? (
            <>
              <div className="music-section-heading">
                <div>
                  <p className="music-kicker">MAKE IT YOUR NIGHT</p>
                  <h2>Request a song</h2>
                </div>
                <span className="music-pill">
                  {Math.max(0, musicRules.requestLimit - open)} requests left
                </span>
              </div>
              <p className="music-muted">
                Choose from tonight’s repertoire. The band decides what plays.
              </p>
              <label className="music-search">
                <Search size={20} />
                <input
                  aria-label="Search songs, artists or genres"
                  placeholder="Find a song or artist…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div className="music-filters" aria-label="Song categories">
                <button
                  aria-pressed={category === "all"}
                  onClick={() => setCategory("all")}
                >
                  All songs
                </button>
                {SONG_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    aria-pressed={category === c.id}
                    onClick={() => setCategory(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {selected ? (
                <section
                  className="music-request-form"
                  aria-label="Confirm your song request"
                >
                  <p className="music-kicker">YOUR PICK</p>
                  <h3>{selected.title}</h3>
                  <p className="music-muted">
                    {selected.artist} · {location.label}
                  </p>
                  <label htmlFor="dedication">
                    Make it personal{" "}
                    <span className="music-muted">(optional)</span>
                  </label>
                  <textarea
                    id="dedication"
                    autoFocus
                    maxLength={180}
                    value={dedication}
                    onChange={(e) => setDedication(e.target.value)}
                    placeholder="A dedication, a celebration, or just because…"
                  />
                  <small className="music-muted">
                    {dedication.length}/180 · Dedications are reviewed by the
                    band.
                  </small>
                  <div className="music-actions">
                    <button
                      className="music-primary"
                      disabled={blocked || taken(selected)}
                      onClick={submit}
                    >
                      <Heart size={17} />
                      Send request
                    </button>
                    <button
                      className="music-secondary"
                      onClick={() => setSelected(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </section>
              ) : null}
              <ul className="music-song-list">
                {results.map((song, i) => (
                  <li key={song.id}>
                    <span className={`music-record record-${i % 4}`}>
                      <Disc3 size={28} />
                    </span>
                    <div className="music-song-info">
                      <strong>{song.title}</strong>
                      <small>
                        {song.artist} · {song.genre}
                      </small>
                    </div>
                    <span className="music-duration">{song.duration}</span>
                    <button
                      className="music-add"
                      aria-label={
                        taken(song)
                          ? `${song.title} already requested`
                          : `Request ${song.title}`
                      }
                      disabled={blocked || taken(song)}
                      onClick={() => {
                        setSelected(song);
                        setMessage("");
                        setDedication("");
                      }}
                    >
                      {taken(song) ? <Check size={20} /> : <Plus size={20} />}
                    </button>
                  </li>
                ))}
              </ul>
              {!results.length ? (
                <p className="music-empty">
                  No songs found. Try another artist or category.
                </p>
              ) : null}
            </>
          ) : view === "mine" ? (
            <>
              <section className="music-mine">
                <div className="music-section-heading">
                  <h2>My requests</h2>
                  <span className="music-pill">{mine.length}</span>
                </div>
                {mine.length ? (
                  mine.slice(0, 6).map((r) => (
                    <Link
                      key={r.id}
                      to={`${home}/requests/${r.ref}`}
                      className="music-my-row"
                    >
                      <div>
                        <strong>{r.meta.Track ?? r.title}</strong>
                        <small>
                          {r.meta.Artist} ·{" "}
                          {
                            music.filter(
                              (other) =>
                                other.meta.Track === r.meta.Track &&
                                !isTerminal(other.status),
                            ).length
                          }{" "}
                          requests
                        </small>
                      </div>
                      <StatusBadge status={r.status} stage={r.stage} />
                      <ArrowUpRight size={18} />
                    </Link>
                  ))
                ) : (
                  <p className="music-muted">
                    Your song’s journey appears here after you send a request.
                  </p>
                )}
              </section>
            </>
          ) : (
            <>
              <section className="music-audience">
                <div className="music-section-heading">
                  <div>
                    <p className="music-kicker">THE ROOM HAS GOOD TASTE</p>
                    <h2>Live requests</h2>
                  </div>
                  <span className="music-live">
                    <i /> LIVE
                  </span>
                </div>
                <p className="music-muted">
                  Tap to upvote an approved song you’d love to hear.
                </p>
                <ol className="music-vote-list">
                  {queue.map((r, i) => (
                    <li key={r.id}>
                      <span className="music-rank">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="music-song-info">
                        <strong>{r.meta.Track ?? r.title}</strong>
                        <small>
                          {r.meta.Artist} ·{" "}
                          {
                            music.filter(
                              (other) =>
                                other.meta.Track === r.meta.Track &&
                                !isTerminal(other.status),
                            ).length
                          }{" "}
                          requests
                        </small>
                      </div>
                      <button
                        className="music-vote"
                        aria-label={`Vote for ${r.meta.Track}`}
                        aria-pressed={Boolean(r.guestVoted)}
                        disabled={!musicRules.votingEnabled}
                        onClick={() => toggleVote(r.id)}
                      >
                        <ThumbsUp size={16} />
                        {r.votes ?? 0}
                      </button>
                    </li>
                  ))}
                </ol>
                {!queue.length ? (
                  <p className="music-empty">
                    The next great request could be yours.
                  </p>
                ) : null}
                {!musicRules.votingEnabled ? (
                  <p className="music-notice">
                    Audience voting is paused for this set.
                  </p>
                ) : null}
                <p className="music-fineprint">
                  <Check size={15} />
                  Votes show demand. The band curates the evening.
                </p>
              </section>
              <section className="music-history">
                <div className="music-section-heading">
                  <h2>Played tonight</h2>
                  <span className="music-pill">{played.length}</span>
                </div>
                {played.slice(0, 5).map((r) => (
                  <div key={r.id} className="music-history-row">
                    <Check size={16} />
                    <span>
                      {r.meta.Track ?? r.title}
                      <small>{r.meta.Artist}</small>
                    </span>
                  </div>
                ))}
                {!played.length ? (
                  <p className="music-muted">
                    The evening is just getting started.
                  </p>
                ) : null}
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
