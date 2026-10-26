import type { Song, SongCategory } from '@/types';

/**
 * Live entertainment sample data.
 * No audio is streamed — song metadata only, used to demonstrate the
 * request / voting / queue moderation workflow.
 */
export const PERFORMER = {
  name: 'Aarav & The Marina Collective',
  role: 'Resident ensemble · Lobby Lounge',
  setNote: 'Acoustic to upbeat · sets at 7:30 PM and 9:15 PM',
  venue: 'Lobby Lounge',
  nextSet: '9:15 PM',
} as const;

/** Browse categories offered on the guest music screen. */
export const SONG_CATEGORIES: Array<{ id: SongCategory; label: string }> = [
  { id: 'bollywood', label: 'Bollywood' },
  { id: 'english-pop', label: 'English Pop' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'jazz', label: 'Jazz' },
  { id: 'classics', label: 'Classics' },
  { id: 'party', label: 'Party Music' },
];

/** Currently playing track shown when no live request is on stage. */
export const NOW_PLAYING: Song = {
  id: 'np-01',
  title: 'Kesariya',
  artist: 'Arijit Singh',
  genre: 'Hindi · Romantic',
  duration: '4:28',
  category: 'bollywood',
};

/** Baseline queue managed by the stage dashboard. */
export const INITIAL_QUEUE: Song[] = [
  { id: 'q-01', title: 'Channa Mereya', artist: 'Arijit Singh', genre: 'Hindi', duration: '4:35', category: 'bollywood' },
  { id: 'q-02', title: 'Lo Mera Hero', artist: 'Vishal Dadlani', genre: 'Hindi · Upbeat', duration: '3:58', category: 'party' },
  { id: 'q-03', title: 'Take Five', artist: 'Dave Brubeck', genre: 'Jazz instrumental', duration: '5:24', category: 'jazz' },
  { id: 'q-04', title: 'Kun Faya Kun', artist: 'A.R. Rahman', genre: 'Sufi', duration: '4:37', category: 'bollywood' },
];

/** Recently performed tracks. */
export const PLAYED_HISTORY: Song[] = [
  { id: 'p-01', title: 'Raataan Lambiyan', artist: 'Jubin Nautiyal', genre: 'Hindi', duration: '3:48', category: 'romantic' },
  { id: 'p-02', title: 'Fly Me to the Moon', artist: 'Frank Sinatra', genre: 'Jazz standard', duration: '2:30', category: 'jazz' },
  { id: 'p-03', title: 'Ilahi', artist: 'Arijit Singh', genre: 'Hindi', duration: '4:21', category: 'bollywood' },
];

/** Searchable catalogue used by the guest song-request search. */
export const SONG_CATALOGUE: Song[] = [
  /* ------------------------------- Bollywood ------------------------------ */
  { id: 's-01', title: 'Kesariya', artist: 'Arijit Singh', genre: 'Hindi', duration: '4:28', category: 'bollywood' },
  { id: 's-02', title: 'Channa Mereya', artist: 'Arijit Singh', genre: 'Hindi', duration: '4:35', category: 'bollywood' },
  { id: 's-03', title: 'Tum Hi Ho', artist: 'Arijit Singh', genre: 'Hindi', duration: '4:22', category: 'bollywood' },
  { id: 's-04', title: 'Agar Tum Saath Ho', artist: 'Arijit Singh & Alka Yagnik', genre: 'Hindi', duration: '5:41', category: 'bollywood' },
  { id: 's-05', title: 'Kun Faya Kun', artist: 'A.R. Rahman', genre: 'Sufi', duration: '4:37', category: 'bollywood' },
  { id: 's-06', title: 'Malang', artist: 'A.R. Rahman', genre: 'Hindi', duration: '4:14', category: 'bollywood' },
  { id: 's-07', title: 'Ilahi', artist: 'Arijit Singh', genre: 'Hindi', duration: '4:21', category: 'bollywood' },
  { id: 's-08', title: 'Raabta', artist: 'Arijit Singh', genre: 'Hindi', duration: '4:06', category: 'bollywood' },
  { id: 's-09', title: 'Gerua', artist: 'Arijit Singh', genre: 'Hindi · Slow', duration: '4:34', category: 'bollywood' },
  { id: 's-10', title: 'Ghungroo', artist: 'Arijit Singh & Shilpa Rao', genre: 'Hindi · Dance', duration: '4:02', category: 'bollywood' },

  /* ----------------------------- English Pop ----------------------------- */
  { id: 's-11', title: 'Perfect', artist: 'Ed Sheeran', genre: 'Pop', duration: '4:23', category: 'english-pop' },
  { id: 's-12', title: 'Thinking Out Loud', artist: 'Ed Sheeran', genre: 'Pop', duration: '4:41', category: 'english-pop' },
  { id: 's-13', title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Pop', duration: '3:20', category: 'english-pop' },
  { id: 's-14', title: 'Levitating', artist: 'Dua Lipa', genre: 'Pop · Dance', duration: '3:23', category: 'english-pop' },
  { id: 's-15', title: 'Shape of You', artist: 'Ed Sheeran', genre: 'Pop', duration: '3:53', category: 'english-pop' },
  { id: 's-16', title: 'As It Was', artist: 'Harry Styles', genre: 'Pop', duration: '2:47', category: 'english-pop' },
  { id: 's-17', title: 'Counting Stars', artist: 'OneRepublic', genre: 'Pop rock', duration: '4:44', category: 'english-pop' },
  { id: 's-18', title: 'Sugar', artist: 'Maroon 5', genre: 'Pop', duration: '5:01', category: 'english-pop' },

  /* ------------------------------- Romantic ------------------------------ */
  { id: 's-19', title: 'Pee Loon', artist: 'Mohit Chauhan', genre: 'Hindi · Slow', duration: '4:54', category: 'romantic' },
  { id: 's-20', title: 'Tujh Mein Rab Dikhta Hai', artist: 'Roop Kumar Rathod', genre: 'Hindi · Slow', duration: '4:36', category: 'romantic' },
  { id: 's-21', title: 'Ae Dil Hai Mushkil', artist: 'Arijit Singh', genre: 'Hindi · Slow', duration: '4:39', category: 'romantic' },
  { id: 's-22', title: 'Raataan Lambiyan', artist: 'Jubin Nautiyal', genre: 'Hindi', duration: '3:48', category: 'romantic' },
  { id: 's-23', title: 'Tere Bina', artist: 'A.R. Rahman & Chinmayi', genre: 'Hindi · Slow', duration: '5:06', category: 'romantic' },
  { id: 's-24', title: 'All of Me', artist: 'John Legend', genre: 'Pop ballad', duration: '4:29', category: 'romantic' },
  { id: 's-25', title: 'Say You Won’t Let Go', artist: 'James Arthur', genre: 'Pop ballad', duration: '3:36', category: 'romantic' },
  { id: 's-26', title: 'Let Me Love You', artist: 'DJ Snake & Justin Bieber', genre: 'Pop', duration: '3:28', category: 'romantic' },

  /* --------------------------------- Jazz -------------------------------- */
  { id: 's-27', title: 'Fly Me to the Moon', artist: 'Frank Sinatra', genre: 'Jazz standard', duration: '2:30', category: 'jazz' },
  { id: 's-28', title: 'The Way You Look Tonight', artist: 'Frank Sinatra', genre: 'Jazz standard', duration: '3:05', category: 'jazz' },
  { id: 's-29', title: 'Take Five', artist: 'Dave Brubeck', genre: 'Jazz instrumental', duration: '5:24', category: 'jazz' },
  { id: 's-30', title: 'So What', artist: 'Miles Davis', genre: 'Jazz instrumental', duration: '9:22', category: 'jazz' },
  { id: 's-31', title: 'My Funny Valentine', artist: 'Chet Baker', genre: 'Jazz ballad', duration: '2:24', category: 'jazz' },
  { id: 's-32', title: 'Autumn Leaves', artist: 'Eva Cassidy', genre: 'Jazz standard', duration: '4:33', category: 'jazz' },
  { id: 's-33', title: 'Summertime', artist: 'Billie Holiday', genre: 'Jazz standard', duration: '3:24', category: 'jazz' },

  /* ------------------------------- Classics ------------------------------ */
  { id: 's-34', title: 'Pal Pal Dil Ke Paas', artist: 'Kishore Kumar', genre: 'Retro Hindi', duration: '4:30', category: 'classics' },
  { id: 's-35', title: 'Roop Tera Mastana', artist: 'Kishore Kumar', genre: 'Retro Hindi', duration: '4:45', category: 'classics' },
  { id: 's-36', title: 'Lag Ja Gale', artist: 'Lata Mangeshkar', genre: 'Retro Hindi', duration: '4:15', category: 'classics' },
  { id: 's-37', title: 'Mere Sapnon Ki Queen', artist: 'Kishore Kumar', genre: 'Retro Hindi', duration: '4:52', category: 'classics' },
  { id: 's-38', title: 'Yesterday', artist: 'The Beatles', genre: 'Classic pop', duration: '2:05', category: 'classics' },
  { id: 's-39', title: 'Wonderful Tonight', artist: 'Eric Clapton', genre: 'Classic rock', duration: '3:42', category: 'classics' },
  { id: 's-40', title: 'Stand By Me', artist: 'Ben E. King', genre: 'Classic soul', duration: '2:57', category: 'classics' },
  { id: 's-41', title: 'Hotel California', artist: 'Eagles', genre: 'Classic rock', duration: '6:30', category: 'classics' },

  /* ------------------------------- Party --------------------------------- */
  { id: 's-42', title: 'London Thumakda', artist: 'Kanika Kapoor', genre: 'Hindi · Dance', duration: '4:07', category: 'party' },
  { id: 's-43', title: 'Badtameez Dil', artist: 'Benny Dayal', genre: 'Hindi · Upbeat', duration: '4:19', category: 'party' },
  { id: 's-44', title: 'Lo Mera Hero', artist: 'Vishal Dadlani', genre: 'Hindi · Upbeat', duration: '3:58', category: 'party' },
  { id: 's-45', title: 'Ude Dil Befikre', artist: 'Vishal Dadlani', genre: 'Hindi · Dance', duration: '3:39', category: 'party' },
  { id: 's-46', title: 'Senorita', artist: 'Farhan Akhtar', genre: 'Hindi · Upbeat', duration: '4:11', category: 'party' },
  { id: 's-47', title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', genre: 'Funk pop', duration: '4:30', category: 'party' },
  { id: 's-48', title: 'Shut Up and Dance', artist: 'WALK THE MOON', genre: 'Pop rock', duration: '3:19', category: 'party' },
  { id: 's-49', title: 'Dance The Night', artist: 'Dua Lipa', genre: 'Disco pop', duration: '3:29', category: 'party' },
];

/** Demo-friendly seed votes for queue entries. */
export const INITIAL_VOTES: Record<string, number> = {
  'q-01': 14,
  'q-02': 6,
  'q-03': 9,
  'q-04': 21,
};

/**
 * Demo rules for song requests — adjustable live from the performer's stage
 * dashboard and enforced on the guest music screen. Sample configuration only.
 */
export const DEFAULT_MUSIC_RULES = {
  paused: false,
  requestLimit: 2,
  votingEnabled: true,
} as const;
