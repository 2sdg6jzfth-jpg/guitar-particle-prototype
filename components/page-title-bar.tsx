'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Props = { title: string; rightAction?: React.ReactNode; backHref?: string };

export function PageTitleBar({ title, rightAction, backHref }: Props) {
  const router = useRouter();
  const onBack = () => (backHref ? router.push(backHref) : router.back());
  return (
    <div className="absolute top-12 left-0 right-0 flex items-center justify-between px-3.5 h-10 z-10">
      <button onClick={onBack} aria-label="Back" className="w-10 h-10 flex items-center justify-center -ml-2">
        <ChevronLeft size={28} strokeWidth={2.5} className="text-text" />
      </button>
      <h1 className="text-base font-medium text-text">{title}</h1>
      <div className="w-10 h-10 flex items-center justify-center">{rightAction}</div>
    </div>
  );
}
