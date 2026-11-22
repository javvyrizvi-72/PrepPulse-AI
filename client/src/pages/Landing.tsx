import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Gauge,
  MessagesSquare,
  Quote,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { ScoreRing } from '../components/ScoreRing';
import { useAuth } from '../lib/auth';

const FEATURES = [
  {
    icon: MessagesSquare,
    title: 'Answers graded on substance',
    body: 'Every response is scored for technical coverage and communication, with the keywords you missed listed explicitly.',
  },
  {
    icon: BarChart3,
    title: 'Readiness you can defend',
    body: 'A running score trend across sessions shows whether your last week of prep actually moved the needle.',
  },
  {
    icon: Target,
    title: 'Four tracks, one plan',
    body: 'MERN, Python & Data Science, DSA and Aptitude, each tracked separately so weak areas cannot hide.',
  },
  {
    icon: BookOpenCheck,
    title: 'Model answers on demand',
    body: 'Compare your attempt against the ideal answer and bookmark gaps for a focused revision session.',
  },
];

const MOCK = {
  question: 'How does useEffect cleanup work, and when would you use it?',
  answer:
    'The function returned from useEffect runs before the effect re-runs and when the component unmounts. I use it to clear timers and abort fetches with an AbortController so no stale request updates state.',
  matched: ['cleanup', 'unmount', 'abort', 'timer'],
  missing: ['listener'],
};

export default function Landing() {
  const { user } = useAuth();
  const startHref = user ? '/dashboard' : '/register';

  return (
    <div className="min-h-dvh bg-ink-50 dark:bg-ink-950">
      <header className="sticky top-0 z-30 border-b border-ink-200/70 bg-ink-50/85 backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-8">
          <Logo />
          <nav className="ml-6 hidden items-center gap-6 text-[13px] font-medium text-ink-500 md:flex dark:text-ink-400">
            <a href="#how" className="transition hover:text-ink-900 dark:hover:text-white">
              How it works
            </a>
            <a href="#tracks" className="transition hover:text-ink-900 dark:hover:text-white">
              Tracks
            </a>
            <a href="#scoring" className="transition hover:text-ink-900 dark:hover:text-white">
              Scoring
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                Go to dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-xl px-3 py-2 text-[13px] font-semibold text-ink-600 transition hover:text-ink-900 sm:block dark:text-ink-300 dark:hover:text-white"
                >
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary">
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ------- Hero ------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grain opacity-60" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-indigo-200/35 blur-[110px] dark:bg-indigo-600/15"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:pb-24">
          <div className="animate-rise-in">
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-indigo-700 shadow-sm dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-indigo-500" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-600" />
              </span>
              Phase 3 · Practice, scoring and admin live
            </p>

            <h1 className="mt-5 text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] text-ink-900 sm:text-[46px] lg:text-[52px] dark:text-white">
              Practice interviews.
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">Know your readiness</span>
                <span
                  className="absolute inset-x-[-2px] bottom-[6px] z-0 h-[11px] rounded-sm bg-indigo-300/70 dark:bg-indigo-400/25"
                  aria-hidden="true"
                />
              </span>
              <br />
              before they ask.
            </h1>

            <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-ink-500 dark:text-ink-400">
              PrepPulse scores your spoken-style answers, separates technical depth from
              communication, and tracks a readiness score across four placement tracks. No vague
              “keep practising” — just the gaps.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to={startHref} className="btn-primary h-11 px-5 text-[14px]">
                {user ? 'Open dashboard' : 'Create free account'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-ghost h-11 px-4 text-[14px]">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                Try the demo student
              </Link>
            </div>

            <dl className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t border-ink-200/80 pt-5 dark:border-ink-800">
              {[
                { k: '56', l: 'curated questions' },
                { k: '4', l: 'placement tracks' },
                { k: '2', l: 'score dimensions' },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="font-mono text-[22px] font-semibold tracking-tight text-ink-900 dark:text-white">
                    {s.k}
                  </dt>
                  <dd className="mt-0.5 text-[11.5px] leading-snug text-ink-400">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Graded-answer artifact */}
          <div className="animate-rise-in [animation-delay:120ms]">
            <div className="relative mx-auto max-w-[470px]">
              <div
                className="absolute -right-3 -top-4 hidden rounded-xl border border-ink-200 bg-white px-3 py-2 shadow-lift sm:block dark:border-ink-700 dark:bg-ink-900"
                aria-hidden="true"
              >
                <p className="data-label">Readiness</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Nearly Ready
                </p>
              </div>

              <div className="surface overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
                  <div className="flex items-center gap-2">
                    <span className="template-dot h-2 w-2 rounded-full bg-indigo-500" />
                    <p className="text-[12px] font-semibold text-ink-800 dark:text-ink-100">
                      MERN Stack · medium
                    </p>
                  </div>
                  <span className="chip border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Graded
                  </span>
                </div>

                <div className="px-5 pt-4">
                  <p className="text-[13.5px] font-medium leading-relaxed text-ink-800 dark:text-ink-100">
                    {MOCK.question}
                  </p>
                  <div className="mt-3 rounded-xl bg-ink-50 p-3.5 dark:bg-ink-950">
                    <p className="data-label mb-1.5">Your answer</p>
                    <p className="text-[12.5px] leading-relaxed text-ink-600 dark:text-ink-300">
                      {MOCK.answer}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5 px-5 py-5">
                  <ScoreRing value={8.1} size={84} label="overall" tone="emerald" />
                  <div className="flex-1 space-y-2.5">
                    <Meter label="Technical" value={8.6} hex="#6B7F5E" />
                    <Meter label="Communication" value={7.4} hex="#C26508" />
                  </div>
                </div>

                <div className="space-y-2 border-t border-ink-100 px-5 py-4 dark:border-ink-800">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="data-label w-[62px] shrink-0">Covered</span>
                    {MOCK.matched.map((k) => (
                      <span
                        key={k}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 font-mono text-[10.5px] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      >
                        <Check className="h-2.5 w-2.5" />
                        {k}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="data-label w-[62px] shrink-0">Missing</span>
                    {MOCK.missing.map((k) => (
                      <span
                        key={k}
                        className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 font-mono text-[10.5px] text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                      >
                        <X className="h-2.5 w-2.5" />
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------- How it works ------- */}
      <section id="how" className="border-t border-ink-200/70 bg-white py-16 dark:border-ink-800 dark:bg-ink-900/40">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="data-label">The loop</p>
            <h2 className="mt-2 text-[27px] font-semibold tracking-[-0.025em] text-ink-900 sm:text-[32px] dark:text-white">
              Three steps, repeated until the score stops moving
            </h2>
          </div>

          <ol className="mt-9 grid gap-5 md:grid-cols-3">
            {[
              {
                n: '01',
                title: 'Answer a real question',
                body: 'Pick a track and difficulty. Questions are pulled from a curated bank, not generated filler.',
                icon: MessagesSquare,
              },
              {
                n: '02',
                title: 'Read the diagnosis',
                body: 'Two scores, matched keywords, missing keywords, and a model answer for comparison.',
                icon: Gauge,
              },
              {
                n: '03',
                title: 'Watch readiness climb',
                body: 'The dashboard plots every session so improvement is visible week over week.',
                icon: TrendingUp,
              },
            ].map((step) => (
              <li key={step.n} className="surface relative p-5">
                <div className="flex items-start justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <step.icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="font-mono text-[11px] font-medium text-ink-300 dark:text-ink-600">
                    {step.n}
                  </span>
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-ink-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500 dark:text-ink-400">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------- Tracks ------- */}
      <section id="tracks" className="py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="data-label">Four tracks</p>
              <h2 className="mt-2 text-[27px] font-semibold tracking-[-0.025em] text-ink-900 sm:text-[32px] dark:text-white">
                Separately scored, so nothing hides
              </h2>
              <p className="mt-3 max-w-[42ch] text-[14px] leading-relaxed text-ink-500 dark:text-ink-400">
                A single blended score hides the track that will fail you in a real loop. PrepPulse
                keeps four independent technical and communication averages.
              </p>
              <Link to={startHref} className="btn-ghost mt-6 h-10">
                See it on your own data
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { name: 'MERN Stack', count: 14, tone: 'indigo', note: 'React, Node, Express, Mongo' },
                { name: 'Python & Data Science', count: 14, tone: 'emerald', note: 'pandas, modelling, evaluation' },
                { name: 'DSA & Problem Solving', count: 14, tone: 'violet', note: 'complexity, structures, patterns' },
                { name: 'Aptitude & Logic', count: 14, tone: 'amber', note: 'quant, series, reasoning' },
              ].map((t) => (
                <div key={t.name} className="surface p-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        t.tone === 'indigo'
                          ? 'bg-indigo-500'
                          : t.tone === 'emerald'
                            ? 'bg-emerald-500'
                            : t.tone === 'violet'
                              ? 'bg-violet-500'
                              : 'bg-amber-500'
                      }`}
                    />
                    <span className="font-mono text-[11px] text-ink-400">{t.count} Qs</span>
                  </div>
                  <h3 className="mt-2.5 text-[14px] font-semibold text-ink-900 dark:text-white">
                    {t.name}
                  </h3>
                  <p className="mt-0.5 text-[12px] text-ink-400">{t.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------- Scoring detail ------- */}
      <section
        id="scoring"
        className="border-y border-ink-200/70 bg-white py-16 dark:border-ink-800 dark:bg-ink-900/40"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="data-label">Scoring</p>
              <h2 className="mt-2 text-[27px] font-semibold tracking-[-0.025em] text-ink-900 sm:text-[32px] dark:text-white">
                What the number actually measures
              </h2>
            </div>
            <p className="max-w-[38ch] text-[13px] leading-relaxed text-ink-400">
              Deterministic keyword coverage and answer structure today. Model-graded feedback is
              the Phase 2 upgrade.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="surface p-5">
                <f.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="mt-3.5 text-[14px] font-semibold text-ink-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500 dark:text-ink-400">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------- Proof + CTA ------- */}
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <blockquote className="surface relative p-6">
            <Quote className="h-6 w-6 text-indigo-200 dark:text-indigo-500/40" />
            <p className="mt-3 text-[16px] font-medium leading-relaxed text-ink-800 dark:text-ink-100">
              I had done forty LeetCode problems and still froze in the mock. The missing-keyword
              list showed I never explained tradeoffs. Two weeks later that was the first thing I
              said.
            </p>
            <footer className="mt-4 flex items-center gap-3 border-t border-ink-100 pt-4 dark:border-ink-800">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-[11px] font-semibold text-white">
                RS
              </span>
              <div>
                <p className="text-[12.5px] font-semibold text-ink-900 dark:text-white">Riya S.</p>
                <p className="text-[11px] text-ink-400">Placed · Backend Engineer</p>
              </div>
            </footer>
          </blockquote>

          <div>
            <h2 className="text-[27px] font-semibold tracking-[-0.025em] text-ink-900 sm:text-[32px] dark:text-white">
              Start with the demo, not a sign-up form
            </h2>
            <p className="mt-3 max-w-[44ch] text-[14px] leading-relaxed text-ink-500 dark:text-ink-400">
              The demo student has six graded sessions and four practice attempts already seeded.
              You land on a dashboard with real data instead of empty states.
            </p>
            <ul className="mt-5 space-y-2.5">
              {[
                'No credit card, no onboarding survey',
                'Seeded history renders every chart immediately',
                'Admin demo included to preview role guards',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[13px] text-ink-600 dark:text-ink-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/login" className="btn-primary h-11 px-5">
                Open demo login
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" className="btn-ghost h-11 px-4">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-200/70 py-8 dark:border-ink-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Logo size="sm" />
          <p className="text-[12px] text-ink-400">
            Built for placement season. Phase 3 — practice, reports, admin CRUD.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-ink-400">
            <Link to="/login" className="transition hover:text-ink-700 dark:hover:text-ink-200">
              Sign in
            </Link>
            <Link to="/register" className="transition hover:text-ink-700 dark:hover:text-ink-200">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Meter({ label, value, hex }: { label: string; value: number; hex: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-medium text-ink-500 dark:text-ink-400">{label}</span>
        <span className="font-mono font-semibold text-ink-800 dark:text-ink-100">{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
        <div
          className="h-full rounded-full"
          style={{ width: `${(value / 10) * 100}%`, backgroundColor: hex }}
        />
      </div>
    </div>
  );
}
