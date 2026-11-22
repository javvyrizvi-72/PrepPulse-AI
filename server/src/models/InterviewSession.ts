import mongoose, { Schema, type Document, type Types } from 'mongoose';
import { QUESTION_CATEGORIES, type QuestionCategory, type Difficulty } from './Question.js';

export interface IResponse {
  questionText: string;
  userAnswer: string;
  score: number;
  technicalScore: number;
  communicationScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  feedback: string;
  idealAnswer: string;
}

export type ReadinessLevel = 'Needs Practice' | 'Developing' | 'Nearly Ready' | 'Interview Ready';

export interface IInterviewSession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  category: QuestionCategory;
  difficulty: Difficulty;
  responses: IResponse[];
  overallScore: number;
  readinessLevel: ReadinessLevel;
  createdAt: Date;
}

const responseSchema = new Schema<IResponse>(
  {
    questionText: { type: String, required: true },
    userAnswer: { type: String, default: '' },
    score: { type: Number, default: 0, min: 0, max: 10 },
    technicalScore: { type: Number, default: 0, min: 0, max: 10 },
    communicationScore: { type: Number, default: 0, min: 0, max: 10 },
    matchedKeywords: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    feedback: { type: String, default: '' },
    idealAnswer: { type: String, default: '' },
  },
  { _id: false }
);

const sessionSchema = new Schema<IInterviewSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, enum: QUESTION_CATEGORIES, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    responses: { type: [responseSchema], default: [] },
    overallScore: { type: Number, default: 0, min: 0, max: 10 },
    readinessLevel: {
      type: String,
      enum: ['Needs Practice', 'Developing', 'Nearly Ready', 'Interview Ready'],
      default: 'Needs Practice',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

sessionSchema.index({ userId: 1, createdAt: -1 });

export const InterviewSession = mongoose.model<IInterviewSession>('InterviewSession', sessionSchema);
