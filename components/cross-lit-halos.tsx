type Props = { intensity?: 'low' | 'medium' | 'high' };

export function CrossLitHalos({ intensity = 'medium' }: Props) {
  const opacityMap = { low: 0.18, medium: 0.32, high: 0.42 };
  const o = opacityMap[intensity];

  return (
    <>
      <div
        className="absolute -top-32 -left-28 w-[340px] h-[340px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(232,160,74,${o}) 0%, rgba(255,216,154,${o * 0.42}) 30%, transparent 70%)`,
        }}
      />
      <div
        className="absolute -bottom-36 -right-32 w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(63,190,212,${o * 0.86}) 0%, rgba(168,233,244,${o * 0.38}) 30%, transparent 70%)`,
        }}
      />
    </>
  );
}
