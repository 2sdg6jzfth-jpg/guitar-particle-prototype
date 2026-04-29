type Props = { children: React.ReactNode };

export function PhoneFrame({ children }: Props) {
  return (
    <div className="phone-frame-wrapper min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div
        className="phone-frame w-[320px] h-[720px] rounded-[36px] bg-bg-primary relative overflow-hidden text-text font-sans"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(245,235,215,0.06), 0 30px 80px rgba(0,0,0,0.5)' }}
      >
        {children}
      </div>
    </div>
  );
}
