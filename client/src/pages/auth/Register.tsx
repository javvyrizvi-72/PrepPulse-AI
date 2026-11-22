import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AlertCircle, ArrowRight, Check, Loader2, UserPlus } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { useAuth } from '../../lib/auth';
import { ApiError } from '../../lib/api';

const LEVELS = ['fresher', '1-3 years', '3+ years'] as const;

const ROLES = [
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'Data Scientist',
  'ML Engineer',
  'SDE Intern',
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    targetRole: 'Full Stack Developer',
    experienceLevel: 'fresher' as (typeof LEVELS)[number],
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const strength = passwordStrength(form.password);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to create your account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      panel={
        <div className="max-w-[360px]">
          <p className="data-label">Why students stay</p>
          <h2 className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink-900 dark:text-white">
            Your first dashboard
            <br />
            starts honest.
          </h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-500 dark:text-ink-400">
            New accounts begin with zero sessions. That is deliberate: the trend line only means
            something once it reflects your own answers.
          </p>

          <ul className="mt-7 space-y-3">
            {[
              'Accounts are always created as students — admin is never self-service',
              'Passwords are hashed with bcrypt before they touch the database',
              'Readiness updates after every graded session',
              'Four tracks scored independently',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                  <Check className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                </span>
                <span className="text-[12.5px] leading-relaxed text-ink-600 dark:text-ink-300">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-xl border border-dashed border-ink-200 p-3.5 dark:border-ink-700">
            <p className="text-[11.5px] leading-relaxed text-ink-400">
              Want to see a populated dashboard first? Use the{' '}
              <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400">
                demo student login
              </Link>
              .
            </p>
          </div>
        </div>
      }
    >
      <div>
        <h1 className="text-[25px] font-semibold tracking-[-0.025em] text-ink-900 dark:text-white">
          Create your account
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-500 dark:text-ink-400">
          Free, and always a student account.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3.5" noValidate>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-[12.5px] font-medium text-ink-700 dark:text-ink-300">
              Full name
            </label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Aarav Sharma"
              autoComplete="name"
              className="field"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-[12.5px] font-medium text-ink-700 dark:text-ink-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@college.edu"
              autoComplete="email"
              className="field"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-[12.5px] font-medium text-ink-700 dark:text-ink-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className="field"
              required
            />
            {form.password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full transition ${
                        strength.score > i
                          ? strength.score === 1
                            ? 'bg-rose-400'
                            : strength.score === 2
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                          : 'bg-ink-200 dark:bg-ink-800'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10.5px] font-medium text-ink-400">{strength.label}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="role" className="mb-1.5 block text-[12.5px] font-medium text-ink-700 dark:text-ink-300">
                Target role
              </label>
              <select
                id="role"
                value={form.targetRole}
                onChange={(e) => set('targetRole', e.target.value)}
                className="field appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238d97a8' stroke-width='2.2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                }}
              >
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="level" className="mb-1.5 block text-[12.5px] font-medium text-ink-700 dark:text-ink-300">
                Experience
              </label>
              <select
                id="level"
                value={form.experienceLevel}
                onChange={(e) => set('experienceLevel', e.target.value as (typeof LEVELS)[number])}
                className="field appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238d97a8' stroke-width='2.2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                }}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l === 'fresher' ? 'Fresher' : l}
                  </option>
                ))}
              </select>
            </div>
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

          <button type="submit" disabled={busy} className="btn-primary h-11 w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create account
          </button>
        </form>

        <p className="mt-5 text-center text-[12.5px] text-ink-500 dark:text-ink-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="inline-flex items-center gap-0.5 font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400"
          >
            Sign in
            <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1;
  const capped = Math.min(3, Math.max(1, score));
  return {
    score: pw.length < 8 ? 1 : capped,
    label: pw.length < 8 ? 'Too short' : capped >= 3 ? 'Strong' : capped === 2 ? 'Good' : 'Weak',
  };
}
