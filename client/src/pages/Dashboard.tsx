import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  BookMarked,
  CalendarCheck,
  Flame,
  Loader2,
  RefreshCw,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, ApiError, type DashboardData } from '../lib/api';
import { useAuth } from '../lib/auth';
import { ScoreRing } from '../components/ScoreRing';
import {
  categoryMeta,
  readinessTone,
  relativeDay,
  scoreTone,
} from '../lib/format';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setError(null);
    try {
      const res = await api.dashboard();
      setData(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className="surface mx-auto mt-10 max-w-md p-8 text-center">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          <RefreshCw className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-[16px] font-semibold text-ink-900 dark:text-white">
          Dashboard unavailable
        </h2>
        <p className="mt-1.5 text-[13px] text-ink-500 dark:text-ink-400">{error}</p>
        <button onClick={() => void load()} className="btn-primary mt-5">
          Try again
        </button>
      </div>
    );
  }

  const { kpis, trend, skillBreakdown, recentSessions, focus } = data;
  const firstName = (user?.name || data.student.name).split(' ')[0];
  const empty = kpis.totalSessions === 0;

  return (
    <div className="space-y-5">
      {/* ---------- Greeting ---------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="data-label">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="mt-1.5 text-[24px] font-semibold tracking-[-0.028em] text-ink-900 sm:text-[28px] dark:text-white">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-[13px] text-ink-500 dark:text-ink-400">
            {empty
              ? 'No sessions yet — your first graded interview will start the trend line.'
              : `You are tracking ${kpis.readinessLevel.toLowerCase()} for ${data.student.targetRole}.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip border-ink-200 bg-white text-ink-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            {kpis.streak} day streak
          </span>
          <span className={`chip ${readinessTone(kpis.readinessLevel)}`}>
            <Target className="h-3.5 w-3.5" />
            {kpis.readinessLevel}
          </span>
        </div>
      </div>

      {/* ---------- KPI cards ---------- */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
        <KpiCard
          label="Readiness score"
          value={kpis.averageScore.toFixed(1)}
          suffix="/ 10"
          icon={TrendingUp}
          tone="indigo"
          hint={
            kpis.bestScore
              ? `Best session ${kpis.bestScore.toFixed(1)}`
              : 'Your average across sessions'
          }
          bar={kpis.averageScore / 10}
        />
        <KpiCard
          label="Interviews taken"
          value={String(kpis.totalSessions)}
          icon={Activity}
          tone="violet"
          hint={`${kpis.thisWeek} of ${kpis.weeklyGoal} this week`}
          bar={Math.min(1, kpis.thisWeek / kpis.weeklyGoal)}
        />
        <KpiCard
          label="Practice accuracy"
          value={`${kpis.practiceAccuracy}%`}
          icon={CalendarCheck}
          tone="emerald"
          hint="Across MCQ practice attempts"
          bar={kpis.practiceAccuracy / 100}
        />
        <KpiCard
          label="Questions banked"
          value={String(kpis.totalQuestions)}
          icon={BookMarked}
          tone="amber"
          hint={`${kpis.bookmarks} bookmarked`}
          bar={undefined}
        />
      </section>

      {/* ---------- Charts ---------- */}
      <section className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold text-ink-900 dark:text-white">
                Score trend
              </h2>
              <p className="mt-0.5 text-[12px] text-ink-400">
                Overall score per interview, oldest to newest
              </p>
            </div>
            {trend.length > 1 && (
              <span className="chip border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {delta(trend)} vs first
              </span>
            )}
          </div>

          <div className="mt-5 h-[248px] w-full">
            {trend.length === 0 ? (
              <EmptyChart message="Your score trend appears after your first graded session." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C26508" stopOpacity={0.26} />
                      <stop offset="100%" stopColor="#C26508" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 5" vertical={false} className="stroke-ink-200 dark:stroke-ink-800" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'currentColor' }}
                    className="text-ink-400"
                    dy={6}
                  />
                  <YAxis
                    domain={[0, 10]}
                    ticks={[0, 2.5, 5, 7.5, 10]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'currentColor' }}
                    className="text-ink-400"
                    width={34}
                    tickFormatter={(v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))}
                  />
                  <Tooltip content={<TrendTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#C26508"
                    strokeWidth={2.2}
                    isAnimationActive={false}
                    fill="url(#trendFill)"
                    dot={{ r: 3.4, strokeWidth: 2, fill: "#FFFFFF", stroke: '#C26508' }}
                    activeDot={{ r: 5, strokeWidth: 2, fill: '#C26508', stroke: "#FFFFFF" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="surface p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-ink-900 dark:text-white">
                Skill breakdown
              </h2>
              <p className="mt-0.5 text-[12px] text-ink-400">Technical vs communication, /10</p>
            </div>
            <div className="flex items-center gap-3 text-[10.5px] text-ink-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-indigo-500" />
                Tech
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-emerald-400" />
                Comm
              </span>
            </div>
          </div>

          <div className="mt-4 h-[248px] w-full">
            {skillBreakdown.every((s) => s.sessions === 0) ? (
              <EmptyChart message="Track scores appear once you have sessions in each category." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={skillBreakdown.map((s) => ({
                    ...s,
                    short: categoryMeta(s.category).short,
                  }))}
                  margin={{ top: 6, right: 0, left: 0, bottom: 0 }}
                  barGap={3}
                >
                  <CartesianGrid strokeDasharray="3 5" vertical={false} className="stroke-ink-200 dark:stroke-ink-800" />
                  <XAxis
                    dataKey="short"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10.5, fill: 'currentColor' }}
                    className="text-ink-400"
                    dy={6}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 10]}
                    ticks={[0, 5, 10]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10.5, fill: 'currentColor' }}
                    className="text-ink-400"
                    width={26}
                  />
                  <Tooltip content={<SkillTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                  <Bar dataKey="technical" name="Technical" fill="#D97706" radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive={false} />
                  <Bar dataKey="communication" name="Communication" fill="#6B7F5E" radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Focus strip ---------- */}
      {!empty && (
        <section className="grid gap-3 lg:grid-cols-3">
          <FocusCard
            label="Strongest track"
            value={focus.strongest || '—'}
            body="Keep a maintenance pass here, one session a week."
            tone="emerald"
          />
          <FocusCard
            label="Focus next"
            value={focus.weakest || '—'}
            body="Lowest technical average. Two sessions before the next mock."
            tone="amber"
          />
          <div className="surface flex items-center gap-4 p-4">
            <ScoreRing value={kpis.averageScore} size={68} tone={kpis.averageScore >= 8 ? 'emerald' : 'indigo'} />
            <div className="min-w-0">
              <p className="data-label">Weekly goal</p>
              <p className="mt-1 text-[14px] font-semibold text-ink-900 dark:text-white">
                {kpis.thisWeek} of {kpis.weeklyGoal} sessions
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                  style={{ width: `${Math.min(100, (kpis.thisWeek / kpis.weeklyGoal) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------- Recent sessions ---------- */}
      <section className="surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 px-5 py-4 dark:border-ink-800">
          <div>
            <h2 className="text-[15px] font-semibold text-ink-900 dark:text-white">
              Recent sessions
            </h2>
            <p className="mt-0.5 text-[12px] text-ink-400">
              {recentSessions.length
                ? `Last ${recentSessions.length} graded interviews`
                : 'No interviews recorded yet'}
            </p>
          </div>
          <span className="hidden items-center gap-1.5 text-[11px] font-medium text-ink-400 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Scored automatically
          </span>
        </div>

        {recentSessions.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-[13.5px] font-medium text-ink-700 dark:text-ink-200">
              No sessions yet
            </p>
            <p className="mx-auto mt-1 max-w-xs text-[12.5px] text-ink-400">
              Interview practice opens in Phase 2. The demo student account has six seeded sessions
              if you want to see the table populated.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-ink-100 dark:border-ink-800">
                    {['Category', 'Difficulty', 'Answers', 'Score', 'Readiness', 'When'].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((s) => {
                    const meta = categoryMeta(s.category);
                    return (
                      <tr
                        key={s.id}
                        className="group border-b border-ink-100/70 last:border-0 transition hover:bg-ink-50/70 dark:border-ink-800/70 dark:hover:bg-ink-800/30"
                      >
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-2.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            <span className="text-[13px] font-medium text-ink-800 dark:text-ink-100">
                              {s.category}
                            </span>
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[11px] font-medium capitalize text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                            {s.difficulty}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-[12px] text-ink-500 dark:text-ink-400">
                          {s.answerCount}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`font-mono text-[13px] font-semibold ${scoreTone(s.overallScore)}`}>
                            {s.overallScore.toFixed(1)}
                          </span>
                          <span className="ml-0.5 text-[11px] text-ink-300 dark:text-ink-600">/10</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`chip ${readinessTone(s.readinessLevel)}`}>
                            {s.readinessLevel}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[12px] text-ink-400">
                          {relativeDay(s.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-ink-100 sm:hidden dark:divide-ink-800">
              {recentSessions.map((s) => {
                const meta = categoryMeta(s.category);
                return (
                  <li key={s.id} className="px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-[13px] font-medium text-ink-800 dark:text-ink-100">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} />
                          <span className="truncate">{s.category}</span>
                        </p>
                        <p className="mt-1 text-[11.5px] text-ink-400">
                          {s.difficulty} · {s.answerCount} answers · {relativeDay(s.createdAt)}
                        </p>
                      </div>
                      <span className={`shrink-0 font-mono text-[15px] font-semibold ${scoreTone(s.overallScore)}`}>
                        {s.overallScore.toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className={`chip ${readinessTone(s.readinessLevel)}`}>{s.readinessLevel}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

/* ------------------------------ subcomponents ------------------------------ */

const TONES = {
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', fg: 'text-indigo-600 dark:text-indigo-300', bar: 'bg-indigo-500' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-500/10', fg: 'text-violet-600 dark:text-violet-300', bar: 'bg-violet-500' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', fg: 'text-emerald-600 dark:text-emerald-300', bar: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', fg: 'text-amber-600 dark:text-amber-300', bar: 'bg-amber-500' },
} as const;

function KpiCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone,
  hint,
  bar,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: typeof Activity;
  tone: keyof typeof TONES;
  hint: string;
  bar?: number;
}) {
  const t = TONES[tone];
  return (
    <div className="surface p-4">
      <div className="flex items-start justify-between">
        <p className="text-[11.5px] font-medium text-ink-500 dark:text-ink-400">{label}</p>
        <span className={`grid h-7 w-7 place-items-center rounded-lg ${t.bg} ${t.fg}`}>
          <Icon className="h-[15px] w-[15px]" />
        </span>
      </div>
      <p className="mt-2.5 flex items-baseline gap-1">
        <span className="font-mono text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink-900 dark:text-white">
          {value}
        </span>
        {suffix && <span className="text-[11.5px] text-ink-400">{suffix}</span>}
      </p>
      <p className="mt-2 truncate text-[11px] text-ink-400">{hint}</p>
      {bar !== undefined && (
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
          <div
            className={`h-full rounded-full ${t.bar} transition-all duration-700`}
            style={{ width: `${Math.max(2, Math.min(100, bar * 100))}%` }}
          />
        </div>
      )}
    </div>
  );
}

function FocusCard({
  label,
  value,
  body,
  tone,
}: {
  label: string;
  value: string;
  body: string;
  tone: 'emerald' | 'amber';
}) {
  const meta = categoryMeta(value);
  return (
    <div className="surface p-4">
      <div className="flex items-center justify-between">
        <p className="data-label">{label}</p>
        <span
          className={`h-2 w-2 rounded-full ${tone === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}`}
        />
      </div>
      <p className="mt-1.5 flex items-center gap-2 text-[14px] font-semibold text-ink-900 dark:text-white">
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
        {value}
      </p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-ink-400">{body}</p>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="grid h-full place-items-center rounded-xl border border-dashed border-ink-200 dark:border-ink-800">
      <p className="max-w-[220px] text-center text-[12px] leading-relaxed text-ink-400">{message}</p>
    </div>
  );
}

function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { label: string; score: number; category: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-ink-200 bg-white px-2.5 py-2 shadow-lift dark:border-ink-700 dark:bg-ink-900">
      <p className="text-[10.5px] text-ink-400">{p.label}</p>
      <p className="mt-0.5 font-mono text-[13px] font-semibold text-ink-900 dark:text-white">
        {p.score.toFixed(1)} <span className="text-[10px] font-normal text-ink-400">/ 10</span>
      </p>
      <p className="mt-0.5 text-[10.5px] text-ink-500 dark:text-ink-400">{p.category}</p>
    </div>
  );
}

function SkillTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-ink-200 bg-white px-2.5 py-2 shadow-lift dark:border-ink-700 dark:bg-ink-900">
      <p className="text-[10.5px] font-medium text-ink-500 dark:text-ink-300">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="mt-0.5 flex items-center gap-1.5 text-[11px]">
          <span className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: p.fill }} />
          <span className="text-ink-400">{p.name}</span>
          <span className="ml-auto font-mono font-semibold text-ink-800 dark:text-ink-100">
            {p.value.toFixed(1)}
          </span>
        </p>
      ))}
    </div>
  );
}

function delta(trend: { score: number }[]) {
  const first = trend[0]?.score ?? 0;
  const last = trend[trend.length - 1]?.score ?? 0;
  const diff = last - first;
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}`;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-3 w-32 animate-pulse rounded bg-ink-200 dark:bg-ink-800" />
          <div className="h-7 w-56 animate-pulse rounded bg-ink-200 dark:bg-ink-800" />
        </div>
        <div className="h-7 w-28 animate-pulse rounded-full bg-ink-200 dark:bg-ink-800" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="surface h-[118px] animate-pulse p-4" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="surface h-[330px] animate-pulse" />
        <div className="surface h-[330px] animate-pulse" />
      </div>
      <div className="flex items-center justify-center gap-2 py-2 text-[12px] text-ink-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading your readiness data
      </div>
    </div>
  );
}
