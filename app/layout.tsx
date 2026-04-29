import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PhoneFrame } from '@/components/phone-frame';
import { OnboardingGate } from '@/components/onboarding-gate';

export const metadata: Metadata = {
  title: 'Guitar Particle',
  description: 'Identify songs and learn chords.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0A0E18',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PhoneFrame>
          <OnboardingGate>{children}</OnboardingGate>
        </PhoneFrame>
      </body>
    </html>
  );
}
