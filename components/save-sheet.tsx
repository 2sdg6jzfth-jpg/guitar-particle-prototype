'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Folder, Check, Plus } from 'lucide-react';
import type { LibraryCategory } from '@/lib/storage';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryId: string) => void;
  onCreateCategory: (name: string) => void;
  song: { title: string; artist: string };
  categories: LibraryCategory[];
};

export function SaveSheet({ isOpen, onClose, onSave, onCreateCategory, song, categories }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelected(null);
      setCreating(false);
      setNewName('');
    }
  }, [isOpen]);

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
            className="absolute bottom-0 left-0 right-0 bg-bg-surface rounded-t-3xl px-4 pt-2 pb-7 z-50 shadow-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="w-[38px] h-1 bg-text/25 rounded mx-auto mb-3.5" />
            <h3 className="text-lg font-medium text-text text-center mb-1">Save to library</h3>
            <p className="text-xs text-text/50 text-center mb-4">
              {song.title} · {song.artist}
            </p>

            <div className="flex flex-col gap-1.5 mb-2.5 max-h-[280px] overflow-y-auto">
              {categories.map(cat => {
                const isSelected = selected === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelected(cat.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                      isSelected
                        ? 'bg-amber/[0.13] border-amber/50'
                        : 'bg-text/[0.04] border-text/[0.06]'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-amber/20' : 'bg-text/[0.06]'
                      }`}
                    >
                      <Folder size={18} strokeWidth={2} className={isSelected ? 'text-amber' : 'text-text/70'} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-medium ${isSelected ? 'text-amber' : 'text-text'}`}>
                        {cat.name}
                      </div>
                      <div className="text-[11px] text-text/50">
                        {cat.count} {cat.count === 1 ? 'song' : 'songs'}
                      </div>
                    </div>
                    {isSelected && <Check size={16} strokeWidth={2.5} className="text-amber" />}
                  </button>
                );
              })}
            </div>

            {!creating ? (
              <button
                onClick={() => setCreating(true)}
                className="w-full p-2.5 rounded-xl border border-dashed border-amber/35 text-amber text-[13px] font-medium flex items-center justify-center gap-2.5 mb-4"
              >
                <Plus size={16} strokeWidth={2.5} /> New category
              </button>
            ) : (
              <div className="flex gap-2 mb-4">
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Category name"
                  className="flex-1 bg-text/[0.05] border border-text/[0.08] rounded-xl px-3.5 h-11 text-sm text-text placeholder:text-text/40 outline-none"
                />
                <button
                  onClick={() => {
                    if (newName.trim()) {
                      onCreateCategory(newName.trim());
                      setNewName('');
                      setCreating(false);
                    }
                  }}
                  className="px-4 h-11 rounded-xl bg-amber text-bg-primary text-sm font-medium"
                >
                  Add
                </button>
              </div>
            )}

            <button
              onClick={() => selected && onSave(selected)}
              disabled={!selected}
              className={`w-full h-12 rounded-2xl text-sm font-medium transition-opacity ${
                selected ? 'bg-amber text-bg-primary' : 'bg-amber/30 text-bg-primary/60'
              }`}
              style={selected ? { boxShadow: '0 8px 24px rgba(255,216,154,0.18)' } : undefined}
            >
              Save
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
