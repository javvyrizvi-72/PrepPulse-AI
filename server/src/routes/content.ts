import { Router } from 'express';
import { Question } from '../models/Question.js';
import { Bookmark } from '../models/Bookmark.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { PracticeAttempt } from '../models/PracticeAttempt.js';

const questionsRouter = Router();

/** GET /api/questions — searchable, filterable bank with bookmark state. */
questionsRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { category, type, difficulty, search } = req.query as Record<string, string>;
    const query: Record<string, unknown> = {};

    if (type && type !== 'all') query.type = type;
    if (category && category !== 'All') query.category = category;
    if (difficulty && difficulty !== 'all') query.difficulty = difficulty;
    if (search) {
      const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { questionText: { $regex: safe, $options: 'i' } },
        { idealAnswer: { $regex: safe, $options: 'i' } },
      ];
    }

    const [questions, bookmarks] = await Promise.all([
      Question.find(query).sort({ category: 1, difficulty: 1 }).lean(),
      Bookmark.find({ userId: req.user!._id }).lean(),
    ]);
    const saved = new Set(bookmarks.map((b) => String(b.questionId)));

    return res.json({
      questions: questions.map((q) => ({
        ...q,
        id: String(q._id),
        bookmarked: saved.has(String(q._id)),
      })),
      total: questions.length,
    });
  } catch (err) {
    console.error('questions list', err);
    return res.status(500).json({ message: 'Could not load questions.' });
  }
});

const bookmarksRouter = Router();

/** GET /api/bookmarks */
bookmarksRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const bookmarks = await Bookmark.find({ userId: req.user!._id }).lean();
  const questions = await Question.find({
    _id: { $in: bookmarks.map((b) => b.questionId) },
  }).lean();
  return res.json({
    questions: questions.map((q) => ({ ...q, id: String(q._id), bookmarked: true })),
  });
});

/** POST /api/bookmarks — toggle a bookmark. */
bookmarksRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { questionId } = req.body || {};
    const question = await Question.findById(questionId).lean();
    if (!question) return res.status(404).json({ message: 'Question not found.' });

    const existing = await Bookmark.findOne({ userId: req.user!._id, questionId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ bookmarked: false });
    }
    await Bookmark.create({ userId: req.user!._id, questionId });
    return res.json({ bookmarked: true });
  } catch (err) {
    console.error('bookmark toggle', err);
    return res.status(500).json({ message: 'Could not update this bookmark.' });
  }
});

export { questionsRouter, bookmarksRouter };
