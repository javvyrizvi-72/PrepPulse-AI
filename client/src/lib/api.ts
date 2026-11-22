export type User = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  targetRole: string;
  experienceLevel: string;
  streakCount: number;
};

export type AuthResponse = { token: string; user: User };

const TOKEN_KEY = 'preppulse.token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`/api${path}`, { ...options, headers });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => ({})) : {};

  if (!res.ok) {
    throw new ApiError((body as any)?.message || 'Something went wrong. Try again.', res.status);
  }
  return body as T;
}

export const api = {
  register: (payload: {
    name: string;
    email: string;
    password: string;
    targetRole?: string;
    experienceLevel?: string;
  }) => request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  me: () => request<{ user: User }>('/auth/me'),

  dashboard: () => request<DashboardData>('/dashboard'),

  startInterview: (payload: { category: string; difficulty: string; count: number }) =>
    request<{ questions: InterviewQuestion[] }>('/interview/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  submitInterview: (payload: {
    category: string;
    difficulty: string;
    responses: { questionId: string; questionText: string; userAnswer: string; idealAnswer: string; keywords?: string[] }[];
  }) =>
    request<{ session: InterviewSessionRecord }>('/interview/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  interviewReport: (id: string) =>
    request<{ session: InterviewSessionRecord }>(`/interview/${id}`),

  interviewHistory: () =>
    request<{ sessions: InterviewSessionRecord[] }>('/interview/history'),

  startQuiz: (payload: { category: string }) =>
    request<{ questions: McqQuestion[] }>('/practice/quiz', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  submitQuiz: (payload: { category: string; answers: { questionId: string; selectedOption: number | null }[] }) =>
    request<{ attempt: PracticeAttemptRecord; review: QuizReview[] }>('/practice/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  practiceHistory: () =>
    request<{ attempts: PracticeAttemptRecord[] }>('/practice/history'),

  questions: (params: {
    category?: string;
    type?: string;
    difficulty?: string;
    search?: string;
  }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request<{ questions: BankQuestion[]; total: number }>(`/questions${suffix}`);
  },

  toggleBookmark: (questionId: string) =>
    request<{ bookmarked: boolean }>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ questionId }),
    }),

  bookmarks: () => request<{ questions: BankQuestion[] }>('/bookmarks'),

  adminStats: () =>
    request<{
      stats: Record<string, number>;
      recentUsers: { id: string; name: string; email: string; role: string; targetRole: string }[];
      progress: StudentProgress[];
    }>('/admin/stats'),

  adminQuestions: (search?: string) =>
    request<{ questions: BankQuestion[] }>(
      `/admin/questions${search ? `?search=${encodeURIComponent(search)}` : ''}`
    ),

  adminCreateQuestion: (payload: QuestionPayload) =>
    request<{ question: BankQuestion }>('/admin/questions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  adminUpdateQuestion: (id: string, payload: QuestionPayload) =>
    request<{ question: BankQuestion }>(`/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  adminDeleteQuestion: (id: string) =>
    request<{ deleted: boolean; id: string }>(`/admin/questions/${id}`, { method: 'DELETE' }),

  updateProfile: (payload: {
    name?: string;
    targetRole?: string;
    experienceLevel?: string;
  }) =>
    request<{ user: User }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/auth/password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export type QuestionPayload = {
  category: string;
  type: 'interview' | 'mcq';
  difficulty: string;
  questionText: string;
  options: string[];
  correctOption: number | null;
  idealAnswer: string;
  keywords: string[];
};

export type StudentProgress = {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  experienceLevel: string;
  interviews: number;
  averageScore: number;
  practiceAttempts: number;
  practiceAccuracy: number;
  createdAt: string;
};

/* ------------------------------- phase 2 types ----------------------------- */

export type InterviewQuestion = {
  id: string;
  category: string;
  difficulty: string;
  questionText: string;
  idealAnswer: string;
  keywords: string[];
};

export type EvaluatedResponse = {
  questionText: string;
  userAnswer: string;
  score: number;
  technicalScore: number;
  communicationScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  feedback: string;
  idealAnswer: string;
};

export type InterviewSessionRecord = {
  id: string;
  category: string;
  difficulty: string;
  responses: EvaluatedResponse[];
  overallScore: number;
  readinessLevel: string;
  createdAt: string;
};

export type McqQuestion = {
  id: string;
  category: string;
  difficulty: string;
  questionText: string;
  options: string[];
};

export type PracticeAttemptRecord = {
  id: string;
  category: string;
  score: number;
  totalQuestions: number;
  createdAt: string;
};

export type QuizReview = {
  questionId: string;
  questionText: string;
  options: string[];
  correctOption: number;
  selectedOption: number | null;
  correct: boolean;
  explanation: string;
  category: string;
};

export type BankQuestion = {
  id: string;
  category: string;
  type: 'interview' | 'mcq';
  difficulty: string;
  questionText: string;
  options: string[];
  correctOption: number | null;
  idealAnswer: string;
  keywords: string[];
  bookmarked?: boolean;
};

export type Kpis = {
  totalSessions: number;
  averageScore: number;
  practiceAccuracy: number;
  bestScore: number;
  streak: number;
  readinessLevel: string;
  bookmarks: number;
  totalQuestions: number;
  thisWeek: number;
  weeklyGoal: number;
};

export type SkillRow = {
  category: string;
  technical: number;
  communication: number;
  practiceAccuracy: number;
  sessions: number;
};

export type DashboardData = {
  kpis: Kpis;
  trend: { label: string; date: string; score: number; category: string }[];
  skillBreakdown: SkillRow[];
  activity: { label: string; interviews: number; practice: number }[];
  recentSessions: {
    id: string;
    category: string;
    difficulty: string;
    overallScore: number;
    readinessLevel: string;
    answerCount: number;
    createdAt: string;
  }[];
  focus: { strongest: string | null; weakest: string | null };
  practiceSummary: { category: string; attempts: number; accuracy: number }[];
  student: { name: string; targetRole: string; experienceLevel: string; role: string };
};

export const DEMO_STUDENT = { email: 'student@preppulse.ai', password: 'Demo@1234' };
export const DEMO_ADMIN = { email: 'admin@preppulse.ai', password: 'Admin@1234' };
