import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Question } from './models/Question.js';
import { InterviewSession } from './models/InterviewSession.js';
import { PracticeAttempt } from './models/PracticeAttempt.js';
import { Bookmark } from './models/Bookmark.js';
import { seedDatabase } from './utils/seedDatabase.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/preppulse_ai';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  await seedDatabase({ User, Question, InterviewSession, PracticeAttempt, Bookmark, bcrypt });
  const counts = {
    users: await User.countDocuments(),
    questions: await Question.countDocuments(),
    sessions: await InterviewSession.countDocuments(),
    attempts: await PracticeAttempt.countDocuments(),
  };
  console.log('Seed complete:', counts);
  console.log('Demo student: student@preppulse.ai / Demo@1234');
  console.log('Demo admin:   admin@preppulse.ai / Admin@1234');
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
