import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  RotateCcw,
  Trophy,
  X,
  XCircle,
} from 'lucide-react';
import {
  api,
  ApiError,
  type McqQuestion,
  type PracticeAttemptRecord,
  type QuizReview,
} from '../lib/api';
import { PageHeader } from '../components/PageHeader';
import { categoryMeta, relativeDay, scoreTone } from '../lib/format';

const CATEGORIES = [
  'All',
  'MERN Stack',
  'Python & Data Science',
  'DSA & Problem Solving',
  'Aptitude & Logic',
] as const;

const QUIZ_SECONDS = 600; // 10 minutes for 10 questions

type View = 'start' | 'quiz' | 'result';

export default function Practice() {
  const [view, setView] = useState<View>('start');
  const [category, setCategory] = useState<string>('All');

  const [questions, setQuestions] = useState<McqQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_SECONDS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [review, setReview] = useState<QuizReview[]>([]);
  const [attempt, setAttempt] = useState<PracticeAttemptRecord | null>(null);
  const [history, setHistory] = useState<PracticeAttemptRecord[]>([]);

  useEffect(() => {
    api
      .practiceHistory()
      .then((res) => setHistory(res.attempts))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (view !== 'quiz') return;
    if (secondsLeft <= 0) {
      void submit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, secondsLeft]);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.startQuiz({ category });
      if (!res.questions.length) throw new Error('No questions available.');
      setQuestions(res.questions);
      setAnswers(new Array(res.questions.length).fill(null));
      setIndex(0);
      setSecondsLeft(QUIZ_SECONDS);
      setView('quiz');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the quiz.');
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.submitQuiz({
        category,
        answers: questions.map((q, i) => ({ questionId: q.id, selectedOption: answers[i] })),
      });
      setReview(res.review);
      setAttempt(res.attempt);
      setHistory((h) => [res.attempt, ...h].slice(0, 12));
      setView('result');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your attempt.');
    } finally {
      setBusy(false);
    }
  }

  const answeredCount = answers.filter((a) => a !== null).length;
  const score = useMemo(() => review.filter((r) => r.correct).length, [review]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Technical & aptitude practice"
        title="MCQ practice"
        description="Ten timed questions from one track. Every wrong answer comes back with the correct option and a one-line explanation, and each attempt is saved to your history."
        actions={
          view !== 'start' ? (
            <button onClick={() => setView('start')} className="btn-ghost h-9">
              <RotateCcw className="h-4 w-4" />
              New quiz
            </button>
          ) : undefined
        }
      />

      {view === 'start' && (
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <section className="surface p-5">
            <h2 className="text-[14px] font-semibold text-ink-900 dark:text-white">
              Pick a category
            </h2>
            <p className="mt-1 text-[12px] text-ink-400">
              10 questions · 10 minutes · explanations after submission
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {CATEGORIES.map((c) => {
                const meta = categoryMeta(c);
                const active = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    aria-pressed={active}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                      active
                        ? 'border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-500/15 dark:border-indigo-500/50 dark:bg-indigo-500/10'
                        : 'border-ink-200 hover:border-ink-300 dark:border-ink-700 dark:hover:border-ink-600'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${c === 'All' ? 'bg-ink-400' : meta.dot}`}
                    />
                    <span className="min-w-0 flex-1 text-[12.5px] font-medium text-ink-800 dark:text-ink-100">
                      {c}
                    </span>
                    {active && <Check className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })}
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[12.5px] text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button onClick={() => void start()} disabled={busy} className="btn-primary mt-5 h-11 w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
              Start 10-question quiz
            </button>
          </section>

          <section className="surface p-5">
            <div className="flex items-center justify-between">
              <p className="data-label">Past attempts</p>
              <History className="h-3.5 w-3.5 text-ink-400" />
            </div>
            {history.length === 0 ? (
              <p className="mt-4 text-[12.5px] leading-relaxed text-ink-400">
                No attempts yet. Your first quiz result will appear here with its score and date.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-ink-100 dark:divide-ink-800">
                {history.slice(0, 7).map((a) => {
                  const pct = a.totalQuestions ? (a.score / a.totalQuestions) * 100 : 0;
                  return (
                    <li key={a.id} className="flex items-center gap-3 py-2.5">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${categoryMeta(a.category).dot}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-medium text-ink-800 dark:text-ink-100">
                          {a.category}
                        </p>
                        <p className="text-[10.5px] text-ink-400">{relativeDay(a.createdAt)}</p>
                      </div>
                      <span className={`font-mono text-[12px] font-semibold ${scoreTone((pct / 100) * 10)}`}>
                        {a.score}/{a.totalQuestions}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}

      {view === 'quiz' && questions[index] && (
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <section className="surface overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-3 dark:border-ink-800">
              <p className="text-[12px] font-semibold text-ink-800 dark:text-ink-100">
                Question {index + 1} of {questions.length}
              </p>
              <span
                className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-[12px] font-semibold tabular-nums ${
                  secondsLeft <= 60
                    ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                    : 'border-ink-200 text-ink-600 dark:border-ink-700 dark:text-ink-300'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
              </span>
            </div>

            <div className="p-5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`chip ${categoryMeta(questions[index].category).bg} ${categoryMeta(questions[index].category).text} ${categoryMeta(questions[index].category).border}`}>
                  {questions[index].category}
                </span>
                <span className="chip border-ink-200 bg-white capitalize text-ink-500 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-400">
                  {questions[index].difficulty}
                </span>
              </div>

              <h2 className="mt-3 text-[16px] font-medium leading-relaxed text-ink-900 dark:text-white">
                {questions[index].questionText}
              </h2>

              <div className="mt-4 space-y-2">
                {questions[index].options.map((opt, i) => {
                  const selected = answers[index] === i;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => {
                          const next = [...prev];
                          next[index] = i;
                          return next;
                        })
                      }
                      aria-pressed={selected}
                      className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
                        selected
                          ? 'border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-500/15 dark:border-indigo-500/50 dark:bg-indigo-500/10'
                          : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50/60 dark:border-ink-700 dark:hover:bg-ink-800/40'
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md font-mono text-[10.5px] font-semibold ${
                          selected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-300'
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-[13px] leading-relaxed text-ink-800 dark:text-ink-100">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[12.5px] text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={index === 0}
                  className="btn-ghost h-10"
                >
                  Previous
                </button>
                {index === questions.length - 1 ? (
                  <button onClick={() => void submit()} disabled={busy} className="btn-emerald ml-auto h-10">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Submit quiz
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
                    className="btn-primary ml-auto h-10"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </section>

          <aside className="surface h-fit p-4">
            <div className="flex items-center justify-between">
              <p className="data-label">Progress</p>
              <span className="font-mono text-[11px] text-ink-400">
                {answeredCount}/{questions.length}
              </span>
            </div>
            <div className="mt-2.5 grid grid-cols-5 gap-1.5">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to question ${i + 1}`}
                  className={`grid h-8 place-items-center rounded-lg font-mono text-[11px] font-semibold transition ${
                    i === index
                      ? 'bg-indigo-600 text-white'
                      : answers[i] !== null
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200'
                        : 'bg-ink-100 text-ink-400 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-500'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-400">
              Unanswered questions are marked wrong. Submit any time to see explanations.
            </p>
            <button onClick={() => void submit()} disabled={busy} className="btn-ghost mt-3 h-9 w-full">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Submit now
            </button>
          </aside>
        </div>
      )}

      {view === 'result' && attempt && (
        <div className="space-y-4">
          <section className="surface p-5">
            <div className="flex flex-wrap items-center gap-5">
              <div className="grid h-[74px] w-[74px] place-items-center rounded-2xl bg-ink-50 dark:bg-ink-950">
                <span className={`font-mono text-[24px] font-semibold ${scoreTone((score / Math.max(attempt.totalQuestions, 1)) * 10)}`}>
                  {score}
                </span>
                <span className="mt-0.5 text-[10px] text-ink-400">of {attempt.totalQuestions}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="data-label">Quiz result</p>
                <h2 className="mt-1 text-[19px] font-semibold tracking-[-0.02em] text-ink-900 dark:text-white">
                  {score === attempt.totalQuestions
                    ? 'Perfect score'
                    : score / attempt.totalQuestions >= 0.7
                      ? 'Solid result — review the misses'
                      : 'Worth a second pass on this track'}
                </h2>
                <p className="mt-1 text-[12.5px] text-ink-500 dark:text-ink-400">
                  {attempt.category} · {Math.round((score / attempt.totalQuestions) * 100)}% accuracy ·
                  saved to your history
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => void start()} className="btn-primary h-10">
                  Try again
                </button>
                <button onClick={() => setView('start')} className="btn-ghost h-10">
                  Change category
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-2.5">
            {review.map((r, i) => (
              <article key={r.questionId} className="surface overflow-hidden">
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <span
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md ${
                      r.correct
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                    }`}
                  >
                    {r.correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium leading-relaxed text-ink-900 dark:text-white">
                      <span className="mr-1.5 font-mono text-[11px] text-ink-400">{i + 1}.</span>
                      {r.questionText}
                    </p>
                    <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                      {r.options.map((opt, oi) => {
                        const isCorrect = oi === r.correctOption;
                        const isPicked = oi === r.selectedOption;
                        return (
                          <li
                            key={opt}
                            className={`rounded-lg border px-2.5 py-1.5 text-[12px] ${
                              isCorrect
                                ? 'border-emerald-300 bg-emerald-50 font-medium text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200'
                                : isPicked
                                  ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200'
                                  : 'border-ink-200/80 text-ink-500 dark:border-ink-800 dark:text-ink-400'
                            }`}
                          >
                            <span className="mr-1.5 font-mono text-[10px] opacity-60">
                              {String.fromCharCode(65 + oi)}
                            </span>
                            {opt}
                            {isCorrect && <span className="ml-1.5 text-[10px] font-semibold">correct</span>}
                            {isPicked && !isCorrect && (
                              <span className="ml-1.5 text-[10px] font-semibold">your pick</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-2 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-ink-500 dark:text-ink-400">
                      <XCircle className="mt-0.5 h-3 w-3 shrink-0 opacity-0" aria-hidden="true" />
                      <span>
                        <b className="font-semibold text-ink-700 dark:text-ink-200">Why: </b>
                        {r.explanation}
                      </span>
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}
