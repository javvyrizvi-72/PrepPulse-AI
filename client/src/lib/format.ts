export const CATEGORY_META: Record<
  string,
  { short: string; hex: string; dot: string; text: string; bg: string; border: string }
> = {
  'MERN Stack': {
    short: 'MERN',
    hex: '#D97706',
    dot: 'bg-indigo-500',
    text: 'text-indigo-700 dark:text-indigo-300',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    border: 'border-indigo-200/70 dark:border-indigo-500/25',
  },
  'Python & Data Science': {
    short: 'Python',
    hex: '#6B7F5E',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200/70 dark:border-emerald-500/25',
  },
  'DSA & Problem Solving': {
    short: 'DSA',
    hex: '#B4543A',
    dot: 'bg-violet-500',
    text: 'text-violet-700 dark:text-violet-300',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    border: 'border-violet-200/70 dark:border-violet-500/25',
  },
  'Aptitude & Logic': {
    short: 'Aptitude',
    hex: '#C08A17',
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200/70 dark:border-amber-500/25',
  },
};

export function categoryMeta(category: string) {
  return (
    CATEGORY_META[category] || {
      short: category,
      hex: '#5f6b7f',
      dot: 'bg-ink-400',
      text: 'text-ink-600 dark:text-ink-300',
      bg: 'bg-ink-100 dark:bg-ink-800',
      border: 'border-ink-200 dark:border-ink-700',
    }
  );
}

export function readinessTone(level: string) {
  switch (level) {
    case 'Interview Ready':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300';
    case 'Nearly Ready':
      return 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300';
    case 'Developing':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300';
    default:
      return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300';
  }
}

export function scoreTone(score: number) {
  if (score >= 8) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 6.5) return 'text-indigo-600 dark:text-indigo-400';
  if (score >= 4.5) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function relativeDay(iso: string) {
  const d = new Date(iso);
  const diff = Math.round((Date.now() - d.getTime()) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return formatDate(iso);
}
