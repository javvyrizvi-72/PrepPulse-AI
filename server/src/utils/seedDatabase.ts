import bcrypt from 'bcryptjs';
import { QUESTIONS } from '../../../shared/questions.js';
import { buildSessions, buildAttempts } from '../../../shared/seed-data.js';

const DEMO_STUDENT = {
  name: 'Aarav Sharma',
  email: 'student@preppulse.ai',
  password: 'Demo@1234',
  role: 'student',
  targetRole: 'Full Stack Developer',
  experienceLevel: 'fresher',
};

const DEMO_ADMIN = {
  name: 'Priya Nair',
  email: 'admin@preppulse.ai',
  password: 'Admin@1234',
  role: 'admin',
  targetRole: 'Platform Admin',
  experienceLevel: '3+ years',
};

/**
 * Idempotent seeding. Safe to run on every server boot:
 * only inserts documents that are missing.
 */
export async function seedDatabase(models: any) {
  const { User, Question, InterviewSession, PracticeAttempt } = models;

  // ---------- Questions ----------
  const questionCount = await Question.countDocuments();
  if (questionCount === 0) {
    await Question.insertMany(QUESTIONS);
    console.log(`Seeded ${QUESTIONS.length} questions`);
  }

  // ---------- Demo users ----------
  const ensureUser = async (spec: any) => {
    let user = await User.findOne({ email: spec.email });
    if (!user) {
      user = await User.create({
        name: spec.name,
        email: spec.email,
        passwordHash: await bcrypt.hash(spec.password, 10),
        role: spec.role,
        targetRole: spec.targetRole,
        experienceLevel: spec.experienceLevel,
        streakCount: 4,
      });
      console.log(`Created ${spec.role} ${spec.email}`);
      return { user, created: true };
    }
    return { user, created: false };
  };

  const { user: student, created: studentCreated } = await ensureUser(DEMO_STUDENT);
  await ensureUser(DEMO_ADMIN);

  // ---------- History for the demo student ----------
  const hasHistory = await InterviewSession.countDocuments({ userId: student._id });
  if (!hasHistory) {
    const sessions = buildSessions();
    await InterviewSession.insertMany(
      sessions.map((s) => ({ ...s, userId: student._id }))
    );
    const attempts = buildAttempts();
    await PracticeAttempt.insertMany(
      attempts.map((a) => ({ ...a, userId: student._id }))
    );
    console.log(`Seeded ${sessions.length} sessions and ${attempts.length} practice attempts`);
  }

  return { studentCreated };
}
