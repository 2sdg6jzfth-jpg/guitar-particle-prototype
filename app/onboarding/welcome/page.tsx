'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { Plectrum } from '@/components/plectrum';
import { OnboardingIndicator } from '@/components/onboarding-indicator';

export default function WelcomePage() {
  return (
    <>
      <CrossLitHalos intensity="high" />
      <StatusBar />

      <div className="absolute top-[120px] left-0 right-0 flex justify-center">
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
        >
          <Plectrum variant="gaseous" />
        </motion.div>
      </div>

      <div className="absolute top-[330px] left-0 right-0 px-8 text-center">
        <h1 className="text-3xl font-medium tracking-tight text-text leading-tight mb-3">
          Hear it. Play it.
        </h1>
        <p className="text-sm text-text/65 leading-relaxed">
          Guitar Particle identifies any song and shows you the chords — instantly.
        </p>
      </div>

      <div className="absolute top-[490px] left-0 right-0 flex flex-col items-center gap-3 px-6">
        <Step n={1} label="Identify songs by listening" />
        <Step n={2} label="Get chords, lyrics, and tabs" />
        <Step n={3} label="Save and learn at your pace" />
      </div>

      <Link
        href="/onboarding/account"
        className="absolute bottom-[60px] left-4 right-4 h-12 rounded-2xl bg-amber text-bg-primary text-sm font-semibold flex items-center justify-center shadow-cta-amber"
      >
        Get started
      </Link>

      <OnboardingIndicator step={1} />
      <HomeIndicator />
    </>
  );
}

function Step({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="w-7 h-7 rounded-full bg-amber/15 border border-amber/35 flex items-center justify-center text-amber text-[11px] font-semibold tabular-nums flex-shrink-0">
        {n}
      </div>
      <span className="text-[13px] text-text/85">{label}</span>
    </div>
  );
}
