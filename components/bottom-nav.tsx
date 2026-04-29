'use client';

import { Search, Music, Home, Sparkles, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/chords', icon: Music, label: 'Chords' },
  { href: '/', icon: Home, label: 'Home' },
  { href: '/for-you', icon: Sparkles, label: 'For you' },
  { href: '/library', icon: Bookmark, label: 'Library' },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[74px] bg-bg-primary/95 backdrop-blur-md border-t border-text/10 flex items-center justify-around px-1.5 z-30">
      {tabs.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className="flex-1 flex items-center justify-center py-4 h-full"
          >
            <Icon size={28} strokeWidth={2} className={isActive ? 'text-amber' : 'text-text'} />
          </Link>
        );
      })}
    </div>
  );
}
