import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={dark}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-500 transition hover:text-ink-800 hover:border-ink-300 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-400 dark:hover:text-white ${className}`}
    >
      {dark ? <Sun className="h-[17px] w-[17px]" /> : <Moon className="h-[17px] w-[17px]" />}
    </button>
  );
}
