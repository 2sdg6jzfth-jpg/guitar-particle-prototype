'use client';

import { motion, AnimatePresence } from 'framer-motion';

type Props = { message: string | null; tone?: 'success' | 'info' };

export function Toast({ message, tone = 'success' }: Props) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-3.5 py-2 rounded-xl bg-bg-surface border border-amber/30 text-xs font-medium text-amber shadow-sheet"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
