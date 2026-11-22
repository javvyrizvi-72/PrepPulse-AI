import { gradeAnswer, readinessLevel } from '../../../shared/analytics.js';

export type Evaluation = {
  score: number;
  technicalScore: number;
  communicationScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  feedback: string;
  idealAnswer: string;
  source: 'ai' | 'rubric';
};

export type EvaluateInput = {
  questionText: string;
  idealAnswer: string;
  keywords?: string[];
  userAnswer: string;
  category?: string;
  difficulty?: string;
};

const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 12000);

const SYSTEM_PROMPT = `You grade interview answers for a placement prep platform.
Return ONLY compact JSON with this shape:
{"score":0-10,"technicalScore":0-10,"communicationScore":0-10,
 "matchedKeywords":["..."],"missingKeywords":["..."],"feedback":"2 sentences, direct, actionable"}
Score technical depth against the ideal answer and the required keywords.
Score communication on structure, precision and completeness. Never inflate scores.`;

function clamp(n: unknown, fallback: number) {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(0, Math.min(10, Math.round(v * 10) / 10));
}

function asStrings(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 12) : [];
}

/**
 * Calls an OpenAI-compatible chat completions endpoint.
 * Throws on missing config, non-2xx responses, timeouts and malformed output,
 * so the caller can fall back to the deterministic rubric.
 */
async function evaluateWithLLM(input: EvaluateInput): Promise<Evaluation> {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  if (!apiKey) throw new Error('AI_API_KEY is not configured');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Category: ${input.category || 'General'}
Difficulty: ${input.difficulty || 'medium'}
Question: ${input.questionText}
Required keywords: ${(input.keywords || []).join(', ') || 'none listed'}
Ideal answer: ${input.idealAnswer}
Candidate answer: ${input.userAnswer}`,
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`LLM responded ${res.status}`);

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = body.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty LLM response');

    const parsed = JSON.parse(content) as Record<string, unknown>;
    const fallback = gradeAnswer(input.userAnswer, { keywords: input.keywords });

    return {
      score: clamp(parsed.score, fallback.score),
      technicalScore: clamp(parsed.technicalScore, fallback.technicalScore),
      communicationScore: clamp(parsed.communicationScore, fallback.communicationScore),
      matchedKeywords: asStrings(parsed.matchedKeywords).length
        ? asStrings(parsed.matchedKeywords)
        : fallback.matchedKeywords,
      missingKeywords: asStrings(parsed.missingKeywords).length
        ? asStrings(parsed.missingKeywords)
        : fallback.missingKeywords,
      feedback: typeof parsed.feedback === 'string' && parsed.feedback.trim()
        ? parsed.feedback.trim()
        : fallback.feedback,
      idealAnswer: input.idealAnswer,
      source: 'ai',
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Dual-mode evaluation.
 * 1. If AI_API_KEY is set, try the LLM (bounded by a timeout).
 * 2. On any missing config, error, timeout or bad payload, fall back to the
 *    deterministic rubric in /shared. A failed AI call must never fail a session.
 */
export async function evaluateAnswer(input: EvaluateInput): Promise<Evaluation> {
  const rubric = (): Evaluation => {
    const graded = gradeAnswer(input.userAnswer, { keywords: input.keywords });
    return { ...graded, idealAnswer: input.idealAnswer, source: 'rubric' };
  };

  if (!process.env.AI_API_KEY) return rubric();

  try {
    return await evaluateWithLLM(input);
  } catch (err) {
    console.warn(
      `[evaluator] AI evaluation unavailable, using rubric: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
    return rubric();
  }
}

export { readinessLevel };
