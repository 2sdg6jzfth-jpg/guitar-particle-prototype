export function StatusBar() {
  return (
    <div className="absolute top-3.5 left-0 right-0 flex justify-between items-center px-6 text-[13px] font-medium text-text z-20 pointer-events-none">
      <span className="tabular-nums">9:41</span>
      <div className="flex items-center gap-1.5 opacity-85">
        {/* Signal */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden>
          <rect x="0" y="7" width="3" height="4" rx="0.6" />
          <rect x="4.5" y="5" width="3" height="6" rx="0.6" />
          <rect x="9" y="3" width="3" height="8" rx="0.6" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.6" />
        </svg>
        {/* Battery */}
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="currentColor" />
          <rect x="23.5" y="3.5" width="1.5" height="5" rx="0.6" fill="currentColor" />
          <rect x="2" y="2" width="18" height="8" rx="1.4" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
