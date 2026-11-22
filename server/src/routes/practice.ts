import { Router } from 'express';
import { Question, QUESTION_CATEGORIES } from '../models/Question.js';
import { PracticeAttempt } from '../models/PracticeAttempt.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();
const QUIZ_SIZE = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** POST /api/practice/quiz — 10 MCQs, answers withheld. */
router.post('/quiz', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { category } = req.body || {};
    const query: Record<string, unknown> = { type: 'mcq' };
    if (category && category !== 'All') {
      if (!QUESTION_CATEGORIES.includes(category)) {
        return res.status(400).json({ message: 'Choose a valid category.' });
      }
      query.category = category;
    }
    const pool = await Question.find(query).lean();
    if (!pool.length) return res.status(404).json({ message: 'No MCQs in this category yet.' });

    const picked = shuffle(pool).slice(0, QUIZ_SIZE);
    return res.json({
      questions: picked.map((q) => ({
        id: String(q._id),
        category: q.category,
        difficulty: q.difficulty,
        questionText: q.questionText,
        options: q.options,
      })),
    });
  } catch (err) {
    console.error('practice quiz', err);
    return res.status(500).json({ message: 'Could not start the quiz.' });
  }
});

/** POST /api/practice/submit — grade, persist attempt, return explanations. */
router.post('/submit', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { category, answers } = req.body || {};
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'No answers submitted.' });
    }

    const ids = answers.map((a: any) => a.questionId).filter((id: string) => id);
    const questions = await Question.find({ _id: { $in: ids } }).lean();
    const byId = new Map(questions.map((q) => [String(q._id), q]));

    let score = 0;
    const review = answers
      .map((a: any) => {
        const q = byId.get(String(a.questionId));
        if (!q) return null;
        const selected = a.selectedOption === null || a.selectedOption === undefined
          ? null
          : Number(a.selectedOption);
        const correct = selected !== null && selected === q.correctOption;
        if (correct) score += 1;
        return {
          questionId: String(q._id),
          questionText: q.questionText,
          options: q.options,
          correctOption: q.correctOption,
          selectedOption: selected,
          correct,
          explanation: q.idealAnswer,
          category: q.category,
        };
      })
      .filter(Boolean);

    const attempt = await PracticeAttempt.create({
      userId: req.user!._id,
      category: QUESTION_CATEGORIES.includes(category) ? category : 'MERN Stack',
      score,
      totalQuestions: review.length,
    });

    return res.status(201).json({
      attempt: { ...attempt.toObject(), id: String(attempt._id) },
      review,
    });
  } catch (err) {
    console.error('practice submit', err);
    return res.status(500).json({ message: 'Could not save your attempt.' });
  }
});

/** GET /api/practice/history */
router.get('/history', requireAuth, async (req: AuthRequest, res) => {
  const attempts = await PracticeAttempt.find({ userId: req.user!._id })
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();
  return res.json({ attempts: attempts.map((a) => ({ ...a, id: String(a._id) })) });
});

export default router;
