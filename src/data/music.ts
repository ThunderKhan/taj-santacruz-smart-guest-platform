import type { Song } from '@/types';

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

/** Currently playing track shown on the guest music screen. */
export const NOW_PLAYING: Song = {
  id: 'np-01',
  title: 'Kesariya',
  artist: 'Arijit Singh',
  genre: 'Hindi · Acoustic',
  duration: '4:28',
};

/** Baseline queue managed by the entertainment dashboard. */
export const INITIAL_QUEUE: Song[] = [
  { id: 'q-01', title: 'Channa Mereya', artist: 'Arijit Singh', genre: 'Hindi', duration: '4:35' },
  { id: 'q-02', title: 'Lo Mera Hero', artist: 'Vishal Dadlani', genre: 'Hindi · Upbeat', duration: '3:58' },
  { id: 'q-03', title: 'Take Five', artist: 'Dave Brubeck', genre: 'Jazz instrumental', duration: '5:24' },
  { id: 'q-04', title: 'Kun Faya Kun', artist: 'A.R. Rahman', genre: 'Sufi', duration: '4:37' },
];

/** Recently performed tracks. */
export const PLAYED_HISTORY: Song[] = [
  { id: 'p-01', title: 'Raataan Lambiyan', artist: 'Jubin Nautiyal', genre: 'Hindi', duration: '3:48' },
  { id: 'p-02', title: 'Fly Me to the Moon', artist: 'Frank Sinatra', genre: 'Jazz standard', duration: '2:30' },
  { id: 'p-03', title: 'Ilahi', artist: 'Arijit Singh', genre: 'Hindi', duration: '4:21' },
];

/** Searchable catalogue used by the guest song-request search. */
export const SONG_CATALOGUE: Song[] = [
  { id: 's-01', title: 'Kesariya', artist: 'Arijit Singh', genre: 'Hindi', duration: '4:28' },
  { id: 's-02', title: 'Channa Mereya', artist: 'Arijit Singh', genre: 'Hindi', duration: '4:35' },
  { id: 's-03', title: 'Tum Hi Ho', artist: 'Arijit Singh', genre: 'Hindi', duration: '4:22' },
  { id: 's-04', title: 'Agar Tum Saath Ho', artist: 'Arijit Singh & Alka Yagnik', genre: 'Hindi', duration: '5:41' },
  { id: 's-05', title: 'Kun Faya Kun', artist: 'A.R. Rahman', genre: 'Sufi', duration: '4:37' },
  { id: 's-06', title: 'Malang', artist: 'A.R. Rahman', genre: 'Hindi', duration: '4:14' },
  { id: 's-07', title: 'Ilahi', artist: 'Arijit Singh', genre: 'Hindi', duration: '4:21' },
  { id: 's-08', title: 'Lo Mera Hero', artist: 'Vishal Dadlani', genre: 'Hindi · Upbeat', duration: '3:58' },
  { id: 's-09', title: 'Badtameez Dil', artist: 'Benny Dayal', genre: 'Hindi · Upbeat', duration: '4:19' },
  { id: 's-10', title: 'London Thumakda', artist: 'Kanika Kapoor', genre: 'Hindi · Dance', duration: '4:07' },
  { id: 's-11', title: 'Raataan Lambiyan', artist: 'Jubin Nautiyal', genre: 'Hindi', duration: '3:48' },
  { id: 's-12', title: 'Raabta', artist: 'Arijit Singh', genre: 'Hindi', duration: '4:06' },
  { id: 's-13', title: 'Pee Loon', artist: 'Mohit Chauhan', genre: 'Hindi · Slow', duration: '4:54' },
  { id: 's-14', title: 'Tujh Mein Rab Dikhta Hai', artist: 'Roop Kumar Rathod', genre: 'Hindi · Slow', duration: '4:36' },
  { id: 's-15', title: 'Gerua', artist: 'Arijit Singh', genre: 'Hindi · Slow', duration: '4:34' },
  { id: 's-16', title: 'Ae Dil Hai Mushkil', artist: 'Arijit Singh', genre: 'Hindi · Slow', duration: '4:39' },
  { id: 's-17', title: 'Zinda', artist: 'Shankar Mahadevan', genre: 'Hindi · Upbeat', duration: '3:52' },
  { id: 's-18', title: 'Ude Dil Befikre', artist: 'Vishal Dadlani', genre: 'Hindi · Dance', duration: '3:39' },
  { id: 's-19', title: 'Ghungroo', artist: 'Arijit Singh & Shilpa Rao', genre: 'Hindi · Dance', duration: '4:02' },
  { id: 's-20', title: 'Senorita', artist: 'Farhan Akhtar', genre: 'Hindi · Upbeat', duration: '4:11' },
  { id: 's-21', title: 'Fly Me to the Moon', artist: 'Frank Sinatra', genre: 'Jazz standard', duration: '2:30' },
  { id: 's-22', title: 'The Way You Look Tonight', artist: 'Frank Sinatra', genre: 'Jazz standard', duration: '3:05' },
  { id: 's-23', title: 'Take Five', artist: 'Dave Brubeck', genre: 'Jazz instrumental', duration: '5:24' },
  { id: 's-24', title: 'So What', artist: 'Miles Davis', genre: 'Jazz instrumental', duration: '9:22' },
  { id: 's-25', title: 'My Funny Valentine', artist: 'Chet Baker', genre: 'Jazz ballad', duration: '2:24' },
  { id: 's-26', title: 'Perfect', artist: 'Ed Sheeran', genre: 'Pop', duration: '4:23' },
  { id: 's-27', title: 'Thinking Out Loud', artist: 'Ed Sheeran', genre: 'Pop', duration: '4:41' },
  { id: 's-28', title: 'Lose Yourself', artist: 'Eminem', genre: 'Hip hop', duration: '5:26' },
  { id: 's-29', title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Pop', duration: '3:20' },
  { id: 's-30', title: 'Levitating', artist: 'Dua Lipa', genre: 'Pop · Dance', duration: '3:23' },
  { id: 's-31', title: 'Valentine', artist: 'Laufey', genre: 'Jazz pop', duration: '3:12' },
  { id: 's-32', title: 'Sunset Lover', artist: 'Petit Biscuit', genre: 'Chill', duration: '3:57' },
];

/** Demo-friendly seed votes for queue entries. */
export const INITIAL_VOTES: Record<string, number> = {
  'q-01': 14,
  'q-02': 6,
  'q-03': 9,
  'q-04': 21,
};
