import { useState } from "react";
import { SongRequestConfirmation } from "./SongRequestConfirmation";
import {
  AudioLines,
  Check,
  Disc3,
  Heart,
  Clock3,
  Plus,
  Search,
} from "lucide-react";
import { useRequests } from "@/store/RequestsProvider";
import { LocationControl } from "@/components/LocationSwitcher";
import { SongRequestRow, SongRequestStatus } from "./SongRequestRow";
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
  const [view, setView] = useState<"search" | "mine" | "queue">("search");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SongCategory | "all">("all");
  const [selected, setSelected] = useState<Song | null>(null);
  const [dedication, setDedication] = useState("");
  const [playTime, setPlayTime] = useState("any");
  const [customTime, setCustomTime] = useState("");
  const [timeError, setTimeError] = useState(false);
  const requestedTime = playTime === "custom" ? customTime : playTime;
  const timeLabel =
    requestedTime === "any"
      ? "Any time"
      : /^\d{2}:\d{2}$/.test(requestedTime)
        ? `${Number(requestedTime.split(":")[0]) % 12 || 12}:${requestedTime.split(":")[1]} ${Number(requestedTime.split(":")[0]) >= 12 ? "PM" : "AM"}`
        : "";
  const [confirmation, setConfirmation] = useState<{
    title: string;
    artist: string;
    preferredTime: string;
  } | null>(null);
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
  const blocked = musicRules.paused;
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
    if (!timeLabel) {
      setTimeError(true);
      document.getElementById("preferred-play-time")?.focus();
      return;
    }
    createRequest(
      {
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
          "Preferred play time": timeLabel,
        },
      },
      { silent: true },
    );
    setConfirmation({
      title: selected.title,
      artist: selected.artist,
      preferredTime: timeLabel,
    });
    setSelected(null);
    setDedication("");
    setView("mine");
  }
  return (
    <main className="music-page music-centered">
      {confirmation ? (
        <SongRequestConfirmation
          song={confirmation}
          onClose={() => setConfirmation(null)}
        />
      ) : null}
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
              The band is taking a break from new requests. You can still browse
              and vote.
            </p>
          ) : null}
          {view === "search" ? (
            <>
              <div className="music-section-heading">
                <div>
                  <p className="music-kicker">MAKE IT YOUR NIGHT</p>
                  <h2>Request a song</h2>
                </div>
                <span className="music-pill">Unlimited requests</span>
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
                  <fieldset
                    className="music-time-picker"
                    aria-describedby="play-time-help"
                  >
                    <legend>
                      <Clock3 size={17} aria-hidden="true" />
                      When would you like to hear it? <span>(optional)</span>
                    </legend>
                    <p id="play-time-help">
                      Choose a preferred time for this evening. The band will do
                      its best to fit it into the set.
                    </p>
                    <div className="music-time-options">
                      {[
                        { value: "any", label: "Any time" },
                        { value: "21:30", label: "9:30 PM" },
                        { value: "22:00", label: "10:00 PM" },
                        { value: "23:00", label: "11:00 PM" },
                      ].map((option) => (
                        <button
                          type="button"
                          key={option.value}
                          aria-pressed={playTime === option.value}
                          onClick={() => {
                            setPlayTime(option.value);
                            setTimeError(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="music-text-button music-custom-time-toggle"
                      aria-expanded={playTime === "custom"}
                      aria-controls="custom-play-time"
                      onClick={() => {
                        setPlayTime(playTime === "custom" ? "any" : "custom");
                        setTimeError(false);
                      }}
                    >
                      Choose another time
                    </button>
                    {playTime === "custom" ? (
                      <div id="custom-play-time" className="music-custom-time">
                        <label htmlFor="preferred-play-time">
                          Preferred time
                        </label>
                        <input
                          id="preferred-play-time"
                          type="time"
                          value={customTime}
                          aria-invalid={timeError}
                          aria-describedby={
                            timeError
                              ? "play-time-error play-time-help"
                              : "play-time-help"
                          }
                          onChange={(event) => {
                            setCustomTime(event.target.value);
                            setTimeError(false);
                          }}
                        />
                        {timeError ? (
                          <p id="play-time-error" role="alert">
                            Choose a time, or select Any time.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    <p className="music-time-disclaimer">
                      A preference, not a confirmed time slot.
                    </p>
                  </fieldset>
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
                        setPlayTime("any");
                        setCustomTime("");
                        setTimeError(false);

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
                  mine.map((r) => <SongRequestRow key={r.id} request={r} />)
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
                  Tap the heart on a song you’d love to hear.
                </p>
                <ol className="music-vote-list">
                  {queue.map((r, i) => (
                    <li key={r.id}>
                      <span className="music-rank">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="music-song-info">
                        <strong>{r.meta.Track ?? r.title}</strong>
                        <SongRequestStatus request={r} />
                        <small>
                          {r.meta.Artist}
                          {r.meta["Preferred play time"] &&
                          r.meta["Preferred play time"] !== "Any time"
                            ? ` · Preferred: ${r.meta["Preferred play time"]}`
                            : ""}{" "}
                          ·{" "}
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
                        className="music-vote music-heart"
                        aria-label={`${r.guestVoted ? "Unlike" : "Like"} ${r.meta.Track ?? r.title}`}
                        aria-pressed={Boolean(r.guestVoted)}
                        disabled={!musicRules.votingEnabled}
                        onClick={() => toggleVote(r.id)}
                      >
                        <Heart size={19} fill={r.guestVoted ? "currentColor" : "none"} aria-hidden="true" />
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
                    Song likes are paused for this set.
                  </p>
                ) : null}
                <p className="music-fineprint">
                  <Check size={15} />
                  Hearts show what the room loves. The band curates the evening.
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
