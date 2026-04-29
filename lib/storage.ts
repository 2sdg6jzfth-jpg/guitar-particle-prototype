// Safe localStorage wrappers (Next.js SSR-safe)

export type SavedSong = {
  songId: string;
  title: string;
  artist: string;
  key: string;
  categoryId: string;
  isPreferredKey: boolean;
  savedAt: number;
};

export type LibraryCategory = { id: string; name: string; count: number };

const KEYS = {
  onboarded: 'guitar_particle_onboarded',
  user: 'guitar_particle_user',
  pro: 'guitar_particle_pro',
  saved: 'guitar_particle_saved_songs',
  categories: 'guitar_particle_categories',
  recents: 'guitar_particle_search_recents',
};

const isBrowser = () => typeof window !== 'undefined';

export const storage = {
  isOnboarded(): boolean {
    if (!isBrowser()) return true; // assume onboarded on server to avoid flash redirect
    return localStorage.getItem(KEYS.onboarded) === 'true';
  },
  setOnboarded() {
    if (!isBrowser()) return;
    localStorage.setItem(KEYS.onboarded, 'true');
  },
  resetOnboarding() {
    if (!isBrowser()) return;
    localStorage.removeItem(KEYS.onboarded);
  },
  saveUser(user: Record<string, unknown>) {
    if (!isBrowser()) return;
    localStorage.setItem(KEYS.user, JSON.stringify(user));
  },
  getUser(): Record<string, unknown> | null {
    if (!isBrowser()) return null;
    const v = localStorage.getItem(KEYS.user);
    return v ? JSON.parse(v) : null;
  },
  isPro(): boolean {
    if (!isBrowser()) return false;
    return localStorage.getItem(KEYS.pro) === 'true';
  },
  setPro(value: boolean) {
    if (!isBrowser()) return;
    if (value) localStorage.setItem(KEYS.pro, 'true');
    else localStorage.removeItem(KEYS.pro);
  },
  getSavedSongs(): SavedSong[] {
    if (!isBrowser()) return [];
    const v = localStorage.getItem(KEYS.saved);
    return v ? JSON.parse(v) : [];
  },
  setSavedSongs(songs: SavedSong[]) {
    if (!isBrowser()) return;
    localStorage.setItem(KEYS.saved, JSON.stringify(songs));
  },
  addSavedSong(song: SavedSong) {
    const all = storage.getSavedSongs().filter(s => s.songId !== song.songId);
    all.push(song);
    storage.setSavedSongs(all);
  },
  isSongSaved(songId: string): boolean {
    return storage.getSavedSongs().some(s => s.songId === songId);
  },
  getCategories(): LibraryCategory[] {
    if (!isBrowser()) return [];
    const v = localStorage.getItem(KEYS.categories);
    if (v) return JSON.parse(v);
    const defaults: LibraryCategory[] = [
      { id: 'favorites', name: 'Favorites', count: 0 },
      { id: 'currently-learning', name: 'Currently learning', count: 0 },
      { id: 'acoustic-set', name: 'Acoustic set', count: 0 },
    ];
    localStorage.setItem(KEYS.categories, JSON.stringify(defaults));
    return defaults;
  },
  setCategories(cats: LibraryCategory[]) {
    if (!isBrowser()) return;
    localStorage.setItem(KEYS.categories, JSON.stringify(cats));
  },
  addCategory(name: string): LibraryCategory {
    const cats = storage.getCategories();
    const newCat = { id: `cat-${Date.now()}`, name, count: 0 };
    cats.push(newCat);
    storage.setCategories(cats);
    return newCat;
  },
  getRecentSearches(): string[] {
    if (!isBrowser()) return [];
    const v = localStorage.getItem(KEYS.recents);
    return v ? JSON.parse(v) : [];
  },
  addRecentSearch(query: string) {
    if (!isBrowser() || !query.trim()) return;
    const recents = storage.getRecentSearches().filter(q => q !== query);
    recents.unshift(query);
    localStorage.setItem(KEYS.recents, JSON.stringify(recents.slice(0, 6)));
  },
};
