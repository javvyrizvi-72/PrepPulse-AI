import mongoose, { Schema, type Document, type Types } from 'mongoose';
import { QUESTION_CATEGORIES, type QuestionCategory } from './Question.js';

export interface IPracticeAttempt extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  category: QuestionCategory;
  score: number;
  totalQuestions: number;
  createdAt: Date;
}

const practiceAttemptSchema = new Schema<IPracticeAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, enum: QUESTION_CATEGORIES, required: true },
    score: { type: Number, required: true, min: 0 },
    totalQuestions: { type: Number, required: true, min: 1 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

practiceAttemptSchema.index({ userId: 1, createdAt: -1 });

export const PracticeAttempt = mongoose.model<IPracticeAttempt>(
  'PracticeAttempt',
  practiceAttemptSchema
);
