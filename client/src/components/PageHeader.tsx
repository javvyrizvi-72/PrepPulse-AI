import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="data-label">{eyebrow}</p>}
        <h1 className="mt-1.5 text-[24px] font-semibold tracking-[-0.028em] text-ink-900 sm:text-[28px] dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-[62ch] text-[13px] leading-relaxed text-ink-500 dark:text-ink-400">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function DifficultyChip({ difficulty }: { difficulty: string }) {
  const tone =
    difficulty === 'easy'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
      : difficulty === 'hard'
        ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
        : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300';
  return <span className={`chip capitalize ${tone}`}>{difficulty}</span>;
}
