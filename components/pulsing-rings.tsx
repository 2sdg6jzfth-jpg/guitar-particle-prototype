'use client';

import { motion } from 'framer-motion';

const RINGS = [
  { color: 'rgba(255,216,154,0.3)', delay: 0 },
  { color: 'rgba(168,233,244,0.3)', delay: 1 },
  { color: 'rgba(255,216,154,0.22)', delay: 2 },
  { color: 'rgba(168,233,244,0.22)', delay: 3 },
];

export function PulsingRings() {
  return (
    <>
      {RINGS.map((r, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{ border: `1px solid ${r.color}`, x: '-50%', y: '-50%' }}
          initial={{ scale: 0.4, opacity: 0.55 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 4, delay: r.delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}
