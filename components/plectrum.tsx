'use client';

import { useId } from 'react';

type Props = {
  variant?: 'gaseous' | 'solid' | 'small';
  className?: string;
};

const SIZES = {
  gaseous: { w: 130, h: 150 },
  solid: { w: 100, h: 116 },
  small: { w: 60, h: 70 },
};

const SHAPE_PATH =
  'M 65 5 C 80 5, 124 13, 124 29 C 119 58, 88 118, 65 141 C 42 118, 11 58, 6 29 C 6 13, 50 5, 65 5 Z';

export function Plectrum({ variant = 'gaseous', className = '' }: Props) {
  const rid = useId().replace(/:/g, '');
  const id = `plectrum-${rid}`;
  const { w, h } = SIZES[variant];
  const isSolid = variant === 'solid';

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 130 150"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={SHAPE_PATH} />
        </clipPath>
        <radialGradient id={`${id}-warm`} cx="75%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFD89A" stopOpacity={isSolid ? 0.85 : 0.55} />
          <stop offset="50%" stopColor="#FFD89A" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FFD89A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-cool`} cx="25%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#A8E9F4" stopOpacity={isSolid ? 0.7 : 0.5} />
          <stop offset="50%" stopColor="#A8E9F4" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#A8E9F4" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g clipPath={`url(#${id}-clip)`}>
        <rect width="130" height="150" fill={`url(#${id}-warm)`} />
        <rect width="130" height="150" fill={`url(#${id}-cool)`} />
      </g>

      {/* Outline */}
      <path d={SHAPE_PATH} fill="none" stroke="rgba(245,235,215,0.22)" strokeWidth="0.5" />

      {/* Right edge — warm rim */}
      <path
        d="M 65 5 C 80 5, 124 13, 124 29 C 119 58, 88 118, 65 141"
        stroke="#FFD89A"
        strokeWidth="1.5"
        fill="none"
        opacity="0.75"
      />

      {/* Left edge — cool rim */}
      <path
        d="M 65 5 C 50 5, 6 13, 6 29 C 11 58, 42 118, 65 141"
        stroke="#A8E9F4"
        strokeWidth="1.5"
        fill="none"
        opacity="0.65"
      />
    </svg>
  );
}
