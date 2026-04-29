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
  size?: 'md' | 'lg';
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
  size = 'md',
  onClick,
}: Props) {
  const isLg = size === 'lg';

  return (
    <button
      onClick={onClick}
      className={`relative rounded-xl flex flex-col items-center border transition-all ${
        isLg ? 'p-4 min-h-[200px]' : 'p-2.5 min-h-[136px]'
      } ${
        isPlaying
          ? 'bg-amber/[0.13] border-amber/50 shadow-[0_0_18px_rgba(255,216,154,0.2)]'
          : 'bg-text/[0.03] border-text/[0.07] active:bg-text/[0.06]'
      }`}
    >
      {sequenceNumber && (
        <span
          className={`absolute font-medium tabular-nums ${
            isLg ? 'top-2 left-2.5 text-xs' : 'top-1.5 left-2 text-[10px]'
          } ${isPlaying ? 'text-amber' : 'text-amber/50'}`}
        >
          {sequenceNumber}
        </span>
      )}

      {isPlaying && <SoundBars isLg={isLg} />}

      <span
        className={`font-medium ${isLg ? 'text-lg mb-3' : 'text-sm mb-1'} ${
          isPlaying ? 'text-amber' : 'text-text'
        }`}
      >
        {name}
      </span>

      <ChordDiagram
        positions={positions}
        openStrings={openStrings}
        mutedStrings={mutedStrings}
        baseFret={baseFret}
        size={isLg ? 'lg' : 'md'}
      />
    </button>
  );
}

function SoundBars({ isLg }: { isLg: boolean }) {
  return (
    <div
      className={`absolute flex items-end gap-[1.5px] ${
        isLg ? 'top-3 right-3 h-[14px]' : 'top-2 right-2.5 h-[11px]'
      }`}
    >
      <span className="w-0.5 bg-amber rounded-sm sound-bar" style={{ animationDelay: '0s' }} />
      <span className="w-0.5 bg-amber rounded-sm sound-bar" style={{ animationDelay: '0.15s' }} />
      <span className="w-0.5 bg-amber rounded-sm sound-bar" style={{ animationDelay: '0.3s' }} />
    </div>
  );
}
