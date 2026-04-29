type Props = {
  positions: { string: number; fret: number; finger?: number }[];
  openStrings: number[];
  mutedStrings: number[];
  size?: 'sm' | 'md';
};

// 6 strings (1=high E on right, 6=low E on left), 4 frets shown
export function ChordDiagram({ positions, openStrings, mutedStrings, size = 'md' }: Props) {
  const W = size === 'sm' ? 60 : 76;
  const H = size === 'sm' ? 76 : 96;
  const padX = 8;
  const topMarker = 10;
  const fretAreaTop = topMarker + 6;
  const fretAreaH = H - fretAreaTop - 6;
  const stringX = (s: number) => padX + ((6 - s) * (W - padX * 2)) / 5;
  const fretY = (f: number) => fretAreaTop + (f - 0.5) * (fretAreaH / 4);
  const fretLineY = (f: number) => fretAreaTop + f * (fretAreaH / 4);
  const dotR = size === 'sm' ? 5 : 6;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      {/* Top markers (open / muted) */}
      {[1, 2, 3, 4, 5, 6].map(s => {
        const cx = stringX(s);
        if (openStrings.includes(s)) {
          return <circle key={`o-${s}`} cx={cx} cy={topMarker} r="3" fill="none" stroke="rgba(245,235,215,0.65)" strokeWidth="1.1" />;
        }
        if (mutedStrings.includes(s)) {
          return (
            <g key={`m-${s}`} stroke="rgba(245,235,215,0.5)" strokeWidth="1.1" strokeLinecap="round">
              <line x1={cx - 2.5} y1={topMarker - 2.5} x2={cx + 2.5} y2={topMarker + 2.5} />
              <line x1={cx - 2.5} y1={topMarker + 2.5} x2={cx + 2.5} y2={topMarker - 2.5} />
            </g>
          );
        }
        return null;
      })}

      {/* Nut */}
      <line
        x1={padX}
        y1={fretAreaTop}
        x2={W - padX}
        y2={fretAreaTop}
        stroke="rgba(245,235,215,0.85)"
        strokeWidth="1.6"
      />
      {/* Frets */}
      {[1, 2, 3, 4].map(f => (
        <line
          key={f}
          x1={padX}
          y1={fretLineY(f)}
          x2={W - padX}
          y2={fretLineY(f)}
          stroke="rgba(245,235,215,0.22)"
          strokeWidth="0.8"
        />
      ))}
      {/* Strings */}
      {[1, 2, 3, 4, 5, 6].map(s => (
        <line
          key={s}
          x1={stringX(s)}
          y1={fretAreaTop}
          x2={stringX(s)}
          y2={H - 6}
          stroke="rgba(245,235,215,0.32)"
          strokeWidth="0.8"
        />
      ))}
      {/* Finger dots */}
      {positions.map((p, i) => (
        <g key={i}>
          <circle cx={stringX(p.string)} cy={fretY(p.fret)} r={dotR} fill="#FFD89A" />
          {p.finger && (
            <text
              x={stringX(p.string)}
              y={fretY(p.fret) + 3}
              fontSize={size === 'sm' ? '7' : '8'}
              fontWeight="600"
              textAnchor="middle"
              fill="#0A0E18"
            >
              {p.finger}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
