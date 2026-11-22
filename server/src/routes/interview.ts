import { Router } from 'express';
import mongoose from 'mongoose';
import { Question, QUESTION_CATEGORIES } from '../models/Question.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { evaluateAnswer, readinessLevel } from '../services/evaluator.js';

const router = Router();

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** POST /api/interview/start — build a question set, no answers leaked. */
router.post('/start', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { category, difficulty, count } = req.body || {};
    if (!QUESTION_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Choose a valid category.' });
    }
    const size = Number(count) === 8 ? 8 : 5;
    const diff = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';

    let pool = await Question.find({ category, type: 'interview', difficulty: diff }).lean();
    if (pool.length < size) {
      pool = await Question.find({ category, type: 'interview' }).lean();
    }
    if (!pool.length) {
      return res.status(404).json({ message: 'No interview questions in this category yet.' });
    }

    const picked = shuffle(pool).slice(0, size);
    return res.json({
      questions: picked.map((q) => ({
        id: String(q._id),
        category: q.category,
        difficulty: q.difficulty,
        questionText: q.questionText,
        idealAnswer: q.idealAnswer,
        keywords: q.keywords,
      })),
    });
  } catch (err) {
    console.error('interview start', err);
    return res.status(500).json({ message: 'Could not prepare your session.' });
  }
});

/** POST /api/interview/submit — evaluate answers, persist the session. */
router.post('/submit', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { category, difficulty, responses } = req.body || {};
    if (!QUESTION_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Choose a valid category.' });
    }
    if (!Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ message: 'Submit at least one answer.' });
    }

    const ids = responses
      .map((r: any) => r.questionId)
      .filter((id: string) => mongoose.isValidObjectId(id));
    const questions = await Question.find({ _id: { $in: ids } }).lean();
    const byId = new Map(questions.map((q) => [String(q._id), q]));

    const evaluated = [];
    for (const item of responses) {
      const q = byId.get(String(item.questionId));
      const question = q
        ? { questionText: q.questionText, idealAnswer: q.idealAnswer, keywords: q.keywords }
        : {
            questionText: String(item.questionText || 'Untitled question'),
            idealAnswer: String(item.idealAnswer || ''),
            keywords: Array.isArray(item.keywords) ? item.keywords : [],
          };

      const result = await evaluateAnswer({
        ...question,
        userAnswer: String(item.userAnswer || ''),
        category,
        difficulty,
      });

      evaluated.push({
        questionText: question.questionText,
        userAnswer: String(item.userAnswer || ''),
        score: result.score,
        technicalScore: result.technicalScore,
        communicationScore: result.communicationScore,
        matchedKeywords: result.matchedKeywords,
        missingKeywords: result.missingKeywords,
        feedback: result.feedback,
        idealAnswer: question.idealAnswer,
      });
    }

    const overallScore =
      Math.round((evaluated.reduce((a, r) => a + r.score, 0) / evaluated.length) * 10) / 10;

    const session = await InterviewSession.create({
      userId: req.user!._id,
      category,
      difficulty,
      responses: evaluated,
      overallScore,
      readinessLevel: readinessLevel(overallScore),
    });

    return res.status(201).json({
      session: { ...session.toObject(), id: String(session._id) },
    });
  } catch (err) {
    console.error('interview submit', err);
    return res.status(500).json({ message: 'Could not save your session.' });
  }
});

/** GET /api/interview/history — recent sessions for the signed-in student. */
router.get('/history', requireAuth, async (req: AuthRequest, res) => {
  const sessions = await InterviewSession.find({ userId: req.user!._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  return res.json({ sessions: sessions.map((s) => ({ ...s, id: String(s._id) })) });
});

/** GET /api/interview/:id — session report. */
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    const session = await InterviewSession.findOne({
      _id: id,
      userId: req.user!._id,
    }).lean();
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    return res.json({ session: { ...session, id: String(session._id) } });
  } catch (err) {
    console.error('interview report', err);
    return res.status(500).json({ message: 'Could not load this report.' });
  }
});

export default router;
