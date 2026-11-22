import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2,
  Printer,
  Sparkles,
  TriangleAlert,
  X,
} from 'lucide-react';
import { api, ApiError, type InterviewSessionRecord } from '../lib/api';
import { ScoreRing } from '../components/ScoreRing';
import { categoryMeta, formatDate, readinessTone, scoreTone } from '../lib/format';
import { DifficultyChip } from '../components/PageHeader';

export default function InterviewReport() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<InterviewSessionRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    api
      .interviewReport(id)
      .then((res) => {
        if (!cancelled) setSession(res.session);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : 'Could not load this report.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <p className="text-[12px] text-ink-400">Loading your report</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="surface mx-auto mt-10 max-w-md p-8 text-center">
        <TriangleAlert className="mx-auto h-6 w-6 text-amber-500" />
        <h2 className="mt-3 text-[16px] font-semibold text-ink-900 dark:text-white">
          Report unavailable
        </h2>
        <p className="mt-1.5 text-[13px] text-ink-500 dark:text-ink-400">{error}</p>
        <Link to="/interview" className="btn-primary mt-5">
          Start a new session
        </Link>
      </div>
    );
  }

  const meta = categoryMeta(session.category);
  const technicalAvg =
    session.responses.reduce((a, r) => a + r.technicalScore, 0) / session.responses.length;
  const communicationAvg =
    session.responses.reduce((a, r) => a + r.communicationScore, 0) / session.responses.length;
  const allMissing = Array.from(
    new Set(session.responses.flatMap((r) => r.missingKeywords || []))
  ).slice(0, 10);

  return (
    <div className="space-y-5">
      {/* Print-only header */}
      <div className="hidden print:block">
        <p className="text-[11px] uppercase tracking-widest text-ink-400">PrepPulse AI</p>
        <h1 className="mt-1 text-[20px] font-semibold">
          Mock interview report · {session.category}
        </h1>
        <p className="text-[12px] text-ink-500">
          {formatDate(session.createdAt)} · {session.responses.length} questions · scored{' '}
          {session.overallScore}/10
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to="/interview"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 transition hover:text-ink-800 dark:text-ink-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to studio
        </Link>
        <button onClick={() => window.print()} className="btn-ghost h-9">
          <Printer className="h-4 w-4" />
          Print / Save PDF
        </button>
      </div>

      {/* Summary */}
      <section className="surface overflow-hidden">
        <div className="border-b border-ink-100 bg-gradient-to-br from-indigo-50/70 to-white px-5 py-5 dark:border-ink-800 dark:from-indigo-500/10 dark:to-ink-900">
          <div className="flex flex-wrap items-center gap-5">
            <ScoreRing
              value={session.overallScore}
              size={96}
              label="overall"
              tone={session.overallScore >= 8 ? 'emerald' : 'indigo'}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`chip ${readinessTone(session.readinessLevel)}`}>
                  <Sparkles className="h-3.5 w-3.5" />
                  {session.readinessLevel}
                </span>
                <DifficultyChip difficulty={session.difficulty} />
                <span className={`chip ${meta.bg} ${meta.text} ${meta.border}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  {session.category}
                </span>
              </div>
              <h1 className="mt-2.5 text-[20px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[23px] dark:text-white">
                {session.overallScore >= 8
                  ? 'Interview ready on this track'
                  : session.overallScore >= 6.5
                    ? 'Close — tighten the gaps below'
                    : session.overallScore >= 4.5
                      ? 'Developing, with specific gaps'
                      : 'Needs another pass on the basics'}
              </h1>
              <p className="mt-1 text-[12.5px] text-ink-500 dark:text-ink-400">
                {session.responses.length} questions answered · {formatDate(session.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-ink-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-ink-800">
          <Metric label="Technical average" value={technicalAvg} />
          <Metric label="Communication average" value={communicationAvg} />
          <Metric
            label="Keywords missing"
            value={allMissing.length}
            suffix={allMissing.length === 1 ? 'idea' : 'ideas'}
            raw
          />
        </div>
      </section>

      {/* Focus list */}
      {allMissing.length > 0 && (
        <section className="surface p-4">
          <p className="data-label">Fix these first</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {allMissing.map((k) => (
              <span
                key={k}
                className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 font-mono text-[11px] text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
              >
                {k}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Question review */}
      <section className="space-y-3">
        <h2 className="px-1 text-[15px] font-semibold text-ink-900 dark:text-white">
          Question by question
        </h2>
        {session.responses.map((r, i) => (
          <article key={i} className="surface overflow-hidden break-inside-avoid">
            <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-4 py-3 dark:border-ink-800">
              <div className="flex min-w-0 items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-ink-100 font-mono text-[10.5px] font-semibold text-ink-500 dark:bg-ink-800 dark:text-ink-300">
                  {i + 1}
                </span>
                <p className="text-[13px] font-medium leading-relaxed text-ink-900 dark:text-white">
                  {r.questionText}
                </p>
              </div>
              <span className={`shrink-0 font-mono text-[15px] font-semibold ${scoreTone(r.score)}`}>
                {r.score.toFixed(1)}
              </span>
            </div>

            <div className="grid gap-0 md:grid-cols-2">
              <div className="border-b border-ink-100 px-4 py-3.5 md:border-b-0 md:border-r dark:border-ink-800">
                <p className="data-label">Your answer</p>
                <p className="mt-1.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink-700 dark:text-ink-200">
                  {r.userAnswer?.trim() || (
                    <span className="italic text-ink-400">No answer recorded.</span>
                  )}
                </p>
              </div>
              <div className="bg-ink-50/50 px-4 py-3.5 dark:bg-ink-950/30">
                <p className="data-label">Ideal answer</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-600 dark:text-ink-300">
                  {r.idealAnswer || 'No model answer recorded.'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 border-t border-ink-100 px-4 py-3.5 dark:border-ink-800">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
                <span className="flex items-center gap-1.5 text-ink-500 dark:text-ink-400">
                  Technical
                  <b className="font-mono font-semibold text-ink-900 dark:text-white">
                    {r.technicalScore.toFixed(1)}
                  </b>
                </span>
                <span className="flex items-center gap-1.5 text-ink-500 dark:text-ink-400">
                  Communication
                  <b className="font-mono font-semibold text-ink-900 dark:text-white">
                    {r.communicationScore.toFixed(1)}
                  </b>
                </span>
              </div>

              {(r.matchedKeywords?.length > 0 || r.missingKeywords?.length > 0) && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {r.matchedKeywords?.map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 font-mono text-[10.5px] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                    >
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {k}
                    </span>
                  ))}
                  {r.missingKeywords?.map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 font-mono text-[10.5px] text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                    >
                      <X className="h-2.5 w-2.5" />
                      {k}
                    </span>
                  ))}
                </div>
              )}

              <p className="flex items-start gap-2 rounded-lg bg-indigo-50/70 px-2.5 py-2 text-[12px] leading-relaxed text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-200">
                <Circle className="mt-1 h-2.5 w-2.5 shrink-0 fill-current" />
                {r.feedback}
              </p>
            </div>
          </article>
        ))}
      </section>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Link to="/interview" className="btn-primary h-10">
          Run another session
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/dashboard" className="btn-ghost h-10">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  suffix,
  raw,
}: {
  label: string;
  value: number;
  suffix?: string;
  raw?: boolean;
}) {
  return (
    <div className="px-5 py-4">
      <p className="data-label">{label}</p>
      <p className="mt-1 font-mono text-[20px] font-semibold text-ink-900 dark:text-white">
        {raw ? value : value.toFixed(1)}
        <span className="ml-1 text-[11px] font-normal text-ink-400">
          {suffix ?? '/ 10'}
        </span>
      </p>
    </div>
  );
}
