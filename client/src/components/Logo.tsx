export function Logo({
  size = 'md',
  showWord = true,
  onDark = false,
}: {
  size?: 'sm' | 'md';
  showWord?: boolean;
  onDark?: boolean;
}) {
  const box = size === 'sm' ? 'h-8 w-8 rounded-[10px]' : 'h-9 w-9 rounded-[11px]';
  return (
    <span className="inline-flex select-none items-center gap-2.5">
      <span
        className={`relative grid place-items-center bg-indigo-600 ${box} shadow-[0_2px_8px_-1px_rgba(194,101,8,0.55)]`}
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <path
            d="M7 18V6h5.2a3.6 3.6 0 0 1 0 7.2H9.4"
            stroke="#FDF5E6"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16.6" cy="15.6" r="1.7" fill="#F3D49B" />
        </svg>
      </span>
      {showWord && (
        <span
          className={`font-display text-[17px] font-semibold tracking-[-0.01em] ${
            onDark ? 'text-ink-100' : 'text-ink-900 dark:text-white'
          }`}
        >
          PrepPulse
          <span className="text-indigo-600 dark:text-indigo-400"> AI</span>
        </span>
      )}
    </span>
  );
}
