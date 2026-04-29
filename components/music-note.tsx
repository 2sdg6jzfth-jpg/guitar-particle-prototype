export function MusicNote() {
  return (
    <svg width="130" height="150" viewBox="0 0 130 150" xmlns="http://www.w3.org/2000/svg">
      <g fill="#F5EBD7">
        <rect x="72" y="15" width="3" height="105" rx="1" />
        <path d="M 75 15 C 100 20, 108 35, 100 55 C 102 40, 90 30, 75 32 Z" />
        <ellipse cx="52" cy="118" rx="20" ry="14" transform="rotate(-22 52 118)" />
      </g>
      <line x1="75" y1="15" x2="75" y2="118" stroke="#FFD89A" strokeWidth="0.6" opacity="0.6" />
      <line x1="72" y1="15" x2="72" y2="118" stroke="#A8E9F4" strokeWidth="0.4" opacity="0.4" />
    </svg>
  );
}
