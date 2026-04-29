'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plectrum } from './plectrum';
import { MusicNote } from './music-note';

type Props = { state: 'plectrum' | 'note' };

export function PlectrumToNoteMorph({ state }: Props) {
  return (
    <div className="relative w-[130px] h-[150px] flex items-center justify-center">
      <AnimatePresence mode="wait">
        {state === 'plectrum' ? (
          <motion.div
            key="plectrum"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Plectrum variant="gaseous" />
          </motion.div>
        ) : (
          <motion.div
            key="note"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <MusicNote />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
