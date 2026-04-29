'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  options: string[];
  value: string | string[];
  multi?: boolean;
  onSave: (v: string | string[]) => void;
};

export function OptionSheet({
  isOpen,
  onClose,
  title,
  description,
  options,
  value,
  multi,
  onSave,
}: Props) {
  const [selected, setSelected] = useState<string | string[]>(value);

  useEffect(() => {
    setSelected(value);
  }, [value, isOpen]);

  const isSelected = (opt: string) =>
    multi ? Array.isArray(selected) && selected.includes(opt) : selected === opt;

  const toggleMulti = (opt: string) => {
    setSelected(prev => {
      const arr = Array.isArray(prev) ? prev : [];
      if (arr.includes(opt)) return arr.filter(v => v !== opt);
      return [...arr, opt];
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="absolute inset-0 bg-bg-overlay z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-bg-surface rounded-t-3xl px-4 pt-2 pb-7 z-50 shadow-sheet flex flex-col"
            style={{ maxHeight: '78%' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="w-[38px] h-1 bg-text/25 rounded mx-auto mb-3.5" />
            <h3 className="text-lg font-medium text-text text-center mb-1">{title}</h3>
            {description && (
              <p className="text-xs text-text/50 text-center mb-4">{description}</p>
            )}

            <div className="flex flex-col gap-1.5 mb-4 overflow-y-auto no-scrollbar">
              {options.map(opt => {
                const sel = isSelected(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      if (multi) {
                        toggleMulti(opt);
                      } else {
                        onSave(opt);
                        onClose();
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      sel
                        ? 'bg-amber/[0.13] border-amber/50'
                        : 'bg-text/[0.04] border-text/[0.06]'
                    }`}
                  >
                    <span className={`text-sm font-medium ${sel ? 'text-amber' : 'text-text'}`}>
                      {opt}
                    </span>
                    {sel && <Check size={16} strokeWidth={2.5} className="text-amber" />}
                  </button>
                );
              })}
            </div>

            {multi && (
              <button
                onClick={() => {
                  onSave(selected);
                  onClose();
                }}
                className="w-full h-12 rounded-2xl bg-amber text-bg-primary text-sm font-medium shadow-cta-amber"
              >
                Done
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
