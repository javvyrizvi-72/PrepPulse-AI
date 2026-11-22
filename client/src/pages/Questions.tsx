import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookMarked, Loader2, Search, SlidersHorizontal, X } from 'lucide-react';
import { api, ApiError, type BankQuestion } from '../lib/api';
import { PageHeader } from '../components/PageHeader';
import { QuestionCard } from '../components/QuestionCard';

const CATEGORIES = [
  'All',
  'MERN Stack',
  'Python & Data Science',
  'DSA & Problem Solving',
  'Aptitude & Logic',
] as const;
const TYPES = [
  { value: 'all', label: 'All types' },
  { value: 'interview', label: 'Interview' },
  { value: 'mcq', label: 'MCQ' },
] as const;
const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'] as const;

export default function Questions() {
  const [category, setCategory] = useState<string>('All');
  const [type, setType] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.questions({ category, type, difficulty, search: debounced });
      setQuestions(res.questions);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load the question bank.');
    } finally {
      setLoading(false);
    }
  }, [category, type, difficulty, debounced]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(questionId: string) {
    setPendingId(questionId);
    // Optimistic toggle so the icon responds instantly.
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, bookmarked: !q.bookmarked } : q))
    );
    try {
      const res = await api.toggleBookmark(questionId);
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, bookmarked: res.bookmarked } : q))
      );
    } catch {
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, bookmarked: !q.bookmarked } : q))
      );
    } finally {
      setPendingId(null);
    }
  }

  const savedCount = useMemo(() => questions.filter((q) => q.bookmarked).length, [questions]);
  const filtersActive =
    category !== 'All' || type !== 'all' || difficulty !== 'all' || debounced.length > 0;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Question bank"
        title="Every question, with the model answer"
        description="Search the full bank by keyword, filter by track and difficulty, then save the ones you keep getting wrong."
        actions={
          <span className="chip border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
            <BookMarked className="h-3.5 w-3.5" />
            {savedCount} saved here
          </span>
        }
      />

      {/* Filters */}
      <div className="surface p-3.5">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions and answers…"
              aria-label="Search questions"
              className="field pl-9 pr-8"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Filter by type"
              className="field w-auto py-2 text-[12.5px]"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              aria-label="Filter by difficulty"
              className="field w-auto py-2 text-[12.5px] capitalize"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d === 'all' ? 'Any level' : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-ink-100 pt-2.5 dark:border-ink-800">
          <SlidersHorizontal className="mr-1 h-3.5 w-3.5 text-ink-400" />
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition ${
                category === c
                  ? 'border-indigo-400 bg-indigo-600 text-white'
                  : 'border-ink-200 text-ink-600 hover:border-ink-300 dark:border-ink-700 dark:text-ink-300'
              }`}
            >
              {c}
            </button>
          ))}
          {filtersActive && (
            <button
              type="button"
              onClick={() => {
                setCategory('All');
                setType('all');
                setDifficulty('all');
                setSearch('');
              }}
              className="ml-auto text-[11px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16">
          <div className="flex items-center gap-2 text-[12px] text-ink-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading questions
          </div>
        </div>
      ) : error ? (
        <div className="surface p-6 text-center">
          <p className="text-[13px] text-ink-500">{error}</p>
          <button onClick={() => void load()} className="btn-ghost mt-3">
            Try again
          </button>
        </div>
      ) : questions.length === 0 ? (
        <div className="surface p-10 text-center">
          <p className="text-[14px] font-medium text-ink-800 dark:text-ink-100">No matches</p>
          <p className="mx-auto mt-1 max-w-xs text-[12.5px] text-ink-400">
            Try a shorter search term, or reset the filters to see the full bank.
          </p>
          <button
            onClick={() => {
              setCategory('All');
              setType('all');
              setDifficulty('all');
              setSearch('');
            }}
            className="btn-ghost mt-4"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          <p className="px-1 text-[11.5px] text-ink-400">
            {questions.length} {questions.length === 1 ? 'question' : 'questions'}
            {debounced && ` matching “${debounced}”`}
          </p>
          <div className="grid gap-2.5 xl:grid-cols-2">
            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onToggleBookmark={toggle}
                pending={pendingId === q.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
