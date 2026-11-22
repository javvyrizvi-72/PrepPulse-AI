/**
 * Bridge to the shared ESM helpers in /shared so the same scoring and
 * analytics logic powers the Express API and the Worker preview.
 */
import { gradeAnswer as grade, readinessLevel as readiness, average as avg, buildDashboard as build } from '../../../shared/analytics.js';
import { CATEGORIES as CATS } from '../../../shared/questions.js';

export const CATEGORIES: string[] = CATS;

export const gradeAnswer = grade as (
  answer: string,
  question: { keywords?: string[] }
) => {
  score: number;
  technicalScore: number;
  communicationScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  feedback: string;
};

export const readinessLevel = readiness as (score: number) => string;
export const average = avg as (nums: number[]) => number;
export const buildDashboard = build as (input: any) => any;
