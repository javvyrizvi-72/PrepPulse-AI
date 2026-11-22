import { Router } from 'express';
import { InterviewSession } from '../models/InterviewSession.js';
import { PracticeAttempt } from '../models/PracticeAttempt.js';
import { Bookmark } from '../models/Bookmark.js';
import { Question } from '../models/Question.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { buildDashboard, CATEGORIES } from '../utils/shared.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!._id;
    const [sessions, attempts, bookmarks, totalQuestions] = await Promise.all([
      InterviewSession.find({ userId }).sort({ createdAt: 1 }).lean(),
      PracticeAttempt.find({ userId }).sort({ createdAt: 1 }).lean(),
      Bookmark.find({ userId }).lean(),
      Question.countDocuments(),
    ]);

    const payload = buildDashboard({
      user: req.user,
      sessions,
      attempts,
      bookmarks,
      totalQuestions,
      categories: CATEGORIES,
    });

    return res.json({
      ...payload,
      student: {
        name: req.user!.name,
        targetRole: req.user!.targetRole,
        experienceLevel: req.user!.experienceLevel,
        role: req.user!.role,
      },
    });
  } catch (err) {
    console.error('dashboard error', err);
    return res.status(500).json({ message: 'Could not load your dashboard.' });
  }
});

export default router;
