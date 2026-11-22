import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  ChevronRight,
  Clock,
  Lightbulb,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Timer,
  Volume2,
} from 'lucide-react';
import { api, ApiError, type InterviewQuestion } from '../lib/api';
import { PageHeader } from '../components/PageHeader';
import { categoryMeta } from '../lib/format';
import { useSpeech } from '../lib/speech';

const CATEGORIES = [
  'MERN Stack',
  'Python & Data Science',
  'DSA & Problem Solving',
  'Aptitude & Logic',
] as const;
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const SECONDS_PER_QUESTION = 120;

type Stage = 'setup' | 'live';

export default function Interview() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('setup');

  /* ------------------------------ setup state ------------------------------ */
  const [category, setCategory] = useState<string>('MERN Stack');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [count, setCount] = useState<5 | 8>(5);
  const [starting, setStarting] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  /* ------------------------------- live state ------------------------------ */
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION);
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speech = useSpeech();
  const current = questions[index];

  async function start() {
    setSetupError(null);
    setStarting(true);
    try {
      const res = await api.startInterview({ category, difficulty, count });
      if (!res.questions?.length) throw new Error('No questions available.');
      setQuestions(res.questions);
      setAnswers(new Array(res.questions.length).fill(''));
      setIndex(0);
      setSecondsLeft(SECONDS_PER_QUESTION);
      setShowHint(false);
      setExpired(false);
      setStage('live');
    } catch (err) {
      setSetupError(
        err instanceof ApiError ? err.message : 'Could not start the session. Try again.'
      );
    } finally {
      setStarting(false);
    }
  }

  /* -------------------------------- timer --------------------------------- */
  useEffect(() => {
    if (stage !== 'live') return;
    if (secondsLeft <= 0) {
      setExpired(true);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, secondsLeft]);

  /* Focus the textarea when the question changes. */
  useEffect(() => {
    if (stage === 'live') textareaRef.current?.focus();
  }, [stage, index]);

  /* Stop dictation when moving on. */
  useEffect(() => {
    if (speech.listening) speech.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const words = useMemo(
    () => (answers[index] || '').trim().split(/\s+/).filter(Boolean).length,
    [answers, index]
  );

  function setAnswer(value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function goNext() {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setSecondsLeft(SECONDS_PER_QUESTION);
      setShowHint(false);
      setExpired(false);
    }
  }

  function goBack() {
    if (index > 0) {
      setIndex(index - 1);
      setSecondsLeft(SECONDS_PER_QUESTION);
      setShowHint(false);
      setExpired(false);
    }
  }

  async function finish() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await api.submitInterview({
        category,
        difficulty,
        responses: questions.map((q, i) => ({
          questionId: q.id,
          questionText: q.questionText,
          userAnswer: answers[i] || '',
          idealAnswer: q.idealAnswer,
          keywords: q.keywords,
        })),
      });
      navigate(`/interview/report/${res.session.id}`);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : 'Could not score your session. Try again.'
      );
      setSubmitting(false);
    }
  }

  if (stage === 'setup') {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Mock interview studio"
          title="Run a timed mock interview"
          description="Pick a track and we will serve real questions. Each answer gets two scored dimensions, matched keywords and a model answer to compare against."
        />

        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <div className="space-y-4">
            <section className="surface p-5">
              <h2 className="text-[14px] font-semibold text-ink-900 dark:text-white">
                1. Choose a track
              </h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
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
                      <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
                      <span className="min-w-0 flex-1 text-[12.5px] font-medium text-ink-800 dark:text-ink-100">
                        {c}
                      </span>
                      {active && <Check className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="surface p-5">
              <h2 className="text-[14px] font-semibold text-ink-900 dark:text-white">
                2. Difficulty
              </h2>
              <div className="mt-3 flex gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    aria-pressed={difficulty === d}
                    className={`flex-1 rounded-xl border px-3 py-2 text-[12.5px] font-medium capitalize transition ${
                      difficulty === d
                        ? 'border-indigo-400 bg-indigo-50/60 text-indigo-700 ring-2 ring-indigo-500/15 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:text-indigo-300'
                        : 'border-ink-200 text-ink-600 hover:border-ink-300 dark:border-ink-700 dark:text-ink-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <h2 className="mt-5 text-[14px] font-semibold text-ink-900 dark:text-white">
                3. Question count
              </h2>
              <div className="mt-3 flex gap-2">
                {[5, 8].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n as 5 | 8)}
                    aria-pressed={count === n}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-left transition ${
                      count === n
                        ? 'border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-500/15 dark:border-indigo-500/50 dark:bg-indigo-500/10'
                        : 'border-ink-200 hover:border-ink-300 dark:border-ink-700'
                    }`}
                  >
                    <span className="block font-mono text-[16px] font-semibold text-ink-900 dark:text-white">
                      {n}
                    </span>
                    <span className="text-[11px] text-ink-400">
                      questions · ~{n * 2} min
                    </span>
                  </button>
                ))}
              </div>

              {setupError && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[12.5px] text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {setupError}
                </div>
              )}

              <button onClick={() => void start()} disabled={starting} className="btn-primary mt-5 h-11 w-full">
                {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Start mock interview
              </button>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="surface p-5">
              <p className="data-label">How scoring works</p>
              <ul className="mt-3 space-y-3">
                {[
                  ['Technical score', 'Keyword coverage against the model answer, capped at 10.'],
                  ['Communication score', 'Sentence structure, completeness and avoidable rambling.'],
                  ['Feedback', 'Written in your terms: what was missing and what to say instead.'],
                ].map(([title, body]) => (
                  <li key={title}>
                    <p className="text-[12.5px] font-semibold text-ink-800 dark:text-ink-100">{title}</p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-400">{body}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-xl border border-dashed border-ink-200 p-3 dark:border-ink-700">
                <p className="text-[11px] leading-relaxed text-ink-400">
                  An LLM grades first when an API key is configured. If it is missing, slow or
                  errors, the rubric evaluator takes over so you never lose an answer.
                </p>
              </div>
            </div>

            <div className="surface p-5">
              <p className="data-label">Session format</p>
              <div className="mt-3 space-y-2 text-[12px]">
                {[
                  [<Timer key="t" className="h-3.5 w-3.5" />, '2 minutes per question'],
                  [<Mic key="m" className="h-3.5 w-3.5" />, 'Dictate or type your answer'],
                  [<Lightbulb key="l" className="h-3.5 w-3.5" />, 'Optional hint per question'],
                ].map(([icon, label], i) => (
                  <p key={i} className="flex items-center gap-2 text-ink-600 dark:text-ink-300">
                    <span className="text-ink-400">{icon}</span>
                    {label}
                  </p>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  /* -------------------------------- live view ------------------------------- */
  if (!current) {
    return (
      <div className="surface mx-auto mt-10 max-w-md p-8 text-center">
        <p className="text-[13px] text-ink-500">No question loaded.</p>
        <button onClick={() => setStage('setup')} className="btn-ghost mt-4">
          Back to setup
        </button>
      </div>
    );
  }

  const timePct = (secondsLeft / SECONDS_PER_QUESTION) * 100;
  const lowTime = secondsLeft <= 20;
  const isLast = index === questions.length - 1;
  const meta = categoryMeta(current.category);
  const answered = answers.filter((a) => a.trim().length > 0).length;

  return (
    <div className="space-y-4">
      {/* Sticky session bar */}
      <div className="surface sticky top-[68px] z-10 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-ink-900 dark:text-white">
              {current.category} · {current.difficulty}
            </p>
            <p className="text-[11px] text-ink-400">
              Question {index + 1} of {questions.length} · {answered} answered
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[13px] font-semibold tabular-nums ${
              lowTime
                ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                : 'border-ink-200 bg-ink-50 text-ink-700 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-200'
            }`}
            role="timer"
            aria-live="off"
          >
            <Clock className={`h-3.5 w-3.5 ${lowTime ? 'animate-pulse' : ''}`} />
            {String(Math.floor(secondsLeft / 60)).padStart(1, '0')}:
            {String(secondsLeft % 60).padStart(2, '0')}
          </div>
        </div>

        <div className="mt-2.5 flex gap-1">
          {questions.map((q, i) => (
            <span
              key={q.id}
              className={`h-1 flex-1 rounded-full transition ${
                i < index
                  ? 'bg-indigo-500'
                  : i === index
                    ? 'bg-indigo-400'
                    : answers[i]?.trim()
                      ? 'bg-indigo-300 dark:bg-indigo-600'
                      : 'bg-ink-200 dark:bg-ink-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question + answer */}
      <div className="surface overflow-hidden">
        <div className="border-b border-ink-100 px-5 py-4 dark:border-ink-800">
          <p className="data-label">Question {index + 1}</p>
          <h1 className="mt-1.5 text-[17px] font-medium leading-relaxed text-ink-900 dark:text-white">
            {current.questionText}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHint((h) => !h)}
              aria-expanded={showHint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11.5px] font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              {showHint ? 'Hide hint' : 'Show hint'}
            </button>
            <span className="text-[11px] text-ink-400">
              {current.keywords?.length || 0} key ideas expected
            </span>
          </div>

          {showHint && (
            <div className="mt-3 rounded-xl border border-amber-200/70 bg-amber-50/70 px-3.5 py-3 dark:border-amber-500/25 dark:bg-amber-500/10">
              <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-200">
                Aim to mention
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-amber-900/80 dark:text-amber-100/80">
                {current.idealAnswer
                  ? current.idealAnswer.split('.').slice(0, 1).join('.') + '.'
                  : 'Structure your answer as definition, mechanism, then when you would use it.'}
              </p>
              {current.keywords?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {current.keywords.map((k) => (
                    <span
                      key={k}
                      className="rounded-md bg-white/80 px-1.5 py-0.5 font-mono text-[10px] text-amber-900 dark:bg-amber-900/30 dark:text-amber-100"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between">
            <label htmlFor="answer" className="data-label">
              Your answer
            </label>
            <div className="flex items-center gap-2">
              {speech.supported ? (
                <button
                  type="button"
                  onClick={() => (speech.listening ? speech.stop() : speech.start(setAnswer))}
                  aria-pressed={speech.listening}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11.5px] font-medium transition ${
                    speech.listening
                      ? 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300'
                      : 'border-ink-200 text-ink-600 hover:border-ink-300 dark:border-ink-700 dark:text-ink-300'
                  }`}
                >
                  {speech.listening ? (
                    <>
                      <MicOff className="h-3.5 w-3.5" />
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute h-full w-full animate-ping rounded-full bg-rose-400" />
                        <span className="relative h-1.5 w-1.5 rounded-full bg-rose-500" />
                      </span>
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5" />
                      Speak answer
                    </>
                  )}
                </button>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-ink-200 px-2 py-1 text-[11px] text-ink-400 dark:border-ink-700"
                  title="Your browser does not support the Web Speech API. Type your answer instead."
                >
                  <MicOff className="h-3.5 w-3.5" />
                  Type your answer
                </span>
              )}
            </div>
          </div>

          <textarea
            id="answer"
            ref={textareaRef}
            value={answers[index] || ''}
            onChange={(e) => setAnswer(e.target.value)}
            rows={9}
            placeholder="Type your answer, or use Speak answer to dictate. Aim for three or four sentences: definition, how it works, and when you would use it."
            className="field mt-1.5 resize-y leading-relaxed"
          />

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-400">
            <span className="tabular-nums">
              {words} {words === 1 ? 'word' : 'words'}
              {words > 0 && words < 25 && ' · aim for 40+'}
              {words >= 25 && <span className="text-emerald-600 dark:text-emerald-400"> · good length</span>}
            </span>
            {speech.error && <span className="text-rose-500">{speech.error}</span>}
            {expired && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Clock className="h-3 w-3" />
                Time is up — finish this answer, then continue
              </span>
            )}
          </div>

          {submitError && (
            <div
              role="alert"
              className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[12.5px] text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {submitError}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={goBack}
              disabled={index === 0}
              className="btn-ghost h-10"
            >
              Previous
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={() => void finish()}
                disabled={submitting}
                className="btn-emerald ml-auto h-10"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scoring session
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit for scoring
                  </>
                )}
              </button>
            ) : (
              <button type="button" onClick={goNext} className="btn-primary ml-auto h-10">
                Next question
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <button
          type="button"
          onClick={() => setStage('setup')}
          className="text-[11.5px] font-medium text-ink-400 transition hover:text-ink-700 dark:hover:text-ink-200"
        >
          Abandon session
        </button>
        <p className="flex items-center gap-1.5 text-[11px] text-ink-400">
          <Volume2 className="h-3 w-3" />
          Answers autosave in this browser tab until you submit
        </p>
      </div>

      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-30 h-[2px] bg-ink-200/50 dark:bg-ink-800/50"
        aria-hidden="true"
      >
        <div
          className={`h-full transition-all duration-1000 ease-linear ${lowTime ? 'bg-rose-400' : 'bg-indigo-500'}`}
          style={{ width: `${timePct}%` }}
        />
      </div>
    </div>
  );
}
