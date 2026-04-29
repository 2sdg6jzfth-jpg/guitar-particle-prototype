'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { OnboardingIndicator } from '@/components/onboarding-indicator';
import { ChevronLeft } from 'lucide-react';

const ACCOUNT_KEY = 'guitar_particle_onboarding_partial';

export default function AccountPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const canContinue = firstName.trim() && email.trim().includes('@');

  const handleContinue = () => {
    if (!canContinue) return;
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || '{}');
      localStorage.setItem(
        ACCOUNT_KEY,
        JSON.stringify({ ...existing, firstName, lastName, email })
      );
    }
    router.push('/onboarding/about');
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

      <div className="absolute top-[100px] left-0 right-0 px-6">
        <h1 className="text-2xl font-medium tracking-tight text-text leading-tight mb-2">
          Let&apos;s get to know you
        </h1>
        <p className="text-sm text-text/55 leading-relaxed">
          Just a couple basics so we can personalize your library.
        </p>
      </div>

      <div className="absolute top-[230px] left-4 right-4 flex flex-col gap-3">
        <Field label="First name" value={firstName} onChange={setFirstName} placeholder="Sam" />
        <Field label="Last name" value={lastName} onChange={setLastName} placeholder="Optional" />
        <Field
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          type="email"
        />
      </div>

      <button
        onClick={handleContinue}
        disabled={!canContinue}
        className={`absolute bottom-[60px] left-4 right-4 h-12 rounded-2xl text-sm font-semibold flex items-center justify-center transition-opacity ${
          canContinue
            ? 'bg-amber text-bg-primary shadow-cta-amber'
            : 'bg-amber/30 text-bg-primary/60'
        }`}
      >
        Continue
      </button>

      <OnboardingIndicator step={2} />
      <HomeIndicator />
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-text/45 font-medium block mb-1.5 px-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-text/[0.04] border border-text/[0.1] rounded-xl px-3.5 h-12 text-sm text-text placeholder:text-text/35 outline-none focus:border-amber/50 transition-colors"
      />
    </div>
  );
}
