'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Play, Pause, Minus, Plus, RotateCcw } from 'lucide-react';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { ChordCard } from '@/components/chord-card';
import { Dropdown } from '@/components/dropdown';
import { SegmentedControl } from '@/components/segmented-control';
import { SaveSheet } from '@/components/save-sheet';
import { ProPaywall } from '@/components/pro-paywall';
import { Toast } from '@/components/toast';
import { Cover } from '@/components/cover';
import { wonderwall, CHROMATIC_KEYS, type Chord } from '@/lib/mock-data';
import { storage, type LibraryCategory } from '@/lib/storage';

type View = 'Diagrams' | 'Lyrics' | 'Tabs';
const VIEW_OPTIONS = ['Diagrams', 'Lyrics', 'Tabs'] as const;
const HAND_OPTIONS = ['R', 'L'] as const;
const STRUM_OPTIONS = ['Simple', 'Real'] as const;

export default function ChordPage() {
  const router = useRouter();
  const song = wonderwall; // mock: always Wonderwall

  const [view, setView] = useState<View>('Diagrams');
  const [selectedSection, setSelectedSection] = useState(song.sections[1].name); // Verse
  const [strumMode, setStrumMode] = useState<(typeof STRUM_OPTIONS)[number]>('Real');
  const [hand, setHand] = useState<(typeof HAND_OPTIONS)[number]>('R');
  const [keyValue, setKeyValue] = useState(song.originalKey);
  const [position, setPosition] = useState('1');
  const [bpm, setBpm] = useState(song.bpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingChord, setPlayingChord] = useState<string | null>(null);
  const [saveSheetOpen, setSaveSheetOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setIsSaved(storage.isSongSaved(song.id));
    setCategories(storage.getCategories());
  }, [song.id]);

  useEffect(() => () => {
    if (playRef.current) clearInterval(playRef.current);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const currentSection = useMemo(
    () => song.sections.find(s => s.name === selectedSection) ?? song.sections[1],
    [selectedSection, song.sections]
  );

  // Strum patterns
  const strumPattern = strumMode === 'Real' ? song.realStrumPattern : song.simpleStrumPattern;

  // Auto-cycle playing chord during play
  useEffect(() => {
    if (!isPlaying) {
      if (playRef.current) clearInterval(playRef.current);
      setPlayingChord(null);
      return;
    }
    let i = 0;
    const tick = () => {
      const chord = currentSection.chords[i % currentSection.chords.length];
      setPlayingChord(chord.name);
      i++;
    };
    tick();
    const interval = (60 / bpm) * 1000 * 2; // half-note per chord
    playRef.current = setInterval(tick, interval);
    return () => {
      if (playRef.current) clearInterval(playRef.current);
    };
  }, [isPlaying, bpm, currentSection]);

  const handleViewChange = (v: View) => {
    if (v === 'Tabs' && !storage.isPro()) {
      setPaywallOpen(true);
      return;
    }
    setView(v);
  };

  const handleSaveToCategory = (categoryId: string) => {
    storage.addSavedSong({
      songId: song.id,
      title: song.title,
      artist: song.artist,
      key: keyValue,
      categoryId,
      isPreferredKey: keyValue !== song.originalKey,
      savedAt: Date.now(),
    });
    // bump category count
    const updated = storage.getCategories().map(c =>
      c.id === categoryId ? { ...c, count: c.count + 1 } : c
    );
    storage.setCategories(updated);
    setCategories(updated);
    setIsSaved(true);
    setSaveSheetOpen(false);
    showToast('Saved to library');
  };

  const handleCreateCategory = (name: string) => {
    storage.addCategory(name);
    setCategories(storage.getCategories());
  };

  return (
    <>
      <CrossLitHalos intensity="low" />
      <StatusBar />

      {/* Top back arrow */}
      <button
        onClick={() => router.back()}
        aria-label="Back"
        className="absolute top-12 left-1.5 w-10 h-10 flex items-center justify-center z-20"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-text">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Song header */}
      <div className="absolute top-[88px] left-4 right-4 flex items-center gap-3 h-[72px]">
        <Cover variant={song.cover ?? 'default'} size={56} />
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-medium leading-tight truncate">{song.title}</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-text/60 truncate">{song.artist}</span>
            <button
              onClick={() => window.open(`https://music.apple.com/search?term=${encodeURIComponent(song.title + ' ' + song.artist)}`, '_blank')}
              aria-label="Apple Music"
              className="w-5 h-5 rounded-full bg-text/[0.08] flex items-center justify-center text-text/70 text-[8px] font-bold"
            >
              ♪
            </button>
            <button
              onClick={() => window.open(`https://open.spotify.com/search/${encodeURIComponent(song.title + ' ' + song.artist)}`, '_blank')}
              aria-label="Spotify"
              className="w-5 h-5 rounded-full bg-text/[0.08] flex items-center justify-center text-text/70 text-[8px] font-bold"
            >
              S
            </button>
            {song.capo ? (
              <span className="px-1.5 py-0.5 rounded-md bg-amber/15 text-amber text-[9px] font-semibold tracking-wider">
                CAPO {song.capo}
              </span>
            ) : null}
          </div>
        </div>
        <button
          onClick={() => setSaveSheetOpen(true)}
          aria-label={isSaved ? 'Saved' : 'Save'}
          className={`w-[42px] h-[42px] rounded-full border flex items-center justify-center transition-colors ${
            isSaved ? 'border-amber bg-amber/15' : 'border-text/15 bg-transparent'
          }`}
        >
          <Heart
            size={20}
            strokeWidth={2}
            className={isSaved ? 'text-amber fill-amber' : 'text-text'}
            fill={isSaved ? '#FFD89A' : 'none'}
          />
        </button>
      </div>

      {/* Controls row: Key | Position | Hand */}
      <div className="absolute top-[178px] left-4 right-4 flex gap-2 h-9">
        <Dropdown
          label="KEY"
          value={keyValue}
          onChange={setKeyValue}
          options={CHROMATIC_KEYS.map(k => ({
            value: k,
            label: k,
            suffix: k === song.originalKey ? '(original)' : undefined,
          }))}
          className="flex-1"
        />
        <Dropdown
          label="POS"
          value={position}
          onChange={setPosition}
          options={['1', '2', '3', '4'].map(p => ({ value: p, label: `Position ${p}` }))}
          className="flex-1"
        />
        <SegmentedControl
          options={HAND_OPTIONS}
          value={hand}
          onChange={setHand}
          size="sm"
          className="w-[64px] h-9"
        />
      </div>

      {/* Section selector */}
      <div className="absolute top-[230px] left-0 right-0 h-9 px-4 flex gap-1.5 overflow-x-auto no-scrollbar">
        {song.sections.map(s => {
          const active = s.name === selectedSection;
          return (
            <button
              key={s.name}
              onClick={() => setSelectedSection(s.name)}
              className={`flex-shrink-0 px-3.5 h-9 rounded-full text-xs font-medium whitespace-nowrap ${
                active ? 'bg-amber text-bg-primary' : 'bg-transparent text-text border border-text/[0.12]'
              }`}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      {/* View tabs */}
      <div className="absolute top-[280px] left-4 right-4">
        <div className="flex bg-text/[0.04] border border-text/10 rounded-[14px] p-[3px] gap-[1px] h-9">
          {VIEW_OPTIONS.map(v => {
            const active = v === view;
            const isLocked = v === 'Tabs' && !storage.isPro();
            return (
              <button
                key={v}
                onClick={() => handleViewChange(v)}
                className={`flex-1 px-3 text-xs font-medium rounded-[11px] transition-colors flex items-center justify-center gap-1 ${
                  active ? 'bg-amber text-bg-primary' : 'bg-transparent text-text'
                }`}
              >
                {v}
                {isLocked && <span className="text-[9px] opacity-70">PRO</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Strum row */}
      <div className="absolute top-[330px] left-4 right-4 h-9 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-text/50 font-medium">Strum</span>
        <div className="flex items-center gap-[3px]">
          {strumPattern.map((d, i) => (
            <span key={i} className="flex items-center justify-center">
              {d === 'D' ? (
                <svg width="13" height="15" viewBox="0 0 13 15" fill="none" stroke="#FFD89A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6.5" y1="2" x2="6.5" y2="13" />
                  <polyline points="2 9 6.5 13 11 9" />
                </svg>
              ) : (
                <svg width="11" height="13" viewBox="0 0 11 13" fill="none" stroke="#A8E9F4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                  <line x1="5.5" y1="11" x2="5.5" y2="2" />
                  <polyline points="2 5 5.5 2 9 5" />
                </svg>
              )}
            </span>
          ))}
        </div>
        <div className="ml-auto">
          <SegmentedControl
            options={STRUM_OPTIONS}
            value={strumMode}
            onChange={setStrumMode}
            size="sm"
            className="w-[112px] h-7"
          />
        </div>
      </div>

      {/* Body — depends on view */}
      <div className="absolute top-[380px] bottom-[110px] left-0 right-0 px-4 overflow-y-auto no-scrollbar">
        {view === 'Diagrams' && (
          <div className="grid grid-cols-2 gap-3 pb-4">
            {currentSection.chords.map((chord: Chord, i: number) => (
              <ChordCard
                key={`${chord.name}-${i}`}
                name={chord.name}
                sequenceNumber={i + 1}
                positions={chord.positions}
                openStrings={chord.openStrings}
                mutedStrings={chord.mutedStrings}
                isPlaying={playingChord === chord.name}
                onClick={() => {
                  setPlayingChord(chord.name);
                  setTimeout(() => setPlayingChord(null), 800);
                }}
              />
            ))}
          </div>
        )}

        {view === 'Lyrics' && (
          <div className="flex flex-col gap-3 pb-4">
            <div className="text-[10px] uppercase tracking-wider text-text/45 font-medium">{currentSection.name}</div>
            {song.lyrics.map((line, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <div className="flex gap-2 text-[10px] font-semibold text-amber tabular-nums">
                  {line.chords.map((c, j) => (
                    <span key={j} style={{ marginLeft: j === 0 ? `${c.at * 6}px` : `${(c.at - line.chords[j - 1].at - 1) * 6}px` }}>
                      {c.chord}
                    </span>
                  ))}
                </div>
                <div className="text-[13px] text-text leading-relaxed">{line.line}</div>
              </div>
            ))}
          </div>
        )}

        {view === 'Tabs' && (
          <div className="flex flex-col gap-2 pb-4 font-mono text-[11px] text-text/85 leading-relaxed">
            <div className="text-[10px] uppercase tracking-wider text-text/45 font-medium font-sans mb-2">{currentSection.name}</div>
            {[
              'e|--3-----3-----3-----3-----|',
              'B|--3-----3-----3-----3-----|',
              'G|--0-----0-----2-----2-----|',
              'D|--0-----0-----0-----2-----|',
              'A|--2-----2-----x-----0-----|',
              'E|--0-----3-----x-----x-----|',
            ].map((row, i) => (
              <div key={i} className="tabular-nums">{row}</div>
            ))}
            <div className="mt-3 text-[10px] text-text/45 font-sans">Tabs are simplified for the prototype.</div>
          </div>
        )}
      </div>

      {/* Transport bar */}
      <div className="absolute bottom-[18px] left-4 right-4 h-[74px] flex items-center justify-between px-3 bg-text/[0.03] border border-text/[0.08] rounded-2xl backdrop-blur-md z-10">
        <button
          onClick={() => setIsPlaying(p => !p)}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="w-9 h-9 flex items-center justify-center"
        >
          {isPlaying ? (
            <Pause size={28} strokeWidth={2} fill="#FFD89A" className="text-amber" />
          ) : (
            <Play size={28} strokeWidth={2} fill="#FFD89A" className="text-amber" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBpm(b => Math.max(40, b - 1))}
            aria-label="Decrease BPM"
            className="w-7 h-7 flex items-center justify-center text-text/55"
          >
            <Minus size={18} strokeWidth={2} />
          </button>
          <div className="flex flex-col items-center min-w-[64px]">
            <span className="text-base font-medium tabular-nums text-text">{bpm}</span>
            <span className="text-[9px] uppercase tracking-wider text-text/40">BPM</span>
          </div>
          <button
            onClick={() => setBpm(b => Math.min(220, b + 1))}
            aria-label="Increase BPM"
            className="w-7 h-7 flex items-center justify-center text-text/55"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        </div>
        <button
          onClick={() => {
            setBpm(song.bpm);
            setIsPlaying(false);
          }}
          aria-label="Reset"
          className="w-11 h-11 rounded-full border border-amber/40 flex items-center justify-center"
        >
          <RotateCcw size={18} strokeWidth={2} className="text-amber" />
        </button>
      </div>

      <HomeIndicator />

      <SaveSheet
        isOpen={saveSheetOpen}
        onClose={() => setSaveSheetOpen(false)}
        onSave={handleSaveToCategory}
        onCreateCategory={handleCreateCategory}
        song={{ title: song.title, artist: song.artist }}
        categories={categories}
      />

      <ProPaywall
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onUnlock={() => showToast('Welcome to Pro!')}
      />

      <Toast message={toast} />
    </>
  );
}
