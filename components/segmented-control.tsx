'use client';

type Props<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
}: Props<T>) {
  const heights = { sm: 'h-7', md: 'h-9' };
  const padX = { sm: 'px-2', md: 'px-3' };

  return (
    <div
      className={`flex bg-text/[0.04] border border-text/10 rounded-[14px] p-[3px] gap-[1px] ${heights[size]} box-border ${className}`}
    >
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 ${padX[size]} text-xs font-medium rounded-[11px] transition-colors ${
            value === opt ? 'bg-amber text-bg-primary' : 'bg-transparent text-text'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
