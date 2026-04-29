'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { OnboardingIndicator } from '@/components/onboarding-indicator';
import { ChevronLeft, Mic } from 'lucide-react';

export default function PermissionPage() {
  const router = useRouter();
  const [requesting, setRequesting] = useState(false);

  const handleAllow = async () => {
    setRequesting(true);
    try {
      // Try to actually request mic permission; fail silently in environments without it.
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      }
    } catch {
      // ignore — prototype only
    }
    router.push('/onboarding/done');
  };

  return (
    <>
      <CrossLitHalos intensity="high" />
      <StatusBar />

      <button
        onClick={() => router.back()}
        aria-label="Back"
        className="absolute top-12 left-1.5 w-10 h-10 flex items-center justify-center z-10"
      >
        <ChevronLeft size={28} strokeWidth={2.5} className="text-text" />
      </button>

      <div className="absolute top-[150px] left-0 right-0 flex flex-col items-center px-8 text-center">
        <div className="w-20 h-20 rounded-full bg-amber/15 border border-amber/35 flex items-center justify-center mb-6">
          <Mic size={36} strokeWidth={2} className="text-amber" />
        </div>
        <h1 className="text-2xl font-medium tracking-tight text-text leading-tight mb-3">
          Listen to identify
        </h1>
        <p className="text-sm text-text/65 leading-relaxed max-w-[260px]">
          We need microphone access so Guitar Particle can hear what&apos;s playing and find chords for you.
        </p>
      </div>

      <div className="absolute top-[420px] left-0 right-0 px-6 flex flex-col gap-2.5">
        <Bullet>Audio is processed only when you tap Listen.</Bullet>
        <Bullet>Nothing is recorded or saved.</Bullet>
        <Bullet>You can revoke access anytime in Settings.</Bullet>
      </div>

      <div className="absolute bottom-[60px] left-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleAllow}
          disabled={requesting}
          className="w-full h-12 rounded-2xl bg-amber text-bg-primary text-sm font-semibold shadow-cta-amber disabled:opacity-60"
        >
          {requesting ? 'Requesting…' : 'Allow microphone'}
        </button>
        <button
          onClick={() => router.push('/onboarding/done')}
          className="w-full h-10 text-text/55 text-[13px] font-medium"
        >
          Skip for now
        </button>
      </div>

      <OnboardingIndicator step={4} />
      <HomeIndicator />
    </>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="w-1 h-1 rounded-full bg-amber mt-2 flex-shrink-0" />
      <span className="text-[12px] text-text/65 leading-relaxed">{children}</span>
    </div>
  );
}
