import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { ArrowRight, AlertCircle, Crown, Loader2, LogIn, Sparkles } from 'lucide-react';
import { AuthLayout, DemoBadge } from './AuthLayout';
import { useAuth } from '../../lib/auth';
import { ApiError, DEMO_ADMIN, DEMO_STUDENT } from '../../lib/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'form' | 'student' | 'admin' | null>(null);

  const next = params.get('next') || '/dashboard';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy('form');
    try {
      await login(email.trim(), password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in.');
    } finally {
      setBusy(null);
    }
  }

  async function demo(kind: 'student' | 'admin') {
    setError(null);
    setBusy(kind);
    const creds = kind === 'student' ? DEMO_STUDENT : DEMO_ADMIN;
    try {
      setEmail(creds.email);
      setPassword(creds.password);
      await login(creds.email, creds.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Demo login unavailable. Make sure the API is running and seeded.'
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <AuthLayout
      panel={
        <div className="max-w-[360px]">
          <p className="data-label">Inside the demo</p>
          <h2 className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink-900 dark:text-white">
            Six sessions.
            <br />
            Already graded.
          </h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-500 dark:text-ink-400">
            The seeded student account opens onto a populated dashboard: a rising score trend, four
            track breakdowns and a recent-session table.
          </p>

          <div className="mt-7 space-y-2.5">
            {[
              ['Overall readiness', '7.9 / 10', 'text-emerald-600 dark:text-emerald-400'],
              ['Strongest track', 'MERN Stack', 'text-indigo-600 dark:text-indigo-400'],
              ['Focus next', 'Aptitude & Logic', 'text-amber-600 dark:text-amber-400'],
              ['Practice accuracy', '85%', 'text-ink-900 dark:text-white'],
            ].map(([label, value, tone]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-ink-200/80 bg-ink-50/70 px-3.5 py-2.5 dark:border-ink-800 dark:bg-ink-950/50"
              >
                <span className="text-[12px] text-ink-500 dark:text-ink-400">{label}</span>
                <span className={`font-mono text-[12.5px] font-semibold ${tone}`}>{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 border-t border-ink-200/80 pt-5 dark:border-ink-800">
            <p className="text-[11.5px] leading-relaxed text-ink-400">
              Demo credentials are pre-filled when you press a button below — no typing, no
              clipboard.
            </p>
          </div>
        </div>
      }
    >
      <div>
        <h1 className="text-[25px] font-semibold tracking-[-0.025em] text-ink-900 dark:text-white">
          Sign in
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-500 dark:text-ink-400">
          Continue your placement prep where you left off.
        </p>

        {/* One-click demos */}
        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={() => demo('student')}
            disabled={busy !== null}
            className="group flex w-full items-center gap-3 rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40 disabled:opacity-60 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/5"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white">
              {busy === 'student' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-ink-900 dark:text-white">
                Demo student login
                <DemoBadge />
              </span>
              <span className="mt-0.5 block truncate text-[11.5px] text-ink-400">
                student@preppulse.ai · seeded history
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
          </button>

          <button
            type="button"
            onClick={() => demo('admin')}
            disabled={busy !== null}
            className="group flex w-full items-center gap-3 rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40 disabled:opacity-60 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/5"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white">
              {busy === 'admin' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Crown className="h-4 w-4" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-ink-900 dark:text-white">
                Demo admin login
                <DemoBadge />
              </span>
              <span className="mt-0.5 block truncate text-[11.5px] text-ink-400">
                admin@preppulse.ai · role guard preview
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-500" />
          </button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-ink-200 dark:bg-ink-800" />
          <span className="text-[11px] font-medium text-ink-400">or use your account</span>
          <span className="h-px flex-1 bg-ink-200 dark:bg-ink-800" />
        </div>

        <form onSubmit={submit} className="space-y-3.5" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[12.5px] font-medium text-ink-700 dark:text-ink-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              className="field"
              required
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="block text-[12.5px] font-medium text-ink-700 dark:text-ink-300">
                Password
              </label>
              <span className="text-[11px] text-ink-400">Forgot password? Phase 2</span>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="field"
              required
            />
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[12.5px] text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button type="submit" disabled={busy !== null} className="btn-primary h-11 w-full">
            {busy === 'form' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            Sign in
          </button>
        </form>

        <p className="mt-5 text-center text-[12.5px] text-ink-500 dark:text-ink-400">
          New here?{' '}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400"
          >
            Create a free account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
