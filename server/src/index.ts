import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import interviewRoutes from './routes/interview.js';
import practiceRoutes from './routes/practice.js';
import { questionsRouter, bookmarksRouter } from './routes/content.js';
import { adminRouter } from './routes/admin.js';
import { User } from './models/User.js';
import { Question } from './models/Question.js';
import { InterviewSession } from './models/InterviewSession.js';
import { PracticeAttempt } from './models/PracticeAttempt.js';
import { Bookmark } from './models/Bookmark.js';
import { seedDatabase } from './utils/seedDatabase.js';

const app = express();
const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/preppulse_ai';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'preppulse-ai' }));
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/questions', questionsRouter);
app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/admin', adminRouter);

app.use('/api', (_req, res) => res.status(404).json({ message: 'Endpoint not found.' }));

async function start() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  // Auto-seed when the database is empty so the first run is usable.
  await seedDatabase({ User, Question, InterviewSession, PracticeAttempt, Bookmark, bcrypt });

  app.listen(PORT, () => {
    console.log(`PrepPulse AI API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
