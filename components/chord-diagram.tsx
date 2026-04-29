type Props = {
  positions: { string: number; fret: number; finger?: number }[];
  openStrings: number[];
  mutedStrings: number[];
  baseFret?: number;
  size?: 'sm' | 'md' | 'lg';
};

const SIZES = {
  sm: { W: 60, H: 76, dotR: 5, fontSize: 7, label: 8 },
  md: { W: 76, H: 96, dotR: 6, fontSize: 8, label: 8 },
  lg: { W: 108, H: 138, dotR: 8, fontSize: 10, label: 11 },
};

export function ChordDiagram({
  positions,
  openStrings,
  mutedStrings,
  baseFret = 1,
  size = 'md',
}: Props) {
  const { W, H, dotR, fontSize, label } = SIZES[size];
  const padX = size === 'lg' ? 10 : 8;
  const topMarker = size === 'lg' ? 12 : 10;
  const fretAreaTop = topMarker + 6;
  const fretAreaH = H - fretAreaTop - 6;
  const stringX = (s: number) => padX + ((6 - s) * (W - padX * 2)) / 5;
  const fretY = (f: number) => fretAreaTop + (f - 0.5) * (fretAreaH / 4);
  const fretLineY = (f: number) => fretAreaTop + f * (fretAreaH / 4);

  const isOpen = baseFret === 1;
  const labelGutter = isOpen ? 0 : 16;
  const xMarkSize = size === 'lg' ? 3 : 2.5;

  return (
    <svg
      width={W + labelGutter}
      height={H}
      viewBox={`0 0 ${W + labelGutter} ${H}`}
      aria-hidden
    >
      {isOpen &&
        [1, 2, 3, 4, 5, 6].map(s => {
          const cx = stringX(s);
          if (openStrings.includes(s)) {
            return (
              <circle
                key={`o-${s}`}
                cx={cx}
                cy={topMarker}
                r={size === 'lg' ? 4 : 3}
                fill="none"
                stroke="rgba(245,235,215,0.65)"
                strokeWidth="1.1"
              />
            );
          }
          if (mutedStrings.includes(s)) {
            return (
              <g key={`m-${s}`} stroke="rgba(245,235,215,0.5)" strokeWidth="1.1" strokeLinecap="round">
                <line x1={cx - xMarkSize} y1={topMarker - xMarkSize} x2={cx + xMarkSize} y2={topMarker + xMarkSize} />
                <line x1={cx - xMarkSize} y1={topMarker + xMarkSize} x2={cx + xMarkSize} y2={topMarker - xMarkSize} />
              </g>
            );
          }
          return null;
        })}

      {!isOpen &&
        mutedStrings.map(s => {
          const cx = stringX(s);
          return (
            <g key={`m-${s}`} stroke="rgba(245,235,215,0.5)" strokeWidth="1.1" strokeLinecap="round">
              <line x1={cx - xMarkSize} y1={topMarker - xMarkSize} x2={cx + xMarkSize} y2={topMarker + xMarkSize} />
              <line x1={cx - xMarkSize} y1={topMarker + xMarkSize} x2={cx + xMarkSize} y2={topMarker - xMarkSize} />
            </g>
          );
        })}

      <line
        x1={padX}
        y1={fretAreaTop}
        x2={W - padX}
        y2={fretAreaTop}
        stroke={isOpen ? 'rgba(245,235,215,0.85)' : 'rgba(245,235,215,0.32)'}
        strokeWidth={isOpen ? '1.6' : '0.8'}
      />

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

      {positions.map((p, i) => (
        <g key={i}>
          <circle cx={stringX(p.string)} cy={fretY(p.fret)} r={dotR} fill="#FFD89A" />
          {p.finger && (
            <text
              x={stringX(p.string)}
              y={fretY(p.fret) + (size === 'lg' ? 4 : 3)}
              fontSize={fontSize}
              fontWeight="600"
              textAnchor="middle"
              fill="#0A0E18"
            >
              {p.finger}
            </text>
          )}
        </g>
      ))}

      {!isOpen && (
        <text
          x={W + 2}
          y={fretY(1) + 3}
          fontSize={label}
          fontWeight="600"
          fill="#FFD89A"
          opacity="0.85"
        >
          {baseFret}fr
        </text>
      )}
    </svg>
  );
}
