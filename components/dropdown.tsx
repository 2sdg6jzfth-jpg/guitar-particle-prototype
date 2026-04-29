'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

type Option = { value: string; label: string; suffix?: string };

type Props = {
  label?: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
};

export function Dropdown({ label, options, value, onChange, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between gap-1.5 w-full bg-text/[0.04] border border-text/[0.1] rounded-xl px-3 h-9"
      >
        <div className="flex flex-col items-start leading-none">
          {label && <span className="text-[8px] uppercase tracking-wider text-text/50 mb-0.5">{label}</span>}
          <span className="text-xs font-medium text-text">{selected?.label ?? value}</span>
        </div>
        <ChevronDown size={12} strokeWidth={2.5} className="text-amber" />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-40 bg-bg-surface border border-text/10 rounded-xl shadow-sheet overflow-hidden max-h-[260px] overflow-y-auto">
          {options.map(o => (
            <button
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-xs ${
                o.value === value ? 'text-amber bg-amber/[0.08]' : 'text-text hover:bg-text/[0.04]'
              }`}
            >
              <span className="font-medium">
                {o.label}
                {o.suffix && <span className="ml-1.5 text-text/40 font-normal">{o.suffix}</span>}
              </span>
              {o.value === value && <Check size={12} strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
