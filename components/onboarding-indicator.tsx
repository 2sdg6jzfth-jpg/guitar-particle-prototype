type Props = { step: number };

export function OnboardingIndicator({ step }: Props) {
  return (
    <div className="absolute bottom-[120px] left-0 right-0 flex justify-center gap-1.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`h-1 rounded-full transition-all ${
            i === step ? 'w-6 bg-amber' : 'w-1 bg-text/25'
          }`}
        />
      ))}
    </div>
  );
}
