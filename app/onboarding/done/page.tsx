'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { Plectrum } from '@/components/plectrum';
import { Indicator } from '../welcome/page';
import { storage } from '@/lib/storage';

const ACCOUNT_KEY = 'guitar_particle_onboarding_partial';

export default function DonePage() {
  const router = useRouter();

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      const partial = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || '{}');
      storage.saveUser(partial);
      localStorage.removeItem(ACCOUNT_KEY);
    }
    storage.setOnboarded();
    router.replace('/');
  };

  return (
    <>
      <CrossLitHalos intensity="high" />
      <StatusBar />

      <div className="absolute top-[110px] left-0 right-0 flex justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: [1, 1.06, 1], opacity: 1 }}
          transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
        >
          <Plectrum variant="gaseous" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="absolute top-[330px] left-0 right-0 px-8 text-center"
      >
        <h1 className="text-3xl font-medium tracking-tight text-text leading-tight mb-3">
          You&apos;re all set
        </h1>
        <p className="text-sm text-text/65 leading-relaxed">
          Hold up your phone, tap the plectrum, and we&apos;ll find the chords.
        </p>
      </motion.div>

      <button
        onClick={handleFinish}
        className="absolute bottom-[60px] left-4 right-4 h-12 rounded-2xl bg-amber text-bg-primary text-sm font-semibold shadow-cta-amber"
      >
        Finish setup
      </button>

      <Indicator step={5} />
      <HomeIndicator />
    </>
  );
}
