'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onboarded = storage.isOnboarded();
    const isOnboardingRoute = pathname.startsWith('/onboarding');
    if (!onboarded && !isOnboardingRoute) {
      router.replace('/onboarding/welcome');
      return;
    }
    setReady(true);
  }, [pathname, router]);

  // Render nothing during the redirect flicker
  if (!ready) return <div className="absolute inset-0 bg-bg-primary" />;
  return <>{children}</>;
}
