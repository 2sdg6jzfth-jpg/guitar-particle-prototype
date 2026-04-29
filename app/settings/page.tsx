'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { PageTitleBar } from '@/components/page-title-bar';
import { OptionSheet } from '@/components/option-sheet';
import { Toast } from '@/components/toast';
import { storage } from '@/lib/storage';

const HAND_OPTIONS = ['Right', 'Left'];
const YEARS_OPTIONS = ['< 1 year', '1–3 years', '3–10 years', '10+ years'];
const GUITAR_OPTIONS = ['Acoustic', 'Electric', 'Classical'];
const STRUM_OPTIONS = ['Simple', 'Real'];
const GENRE_OPTIONS = [
  'Rock', 'Indie', 'Folk', 'Pop', 'Country', 'Jazz',
  'Blues', 'Metal', 'Hip-hop', 'Electronic', 'Classical', 'R&B',
];

type EditConfig = {
  field: string;
  title: string;
  options: string[];
  multi?: boolean;
  description?: string;
};

const EDIT_CONFIGS: Record<string, EditConfig> = {
  hand: { field: 'hand', title: 'Playing hand', options: HAND_OPTIONS },
  yearsPlaying: { field: 'yearsPlaying', title: 'Years playing', options: YEARS_OPTIONS },
  guitarType: { field: 'guitarType', title: 'Guitar type', options: GUITAR_OPTIONS },
  defaultStrum: { field: 'defaultStrum', title: 'Default strum', options: STRUM_OPTIONS },
  genres: {
    field: 'genres',
    title: 'Music you like',
    options: GENRE_OPTIONS,
    multi: true,
    description: 'Pick as many as you want',
  },
};

export default function SettingsPage() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [haptics, setHaptics] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [editing, setEditing] = useState<EditConfig | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(storage.getUser());
    setIsPro(storage.isPro());
  }, []);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };

  const handleSave = (newValue: string | string[]) => {
    if (!editing) return;
    storage.updateUser({ [editing.field]: newValue });
    setUser(storage.getUser());
    showToast('Updated');
  };

  // Display string for current value of an editable field
  const displayValue = (field: string): string => {
    const v = user?.[field];
    if (Array.isArray(v)) return v.length === 0 ? 'None' : v.join(', ');
    if (typeof v === 'string' && v) return v;
    // sensible defaults if not set
    const defaults: Record<string, string> = {
      hand: 'Right',
      yearsPlaying: '< 1 year',
      guitarType: 'Acoustic',
      defaultStrum: 'Real',
      genres: 'None',
    };
    return defaults[field] ?? '—';
  };

  const currentValue = (field: string): string | string[] => {
    const v = user?.[field];
    if (EDIT_CONFIGS[field]?.multi) {
      return Array.isArray(v) ? v : [];
    }
    return (typeof v === 'string' && v) || displayValue(field);
  };

  const resetOnboarding = () => {
    storage.resetOnboarding();
    router.push('/onboarding/welcome');
  };

  return (
    <>
      <CrossLitHalos intensity="low" />
      <StatusBar />
      <PageTitleBar title="Settings" />

      <div className="absolute top-[100px] bottom-[20px] left-0 right-0 overflow-y-auto px-4 pb-6 no-scrollbar">
        {/* Profile card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-text/[0.04] border border-text/[0.08] mb-5">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold text-bg-primary flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FFD89A, #5DD3E8)' }}
          >
            {((user?.firstName as string) ?? 'G')[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-text truncate">
              {(user?.firstName as string) ?? 'Guitarist'} {(user?.lastName as string) ?? ''}
            </div>
            <div className="text-xs text-text/55 truncate">
              {(user?.email as string) ?? 'you@example.com'}
            </div>
          </div>
          {isPro && (
            <span className="px-2 py-0.5 rounded-md bg-amber text-bg-primary text-[9px] font-bold tracking-wider">
              PRO
            </span>
          )}
        </div>

        {/* Playing preferences */}
        <SectionHeader>Playing preferences</SectionHeader>
        <Section>
          <EditRow
            label="Hand"
            value={displayValue('hand')}
            onClick={() => setEditing(EDIT_CONFIGS.hand)}
          />
          <EditRow
            label="Years playing"
            value={displayValue('yearsPlaying')}
            onClick={() => setEditing(EDIT_CONFIGS.yearsPlaying)}
          />
          <EditRow
            label="Guitar type"
            value={displayValue('guitarType')}
            onClick={() => setEditing(EDIT_CONFIGS.guitarType)}
          />
          <EditRow
            label="Default strum"
            value={displayValue('defaultStrum')}
            onClick={() => setEditing(EDIT_CONFIGS.defaultStrum)}
            isLast
          />
        </Section>

        {/* Music */}
        <SectionHeader>Music</SectionHeader>
        <Section>
          <EditRow
            label="Genres"
            value={displayValue('genres')}
            onClick={() => setEditing(EDIT_CONFIGS.genres)}
          />
          <EditRow
            label="Apple Music"
            value="Connect"
            onClick={() => showToast('Would open Apple Music auth')}
          />
          <EditRow
            label="Spotify"
            value="Connected"
            onClick={() => showToast('Would open Spotify settings')}
            isLast
          />
        </Section>

        {/* App */}
        <SectionHeader>App</SectionHeader>
        <Section>
          <StaticRow label="Microphone" value="Allowed" />
          <ToggleRow label="Notifications" value={notifications} onChange={setNotifications} />
          <ToggleRow label="Haptics" value={haptics} onChange={setHaptics} isLast />
        </Section>

        {/* Subscription */}
        <SectionHeader>Subscription</SectionHeader>
        <Section>
          <LinkRow
            label={isPro ? 'Manage Pro' : 'Upgrade to Pro'}
            href="/settings/subscription"
            isLast
          />
        </Section>

        {/* Support */}
        <SectionHeader>Support</SectionHeader>
        <Section>
          <EditRow label="Help center" onClick={() => showToast('Help is in the main app')} />
          <EditRow label="Privacy policy" onClick={() => showToast('Privacy policy: prototype')} />
          <EditRow
            label="Terms of service"
            onClick={() => showToast('Terms: prototype')}
            isLast
          />
        </Section>

        {/* Account */}
        <Section>
          <button
            onClick={() => showToast('Sign out is disabled in prototype')}
            className="flex items-center justify-between w-full px-3.5 h-12"
          >
            <span className="text-sm text-destructive">Sign out</span>
          </button>
        </Section>

        <button
          onClick={resetOnboarding}
          className="w-full text-center text-[11px] text-text/35 mt-4"
        >
          Reset onboarding (prototype)
        </button>
        <p className="text-center text-[10px] text-text/25 mt-2">
          Guitar Particle prototype · v0.1
        </p>
      </div>

      <HomeIndicator />

      <OptionSheet
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.title ?? ''}
        description={editing?.description}
        options={editing?.options ?? []}
        value={editing ? currentValue(editing.field) : ''}
        multi={editing?.multi}
        onSave={handleSave}
      />

      <Toast message={toast} />
    </>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider text-text/45 font-medium px-1 mb-2">
      {children}
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-text/[0.03] border border-text/[0.07] overflow-hidden mb-5">
      {children}
    </div>
  );
}

function EditRow({
  label,
  value,
  onClick,
  isLast,
}: {
  label: string;
  value?: string;
  onClick: () => void;
  isLast?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-3.5 h-12 active:bg-text/[0.04] ${
        isLast ? '' : 'border-b border-text/[0.06]'
      }`}
    >
      <span className="text-sm text-text">{label}</span>
      <div className="flex items-center gap-1.5 max-w-[60%]">
        {value && (
          <span className="text-xs text-text/55 truncate">{value}</span>
        )}
        <ChevronRight size={16} strokeWidth={2} className="text-text/35 flex-shrink-0" />
      </div>
    </button>
  );
}

function StaticRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-3.5 h-12 ${
        isLast ? '' : 'border-b border-text/[0.06]'
      }`}
    >
      <span className="text-sm text-text">{label}</span>
      <span className="text-xs text-text/55">{value}</span>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  isLast,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-3.5 h-12 ${
        isLast ? '' : 'border-b border-text/[0.06]'
      }`}
    >
      <span className="text-sm text-text">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
          value ? 'bg-amber' : 'bg-text/15'
        }`}
        aria-checked={value}
        role="switch"
      >
        <span
          className={`block w-5 h-5 rounded-full bg-bg-primary transition-transform ${
            value ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function LinkRow({
  label,
  href,
  isLast,
}: {
  label: string;
  href: string;
  isLast?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-3.5 h-12 active:bg-text/[0.04] ${
        isLast ? '' : 'border-b border-text/[0.06]'
      }`}
    >
      <span className="text-sm text-text">{label}</span>
      <ChevronRight size={16} strokeWidth={2} className="text-text/35" />
    </Link>
  );
}
