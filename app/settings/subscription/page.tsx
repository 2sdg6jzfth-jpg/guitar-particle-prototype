'use client';

import { useEffect, useState } from 'react';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { PageTitleBar } from '@/components/page-title-bar';
import { ProPaywall } from '@/components/pro-paywall';
import { Toast } from '@/components/toast';
import { storage } from '@/lib/storage';

export default function SubscriptionPage() {
  const [isPro, setIsPro] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setIsPro(storage.isPro());
  }, []);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };

  const handleCancel = () => {
    storage.setPro(false);
    setIsPro(false);
    showToast('Pro subscription cancelled');
  };

  return (
    <>
      <CrossLitHalos intensity="low" />
      <StatusBar />
      <PageTitleBar title="Subscription" />

      <div className="absolute top-[100px] bottom-[20px] left-0 right-0 overflow-y-auto px-4 pb-6 no-scrollbar">
        {isPro ? (
          <>
            <div
              className="rounded-2xl p-4 border border-amber/30 mb-5"
              style={{
                background: 'linear-gradient(135deg, rgba(255,216,154,0.22), rgba(255,182,97,0.06))',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-amber font-medium">Active plan</span>
                <span className="px-2 py-0.5 rounded-md bg-amber text-bg-primary text-[9px] font-bold tracking-wider">
                  PRO
                </span>
              </div>
              <div className="text-xl font-medium text-text">Yearly</div>
              <div className="text-[11px] text-text/55 mt-1 tabular-nums">$15.99/year · Renews Apr 28, 2027</div>
            </div>

            <div className="text-[10px] uppercase tracking-wider text-text/45 font-medium px-1 mb-2">
              Manage
            </div>
            <div className="rounded-2xl bg-text/[0.03] border border-text/[0.07] overflow-hidden mb-5">
              <button className="w-full flex items-center justify-between px-3.5 h-12 border-b border-text/[0.06]">
                <span className="text-sm text-text">Switch to monthly</span>
                <span className="text-xs text-text/55 tabular-nums">$1.99/mo</span>
              </button>
              <button className="w-full flex items-center justify-between px-3.5 h-12 border-b border-text/[0.06]">
                <span className="text-sm text-text">Restore purchase</span>
              </button>
              <button className="w-full flex items-center justify-between px-3.5 h-12">
                <span className="text-sm text-text">Manage in App Store</span>
              </button>
            </div>

            <button
              onClick={handleCancel}
              className="w-full h-12 rounded-2xl border border-destructive/50 text-destructive text-sm font-medium"
            >
              Cancel subscription
            </button>
            <p className="text-center text-[10px] text-text/40 mt-3 px-4">
              You&apos;ll keep Pro until your renewal date.
            </p>
          </>
        ) : (
          <>
            <div
              className="rounded-2xl p-5 border border-text/[0.1] mb-5"
              style={{ background: 'linear-gradient(135deg, rgba(20,24,31,0.8), rgba(10,14,24,0.6))' }}
            >
              <div className="text-[10px] uppercase tracking-wider text-text/55 font-medium mb-1">Current plan</div>
              <div className="text-xl font-medium text-text">Free</div>
              <div className="text-[11px] text-text/55 mt-1">Limited features</div>
            </div>

            <button
              onClick={() => setPaywallOpen(true)}
              className="w-full h-12 rounded-2xl bg-amber text-bg-primary text-sm font-semibold shadow-cta-amber"
            >
              Upgrade to Pro
            </button>
            <p className="text-center text-[11px] text-text/45 mt-3">
              7-day free trial · Cancel anytime
            </p>
          </>
        )}
      </div>

      <HomeIndicator />

      <ProPaywall
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onUnlock={() => {
          setIsPro(true);
          showToast('Welcome to Pro!');
        }}
      />
      <Toast message={toast} />
    </>
  );
}
