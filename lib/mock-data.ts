export type ChordPosition = {
  string: number; // 1 (high E) – 6 (low E)
  fret: number;
  finger?: number;
};

export type Chord = {
  name: string;
  positions: ChordPosition[];
  openStrings: number[];
  mutedStrings: number[];
};

export type Section = {
  name: string;
  chords: Chord[];
};

export type Song = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  originalKey: string;
  bpm: number;
  capo?: number;
  cover?: string;
  sections: Section[];
  lyrics: { line: string; chords: { chord: string; at: number }[] }[];
  realStrumPattern: ('D' | 'U' | '-')[];
  simpleStrumPattern: ('D' | 'U' | '-')[];
};

// Chord library (canonical Wonderwall voicings, capo 2)
const CHORDS: Record<string, Chord> = {
  Em7: {
    name: 'Em7',
    positions: [
      { string: 5, fret: 2, finger: 2 },
      { string: 4, fret: 2, finger: 3 },
    ],
    openStrings: [1, 2, 3, 6],
    mutedStrings: [],
  },
  G: {
    name: 'G',
    positions: [
      { string: 6, fret: 3, finger: 2 },
      { string: 5, fret: 2, finger: 1 },
      { string: 1, fret: 3, finger: 3 },
    ],
    openStrings: [2, 3, 4],
    mutedStrings: [],
  },
  Dsus4: {
    name: 'Dsus4',
    positions: [
      { string: 3, fret: 2, finger: 1 },
      { string: 2, fret: 3, finger: 2 },
      { string: 1, fret: 3, finger: 3 },
    ],
    openStrings: [4],
    mutedStrings: [5, 6],
  },
  A7sus4: {
    name: 'A7sus4',
    positions: [
      { string: 4, fret: 2, finger: 2 },
      { string: 2, fret: 3, finger: 3 },
    ],
    openStrings: [1, 3, 5],
    mutedStrings: [6],
  },
  Cadd9: {
    name: 'Cadd9',
    positions: [
      { string: 5, fret: 3, finger: 2 },
      { string: 4, fret: 2, finger: 1 },
      { string: 2, fret: 3, finger: 3 },
      { string: 1, fret: 3, finger: 4 },
    ],
    openStrings: [3],
    mutedStrings: [6],
  },
};

export const wonderwall: Song = {
  id: 'wonderwall',
  title: 'Wonderwall',
  artist: 'Oasis',
  album: "(What's the Story) Morning Glory?",
  originalKey: 'A',
  bpm: 87,
  capo: 2,
  cover: 'gradient-wonderwall',
  sections: [
    { name: 'Intro', chords: [CHORDS.Em7, CHORDS.G, CHORDS.Dsus4, CHORDS.A7sus4] },
    { name: 'Verse', chords: [CHORDS.Em7, CHORDS.G, CHORDS.Dsus4, CHORDS.A7sus4] },
    { name: 'Pre-chorus', chords: [CHORDS.Em7, CHORDS.G, CHORDS.Dsus4, CHORDS.A7sus4, CHORDS.Cadd9] },
    { name: 'Chorus', chords: [CHORDS.Cadd9, CHORDS.Em7, CHORDS.G, CHORDS.Dsus4] },
    { name: 'Bridge', chords: [CHORDS.Cadd9, CHORDS.Em7, CHORDS.G] },
    { name: 'Outro', chords: [CHORDS.Cadd9, CHORDS.Em7, CHORDS.G, CHORDS.Dsus4] },
  ],
  lyrics: [
    { line: 'Today is gonna be the day', chords: [{ chord: 'Em7', at: 0 }, { chord: 'G', at: 3 }] },
    { line: "That they're gonna throw it back to you", chords: [{ chord: 'Dsus4', at: 0 }, { chord: 'A7sus4', at: 5 }] },
    { line: 'By now you should have somehow', chords: [{ chord: 'Em7', at: 0 }, { chord: 'G', at: 4 }] },
    { line: 'Realised what you gotta do', chords: [{ chord: 'Dsus4', at: 0 }, { chord: 'A7sus4', at: 3 }] },
    { line: "I don't believe that anybody", chords: [{ chord: 'Em7', at: 0 }, { chord: 'G', at: 4 }] },
    { line: 'Feels the way I do about you now', chords: [{ chord: 'Dsus4', at: 0 }, { chord: 'A7sus4', at: 4 }, { chord: 'Cadd9', at: 6 }] },
    { line: 'And all the roads we have to walk are winding', chords: [{ chord: 'Cadd9', at: 0 }, { chord: 'Em7', at: 5 }] },
    { line: 'And all the lights that lead us there are blinding', chords: [{ chord: 'G', at: 0 }, { chord: 'Em7', at: 6 }] },
    { line: "There are many things that I", chords: [{ chord: 'Cadd9', at: 0 }, { chord: 'Dsus4', at: 4 }] },
    { line: 'Would like to say to you', chords: [{ chord: 'A7sus4', at: 2 }] },
    { line: "But I don't know how", chords: [{ chord: 'Cadd9', at: 0 }] },
    { line: 'Because maybe', chords: [{ chord: 'Cadd9', at: 0 }, { chord: 'Em7', at: 1 }] },
    { line: "You're gonna be the one that saves me", chords: [{ chord: 'G', at: 0 }, { chord: 'Em7', at: 4 }] },
    { line: 'And after all', chords: [{ chord: 'Cadd9', at: 0 }, { chord: 'Em7', at: 2 }] },
    { line: "You're my wonderwall", chords: [{ chord: 'G', at: 0 }, { chord: 'Em7', at: 2 }] },
  ],
  realStrumPattern: ['D', 'D', 'U', 'U', 'D', 'U'],
  simpleStrumPattern: ['D', 'D', 'D', 'D'],
};

export const trendingSongs = [
  { id: 'stick-season', title: 'Stick Season', artist: 'Noah Kahan', cover: 'gradient-1' },
  { id: 'vampire', title: 'Vampire', artist: 'Olivia Rodrigo', cover: 'gradient-2' },
  { id: 'flowers', title: 'Flowers', artist: 'Miley Cyrus', cover: 'gradient-3' },
  { id: 'creep', title: 'Creep', artist: 'Radiohead', cover: 'gradient-4' },
  { id: 'wonderwall', title: 'Wonderwall', artist: 'Oasis', cover: 'gradient-wonderwall' },
  { id: 'wagon-wheel', title: 'Wagon Wheel', artist: 'Old Crow Medicine Show', cover: 'gradient-5' },
];

export const recommendedForYou = [
  { id: 'champagne', title: 'Champagne Supernova', artist: 'Oasis', cover: 'gradient-6' },
  { id: 'dont-look', title: "Don't Look Back in Anger", artist: 'Oasis', cover: 'gradient-7' },
  { id: 'live-forever', title: 'Live Forever', artist: 'Oasis', cover: 'gradient-8' },
  { id: 'rocket-man', title: 'Rocket Man', artist: 'Elton John', cover: 'gradient-9' },
];

export const curatedPlaylists = [
  { id: 'beginner', title: 'Beginner-friendly', count: 24, gradient: 'from-amber/40 to-amber/10' },
  { id: 'c-major', title: 'Songs in C major', count: 32, gradient: 'from-cyan/40 to-cyan/10' },
  { id: '90s-rock', title: '90s rock', count: 48, gradient: 'from-amber-deep/40 to-amber/10' },
  { id: 'acoustic', title: 'Acoustic favorites', count: 56, gradient: 'from-cyan-deep/40 to-cyan/10' },
];

export const defaultLibraryCategories = [
  { id: 'favorites', name: 'Favorites', count: 0 },
  { id: 'currently-learning', name: 'Currently learning', count: 0 },
  { id: 'acoustic-set', name: 'Acoustic set', count: 0 },
];

// All searchable songs (used in search results)
export const allSongs = [
  { id: 'wonderwall', title: 'Wonderwall', artist: 'Oasis', album: "(What's the Story) Morning Glory?" },
  { id: 'champagne', title: 'Champagne Supernova', artist: 'Oasis', album: "(What's the Story) Morning Glory?" },
  { id: 'dont-look', title: "Don't Look Back in Anger", artist: 'Oasis', album: "(What's the Story) Morning Glory?" },
  { id: 'live-forever', title: 'Live Forever', artist: 'Oasis', album: 'Definitely Maybe' },
  { id: 'stick-season', title: 'Stick Season', artist: 'Noah Kahan', album: 'Stick Season' },
  { id: 'vampire', title: 'Vampire', artist: 'Olivia Rodrigo', album: 'GUTS' },
  { id: 'flowers', title: 'Flowers', artist: 'Miley Cyrus', album: 'Endless Summer Vacation' },
  { id: 'creep', title: 'Creep', artist: 'Radiohead', album: 'Pablo Honey' },
  { id: 'wagon-wheel', title: 'Wagon Wheel', artist: 'Old Crow Medicine Show', album: 'OCMS' },
];

export const CHROMATIC_KEYS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
