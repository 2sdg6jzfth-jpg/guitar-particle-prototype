'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart, Play, Pause, Minus, Plus, RotateCcw,
  ChevronUp, ChevronDown, Maximize2, Minimize2,
} from 'lucide-react';
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
import {
  wonderwall,
  CHROMATIC_KEYS,
  transposeChordName,
  type Chord,
} from '@/lib/mock-data';
import { storage, type LibraryCategory } from '@/lib/storage';
import { playChord, playClick } from '@/lib/audio';

type View = 'Diagrams' | 'Lyrics' | 'Tabs';
const VIEW_OPTIONS = ['Diagrams', 'Lyrics', 'Tabs'] as const;
const HAND_OPTIONS = ['R', 'L'] as const;
const STRUM_OPTIONS = ['Simple', 'Real'] as const;

export default function ChordPage() {
  const router = useRouter();
  const song = wonderwall;
  const originalCapo = song.capo ?? 0;

  const [view, setView] = useState<View>('Diagrams');
  const [selectedSection, setSelectedSection] = useState(song.sections[1].name);
  const [strumMode, setStrumMode] = useState<(typeof STRUM_OPTIONS)[number]>('Real');
  const [hand, setHand] = useState<(typeof HAND_OPTIONS)[number]>('R');
  const [keyValue, setKeyValue] = useState(song.originalKey);
  const [position, setPosition] = useState('1');
  const [bpm, setBpm] = useState(song.bpm);
  const [capoFret, setCapoFret] = useState(originalCapo);
  const [capoOpen, setCapoOpen] = useState(false);
  const capoRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingChord, setPlayingChord] = useState<string | null>(null);
  const [saveSheetOpen, setSaveSheetOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // View modes
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  useEffect(() => {
    setIsSaved(storage.isSongSaved(song.id));
    setCategories(storage.getCategories());
  }, [song.id]);

  useEffect(() => () => {
    if (playRef.current) clearInterval(playRef.current);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (capoRef.current && !capoRef.current.contains(e.target as Node)) setCapoOpen(false);
    };
    if (capoOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [capoOpen]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const currentSection = useMemo(
    () => song.sections.find(s => s.name === selectedSection) ?? song.sections[1],
    [selectedSection, song.sections]
  );

  const capoSemitoneShift = capoFret - originalCapo;
  const displayName = (chordName: string) =>
    capoSemitoneShift === 0 ? chordName : transposeChordName(chordName, capoSemitoneShift);

  const positionIdx = parseInt(position, 10) - 1;
  const getVoicing = (chord: Chord) => chord.voicings[positionIdx] ?? chord.voicings[0];

  const maxVoicings = Math.max(...currentSection.chords.map(c => c.voicings.length));
  const positionOptions = Array.from({ length: maxVoicings }, (_, i) => ({
    value: String(i + 1),
    label: `Position ${i + 1}${i === 0 ? ' (open)' : ''}`,
  }));

  const strumPattern = strumMode === 'Real' ? song.realStrumPattern : song.simpleStrumPattern;

  // Play loop: metronome ticks every beat, chords change every 2 beats and play audibly
  useEffect(() => {
    if (!isPlaying) {
      if (playRef.current) clearInterval(playRef.current);
      setPlayingChord(null);
      return;
    }
    let beatCount = 0;
    const beatMs = (60 / bpm) * 1000;

    const tick = () => {
      const isDownbeat = beatCount % 4 === 0;
      try {
        playClick(isDownbeat);
      } catch {
        // Audio not available — keep visual loop running
      }

      if (beatCount % 2 === 0) {
        const chordIdx = (beatCount / 2) % currentSection.chords.length;
        const chord = currentSection.chords[chordIdx];
        const voicing = getVoicing(chord);
        try {
          playChord(voicing, capoFret);
        } catch {
          // ignore
        }
        setPlayingChord(chord.name);
      }
      beatCount++;
    };

    tick(); // first beat immediately
    playRef.current = setInterval(tick, beatMs);
    return () => {
      if (playRef.current) clearInterval(playRef.current);
    };
  }, [isPlaying, bpm, currentSection, capoFret, position]);

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

  // Body content (renders different sizes for fullscreen)
  const renderBody = (large: boolean) => {
    if (view === 'Diagrams') {
      return (
        <div className={`grid grid-cols-2 ${large ? 'gap-4' : 'gap-3'} pb-4`}>
          {currentSection.chords.map((chord, i) => {
            const voicing = getVoicing(chord);
            return (
              <ChordCard
                key={`${chord.name}-${i}-${position}-${capoFret}`}
                name={displayName(chord.name)}
                sequenceNumber={i + 1}
                positions={voicing.positions}
                openStrings={voicing.openStrings}
                mutedStrings={voicing.mutedStrings}
                baseFret={voicing.baseFret}
                size={large ? 'lg' : 'md'}
                isPlaying={playingChord === chord.name}
                onClick={() => {
                  try {
                    playChord(voicing, capoFret);
                  } catch {
                    // ignore
                  }
                  setPlayingChord(chord.name);
                  setTimeout(() => setPlayingChord(null), 1200);
                }}
              />
            );
          })}
        </div>
      );
    }
    if (view === 'Lyrics') {
      return (
        <div className="flex flex-col gap-3 pb-4">
          <div className="text-[10px] uppercase tracking-wider text-text/45 font-medium">
            {currentSection.name}
          </div>
          {song.lyrics.map((line, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <div
                className={`flex gap-2 font-semibold text-amber tabular-nums ${
                  large ? 'text-xs' : 'text-[10px]'
                }`}
              >
                {line.chords.map((c, j) => (
                  <span
                    key={j}
                    style={{
                      marginLeft:
                        j === 0
                          ? `${c.at * (large ? 8 : 6)}px`
                          : `${(c.at - line.chords[j - 1].at - 1) * (large ? 8 : 6)}px`,
                    }}
                  >
                    {displayName(c.chord)}
                  </span>
                ))}
              </div>
              <div className={`text-text leading-relaxed ${large ? 'text-base' : 'text-[13px]'}`}>
                {line.line}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div
        className={`flex flex-col gap-2 pb-4 font-mono text-text/85 leading-relaxed ${
          large ? 'text-[14px]' : 'text-[11px]'
        }`}
      >
        <div className="text-[10px] uppercase tracking-wider text-text/45 font-medium font-sans mb-2">
          {currentSection.name}
        </div>
        {[
          'e|--3-----3-----3-----3-----|',
          'B|--3-----3-----3-----3-----|',
          'G|--0-----0-----2-----2-----|',
          'D|--0-----0-----0-----2-----|',
          'A|--2-----2-----x-----0-----|',
          'E|--0-----3-----x-----x-----|',
        ].map((row, i) => (
          <div key={i} className="tabular-nums">
            {row}
          </div>
        ))}
        <div className="mt-3 text-[10px] text-text/45 font-sans">
          Tabs are simplified for the prototype.
        </div>
      </div>
    );
  };

  // ============== FULLSCREEN MODE ==============
  if (fullScreen) {
    return (
      <>
        <CrossLitHalos intensity="low" />

        {/* Top bar: minimize + title */}
        <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-3.5 h-12 z-20">
          <button
            onClick={() => setFullScreen(false)}
            aria-label="Exit full screen"
            className="w-10 h-10 flex items-center justify-center"
          >
            <Minimize2 size={22} strokeWidth={2} className="text-text" />
          </button>
          <h2 className="text-sm font-medium text-text truncate max-w-[200px]">{song.title}</h2>
          <div className="w-10" />
        </div>

        {/* Body — fills nearly the whole frame */}
        <div className="absolute top-[64px] bottom-[112px] left-0 right-0 px-4 overflow-y-auto no-scrollbar">
          {renderBody(true)}
        </div>

        {/* Floating play/pause */}
        <button
          onClick={() => setIsPlaying(p => !p)}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-amber flex items-center justify-center shadow-cta-amber z-20"
          style={{ boxShadow: '0 12px 32px rgba(255,216,154,0.3)' }}
        >
          {isPlaying ? (
            <Pause size={28} strokeWidth={2} fill="#0A0E18" className="text-bg-primary" />
          ) : (
            <Play size={28} strokeWidth={2} fill="#0A0E18" className="text-bg-primary ml-0.5" />
          )}
        </button>

        <HomeIndicator />

        <Toast message={toast} />
      </>
    );
  }

  // ============== NORMAL MODE (default + collapsed) ==============
  return (
    <>
      <CrossLitHalos intensity="low" />
      <StatusBar />

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
      <div className="absolute top-[88px] left-4 right-4">
        <div className="flex items-center gap-3 h-[56px]">
          <Cover variant={song.cover ?? 'default'} size={56} />
          <div className="flex-1 min-w-0">
            <h1 className="text-[18px] font-medium leading-tight truncate">{song.title}</h1>
            <div className="text-xs text-text/60 truncate mt-0.5">{song.artist}</div>
          </div>
          <button
            onClick={() => {
              if (isSaved) {
                storage.removeSavedSong(song.id);
                setIsSaved(false);
                setCategories(storage.getCategories());
                showToast('Removed from library');
              } else {
                setSaveSheetOpen(true);
              }
            }}
            aria-label={isSaved ? 'Remove from library' : 'Save'}
            className={`w-[42px] h-[42px] rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${
              isSaved ? 'border-amber bg-amber/15' : 'border-text/15 bg-transparent'
            }`}
          >
            <Heart
              size={20}
              strokeWidth={2}
              className={isSaved ? 'text-amber' : 'text-text'}
              fill={isSaved ? '#FFD89A' : 'none'}
            />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3 ml-[68px]">
          <button
            onClick={() =>
              window.open(
                `https://music.apple.com/search?term=${encodeURIComponent(song.title + ' ' + song.artist)}`,
                '_blank'
              )
            }
            aria-label="Open in Apple Music"
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FA233B, #FB5C74)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" fill="white" stroke="none" />
              <circle cx="18" cy="16" r="3" fill="white" stroke="none" />
            </svg>
          </button>
          <button
            onClick={() =>
              window.open(
                `https://open.spotify.com/search/${encodeURIComponent(song.title + ' ' + song.artist)}`,
                '_blank'
              )
            }
            aria-label="Open in Spotify"
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#1DB954' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="M5 9c4.5-2 9.5-2 14 0" />
              <path d="M6.5 13c3.5-1.5 7.5-1.5 11 0" />
              <path d="M8 16.5c2.5-1 5.5-1 8 0" />
            </svg>
          </button>

          <div ref={capoRef} className="ml-auto relative">
            <button
              onClick={() => setCapoOpen(o => !o)}
              className={`flex items-center gap-1.5 px-3 h-9 rounded-2xl border ${
                capoFret === 0
                  ? 'bg-text/[0.05] border-text/[0.12] text-text/70'
                  : 'bg-amber/15 border-amber/40 text-amber'
              }`}
            >
              <span className="text-[11px] font-semibold tracking-wider uppercase">
                {capoFret === 0 ? 'No capo' : `Capo ${capoFret}`}
              </span>
              <ChevronDown size={10} strokeWidth={3} />
            </button>
            {capoOpen && (
              <div className="absolute top-[calc(100%+6px)] right-0 z-40 w-[210px] bg-bg-surface border border-text/10 rounded-xl shadow-sheet p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-text/50 font-medium mb-2 px-1">
                  Capo position
                </div>
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {[0, 1, 2, 3, 4, 5].map(f => (
                    <button
                      key={f}
                      onClick={() => {
                        setCapoFret(f);
                        setCapoOpen(false);
                      }}
                      className={`h-8 rounded-md text-xs font-medium tabular-nums flex items-center justify-center ${
                        f === capoFret
                          ? 'bg-amber text-bg-primary'
                          : 'bg-text/[0.05] text-text border border-text/[0.08]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-text/45 leading-relaxed px-1">
                  {capoFret === originalCapo
                    ? 'Original — chords as written.'
                    : capoFret === 0
                    ? `No capo — names shown ${capoSemitoneShift > 0 ? 'higher' : 'lower'} than the recording.`
                    : `Capo on fret ${capoFret} — chord names retransposed.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== CONTROLS (default mode) ===== */}
      {!controlsCollapsed && (
        <>
          <div className="absolute top-[208px] left-4 right-4 flex gap-2 h-9">
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
              options={positionOptions}
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

          <div className="absolute top-[260px] left-0 right-0 h-9 px-4 flex gap-1.5 overflow-x-auto no-scrollbar">
            {song.sections.map(s => {
              const active = s.name === selectedSection;
              return (
                <button
                  key={s.name}
                  onClick={() => {
                    setSelectedSection(s.name);
                    setPosition('1');
                  }}
                  className={`flex-shrink-0 px-3.5 h-9 rounded-full text-xs font-medium whitespace-nowrap ${
                    active ? 'bg-amber text-bg-primary' : 'bg-transparent text-text border border-text/[0.12]'
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>

          <div className="absolute top-[310px] left-4 right-4">
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

          {/* Strum row + collapse/fullscreen toggles */}
          <div className="absolute top-[360px] left-4 right-4 h-9 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-text/50 font-medium">Strum</span>
            <div className="flex items-center gap-[3px]">
              {strumPattern.map((d, i) => (
                <span key={i} className="flex items-center justify-center">
                  {d === 'D' ? (
                    <svg width="12" height="14" viewBox="0 0 13 15" fill="none" stroke="#FFD89A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="6.5" y1="2" x2="6.5" y2="13" />
                      <polyline points="2 9 6.5 13 11 9" />
                    </svg>
                  ) : (
                    <svg width="10" height="12" viewBox="0 0 11 13" fill="none" stroke="#A8E9F4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                      <line x1="5.5" y1="11" x2="5.5" y2="2" />
                      <polyline points="2 5 5.5 2 9 5" />
                    </svg>
                  )}
                </span>
              ))}
            </div>
            <SegmentedControl
              options={STRUM_OPTIONS}
              value={strumMode}
              onChange={setStrumMode}
              size="sm"
              className="ml-auto w-[88px] h-7"
            />
            <button
              onClick={() => setControlsCollapsed(true)}
              aria-label="Collapse controls"
              className="w-7 h-7 rounded-md bg-text/[0.05] border border-text/[0.1] flex items-center justify-center flex-shrink-0"
            >
              <ChevronUp size={14} strokeWidth={2.2} className="text-text/75" />
            </button>
            <button
              onClick={() => setFullScreen(true)}
              aria-label="Full screen"
              className="w-7 h-7 rounded-md bg-text/[0.05] border border-text/[0.1] flex items-center justify-center flex-shrink-0"
            >
              <Maximize2 size={13} strokeWidth={2.2} className="text-text/75" />
            </button>
          </div>
        </>
      )}

      {/* ===== COMPACT SUMMARY BAR (collapsed mode) ===== */}
      {controlsCollapsed && (
        <div className="absolute top-[208px] left-4 right-4 h-9 flex items-center gap-2">
          <button
            onClick={() => setControlsCollapsed(false)}
            className="flex-1 flex items-center gap-2 bg-text/[0.04] border border-text/[0.07] rounded-xl px-3 h-9"
          >
            <ChevronDown size={14} strokeWidth={2.2} className="text-amber flex-shrink-0" />
            <span className="text-xs text-text/75 truncate text-left">
              <span className="font-medium text-text">{selectedSection}</span>
              <span className="text-text/45"> · {view} · {strumMode}</span>
            </span>
          </button>
          <button
            onClick={() => setFullScreen(true)}
            aria-label="Full screen"
            className="w-9 h-9 rounded-md bg-text/[0.05] border border-text/[0.1] flex items-center justify-center flex-shrink-0"
          >
            <Maximize2 size={14} strokeWidth={2.2} className="text-text/75" />
          </button>
        </div>
      )}

      {/* Body */}
      <div
        className={`absolute left-0 right-0 px-4 overflow-y-auto no-scrollbar ${
          controlsCollapsed ? 'top-[256px]' : 'top-[410px]'
        } bottom-[110px]`}
      >
        {renderBody(false)}
      </div>

      {/* Transport */}
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
