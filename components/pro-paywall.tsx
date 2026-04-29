'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Plectrum } from './plectrum';
import { storage } from '@/lib/storage';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUnlock?: () => void;
};

const FEATURES = [
  'Unlimited song identifications',
  'Tabs view (chord + tab notation)',
  'Loop & speed controls',
  'Custom strum patterns',
  'Offline access to saved songs',
  'No ads, ever',
];

export function ProPaywall({ isOpen, onClose, onUnlock }: Props) {
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');

  const handleStartTrial = () => {
    storage.setPro(true);
    onClose();
    onUnlock?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 z-50 bg-bg-primary overflow-hidden"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {/* Halos */}
          <div
            className="absolute -top-40 -left-32 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(232,160,74,0.55) 0%, rgba(255,216,154,0.15) 35%, transparent 70%)',
            }}
          />
          <div
            className="absolute -bottom-40 -right-32 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(63,190,212,0.4) 0%, rgba(168,233,244,0.12) 35%, transparent 70%)',
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-12 right-4 w-10 h-10 flex items-center justify-center text-text/70 z-10"
          >
            <X size={24} strokeWidth={2.5} />
          </button>

          {/* Hero */}
          <div className="absolute top-[88px] left-0 right-0 flex flex-col items-center">
            <Plectrum variant="solid" />
            <div className="mt-4 px-3 py-1 rounded-full bg-amber/15 border border-amber/35">
              <span className="text-[11px] font-medium tracking-wider uppercase text-amber">Guitar Particle Pro</span>
            </div>
          </div>

          {/* Title */}
          <div className="absolute top-[290px] left-0 right-0 text-center px-6">
            <h2 className="text-2xl font-medium tracking-tight text-text">Play more, learn faster.</h2>
          </div>

          {/* Features list */}
          <div className="absolute top-[340px] left-6 right-6 flex flex-col gap-1.5">
            {FEATURES.slice(0, 4).map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <Check size={14} strokeWidth={2.5} className="text-amber flex-shrink-0" />
                <span className="text-[13px] text-text/85">{f}</span>
              </div>
            ))}
          </div>

          {/* Plan cards */}
          <div className="absolute top-[460px] left-4 right-4 flex gap-2.5">
            <button
              onClick={() => setPlan('monthly')}
              className={`flex-1 p-3 rounded-2xl border-2 text-left transition-colors ${
                plan === 'monthly'
                  ? 'border-amber bg-amber/[0.08]'
                  : 'border-text/10 bg-text/[0.03]'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider text-text/55 mb-0.5">Monthly</div>
              <div className="text-lg font-medium text-text tabular-nums">$1.99</div>
              <div className="text-[10px] text-text/45">per month</div>
            </button>
            <button
              onClick={() => setPlan('yearly')}
              className={`flex-1 relative p-3 rounded-2xl border-2 text-left transition-colors ${
                plan === 'yearly'
                  ? 'border-amber bg-amber/[0.08]'
                  : 'border-text/10 bg-text/[0.03]'
              }`}
            >
              <div className="absolute -top-2 right-2.5 px-1.5 py-0.5 rounded-md bg-amber text-bg-primary text-[9px] font-semibold tracking-wide">
                SAVE 33%
              </div>
              <div className="text-[10px] uppercase tracking-wider text-text/55 mb-0.5">Yearly</div>
              <div className="text-lg font-medium text-text tabular-nums">$15.99</div>
              <div className="text-[10px] text-text/45">$1.33 / month</div>
            </button>
          </div>

          {/* CTA */}
          <button
            onClick={handleStartTrial}
            className="absolute bottom-[80px] left-4 right-4 h-12 rounded-2xl bg-amber text-bg-primary text-sm font-semibold shadow-cta-pro"
          >
            Start 7-day free trial
          </button>

          <p className="absolute bottom-[52px] left-0 right-0 text-center text-[10px] text-text/40 px-6">
            Then {plan === 'yearly' ? '$15.99/year' : '$1.99/month'} · Cancel anytime
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
