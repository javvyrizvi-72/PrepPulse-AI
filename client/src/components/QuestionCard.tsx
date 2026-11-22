import { useState } from 'react';
import { Bookmark, ChevronDown, Lightbulb } from 'lucide-react';
import type { BankQuestion } from '../lib/api';
import { categoryMeta } from '../lib/format';
import { DifficultyChip } from './PageHeader';

export function QuestionCard({
  question,
  onToggleBookmark,
  pending,
}: {
  question: BankQuestion;
  onToggleBookmark: (id: string) => void;
  pending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const meta = categoryMeta(question.category);

  return (
    <article className="surface overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`chip ${meta.bg} ${meta.text} ${meta.border}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                {question.category}
              </span>
              <DifficultyChip difficulty={question.difficulty} />
              <span className="chip border-ink-200 bg-white capitalize text-ink-500 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-400">
                {question.type}
              </span>
            </div>
            <h3 className="mt-2.5 text-[14px] font-medium leading-relaxed text-ink-900 dark:text-white">
              {question.questionText}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => onToggleBookmark(question.id)}
            disabled={pending}
            aria-pressed={!!question.bookmarked}
            aria-label={question.bookmarked ? 'Remove bookmark' : 'Save question'}
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition disabled:opacity-50 ${
              question.bookmarked
                ? 'border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300'
                : 'border-ink-200 bg-white text-ink-400 hover:border-ink-300 hover:text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${question.bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {question.options?.length > 0 && (
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {question.options.map((opt, i) => (
              <li
                key={opt}
                className={`rounded-lg border px-2.5 py-1.5 text-[12px] ${
                  open && i === question.correctOption
                    ? 'border-emerald-300 bg-emerald-50 font-medium text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200'
                    : 'border-ink-200/80 text-ink-600 dark:border-ink-800 dark:text-ink-300'
                }`}
              >
                <span className="mr-1.5 font-mono text-[10.5px] text-ink-400">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400"
        >
          {open ? 'Hide answer' : 'Show ideal answer'}
          <ChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-ink-50/60 px-4 py-3.5 dark:border-ink-800 dark:bg-ink-950/40">
          <p className="data-label">Ideal answer</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-700 dark:text-ink-200">
            {question.idealAnswer || 'No model answer recorded for this question.'}
          </p>
          {question.keywords?.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="data-label flex items-center gap-1 text-[10px]">
                <Lightbulb className="h-3 w-3" />
                Keywords
              </span>
              {question.keywords.map((k) => (
                <span
                  key={k}
                  className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[10.5px] text-ink-600 ring-1 ring-ink-200 dark:bg-ink-900 dark:text-ink-300 dark:ring-ink-700"
                >
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
