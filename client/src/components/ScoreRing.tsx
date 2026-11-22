import type { ReactNode } from 'react';

export function ScoreRing({
  value,
  max = 10,
  size = 92,
  label,
  tone = 'indigo',
}: {
  value: number;
  max?: number;
  size?: number;
  label?: ReactNode;
  tone?: 'indigo' | 'emerald' | 'amber';
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  const stroke = size >= 80 ? 7 : 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const colors = {
    indigo: '#C26508',
    emerald: '#6B7F5E',
    amber: '#C08A17',
  } as const;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-ink-100 dark:stroke-ink-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colors[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          style={{ transition: 'stroke-dasharray 700ms cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center leading-none">
        <span
          className="font-semibold tracking-[-0.03em] text-ink-900 dark:text-white"
          style={{ fontSize: size * 0.26 }}
        >
          {value}
        </span>
        {label && <span className="mt-1 text-[10px] font-medium text-ink-400">{label}</span>}
      </div>
    </div>
  );
}
