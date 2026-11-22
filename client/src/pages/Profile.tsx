import { useState } from 'react';
import {
  AlertCircle,
  Check,
  KeyRound,
  Loader2,
  LogOut,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError, type User } from '../lib/api';
import { useAuth } from '../lib/auth';
import { PageHeader } from '../components/PageHeader';
import { formatDate } from '../lib/format';

const LEVELS = ['fresher', '1-3 years', '3+ years'] as const;
const ROLES = [
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'Data Scientist',
  'ML Engineer',
  'SDE Intern',
  'Platform Admin',
];

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    targetRole: user?.targetRole || 'Full Stack Developer',
    experienceLevel: (user?.experienceLevel as (typeof LEVELS)[number]) || 'fresher',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const dirty =
    form.name !== user.name ||
    form.targetRole !== user.targetRole ||
    form.experienceLevel !== user.experienceLevel;

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      const res = await api.updateProfile(form);
      updateUser(res.user as User);
      setProfileMsg({ tone: 'ok', text: 'Profile updated.' });
    } catch (err) {
      setProfileMsg({
        tone: 'err',
        text: err instanceof ApiError ? err.message : 'Could not save your profile.',
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pw.next !== pw.confirm) {
      setPwMsg({ tone: 'err', text: 'New passwords do not match.' });
      return;
    }
    if (pw.next.length < 8) {
      setPwMsg({ tone: 'err', text: 'New password must be at least 8 characters.' });
      return;
    }
    setSavingPw(true);
    try {
      await api.changePassword({ currentPassword: pw.current, newPassword: pw.next });
      setPw({ current: '', next: '', confirm: '' });
      setPwMsg({ tone: 'ok', text: 'Password changed. Use it next time you sign in.' });
    } catch (err) {
      setPwMsg({
        tone: 'err',
        text: err instanceof ApiError ? err.message : 'Could not update your password.',
      });
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Your account"
        title="Profile"
        description="Keep your target role current — the dashboard frames readiness around it, and question recommendations follow the same goal."
      />

      {/* Identity card */}
      <section className="surface overflow-hidden">
        <div className="flex flex-wrap items-center gap-4 border-b border-ink-100 bg-ink-100/60 px-5 py-5 dark:border-ink-800 dark:bg-ink-950/40">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-600 font-display text-[19px] font-semibold text-white shadow-sm">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-ink-900 dark:text-white">
              {user.name}
            </h2>
            <p className="truncate text-[12.5px] text-ink-500 dark:text-ink-400">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="chip border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                <UserRound className="h-3 w-3" />
                {user.role === 'admin' ? 'Administrator' : 'Student'}
              </span>
              <span className="chip border-ink-200 bg-white text-ink-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300">
                <Target className="h-3 w-3" />
                {user.targetRole}
              </span>
              <span className="chip border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <Sparkles className="h-3 w-3" />
                {user.streakCount} day streak
              </span>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 divide-x divide-ink-100 sm:grid-cols-3 dark:divide-ink-800">
          <div className="px-5 py-3.5">
            <dt className="data-label">Experience</dt>
            <dd className="mt-1 text-[13px] font-medium capitalize text-ink-800 dark:text-ink-100">
              {user.experienceLevel}
            </dd>
          </div>
          <div className="px-5 py-3.5">
            <dt className="data-label">Account</dt>
            <dd className="mt-1 text-[13px] font-medium capitalize text-ink-800 dark:text-ink-100">
              {user.role}
            </dd>
          </div>
          <div className="col-span-2 px-5 py-3.5 sm:col-span-1">
            <dt className="data-label">Member since</dt>
            <dd className="mt-1 text-[13px] font-medium text-ink-800 dark:text-ink-100">
              {formatDate(new Date().toISOString())}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Profile details */}
        <section className="surface p-5">
          <h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink-900 dark:text-white">
            <UserRound className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Personal details
          </h2>
          <p className="mt-0.5 text-[11.5px] text-ink-400">
            Your email is your login and cannot be changed here.
          </p>

          <form onSubmit={saveProfile} className="mt-4 space-y-3.5">
            <div>
              <label htmlFor="p-name" className="mb-1.5 block text-[12px] font-medium text-ink-700 dark:text-ink-300">
                Full name
              </label>
              <input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="field"
                required
              />
            </div>

            <div>
              <label htmlFor="p-email" className="mb-1.5 block text-[12px] font-medium text-ink-700 dark:text-ink-300">
                Email
              </label>
              <input
                id="p-email"
                value={user.email}
                readOnly
                disabled
                className="field cursor-not-allowed bg-ink-100/60 text-ink-500 dark:bg-ink-950"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="p-role" className="mb-1.5 block text-[12px] font-medium text-ink-700 dark:text-ink-300">
                  Target role
                </label>
                <select
                  id="p-role"
                  value={form.targetRole}
                  onChange={(e) => setForm((f) => ({ ...f, targetRole: e.target.value }))}
                  className="field"
                >
                  {Array.from(new Set([...ROLES, form.targetRole])).map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="p-level" className="mb-1.5 block text-[12px] font-medium text-ink-700 dark:text-ink-300">
                  Experience
                </label>
                <select
                  id="p-level"
                  value={form.experienceLevel}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      experienceLevel: e.target.value as (typeof LEVELS)[number],
                    }))
                  }
                  className="field"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l === 'fresher' ? 'Fresher' : l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {profileMsg && <Message tone={profileMsg.tone} text={profileMsg.text} />}

            <div className="flex items-center gap-2">
              <button type="submit" disabled={savingProfile || !dirty} className="btn-primary h-10">
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Save changes
              </button>
              {dirty && (
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      name: user.name,
                      targetRole: user.targetRole,
                      experienceLevel:
                        (user.experienceLevel as (typeof LEVELS)[number]) || 'fresher',
                    })
                  }
                  className="btn-ghost h-10"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Password + security */}
        <section className="surface p-5">
          <h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink-900 dark:text-white">
            <KeyRound className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Password
          </h2>
          <p className="mt-0.5 text-[11.5px] text-ink-400">
            Passwords are hashed with bcrypt before they reach the database.
          </p>

          <form onSubmit={savePassword} className="mt-4 space-y-3.5">
            <div>
              <label htmlFor="pw-cur" className="mb-1.5 block text-[12px] font-medium text-ink-700 dark:text-ink-300">
                Current password
              </label>
              <input
                id="pw-cur"
                type="password"
                autoComplete="current-password"
                value={pw.current}
                onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor="pw-new" className="mb-1.5 block text-[12px] font-medium text-ink-700 dark:text-ink-300">
                New password
              </label>
              <input
                id="pw-new"
                type="password"
                autoComplete="new-password"
                value={pw.next}
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor="pw-conf" className="mb-1.5 block text-[12px] font-medium text-ink-700 dark:text-ink-300">
                Confirm new password
              </label>
              <input
                id="pw-conf"
                type="password"
                autoComplete="new-password"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                className="field"
                required
              />
            </div>

            {pwMsg && <Message tone={pwMsg.tone} text={pwMsg.text} />}

            <button type="submit" disabled={savingPw} className="btn-primary h-10">
              {savingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              Update password
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-ink-200 bg-ink-50/70 p-3.5 dark:border-ink-800 dark:bg-ink-950/50">
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-700 dark:text-ink-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Session
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-400">
              Tokens expire after 7 days. Signing out clears the token from this browser.
            </p>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="btn-ghost mt-2.5 h-9 w-full"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out of this device
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Message({ tone, text }: { tone: 'ok' | 'err'; text: string }) {
  const ok = tone === 'ok';
  return (
    <div
      role={ok ? 'status' : 'alert'}
      className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[12px] ${
        ok
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
          : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
      }`}
    >
      {ok ? (
        <Check className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      {text}
    </div>
  );
}
