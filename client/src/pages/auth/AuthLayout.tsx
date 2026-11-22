import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState, type ReactNode } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';

/** Split auth layout: form on the left, a quiet product panel on the right. */
export function AuthLayout({
  children,
  panel,
}: {
  children: ReactNode;
  panel: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-ink-50 dark:bg-ink-950">
      <div className="grid min-h-dvh lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col px-5 py-6 sm:px-10 lg:px-14">
          <div className="flex items-center justify-between">
            <Link to="/" aria-label="PrepPulse AI home">
              <Logo />
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-[12.5px] font-medium text-ink-500 transition hover:text-ink-800 dark:text-ink-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Home
              </Link>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-[400px]">{children}</div>
          </div>

          <p className="text-center text-[11px] text-ink-400">
            Phase 1 preview · password hashing and JWT auth enabled
          </p>
        </div>

        <div className="relative hidden overflow-hidden border-l border-ink-200/70 bg-white lg:block dark:border-ink-800 dark:bg-ink-900/40">
          <div className="absolute inset-0 grain opacity-70" aria-hidden="true" />
          <div
            className="absolute -right-24 top-1/4 h-[420px] w-[420px] rounded-full bg-indigo-200/40 blur-[100px] dark:bg-indigo-600/15"
            aria-hidden="true"
          />
          <div className="relative flex h-full flex-col justify-center p-12 xl:p-16">{panel}</div>
        </div>
      </div>
    </div>
  );
}

/** Redirects signed-in users away from auth pages. */
export function AlreadySignedIn({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [dismissed] = useState(false);
  void navigate;
  void dismissed;
  const from = (location.state as { from?: string } | null)?.from;
  if (from === '/login' || from === '/register') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10.5px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
      <ShieldCheck className="h-3 w-3" />
      Seeded demo
    </span>
  );
}
