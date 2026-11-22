/**
 * Preview adapter for PrepPulse AI.
 *
 * The deliverable is the Express + MongoDB API in /server. This Worker mirrors the
 * same routes so the React client can be previewed here, using KV as its store and
 * the shared scoring/rubric modules as its evaluator. It is deliberately not a
 * substitute for MongoDB: it exists so the UI can be clicked through.
 */
import { CATEGORIES, QUESTIONS } from '../shared/questions.js';
import { gradeAnswer, readinessLevel } from '../shared/analytics.js';
import { buildSessions, buildAttempts } from '../shared/seed-data.js';

const enc = new TextEncoder();

/* ------------------------------- crypto utils ------------------------------ */

function b64url(bytes) {
  let s = '';
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  return atob(s.padEnd(s.length + ((4 - (s.length % 4)) % 4), '='));
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );
  return `pbkdf2$100000$${b64url(salt)}$${b64url(bits)}`;
}

async function verifyPassword(password, stored) {
  try {
    const [scheme, iter, saltB64, hashB64] = String(stored).split('$');
    if (scheme !== 'pbkdf2') return false;
    const salt = Uint8Array.from(b64urlDecode(saltB64), (c) => c.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: Number(iter), hash: 'SHA-256' },
      key,
      256
    );
    return b64url(bits) === hashB64;
  } catch {
    return false;
  }
}

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

async function signToken(payload, secret) {
  const header = b64url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const data = `${header}.${body}`;
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(data));
  return `${data}.${b64url(sig)}`;
}

async function verifyToken(token, secret) {
  try {
    const [header, body, sig] = String(token).split('.');
    if (!header || !body || !sig) return null;
    const ok = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret),
      Uint8Array.from(b64urlDecode(sig), (c) => c.charCodeAt(0)),
      enc.encode(`${header}.${body}`)
    );
    if (!ok) return null;
    const payload = JSON.parse(b64urlDecode(body));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

const uid = () => crypto.randomUUID();

/* --------------------------------- storage -------------------------------- */

const K = {
  users: 'users',
  sessions: 'sessions',
  attempts: 'attempts',
  bookmarks: 'bookmarks',
  questions: 'questions:v1',
  seeded: 'meta:seeded:v2',
};

async function read(env, key, fallback) {
  const raw = await env.KV.get(key);
  return raw ? JSON.parse(raw) : fallback;
}
async function write(env, key, value) {
  await env.KV.put(key, JSON.stringify(value));
}

const DEMO_STUDENT = {
  id: 'demo-student',
  name: 'Aarav Sharma',
  email: 'student@preppulse.ai',
  password: 'Demo@1234',
  role: 'student',
  targetRole: 'Full Stack Developer',
  experienceLevel: 'fresher',
  streakCount: 4,
};
const DEMO_ADMIN = {
  id: 'demo-admin',
  name: 'Priya Nair',
  email: 'admin@preppulse.ai',
  password: 'Admin@1234',
  role: 'admin',
  targetRole: 'Platform Admin',
  experienceLevel: '3+ years',
  streakCount: 12,
};

async function ensureSeed(env) {
  if (await env.KV.get(K.seeded)) return;
  const users = [];
  for (const spec of [DEMO_STUDENT, DEMO_ADMIN]) {
    users.push({
      id: spec.id,
      name: spec.name,
      email: spec.email,
      passwordHash: await hashPassword(spec.password),
      role: spec.role,
      targetRole: spec.targetRole,
      experienceLevel: spec.experienceLevel,
      streakCount: spec.streakCount,
      createdAt: new Date().toISOString(),
    });
  }

  const sessions = buildSessions().map((s, i) => ({
    id: `seed-session-${i + 1}`,
    userId: DEMO_STUDENT.id,
    ...s,
    createdAt: new Date(s.createdAt).toISOString(),
  }));
  const attempts = buildAttempts().map((a, i) => ({
    id: `seed-attempt-${i + 1}`,
    userId: DEMO_STUDENT.id,
    ...a,
    createdAt: new Date(a.createdAt).toISOString(),
  }));

  await write(env, K.users, users);
  await write(env, K.sessions, sessions);
  await write(env, K.attempts, attempts);
  await write(env, K.bookmarks, []);
  await write(env, K.questions, QUESTIONS_INDEXED);
  await write(env, K.seeded, { at: new Date().toISOString() });
}

/** Reads the question store, seeding defaults on first use. */
async function loadQuestions(env) {
  const stored = await read(env, K.questions, null);
  if (stored) return stored;
  await write(env, K.questions, QUESTIONS_INDEXED);
  return QUESTIONS_INDEXED;
}

/* -------------------------------- helpers -------------------------------- */

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const safeUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  targetRole: u.targetRole,
  experienceLevel: u.experienceLevel,
  streakCount: u.streakCount,
});

async function currentUser(req, env) {
  const header = req.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return null;
  const payload = await verifyToken(header.slice(7), env.JWT_SECRET || 'preppulse_preview_secret');
  if (!payload?.sub) return null;
  const users = await read(env, K.users, []);
  return users.find((u) => u.id === payload.sub) || null;
}

function publicQuestion(q, i) {
  return {
    id: q.id || `q-${i}`,
    category: q.category,
    type: q.type,
    difficulty: q.difficulty,
    questionText: q.questionText,
    options: q.options || [],
  };
}

const QUESTIONS_INDEXED = QUESTIONS.map((q, i) => ({ ...q, id: `q-${i + 1}` }));

/* ------------------------------ API handlers ------------------------------ */

async function handleAuth(req, env, url) {
  const path = url.pathname.replace('/api/auth', '');

  if (path === '/register' && req.method === 'POST') {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || '').trim();
    const email = String(body.email || '').toLowerCase().trim();
    const password = String(body.password || '');
    if (name.length < 2) return json({ message: 'Please enter your full name.' }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return json({ message: 'Please enter a valid email address.' }, 400);
    if (password.length < 8) return json({ message: 'Password must be at least 8 characters.' }, 400);

    const users = await read(env, K.users, []);
    if (users.some((u) => u.email === email))
      return json({ message: 'An account with this email already exists.' }, 409);

    // Public registration is always a student account.
    const user = {
      id: uid(),
      name,
      email,
      passwordHash: await hashPassword(password),
      role: 'student',
      targetRole: body.targetRole || 'Full Stack Developer',
      experienceLevel: ['fresher', '1-3 years', '3+ years'].includes(body.experienceLevel)
        ? body.experienceLevel
        : 'fresher',
      streakCount: 0,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    await write(env, K.users, users);
    const token = await signToken(
      { sub: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + 604800 },
      env.JWT_SECRET || 'preppulse_preview_secret'
    );
    return json({ token, user: safeUser(user) }, 201);
  }

  if (path === '/login' && req.method === 'POST') {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').toLowerCase().trim();
    const users = await read(env, K.users, []);
    const user = users.find((u) => u.email === email);
    if (!user || !(await verifyPassword(String(body.password || ''), user.passwordHash)))
      return json({ message: 'Invalid email or password.' }, 401);
    const token = await signToken(
      { sub: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + 604800 },
      env.JWT_SECRET || 'preppulse_preview_secret'
    );
    return json({ token, user: safeUser(user) });
  }

  if (path === '/me') {
    const user = await currentUser(req, env);
    if (!user) return json({ message: 'Authentication required.' }, 401);
    return json({ user: safeUser(user) });
  }

  if (path === '/profile' && req.method === 'PATCH') {
    const user = await currentUser(req, env);
    if (!user) return json({ message: 'Authentication required.' }, 401);
    const body = await req.json().catch(() => ({}));
    const users = await read(env, K.users, []);
    const target = users.find((u) => u.id === user.id);
    if (!target) return json({ message: 'Account not found.' }, 404);

    if (body.name !== undefined) {
      const clean = String(body.name).trim();
      if (clean.length < 2) return json({ message: 'Name needs at least 2 characters.' }, 400);
      target.name = clean.slice(0, 80);
    }
    if (body.targetRole !== undefined) {
      const clean = String(body.targetRole).trim();
      if (!clean) return json({ message: 'Target role cannot be empty.' }, 400);
      target.targetRole = clean.slice(0, 80);
    }
    if (body.experienceLevel !== undefined) {
      if (!['fresher', '1-3 years', '3+ years'].includes(body.experienceLevel))
        return json({ message: 'Choose a valid experience level.' }, 400);
      target.experienceLevel = body.experienceLevel;
    }
    await write(env, K.users, users);
    return json({ user: safeUser(target) });
  }

  if (path === '/password' && req.method === 'POST') {
    const user = await currentUser(req, env);
    if (!user) return json({ message: 'Authentication required.' }, 401);
    const body = await req.json().catch(() => ({}));
    if (!body.currentPassword || !body.newPassword)
      return json({ message: 'Enter your current and new password.' }, 400);
    if (String(body.newPassword).length < 8)
      return json({ message: 'New password must be at least 8 characters.' }, 400);

    const users = await read(env, K.users, []);
    const target = users.find((u) => u.id === user.id);
    if (!target) return json({ message: 'Account not found.' }, 404);

    const ok = await verifyPassword(String(body.currentPassword), target.passwordHash);
    if (!ok) return json({ message: 'Current password is incorrect.' }, 401);

    target.passwordHash = await hashPassword(String(body.newPassword));
    await write(env, K.users, users);
    return json({ message: 'Password updated.' });
  }

  return json({ message: 'Endpoint not found.' }, 404);
}

async function handleDashboard(req, env) {
  const user = await currentUser(req, env);
  if (!user) return json({ message: 'Authentication required.' }, 401);

  const [sessions, attempts, bookmarks, allQuestions] = await Promise.all([
    read(env, K.sessions, []),
    read(env, K.attempts, []),
    read(env, K.bookmarks, []),
    loadQuestions(env),
  ]);
  const mine = {
    sessions: sessions.filter((s) => s.userId === user.id),
    attempts: attempts.filter((a) => a.userId === user.id),
    bookmarks: bookmarks.filter((b) => b.userId === user.id),
  };

  // Reuse the same aggregation the Express API uses.
  const { buildDashboard } = await import('../shared/analytics.js');
  const payload = buildDashboard({
    user,
    sessions: mine.sessions,
    attempts: mine.attempts,
    bookmarks: mine.bookmarks,
    totalQuestions: allQuestions.length,
    categories: CATEGORIES,
  });

  return json({
    ...payload,
    student: {
      name: user.name,
      targetRole: user.targetRole,
      experienceLevel: user.experienceLevel,
      role: user.role,
    },
  });
}

async function handleQuestions(req, env, url) {
  const user = await currentUser(req, env);
  if (!user) return json({ message: 'Authentication required.' }, 401);
  const category = url.searchParams.get('category');
  const type = url.searchParams.get('type');
  const search = (url.searchParams.get('search') || '').toLowerCase();
  const difficulty = url.searchParams.get('difficulty');

  const all = await loadQuestions(env);
  const bookmarks = await read(env, K.bookmarks, []);
  const saved = new Set(bookmarks.filter((b) => b.userId === user.id).map((b) => b.questionId));

  const list = all.filter(
    (q) =>
      (!category || category === 'All' || q.category === category) &&
      (!type || type === 'all' || q.type === type) &&
      (!difficulty || difficulty === 'all' || q.difficulty === difficulty) &&
      (!search ||
        q.questionText.toLowerCase().includes(search) ||
        (q.idealAnswer || '').toLowerCase().includes(search))
  ).map((q) => ({
    ...q,
    bookmarked: saved.has(q.id),
  }));

  return json({ questions: list, total: list.length });
}

async function handleBookmarks(req, env, url) {
  const user = await currentUser(req, env);
  if (!user) return json({ message: 'Authentication required.' }, 401);

  const all = await loadQuestions(env);
  const byIdMap = new Map(all.map((q) => [q.id, q]));

  if (req.method === 'POST') {
    const body = await req.json().catch(() => ({}));
    const questionId = String(body.questionId || '');
    if (!byIdMap.has(questionId)) return json({ message: 'Question not found.' }, 404);
    const bookmarks = await read(env, K.bookmarks, []);
    const idx = bookmarks.findIndex((b) => b.userId === user.id && b.questionId === questionId);
    let bookmarked;
    if (idx >= 0) {
      bookmarks.splice(idx, 1);
      bookmarked = false;
    } else {
      bookmarks.push({ id: uid(), userId: user.id, questionId, createdAt: new Date().toISOString() });
      bookmarked = true;
    }
    await write(env, K.bookmarks, bookmarks);
    return json({ bookmarked });
  }

  const bookmarks = await read(env, K.bookmarks, []);
  const ids = bookmarks.filter((b) => b.userId === user.id).map((b) => b.questionId);
  return json({
    questions: ids
      .map((id) => byIdMap.get(id))
      .filter(Boolean)
      .map((q) => ({ ...q, bookmarked: true })),
  });
}

async function handleInterview(req, env, url) {
  const user = await currentUser(req, env);
  if (!user) return json({ message: 'Authentication required.' }, 401);

  // GET /api/interview/:id -> report
  const reportMatch = url.pathname.match(/^\/api\/interview\/([^/]+)$/);
  if (req.method === 'GET' && reportMatch) {
    const sessions = await read(env, K.sessions, []);
    const session = sessions.find((s) => s.id === reportMatch[1] && s.userId === user.id);
    if (!session) return json({ message: 'Session not found.' }, 404);
    return json({ session });
  }

  if (req.method === 'GET' && url.pathname === '/api/interview/history') {
    const sessions = await read(env, K.sessions, []);
    return json({
      sessions: sessions
        .filter((s) => s.userId === user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 20),
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/interview/submit') {
    const body = await req.json().catch(() => ({}));
    const category = String(body.category || '');
    const difficulty = String(body.difficulty || 'medium');
    const answers = Array.isArray(body.responses) ? body.responses : [];
    if (!CATEGORIES.includes(category)) return json({ message: 'Unknown category.' }, 400);

    const evaluated = [];
    const allQuestions = await loadQuestions(env);
    const qIndex = new Map(allQuestions.map((q) => [q.id, q]));
    for (const item of answers) {
      const q = qIndex.get(item.questionId) || {
        questionText: item.questionText,
        idealAnswer: item.idealAnswer || '',
        keywords: [],
      };
      const result = await evaluateAnswer({
        question: q,
        userAnswer: String(item.userAnswer || ''),
        category,
        env,
      });
      evaluated.push({ questionText: q.questionText, userAnswer: item.userAnswer || '', ...result });
    }

    const overall =
      Math.round(
        (evaluated.reduce((a, r) => a + r.score, 0) / Math.max(evaluated.length, 1)) * 10
      ) / 10;

    const session = {
      id: uid(),
      userId: user.id,
      category,
      difficulty,
      responses: evaluated,
      overallScore: overall,
      readinessLevel: readinessLevel(overall),
      createdAt: new Date().toISOString(),
    };

    const sessions = await read(env, K.sessions, []);
    sessions.push(session);
    await write(env, K.sessions, sessions);
    return json({ session }, 201);
  }

  // POST /api/interview/start -> question set without answers
  if (req.method === 'POST' && url.pathname === '/api/interview/start') {
    const body = await req.json().catch(() => ({}));
    const category = String(body.category || CATEGORIES[0]);
    const difficulty = String(body.difficulty || 'medium');
    const count = Number(body.count) === 8 ? 8 : 5;

    const all = await loadQuestions(env);
    let pool = all.filter(
      (q) => q.category === category && q.type === 'interview' && q.difficulty === difficulty
    );
    if (pool.length < count) {
      pool = all.filter((q) => q.category === category && q.type === 'interview');
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
    return json({
      questions: shuffled.map((q) => ({
        id: q.id,
        category: q.category,
        difficulty: q.difficulty,
        questionText: q.questionText,
        idealAnswer: q.idealAnswer,
        keywords: q.keywords || [],
      })),
    });
  }

  return json({ message: 'Endpoint not found.' }, 404);
}

async function handlePractice(req, env, url) {
  const user = await currentUser(req, env);
  if (!user) return json({ message: 'Authentication required.' }, 401);

  if (req.method === 'POST' && url.pathname === '/api/practice/quiz') {
    const body = await req.json().catch(() => ({}));
    const category = String(body.category || '');
    const all = await loadQuestions(env);
    let pool = all.filter((q) => q.type === 'mcq');
    if (category && category !== 'All') pool = pool.filter((q) => q.category === category);
    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    return json({
      questions: picked.map((q) => ({
        id: q.id,
        category: q.category,
        difficulty: q.difficulty,
        questionText: q.questionText,
        options: q.options,
      })),
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/practice/submit') {
    const body = await req.json().catch(() => ({}));
    const category = String(body.category || '');
    const answers = Array.isArray(body.answers) ? body.answers : [];
    const all = await loadQuestions(env);
    const qIndex = new Map(all.map((q) => [q.id, q]));
    let score = 0;
    let total = 0;
    const review = answers.map((a) => {
      const q = qIndex.get(a.questionId);
      if (!q) return null;
      total += 1;
      const correct = Number(a.selectedOption) === Number(q.correctOption);
      if (correct) score += 1;
      return {
        questionId: q.id,
        questionText: q.questionText,
        options: q.options,
        correctOption: q.correctOption,
        selectedOption: a.selectedOption ?? null,
        correct,
        explanation: q.idealAnswer,
        category: q.category,
      };
    }).filter(Boolean);

    const attempt = {
      id: uid(),
      userId: user.id,
      category: category || 'All',
      score,
      totalQuestions: total || answers.length,
      createdAt: new Date().toISOString(),
    };
    const attempts = await read(env, K.attempts, []);
    attempts.push(attempt);
    await write(env, K.attempts, attempts);
    return json({ attempt, review }, 201);
  }

  if (req.method === 'GET' && url.pathname === '/api/practice/history') {
    const attempts = await read(env, K.attempts, []);
    return json({
      attempts: attempts
        .filter((a) => a.userId === user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 12),
    });
  }

  return json({ message: 'Endpoint not found.' }, 404);
}

const QUESTION_CATEGORY_LIST = CATEGORIES;

function validateQuestion(body) {
  const errors = [];
  if (!QUESTION_CATEGORY_LIST.includes(body.category)) errors.push('Choose a valid category.');
  if (!['interview', 'mcq'].includes(body.type)) errors.push('Type must be interview or mcq.');
  if (!['easy', 'medium', 'hard'].includes(body.difficulty)) errors.push('Pick a difficulty.');
  if (!body.questionText || String(body.questionText).trim().length < 8)
    errors.push('Question text needs at least 8 characters.');

  let options = [];
  let correctOption = null;
  if (body.type === 'mcq') {
    options = Array.isArray(body.options)
      ? body.options.map((o) => String(o).trim()).filter(Boolean)
      : [];
    if (options.length < 2) errors.push('MCQs need at least two options.');
    const idx = Number(body.correctOption);
    if (!Number.isInteger(idx) || idx < 0 || idx >= options.length)
      errors.push('Pick which option is correct.');
    else correctOption = idx;
  }
  if (body.type === 'interview' && !String(body.idealAnswer || '').trim())
    errors.push('Interview questions need an ideal answer.');

  return { errors, options, correctOption };
}

function normaliseKeywords(value) {
  if (Array.isArray(value)) return value.map((k) => String(k).trim()).filter(Boolean);
  return String(value || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
}

async function handleAdmin(req, env, url) {
  const user = await currentUser(req, env);
  if (!user) return json({ message: 'Authentication required.' }, 401);
  if (user.role !== 'admin') return json({ message: 'Admin access only.' }, 403);

  const path = url.pathname.replace('/api/admin', '');
  const all = await loadQuestions(env);

  /* -------------------------- question CRUD -------------------------- */
  if (path === '/questions') {
    if (req.method === 'GET') {
      const search = (url.searchParams.get('search') || '').toLowerCase();
      const list = all.filter(
        (q) => !search || q.questionText.toLowerCase().includes(search)
      );
      return json({ questions: list });
    }
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { errors, options, correctOption } = validateQuestion(body);
      if (errors.length) return json({ message: errors[0], errors }, 400);
      const question = {
        id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        category: body.category,
        type: body.type,
        difficulty: body.difficulty,
        questionText: String(body.questionText).trim(),
        options,
        correctOption,
        idealAnswer: String(body.idealAnswer || '').trim(),
        keywords: normaliseKeywords(body.keywords),
      };
      all.unshift(question);
      await write(env, K.questions, all);
      return json({ question }, 201);
    }
  }

  const match = path.match(/^\/questions\/([^/]+)$/);
  if (match) {
    const id = decodeURIComponent(match[1]);
    const idx = all.findIndex((q) => q.id === id);
    if (idx < 0) return json({ message: 'Question not found.' }, 404);

    if (req.method === 'PUT') {
      const body = await req.json().catch(() => ({}));
      const { errors, options, correctOption } = validateQuestion(body);
      if (errors.length) return json({ message: errors[0], errors }, 400);
      all[idx] = {
        ...all[idx],
        category: body.category,
        type: body.type,
        difficulty: body.difficulty,
        questionText: String(body.questionText).trim(),
        options,
        correctOption,
        idealAnswer: String(body.idealAnswer || '').trim(),
        keywords: normaliseKeywords(body.keywords),
      };
      await write(env, K.questions, all);
      return json({ question: all[idx] });
    }

    if (req.method === 'DELETE') {
      all.splice(idx, 1);
      await write(env, K.questions, all);
      // Remove dangling bookmarks for the deleted question.
      const bookmarks = await read(env, K.bookmarks, []);
      await write(env, K.bookmarks, bookmarks.filter((b) => b.questionId !== id));
      return json({ deleted: true, id });
    }
  }

  /* ----------------------------- stats ------------------------------ */
  if (path === '/stats' && req.method === 'GET') {
    const [users, sessions, attempts, bookmarks] = await Promise.all([
      read(env, K.users, []),
      read(env, K.sessions, []),
      read(env, K.attempts, []),
      read(env, K.bookmarks, []),
    ]);
    const students = users.filter((u) => u.role === 'student');
    const progress = students.map((s) => {
      const own = sessions.filter((x) => x.userId === s.id);
      const ownAttempts = attempts.filter((x) => x.userId === s.id);
      const avg = own.length
        ? Math.round((own.reduce((a, x) => a + x.overallScore, 0) / own.length) * 10) / 10
        : 0;
      const accuracy = ownAttempts.length
        ? Math.round(
            (ownAttempts.reduce(
              (a, x) => a + (x.totalQuestions ? (x.score / x.totalQuestions) * 100 : 0),
              0
            ) /
              ownAttempts.length) *
              10
          ) / 10
        : 0;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        targetRole: s.targetRole,
        experienceLevel: s.experienceLevel,
        interviews: own.length,
        averageScore: avg,
        practiceAttempts: ownAttempts.length,
        practiceAccuracy: accuracy,
        createdAt: s.createdAt,
      };
    });

    return json({
      stats: {
        users: users.length,
        students: students.length,
        admins: users.length - students.length,
        questions: all.length,
        sessions: sessions.length,
        attempts: attempts.length,
        bookmarks: bookmarks.length,
      },
      recentUsers: users
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8)
        .map(safeUser),
      progress,
    });
  }

  return json({ message: 'Endpoint not found.' }, 404);
}

/* ------------------------------- evaluator -------------------------------- */

/**
 * Dual-mode evaluation, mirrored from server/services/evaluator.ts.
 * The preview Worker has no outbound network, so the AI branch always falls
 * back to the deterministic rubric — the same contract the Express service uses.
 */
async function evaluateAnswer({ question, userAnswer, env }) {
  const idealAnswer = question.idealAnswer || '';
  const base = gradeAnswer(userAnswer, question);

  if (!env.AI_API_KEY) {
    return { ...base, idealAnswer, source: 'rubric' };
  }

  try {
    // Real LLM call would go here in the Express service. In the sandboxed
    // preview this times out or fails, which must degrade gracefully.
    return { ...base, idealAnswer, source: 'rubric' };
  } catch {
    return { ...base, idealAnswer, source: 'rubric' };
  }
}

/* --------------------------------- router --------------------------------- */

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS ? env.ASSETS.fetch(req) : new Response('Not found', { status: 404 });
    }

    await ensureSeed(env);

    try {
      if (url.pathname === '/api/health')
        return json({ status: 'ok', service: 'preppulse-ai', storage: 'kv-preview' });
      if (url.pathname.startsWith('/api/auth')) return handleAuth(req, env, url);
      if (url.pathname === '/api/dashboard') return handleDashboard(req, env);
      if (url.pathname === '/api/questions') return handleQuestions(req, env, url);
      if (url.pathname.startsWith('/api/bookmarks')) return handleBookmarks(req, env, url);
      if (url.pathname.startsWith('/api/interview')) return handleInterview(req, env, url);
      if (url.pathname.startsWith('/api/practice')) return handlePractice(req, env, url);
      if (url.pathname.startsWith('/api/admin')) return handleAdmin(req, env, url);
      return json({ message: 'Endpoint not found.' }, 404);
    } catch (err) {
      return json({ message: 'Unexpected error. Try again.', detail: String(err?.message || err) }, 500);
    }
  },
};
