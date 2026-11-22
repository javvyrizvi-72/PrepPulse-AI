// Shared scoring + analytics helpers.
// Used by the Express server and mirrored in the Worker preview.

export const STOPWORDS = new Set([
  'the','a','an','and','or','but','if','then','than','that','this','these','those',
  'is','are','was','were','be','been','being','to','of','in','on','for','with','as',
  'by','at','from','it','its','their','there','which','when','while','you','your',
  'we','our','can','should','would','could','will','must','do','does','did','not',
  'use','used','using','about','into','over','also','more','most','some','each',
  'how','what','why','who','where','so','such','only','just','very','them','they',
]);

export function tokens(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^\.+|\.+$/g, ''))
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Heuristic grading for a free-text interview answer.
 * Returns 0-10 technical, 0-10 communication, matched/missing keywords.
 */
export function gradeAnswer(userAnswer, question) {
  const answer = String(userAnswer || '').trim();
  const keywords = (question.keywords || []).map((k) => k.toLowerCase());

  if (!answer) {
    return {
      score: 0,
      technicalScore: 0,
      communicationScore: 0,
      matchedKeywords: [],
      missingKeywords: keywords,
      feedback:
        'No answer recorded. Start with a one-line definition, then add an example so the interviewer can follow your reasoning.',
    };
  }

  const lower = answer.toLowerCase();
  const matchedKeywords = keywords.filter((k) => lower.includes(k));
  const missingKeywords = keywords.filter((k) => !lower.includes(k));
  const coverage = keywords.length ? matchedKeywords.length / keywords.length : 0;

  const words = answer.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const unique = new Set(tokens(answer)).size;
  const sentences = answer.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const avgSentence = sentences ? wordCount / sentences : wordCount;

  // Technical: keyword coverage dominates, with a floor for substance.
  const lengthBonus = wordCount >= 40 ? 1 : wordCount >= 20 ? 0.6 : wordCount >= 8 ? 0.3 : 0;
  const technical = Math.min(10, coverage * 8.2 + lengthBonus * 1.6);

  // Communication: completeness, sentence rhythm, vocabulary variety.
  let communication = 5;
  if (wordCount >= 25) communication += 1.5;
  if (wordCount >= 60) communication += 0.8;
  if (wordCount > 180) communication -= 1.2; // rambling
  if (avgSentence >= 6 && avgSentence <= 30) communication += 1.4;
  else if (avgSentence > 30) communication -= 0.8;
  if (unique / Math.max(wordCount, 1) > 0.55) communication += 1;
  if (sentences >= 2) communication += 0.6;
  communication = Math.max(1, Math.min(10, communication + coverage * 1.2));

  const score = Math.round((technical * 0.62 + communication * 0.38) * 10) / 10;

  let feedback;
  if (score >= 8.5) {
    feedback = 'Strong, specific answer. You covered the core idea and the important keywords. Keep the same structure and add one concrete example.';
  } else if (score >= 7) {
    feedback = 'Good answer with the main idea in place. Tighten the ending and mention ' + (missingKeywords.slice(0, 2).join(', ') || 'a concrete example') + ' to reach a top score.';
  } else if (score >= 5) {
    feedback = 'Understandable but incomplete. Name the concept directly, then cover ' + (missingKeywords.slice(0, 3).join(', ') || 'the key tradeoffs') + ' in one or two sentences.';
  } else if (wordCount < 12) {
    feedback = 'Too brief to assess. Expand to at least three sentences: definition, how it works, and when you would use it.';
  } else {
    feedback = 'The answer drifts from the core concept. Lead with a precise definition, then add the keywords ' + (missingKeywords.slice(0, 3).join(', ') || 'from the model answer') + '.';
  }

  return {
    score,
    technicalScore: Math.round(technical * 10) / 10,
    communicationScore: Math.round(communication * 10) / 10,
    matchedKeywords,
    missingKeywords,
    feedback,
  };
}

export function readinessLevel(overallScore) {
  if (overallScore >= 8) return 'Interview Ready';
  if (overallScore >= 6.5) return 'Nearly Ready';
  if (overallScore >= 4.5) return 'Developing';
  return 'Needs Practice';
}

export function average(nums) {
  const clean = nums.filter((n) => typeof n === 'number' && !Number.isNaN(n));
  if (!clean.length) return 0;
  return Math.round((clean.reduce((a, b) => a + b, 0) / clean.length) * 10) / 10;
}

/**
 * Builds the dashboard payload from raw sessions + attempts.
 */
export function buildDashboard({ user, sessions, attempts, bookmarks, totalQuestions, categories }) {
  const totalSessions = sessions.length;
  const totalPractice = attempts.length;
  const practiceAccuracy = totalPractice
    ? average(attempts.map((a) => (a.totalQuestions ? (a.score / a.totalQuestions) * 100 : 0)))
    : 0;

  const sessionScores = sessions.map((s) => s.overallScore);
  const avgScore = average(sessionScores);

  // Skill breakdown per category.
  const byCategory = categories.map((category) => {
    const catSessions = sessions.filter((s) => s.category === category);
    const catAttempts = attempts.filter((a) => a.category === category);
    const catResponses = catSessions.flatMap((s) => s.responses || []);
    return {
      category,
      technical: average(catResponses.map((r) => r.technicalScore)),
      communication: average(catResponses.map((r) => r.communicationScore)),
      practiceAccuracy: catAttempts.length
        ? average(catAttempts.map((a) => (a.totalQuestions ? (a.score / a.totalQuestions) * 100 : 0)))
        : 0,
      sessions: catSessions.length,
    };
  });

  // Score trend: last 12 sessions oldest -> newest.
  const ordered = [...sessions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const trend = ordered.slice(-12).map((s) => ({
    label: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    date: new Date(s.createdAt).toISOString().slice(0, 10),
    score: s.overallScore,
    category: s.category,
  }));

  // Weekly activity for the last 8 weeks.
  const activity = [];
  const now = new Date();
  for (let i = 7; i >= 0; i -= 1) {
    const end = new Date(now);
    end.setDate(now.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    const inRange = (d) => {
      const t = new Date(d).getTime();
      return t >= start.setHours(0, 0, 0, 0) && t <= end.setHours(23, 59, 59, 999);
    };
    activity.push({
      label: new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      interviews: sessions.filter((s) => inRange(s.createdAt)).length,
      practice: attempts.filter((a) => inRange(a.createdAt)).length,
    });
  }

  // Streak from distinct active days.
  const days = new Set(
    [...sessions, ...attempts].map((x) => new Date(x.createdAt).toISOString().slice(0, 10))
  );
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  streak = Math.max(streak, user.streakCount || 0);

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map((s) => ({
      id: String(s._id || s.id),
      category: s.category,
      difficulty: s.difficulty,
      overallScore: s.overallScore,
      readinessLevel: s.readinessLevel,
      answerCount: (s.responses || []).length,
      createdAt: s.createdAt,
    }));

  // Weekly goal: 5 sessions this calendar week.
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const thisWeek = sessions.filter((s) => new Date(s.createdAt) >= weekStart).length;

  const strongCategory = [...byCategory].sort((a, b) => b.technical - a.technical)[0];
  const weakCategory = [...byCategory]
    .filter((c) => c.sessions > 0)
    .sort((a, b) => a.technical - b.technical)[0];

  return {
    kpis: {
      totalSessions,
      averageScore: avgScore,
      practiceAccuracy: Math.round(practiceAccuracy),
      bestScore: sessionScores.length ? Math.max(...sessionScores) : 0,
      streak,
      readinessLevel: readinessLevel(avgScore),
      bookmarks: bookmarks.length,
      totalQuestions,
      thisWeek,
      weeklyGoal: 5,
    },
    trend,
    skillBreakdown: byCategory,
    activity,
    recentSessions,
    focus: {
      strongest: strongCategory ? strongCategory.category : null,
      weakest: weakCategory ? weakCategory.category : null,
    },
    practiceSummary: categories.map((category) => ({
      category,
      attempts: attempts.filter((a) => a.category === category).length,
      accuracy: (() => {
        const list = attempts.filter((a) => a.category === category);
        return list.length ? average(list.map((a) => (a.totalQuestions ? (a.score / a.totalQuestions) * 100 : 0))) : 0;
      })(),
    })),
  };
}

export default { gradeAnswer, readinessLevel, average, buildDashboard, tokens };
