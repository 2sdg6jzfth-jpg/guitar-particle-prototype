'use client';

import { ChordDiagram } from './chord-diagram';

type Props = {
  name: string;
  sequenceNumber?: number;
  positions: { string: number; fret: number; finger?: number }[];
  openStrings: number[];
  mutedStrings: number[];
  baseFret?: number;
  isPlaying?: boolean;
  onClick?: () => void;
};

export function ChordCard({
  name,
  sequenceNumber,
  positions,
  openStrings,
  mutedStrings,
  baseFret,
  isPlaying,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-xl p-2.5 flex flex-col items-center min-h-[136px] border transition-all ${
        isPlaying
          ? 'bg-amber/[0.13] border-amber/50 shadow-[0_0_18px_rgba(255,216,154,0.2)]'
          : 'bg-text/[0.03] border-text/[0.07] active:bg-text/[0.06]'
      }`}
    >
      {sequenceNumber && (
        <span
          className={`absolute top-1.5 left-2 text-[10px] font-medium tabular-nums ${
            isPlaying ? 'text-amber' : 'text-amber/50'
          }`}
        >
          {sequenceNumber}
        </span>
      )}

      {isPlaying && <SoundBars />}

      <span className={`text-sm font-medium mb-1 ${isPlaying ? 'text-amber' : 'text-text'}`}>
        {name}
      </span>

      <ChordDiagram
        positions={positions}
        openStrings={openStrings}
        mutedStrings={mutedStrings}
        baseFret={baseFret}
      />
    </button>
  );
}

function SoundBars() {
  return (
    <div className="absolute top-2 right-2.5 flex items-end gap-[1.5px] h-[11px]">
      <span className="w-0.5 bg-amber rounded-sm sound-bar" style={{ animationDelay: '0s' }} />
      <span className="w-0.5 bg-amber rounded-sm sound-bar" style={{ animationDelay: '0.15s' }} />
      <span className="w-0.5 bg-amber rounded-sm sound-bar" style={{ animationDelay: '0.3s' }} />
    </div>
  );
}
