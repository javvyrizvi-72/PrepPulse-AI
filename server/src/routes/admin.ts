import { Router } from 'express';
import { Question, QUESTION_CATEGORIES } from '../models/Question.js';
import { requireAuth, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { PracticeAttempt } from '../models/PracticeAttempt.js';
import { Bookmark } from '../models/Bookmark.js';

const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

/** GET /api/admin/stats — counters + progress monitor rows. */
adminRouter.get('/stats', async (_req, res) => {
  try {
    const [users, questions, sessions, attempts, bookmarks] = await Promise.all([
      User.find().sort({ createdAt: -1 }).lean(),
      Question.countDocuments(),
      InterviewSession.find().lean(),
      PracticeAttempt.find().lean(),
      Bookmark.countDocuments(),
    ]);

    const students = users.filter((u) => u.role === 'student');

    // Per-student progress: interview count, average score, practice accuracy.
    const progress = students.map((s) => {
      const own = sessions.filter((x) => String(x.userId) === String(s._id));
      const ownAttempts = attempts.filter((x) => String(x.userId) === String(s._id));
      const avg = own.length
        ? Math.round((own.reduce((a, x) => a + x.overallScore, 0) / own.length) * 10) / 10
        : 0;
      const accuracy = ownAttempts.length
        ? Math.round(
            (ownAttempts.reduce(
              (a, x) => a + (x.totalQuestions ? (x.score / x.totalQuestions) * 100 : 0),
              0
            ) /
              ownAttempts.length) *
              10
          ) / 10
        : 0;
      return {
        id: String(s._id),
        name: s.name,
        email: s.email,
        targetRole: s.targetRole,
        experienceLevel: s.experienceLevel,
        interviews: own.length,
        averageScore: avg,
        practiceAttempts: ownAttempts.length,
        practiceAccuracy: accuracy,
        createdAt: s.createdAt,
      };
    });

    return res.json({
      stats: {
        users: users.length,
        students: students.length,
        admins: users.length - students.length,
        questions,
        sessions: sessions.length,
        attempts: attempts.length,
        bookmarks,
      },
      recentUsers: users.slice(0, 8).map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        targetRole: u.targetRole,
      })),
      progress,
    });
  } catch (err) {
    console.error('admin stats', err);
    return res.status(500).json({ message: 'Could not load admin stats.' });
  }
});

/** GET /api/admin/questions — full list including correct answers. */
adminRouter.get('/questions', async (req, res) => {
  const { search } = req.query as Record<string, string>;
  const query: Record<string, unknown> = {};
  if (search) {
    const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.questionText = { $regex: safe, $options: 'i' };
  }
  const questions = await Question.find(query).sort({ createdAt: -1 }).lean();
  return res.json({
    questions: questions.map((q) => ({ ...q, id: String(q._id) })),
  });
});

function validate(body: any) {
  const errors: string[] = [];
  if (!QUESTION_CATEGORIES.includes(body.category)) errors.push('Choose a valid category.');
  if (!['interview', 'mcq'].includes(body.type)) errors.push('Type must be interview or mcq.');
  if (!['easy', 'medium', 'hard'].includes(body.difficulty)) errors.push('Pick a difficulty.');
  if (!body.questionText || String(body.questionText).trim().length < 8)
    errors.push('Question text needs at least 8 characters.');

  const type = body.type;
  let options: string[] = [];
  let correctOption: number | null = null;

  if (type === 'mcq') {
    options = Array.isArray(body.options)
      ? body.options.map((o: unknown) => String(o).trim()).filter(Boolean)
      : [];
    if (options.length < 2) errors.push('MCQs need at least two options.');
    const idx = Number(body.correctOption);
    if (!Number.isInteger(idx) || idx < 0 || idx >= options.length)
      errors.push('Pick which option is correct.');
    else correctOption = idx;
  }

  if (type === 'interview' && !String(body.idealAnswer || '').trim())
    errors.push('Interview questions need an ideal answer.');

  return { errors, options, correctOption };
}

/** POST /api/admin/questions */
adminRouter.post('/questions', async (req, res) => {
  try {
    const { errors, options, correctOption } = validate(req.body || {});
    if (errors.length) return res.status(400).json({ message: errors[0], errors });

    const body = req.body;
    const question = await Question.create({
      category: body.category,
      type: body.type,
      difficulty: body.difficulty,
      questionText: String(body.questionText).trim(),
      options,
      correctOption,
      idealAnswer: String(body.idealAnswer || '').trim(),
      keywords: Array.isArray(body.keywords)
        ? body.keywords.map((k: unknown) => String(k).trim()).filter(Boolean)
        : String(body.keywords || '')
            .split(',')
            .map((k: string) => k.trim())
            .filter(Boolean),
    });
    return res.status(201).json({ question: { ...question.toObject(), id: String(question._id) } });
  } catch (err) {
    console.error('admin create question', err);
    return res.status(500).json({ message: 'Could not create the question.' });
  }
});

/** PUT /api/admin/questions/:id */
adminRouter.put('/questions/:id', async (req, res) => {
  try {
    const { errors, options, correctOption } = validate(req.body || {});
    if (errors.length) return res.status(400).json({ message: errors[0], errors });

    const body = req.body;
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      {
        category: body.category,
        type: body.type,
        difficulty: body.difficulty,
        questionText: String(body.questionText).trim(),
        options,
        correctOption,
        idealAnswer: String(body.idealAnswer || '').trim(),
        keywords: Array.isArray(body.keywords)
          ? body.keywords.map((k: unknown) => String(k).trim()).filter(Boolean)
          : String(body.keywords || '')
              .split(',')
              .map((k: string) => k.trim())
              .filter(Boolean),
      },
      { new: true, runValidators: true }
    ).lean();

    if (!question) return res.status(404).json({ message: 'Question not found.' });
    return res.json({ question: { ...question, id: String(question._id) } });
  } catch (err) {
    console.error('admin update question', err);
    return res.status(500).json({ message: 'Could not update the question.' });
  }
});

/** DELETE /api/admin/questions/:id */
adminRouter.delete('/questions/:id', async (req, res) => {
  try {
    const removed = await Question.findByIdAndDelete(req.params.id).lean();
    if (!removed) return res.status(404).json({ message: 'Question not found.' });
    // Clean up dependents so bookmarks do not point at a deleted question.
    await Bookmark.deleteMany({ questionId: req.params.id });
    return res.json({ deleted: true, id: req.params.id });
  } catch (err) {
    console.error('admin delete question', err);
    return res.status(500).json({ message: 'Could not delete the question.' });
  }
});

export { adminRouter };
