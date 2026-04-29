'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { PageTitleBar } from '@/components/page-title-bar';
import { storage } from '@/lib/storage';

type Row = { label: string; value?: string; href?: string; toggle?: boolean; danger?: boolean };

export default function SettingsPage() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [haptics, setHaptics] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setUser(storage.getUser());
    setIsPro(storage.isPro());
  }, []);

  const sections: { title?: string; rows: Row[] }[] = [
    {
      title: 'Playing preferences',
      rows: [
        { label: 'Hand', value: (user?.hand as string) ?? 'Right' },
        { label: 'Years playing', value: (user?.yearsPlaying as string) ?? '< 1 year' },
        { label: 'Guitar type', value: (user?.guitarType as string) ?? 'Acoustic' },
        { label: 'Default strum', value: (user?.defaultStrum as string) ?? 'Real' },
      ],
    },
    {
      title: 'Music',
      rows: [
        { label: 'Genres', value: 'Rock, Indie' },
        { label: 'Apple Music', value: 'Connect' },
        { label: 'Spotify', value: 'Connected' },
      ],
    },
    {
      title: 'App',
      rows: [
        { label: 'Microphone', value: 'Allowed' },
        { label: 'Notifications', toggle: true },
        { label: 'Haptics', toggle: true },
      ],
    },
    {
      title: 'Subscription',
      rows: [
        {
          label: isPro ? 'Manage Pro' : 'Upgrade to Pro',
          href: '/settings/subscription',
        },
      ],
    },
    {
      title: 'Support',
      rows: [
        { label: 'Help center' },
        { label: 'Privacy policy' },
        { label: 'Terms of service' },
      ],
    },
    {
      rows: [{ label: 'Sign out', danger: true }],
    },
  ];

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
            {(user?.firstName as string)?.[0] ?? 'G'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-text truncate">
              {(user?.firstName as string) ?? 'Guitarist'} {(user?.lastName as string) ?? ''}
            </div>
            <div className="text-xs text-text/55 truncate">{(user?.email as string) ?? 'you@example.com'}</div>
          </div>
          {isPro && (
            <span className="px-2 py-0.5 rounded-md bg-amber text-bg-primary text-[9px] font-bold tracking-wider">
              PRO
            </span>
          )}
        </div>

        {sections.map((section, i) => (
          <div key={i} className="mb-5">
            {section.title && (
              <div className="text-[10px] uppercase tracking-wider text-text/45 font-medium px-1 mb-2">
                {section.title}
              </div>
            )}
            <div className="rounded-2xl bg-text/[0.03] border border-text/[0.07] overflow-hidden">
              {section.rows.map((row, j) => {
                const isLast = j === section.rows.length - 1;
                const baseClasses = `flex items-center justify-between px-3.5 h-12 ${
                  isLast ? '' : 'border-b border-text/[0.06]'
                }`;
                if (row.toggle) {
                  const checked = row.label === 'Notifications' ? notifications : haptics;
                  const setChecked = row.label === 'Notifications' ? setNotifications : setHaptics;
                  return (
                    <div key={row.label} className={baseClasses}>
                      <span className="text-sm text-text">{row.label}</span>
                      <button
                        onClick={() => setChecked(!checked)}
                        className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
                          checked ? 'bg-amber' : 'bg-text/15'
                        }`}
                        aria-checked={checked}
                        role="switch"
                      >
                        <span
                          className={`block w-5 h-5 rounded-full bg-bg-primary transition-transform ${
                            checked ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                }
                if (row.href) {
                  return (
                    <Link key={row.label} href={row.href} className={baseClasses}>
                      <span className="text-sm text-text">{row.label}</span>
                      <ChevronRight size={16} strokeWidth={2} className="text-text/35" />
                    </Link>
                  );
                }
                return (
                  <div key={row.label} className={baseClasses}>
                    <span className={`text-sm ${row.danger ? 'text-destructive' : 'text-text'}`}>
                      {row.label}
                    </span>
                    {row.value && <span className="text-xs text-text/55">{row.value}</span>}
                    {!row.value && !row.danger && <ChevronRight size={16} strokeWidth={2} className="text-text/35" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <button
          onClick={resetOnboarding}
          className="w-full text-center text-[11px] text-text/35 mt-4"
        >
          Reset onboarding (prototype)
        </button>
        <p className="text-center text-[10px] text-text/25 mt-2">Guitar Particle prototype · v0.1</p>
      </div>

      <HomeIndicator />
    </>
  );
}
