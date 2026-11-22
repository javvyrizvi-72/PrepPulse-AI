import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  Loader2,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  api,
  ApiError,
  type BankQuestion,
  type QuestionPayload,
  type StudentProgress,
} from '../lib/api';
import { PageHeader, DifficultyChip } from '../components/PageHeader';
import { categoryMeta, relativeDay, scoreTone } from '../lib/format';

const LABELS: Record<string, string> = {
  users: 'Total accounts',
  students: 'Students',
  admins: 'Administrators',
  questions: 'Questions',
  sessions: 'Interview sessions',
  attempts: 'Practice attempts',
  bookmarks: 'Bookmarks',
};

const CATEGORIES = [
  'MERN Stack',
  'Python & Data Science',
  'DSA & Problem Solving',
  'Aptitude & Logic',
];

const EMPTY: QuestionPayload = {
  category: 'MERN Stack',
  type: 'interview',
  difficulty: 'medium',
  questionText: '',
  options: ['', '', '', ''],
  correctOption: 0,
  idealAnswer: '',
  keywords: [],
};

type Tab = 'questions' | 'students';

export default function Admin() {
  const [tab, setTab] = useState<Tab>('questions');
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [questions, setQuestions] = useState<BankQuestion[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'interview' | 'mcq'>('all');

  const [editing, setEditing] = useState<BankQuestion | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<QuestionPayload>(EMPTY);
  const [keywordText, setKeywordText] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, questionsRes] = await Promise.all([api.adminStats(), api.adminQuestions()]);
      setStats(statsRes.stats);
      setProgress(statsRes.progress || []);
      setQuestions(questionsRes.questions);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setKeywordText('');
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(q: BankQuestion) {
    setEditing(q);
    setForm({
      category: q.category,
      type: q.type,
      difficulty: q.difficulty,
      questionText: q.questionText,
      options: q.options?.length ? [...q.options] : ['', '', '', ''],
      correctOption: q.correctOption ?? 0,
      idealAnswer: q.idealAnswer || '',
      keywords: q.keywords || [],
    });
    setKeywordText((q.keywords || []).join(', '));
    setFormError(null);
    setFormOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    const payload: QuestionPayload = {
      ...form,
      options: form.type === 'mcq' ? form.options.filter((o) => o.trim()) : [],
      correctOption: form.type === 'mcq' ? form.correctOption : null,
      keywords: keywordText
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    };
    try {
      if (editing) {
        const res = await api.adminUpdateQuestion(editing.id, payload);
        setQuestions((prev) => prev.map((q) => (q.id === editing.id ? res.question : q)));
        setToast('Question updated');
      } else {
        const res = await api.adminCreateQuestion(payload);
        setQuestions((prev) => [res.question, ...prev]);
        setToast('Question added');
      }
      setFormOpen(false);
      setStats((s) => (s ? { ...s, questions: questions.length + (editing ? 0 : 1) } : s));
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not save the question.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(q: BankQuestion) {
    if (!window.confirm(`Delete this question?\n\n${q.questionText}`)) return;
    setDeletingId(q.id);
    try {
      await api.adminDeleteQuestion(q.id);
      setQuestions((prev) => prev.filter((x) => x.id !== q.id));
      setStats((s) => (s ? { ...s, questions: Math.max(0, (s.questions || 1) - 1) } : s));
      setToast('Question deleted');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the question.');
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return questions.filter(
      (q) =>
        (typeFilter === 'all' || q.type === typeFilter) &&
        (!term ||
          q.questionText.toLowerCase().includes(term) ||
          q.category.toLowerCase().includes(term))
    );
  }, [questions, search, typeFilter]);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Admin"
        title="Platform control room"
        description="Every action here is guarded server-side by requireAdmin. Manage the question bank students practise from, and monitor who is actually progressing."
        actions={
          <span className="chip border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin session
          </span>
        }
      />

      {loading ? (
        <div className="grid place-items-center py-20">
          <div className="flex items-center gap-2 text-[12px] text-ink-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading admin data
          </div>
        </div>
      ) : error ? (
        <div className="surface p-6 text-center">
          <ShieldAlert className="mx-auto h-6 w-6 text-rose-500" />
          <p className="mt-2 text-[13px] text-ink-500">{error}</p>
          <button onClick={() => void load()} className="btn-ghost mt-3">
            Try again
          </button>
        </div>
      ) : (
        <>
          {stats && (
            <section className="grid gap-2.5 grid-cols-2 lg:grid-cols-4">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="surface px-4 py-3">
                  <p className="text-[11px] font-medium text-ink-500 dark:text-ink-400">
                    {LABELS[key] || key}
                  </p>
                  <p className="mt-1 font-mono text-[21px] font-semibold leading-none text-ink-900 dark:text-white">
                    {value}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-ink-200 bg-white p-1 dark:border-ink-800 dark:bg-ink-900">
            {(
              [
                ['questions', 'Question bank', questions.length],
                ['students', 'Student progress', progress.length],
              ] as const
            ).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-pressed={tab === key}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${
                  tab === key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800'
                }`}
              >
                {key === 'questions' ? (
                  <Pencil className="h-3.5 w-3.5" />
                ) : (
                  <Users className="h-3.5 w-3.5" />
                )}
                {label}
                <span
                  className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
                    tab === key ? 'bg-white/20' : 'bg-ink-100 dark:bg-ink-800'
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {tab === 'questions' && (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search questions…"
                    aria-label="Search questions"
                    className="field pl-9"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                  aria-label="Filter by type"
                  className="field w-full py-2.5 text-[12.5px] sm:w-[150px]"
                >
                  <option value="all">All types</option>
                  <option value="interview">Interview</option>
                  <option value="mcq">MCQ</option>
                </select>
                <button onClick={openCreate} className="btn-primary h-10 shrink-0">
                  <Plus className="h-4 w-4" />
                  Add question
                </button>
              </div>

              <div className="surface overflow-hidden">
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[720px] text-left">
                    <thead>
                      <tr className="border-b border-ink-100 dark:border-ink-800">
                        {['Question', 'Track', 'Type', 'Level', ''].map((h, i) => (
                          <th
                            key={i}
                            className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((q) => (
                        <tr
                          key={q.id}
                          className="border-b border-ink-100/70 transition last:border-0 hover:bg-ink-50/70 dark:border-ink-800/70 dark:hover:bg-ink-800/30"
                        >
                          <td className="max-w-[380px] px-4 py-3">
                            <p className="line-clamp-2 text-[12.5px] font-medium leading-relaxed text-ink-800 dark:text-ink-100">
                              {q.questionText}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`chip ${categoryMeta(q.category).bg} ${categoryMeta(q.category).text} ${categoryMeta(q.category).border} whitespace-nowrap`}>
                              {categoryMeta(q.category).short}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[11.5px] capitalize text-ink-500 dark:text-ink-400">
                            {q.type}
                          </td>
                          <td className="px-4 py-3">
                            <DifficultyChip difficulty={q.difficulty} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEdit(q)}
                                aria-label="Edit question"
                                className="grid h-7 w-7 place-items-center rounded-lg border border-ink-200 text-ink-500 transition hover:border-ink-300 hover:text-ink-900 dark:border-ink-700 dark:text-ink-400 dark:hover:text-white"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => void remove(q)}
                                disabled={deletingId === q.id}
                                aria-label="Delete question"
                                className="grid h-7 w-7 place-items-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
                              >
                                {deletingId === q.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <ul className="divide-y divide-ink-100 md:hidden dark:divide-ink-800">
                  {filtered.map((q) => (
                    <li key={q.id} className="px-3.5 py-3">
                      <p className="line-clamp-2 text-[12.5px] font-medium leading-relaxed text-ink-800 dark:text-ink-100">
                        {q.questionText}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className={`chip ${categoryMeta(q.category).bg} ${categoryMeta(q.category).text} ${categoryMeta(q.category).border}`}>
                          {categoryMeta(q.category).short}
                        </span>
                        <span className="chip border-ink-200 bg-white capitalize text-ink-500 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-400">
                          {q.type}
                        </span>
                        <DifficultyChip difficulty={q.difficulty} />
                        <div className="ml-auto flex gap-1">
                          <button
                            onClick={() => openEdit(q)}
                            aria-label="Edit question"
                            className="grid h-7 w-7 place-items-center rounded-lg border border-ink-200 text-ink-500 dark:border-ink-700 dark:text-ink-400"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => void remove(q)}
                            disabled={deletingId === q.id}
                            aria-label="Delete question"
                            className="grid h-7 w-7 place-items-center rounded-lg border border-rose-200 text-rose-600 dark:border-rose-500/30 dark:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {filtered.length === 0 && (
                  <p className="px-4 py-10 text-center text-[12.5px] text-ink-400">
                    No questions match this filter.
                  </p>
                )}
              </div>
            </>
          )}

          {tab === 'students' && (
            <div className="surface overflow-hidden">
              <div className="border-b border-ink-100 px-4 py-3 dark:border-ink-800">
                <h2 className="text-[13.5px] font-semibold text-ink-900 dark:text-white">
                  Student progress monitor
                </h2>
                <p className="mt-0.5 text-[11.5px] text-ink-400">
                  {progress.length} registered {progress.length === 1 ? 'student' : 'students'} ·
                  interviews and averages are computed live
                </p>
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-ink-100 dark:border-ink-800">
                      {['Student', 'Target role', 'Interviews', 'Avg score', 'Practice', 'Joined'].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {progress.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-ink-100/70 last:border-0 hover:bg-ink-50/70 dark:border-ink-800/70 dark:hover:bg-ink-800/30"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-indigo-50 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                              {s.name.slice(0, 2).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[12.5px] font-medium text-ink-800 dark:text-ink-100">
                                {s.name}
                              </p>
                              <p className="truncate text-[10.5px] text-ink-400">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-ink-600 dark:text-ink-300">
                          {s.targetRole}
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px] text-ink-700 dark:text-ink-200">
                          {s.interviews}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-mono text-[12.5px] font-semibold ${scoreTone(s.averageScore)}`}>
                            {s.interviews ? s.averageScore.toFixed(1) : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11.5px] text-ink-500 dark:text-ink-400">
                          {s.practiceAttempts
                            ? `${s.practiceAttempts} · ${s.practiceAccuracy}%`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-[11.5px] text-ink-400">
                          {relativeDay(s.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="divide-y divide-ink-100 md:hidden dark:divide-ink-800">
                {progress.map((s) => (
                  <li key={s.id} className="px-3.5 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-medium text-ink-800 dark:text-ink-100">
                          {s.name}
                        </p>
                        <p className="truncate text-[10.5px] text-ink-400">{s.email}</p>
                        <p className="mt-1 text-[11px] text-ink-500 dark:text-ink-400">
                          {s.targetRole} · {s.interviews} interviews
                        </p>
                      </div>
                      <span className={`font-mono text-[14px] font-semibold ${scoreTone(s.averageScore)}`}>
                        {s.interviews ? s.averageScore.toFixed(1) : '—'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              {progress.length === 0 && (
                <p className="px-4 py-10 text-center text-[12.5px] text-ink-400">
                  No student accounts yet.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* ------------------------- Add / edit drawer ------------------------- */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-[2px]"
            onClick={() => !saving && setFormOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editing ? 'Edit question' : 'Add question'}
            className="relative flex max-h-[92dvh] w-full max-w-[560px] animate-rise-in flex-col overflow-hidden rounded-t-2xl border border-ink-200 bg-white shadow-lift sm:rounded-2xl dark:border-ink-700 dark:bg-ink-900"
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3 dark:border-ink-800">
              <h2 className="text-[14px] font-semibold text-ink-900 dark:text-white">
                {editing ? 'Edit question' : 'Add a question'}
              </h2>
              <button
                onClick={() => !saving && setFormOpen(false)}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={save} className="flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="f-type" className="mb-1.5 block text-[12px] font-medium text-ink-700 dark:text-ink-300">
                    Type
                  </label>
                  <select
                    id="f-type"
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value as 'interview' | 'mcq' }))
                    }
                    className="field"
                  >
                    <option value="interview">Interview</option>
                    <option value="mcq">MCQ</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="f-diff" className="mb-1.5 block text-[12px] font-medium text-ink-700 dark:text-ink-300">
                    Difficulty
                  </label>
                  <select
                    id="f-diff"
                    value={form.difficulty}
                    onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                    className="field capitalize"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="f-cat" className="mb-1.5 block text-[12px] font-medium text-ink-700 dark:text-ink-300">
                  Track
                </label>
                <select
                  id="f-cat"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="field"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="f-q" className="mb-1.5 block text-[12px] font-medium text-ink-700 dark:text-ink-300">
                  Question
                </label>
                <textarea
                  id="f-q"
                  value={form.questionText}
                  onChange={(e) => setForm((f) => ({ ...f, questionText: e.target.value }))}
                  rows={3}
                  required
                  placeholder="What is the difference between state and props in React?"
                  className="field resize-y"
                />
              </div>

              {form.type === 'mcq' && (
                <div>
                  <p className="mb-1.5 text-[12px] font-medium text-ink-700 dark:text-ink-300">
                    Options <span className="text-ink-400">(select the correct one)</span>
                  </p>
                  <div className="space-y-2">
                    {form.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, correctOption: i }))}
                          aria-label={`Mark option ${String.fromCharCode(65 + i)} correct`}
                          aria-pressed={form.correctOption === i}
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border font-mono text-[10.5px] font-semibold transition ${
                            form.correctOption === i
                              ? 'border-emerald-500 bg-emerald-600 text-white'
                              : 'border-ink-200 text-ink-500 dark:border-ink-700 dark:text-ink-400'
                          }`}
                        >
                          {form.correctOption === i ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            String.fromCharCode(65 + i)
                          )}
                        </button>
                        <input
                          value={opt}
                          onChange={(e) =>
                            setForm((f) => {
                              const options = [...f.options];
                              options[i] = e.target.value;
                              return { ...f, options };
                            })
                          }
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          className="field py-2 text-[12.5px]"
                        />
                        {form.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                options: f.options.filter((_, oi) => oi !== i),
                                correctOption: Math.max(
                                  0,
                                  Math.min(f.correctOption ?? 0, f.options.length - 2)
                                ),
                              }))
                            }
                            aria-label="Remove option"
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-400 hover:text-rose-600"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {form.options.length < 6 && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, options: [...f.options, ''] }))}
                      className="mt-2 text-[11.5px] font-semibold text-indigo-600 dark:text-indigo-400"
                    >
                      + Add option
                    </button>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="f-ideal" className="mb-1.5 block text-[12px] font-medium text-ink-700 dark:text-ink-300">
                  {form.type === 'mcq' ? 'Explanation' : 'Ideal answer'}
                </label>
                <textarea
                  id="f-ideal"
                  value={form.idealAnswer}
                  onChange={(e) => setForm((f) => ({ ...f, idealAnswer: e.target.value }))}
                  rows={3}
                  placeholder="The model answer students are graded against."
                  className="field resize-y"
                  required={form.type === 'interview'}
                />
              </div>

              <div>
                <label htmlFor="f-kw" className="mb-1.5 block text-[12px] font-medium text-ink-700 dark:text-ink-300">
                  Keywords <span className="text-ink-400">(comma separated)</span>
                </label>
                <input
                  id="f-kw"
                  value={keywordText}
                  onChange={(e) => setKeywordText(e.target.value)}
                  placeholder="props, state, read-only, useState"
                  className="field"
                />
              </div>

              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[12px] text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="flex gap-2 border-t border-ink-100 pt-3 dark:border-ink-800">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  disabled={saving}
                  className="btn-ghost h-10 flex-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary h-10 flex-1">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editing ? 'Save changes' : 'Add question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 animate-rise-in rounded-xl bg-ink-900 px-3.5 py-2 text-[12px] font-medium text-white shadow-lift lg:bottom-6 dark:bg-ink-100 dark:text-ink-900"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
