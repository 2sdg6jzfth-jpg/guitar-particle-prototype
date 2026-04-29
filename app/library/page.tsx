'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Trash2, MoreHorizontal, Heart } from 'lucide-react';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { BottomNav } from '@/components/bottom-nav';
import { Plectrum } from '@/components/plectrum';
import { Cover } from '@/components/cover';
import { Dropdown } from '@/components/dropdown';
import { Toast } from '@/components/toast';
import { storage, type SavedSong, type LibraryCategory } from '@/lib/storage';

const SORT_OPTIONS = ['A–Z', 'Preferred key', 'Original key', 'Tempo', 'Recent'] as const;
type Sort = (typeof SORT_OPTIONS)[number];

export default function LibraryPage() {
  const [songs, setSongs] = useState<SavedSong[]>([]);
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<Sort>('Recent');
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState<SavedSong | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    setSongs(storage.getSavedSongs());
    setCategories(storage.getCategories());
  };

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };

  const handleDelete = (song: SavedSong) => {
    storage.removeSavedSong(song.songId);
    refresh();
    setConfirming(null);
    showToast('Removed from library');
  };

  const filtered = useMemo(() => {
    const base = activeCategory === 'all' ? songs : songs.filter(s => s.categoryId === activeCategory);
    const sorted = [...base];
    switch (sortBy) {
      case 'A–Z':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'Preferred key':
      case 'Original key':
        sorted.sort((a, b) => a.key.localeCompare(b.key));
        break;
      case 'Tempo':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'Recent':
      default:
        sorted.sort((a, b) => b.savedAt - a.savedAt);
    }
    return sorted;
  }, [songs, sortBy, activeCategory]);

  const categoryOptions = [
    { value: 'all', label: `All songs · ${songs.length} ${songs.length === 1 ? 'song' : 'songs'}` },
    ...categories.map(c => ({
      value: c.id,
      label: `${c.name} · ${c.count} ${c.count === 1 ? 'song' : 'songs'}`,
    })),
  ];

  return (
    <>
      <CrossLitHalos intensity="low" />
      <StatusBar />

      <div className="absolute top-[88px] left-4 right-4 flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight text-text">Library</h1>
        {songs.length > 0 && (
          <button
            onClick={() => setEditing(e => !e)}
            className={`text-xs font-medium px-3 h-8 rounded-2xl ${
              editing ? 'bg-amber text-bg-primary' : 'text-amber'
            }`}
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        )}
      </div>

      <div className="absolute top-[138px] left-4 right-4">
        <Dropdown
          label="SHOWING"
          value={activeCategory}
          onChange={setActiveCategory}
          options={categoryOptions}
        />
      </div>

      <div className="absolute top-[200px] left-0 right-0 flex items-center gap-3 px-4">
        <span className="text-[11px] uppercase tracking-wider text-text/50 flex-shrink-0">Sort</span>
        <div className="flex-1 overflow-x-auto flex gap-1.5 no-scrollbar">
          {SORT_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-2xl text-xs font-medium whitespace-nowrap ${
                s === sortBy ? 'bg-amber text-bg-primary' : 'bg-transparent text-text border border-text/[0.12]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="absolute top-[244px] bottom-[90px] left-0 right-0 overflow-y-auto px-4 no-scrollbar">
          <div className="flex flex-col">
            {filtered.map(song => (
              <SongRow
                key={song.songId}
                song={song}
                editing={editing}
                onDelete={() => setConfirming(song)}
              />
            ))}
          </div>
          {editing && (
            <p className="text-center text-[11px] text-text/40 mt-4 mb-2">
              Tap the trash icon to remove a song
            </p>
          )}
        </div>
      )}

      <BottomNav />
      <HomeIndicator />

      {/* Confirm delete modal */}
      {confirming && (
        <>
          <div
            className="absolute inset-0 bg-bg-overlay z-40"
            onClick={() => setConfirming(null)}
          />
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 z-50 bg-bg-surface border border-text/10 rounded-2xl p-5 shadow-sheet">
            <h3 className="text-base font-medium text-text mb-1">Remove from library?</h3>
            <p className="text-xs text-text/55 mb-5">
              {confirming.title} · {confirming.artist}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(null)}
                className="flex-1 h-11 rounded-xl bg-text/[0.06] border border-text/[0.1] text-text text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirming)}
                className="flex-1 h-11 rounded-xl bg-destructive text-text text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        </>
      )}

      <Toast message={toast} />
    </>
  );
}

function SongRow({
  song,
  editing,
  onDelete,
}: {
  song: SavedSong;
  editing: boolean;
  onDelete: () => void;
}) {
  const inner = (
    <>
      <Cover variant="gradient-wonderwall" size={44} rounded="rounded-lg" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text truncate flex items-center gap-1.5">
          {song.title}
          {song.categoryId === 'favorites' && (
            <Heart size={11} fill="#FFD89A" className="text-amber flex-shrink-0" />
          )}
        </div>
        <div className="text-[11px] text-text/55 truncate">{song.artist}</div>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[10px] uppercase tracking-wider text-text/45">Key</span>
        <span className="text-xs font-medium text-amber">{song.key}</span>
      </div>
    </>
  );

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-2.5 border-b border-text/[0.06]">
        <button
          onClick={onDelete}
          aria-label="Remove from library"
          className="w-8 h-8 rounded-full bg-destructive/15 border border-destructive/40 flex items-center justify-center flex-shrink-0"
        >
          <Trash2 size={14} strokeWidth={2} className="text-destructive" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">{inner}</div>
      </div>
    );
  }

  return (
    <Link
      href={`/chord/${song.songId}`}
      className="flex items-center gap-3 py-2.5 border-b border-text/[0.06] active:bg-text/[0.03]"
    >
      {inner}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="absolute top-[260px] bottom-[110px] left-0 right-0 flex flex-col items-center justify-center px-8 text-center">
      <div className="opacity-30 mb-5">
        <Plectrum variant="small" />
      </div>
      <h3 className="text-base font-medium text-text mb-1.5">No saved songs yet</h3>
      <p className="text-xs text-text/55 mb-6 leading-relaxed">
        Identify a song or search to add chords to your library.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-2xl bg-amber text-bg-primary text-sm font-medium shadow-cta-amber"
      >
        Identify a song
      </Link>
    </div>
  );
}
