type Props = { variant: string; size?: number; rounded?: string };

const GRADIENTS: Record<string, string> = {
  'gradient-wonderwall':
    'linear-gradient(135deg, #FFD89A 0%, #FFB661 50%, #5DD3E8 100%)',
  'gradient-1': 'linear-gradient(135deg, #FFB661, #5DD3E8)',
  'gradient-2': 'linear-gradient(135deg, #A8E9F4, #FFD89A)',
  'gradient-3': 'linear-gradient(135deg, #FFD89A, #E24B4A)',
  'gradient-4': 'linear-gradient(135deg, #5DD3E8, #14181F)',
  'gradient-5': 'linear-gradient(135deg, #FFE9C0, #FFB661)',
  'gradient-6': 'linear-gradient(135deg, #5DD3E8, #FFD89A)',
  'gradient-7': 'linear-gradient(135deg, #FFB661, #A8E9F4)',
  'gradient-8': 'linear-gradient(135deg, #FFD89A, #5DD3E8)',
  'gradient-9': 'linear-gradient(135deg, #A8E9F4, #FFB661)',
  default: 'linear-gradient(135deg, #FFD89A, #5DD3E8)',
};

export function Cover({ variant, size = 56, rounded = 'rounded-xl' }: Props) {
  const bg = GRADIENTS[variant] ?? GRADIENTS.default;
  return (
    <div
      className={`flex-shrink-0 ${rounded}`}
      style={{
        width: size,
        height: size,
        background: bg,
        boxShadow: 'inset 0 0 0 1px rgba(245,235,215,0.08), 0 4px 14px rgba(0,0,0,0.35)',
      }}
    />
  );
}
