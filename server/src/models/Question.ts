import mongoose, { Schema, type Document, type Types } from 'mongoose';

export const QUESTION_CATEGORIES = [
  'MERN Stack',
  'Python & Data Science',
  'DSA & Problem Solving',
  'Aptitude & Logic',
] as const;

export type QuestionCategory = (typeof QUESTION_CATEGORIES)[number];
export type QuestionType = 'interview' | 'mcq';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  category: QuestionCategory;
  type: QuestionType;
  difficulty: Difficulty;
  questionText: string;
  options: string[];
  correctOption: number | null;
  idealAnswer: string;
  keywords: string[];
}

const questionSchema = new Schema<IQuestion>(
  {
    category: { type: String, enum: QUESTION_CATEGORIES, required: true, index: true },
    type: { type: String, enum: ['interview', 'mcq'], required: true, index: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    questionText: { type: String, required: true, trim: true },
    options: { type: [String], default: [] },
    correctOption: { type: Number, default: null, min: 0 },
    idealAnswer: { type: String, default: '' },
    keywords: { type: [String], default: [] },
  },
  { timestamps: true }
);

questionSchema.index({ category: 1, type: 1, difficulty: 1 });

export const Question = mongoose.model<IQuestion>('Question', questionSchema);
