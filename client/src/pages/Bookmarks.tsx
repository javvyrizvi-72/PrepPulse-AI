import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Loader2 } from 'lucide-react';
import { api, ApiError, type BankQuestion } from '../lib/api';
import { PageHeader } from '../components/PageHeader';
import { QuestionCard } from '../components/QuestionCard';

export default function Bookmarks() {
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .bookmarks()
      .then((res) => setQuestions(res.questions))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Could not load your bookmarks.')
      )
      .finally(() => setLoading(false));
  }, []);

  async function remove(questionId: string) {
    setPendingId(questionId);
    try {
      await api.toggleBookmark(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch {
      /* leave the card in place on failure */
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Saved revision"
        title="Bookmarks"
        description="Questions you flagged in the bank. Work through them before a mock, then remove the ones you have covered."
        actions={
          <Link to="/questions" className="btn-ghost h-9">
            Browse the bank
          </Link>
        }
      />

      {loading ? (
        <div className="grid place-items-center py-16">
          <div className="flex items-center gap-2 text-[12px] text-ink-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading bookmarks
          </div>
        </div>
      ) : error ? (
        <div className="surface p-6 text-center">
          <p className="text-[13px] text-ink-500">{error}</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="surface px-6 py-14 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Bookmark className="h-5 w-5" />
          </span>
          <h2 className="mt-3 text-[15px] font-semibold text-ink-900 dark:text-white">
            No bookmarks yet
          </h2>
          <p className="mx-auto mt-1 max-w-xs text-[12.5px] leading-relaxed text-ink-400">
            Tap the bookmark icon on any question in the bank and it will be waiting here.
          </p>
          <Link to="/questions" className="btn-primary mt-4">
            Open question bank
          </Link>
        </div>
      ) : (
        <>
          <p className="px-1 text-[11.5px] text-ink-400">
            {questions.length} saved {questions.length === 1 ? 'question' : 'questions'}
          </p>
          <div className="grid gap-2.5 xl:grid-cols-2">
            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                question={{ ...q, bookmarked: true }}
                onToggleBookmark={remove}
                pending={pendingId === q.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
