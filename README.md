# PrepPulse AI

AI-powered interview practice and placement preparation for students. Answer real
interview questions, get a scored diagnosis of what was missing, practise timed MCQs,
and watch a readiness score move across four placement tracks.

Built as a MERN + TypeScript application, with a warm "Paper & Espresso" editorial
interface and light/dark modes.

---

## Demo credentials

Both accounts are created automatically by the seeder.

| Role | Email | Password |
| --- | --- | --- |
| Student | `student@preppulse.ai` | `Demo@1234` |
| Admin | `admin@preppulse.ai` | `Admin@1234` |

The **student** account ships with six graded interview sessions and four practice
attempts, so the dashboard charts and tables render with real history on first login.
Both accounts are also reachable from the one-click buttons on `/login`.

---

## Tech stack

**Client** — React 19, TypeScript, Vite, Tailwind CSS, React Router, Lucide React, Recharts.

**Server** — Node.js, Express, TypeScript, MongoDB + Mongoose, `jsonwebtoken`,
`bcryptjs`, `cors`, `dotenv`.

**Evaluation** — a dual-mode service: an LLM grades answers when `AI_API_KEY` is
configured, otherwise (or on any error/timeout) a deterministic rubric + keyword
evaluator takes over from `shared/`.

---

## Features

- **Auth & roles** — JWT auth, bcrypt password hashing, `requireAuth` and
  `requireAdmin` guards. Public registration always creates a `student`.
- **Student dashboard** — four KPI cards, score-trend area chart, per-track skill
  breakdown, weekly goal, focus areas and recent sessions.
- **Mock interview studio** — choose track, difficulty and 5 or 8 questions; 2-minute
  countdown per question, progress bar, word counter, Web Speech dictation with a
  typing fallback, hint toggle, then a scored report with your answer vs the ideal
  answer, missing keywords, and Print / Save PDF.
- **MCQ practice** — timed 10-question quizzes, per-question explanations, saved
  attempt history.
- **Question bank** — search and filter every question, reveal ideal answers, bookmark
  for revision.
- **Bookmarks** — saved questions, stored per user.
- **Admin** — full question CRUD (interview and MCQ), platform counters, and a
  student progress monitor with interview counts and average scores.
- **Profile** — update name, target role and experience level; change password.

---

## Folder structure

```
.
├── client/                     # React 19 + Vite frontend
│   ├── public/                 # favicon.svg, self-hosted woff2 fonts
│   └── src/
│       ├── components/         # AppShell, QuestionCard, ScoreRing, Logo, …
│       ├── lib/                # api client, auth context, theme, speech, formatters
│       └── pages/              # Landing, auth/, Dashboard, Interview, Practice, …
├── server/                     # Express + TypeScript API
│   └── src/
│       ├── middleware/         # requireAuth, requireAdmin, JWT signing
│       ├── models/             # User, Question, InterviewSession, PracticeAttempt, Bookmark
│       ├── routes/             # auth, dashboard, interview, practice, content, admin
│       ├── services/           # evaluator.ts (LLM with rubric fallback)
│       ├── utils/              # seeder, shared logic bridge
│       ├── index.ts            # app entry + auto-seed
│       └── seed.ts             # npm run seed
├── shared/                     # Question bank, scoring rubric, analytics, demo history
├── worker/                     # Optional preview adapter (KV-backed mirror of the API)
├── .env.example
└── README.md
```

`shared/` is the single source of truth for scoring and analytics, imported by both
the Express API and the preview adapter so results stay consistent.

---

## Local setup

### 1. Prerequisites

- Node.js 20+
- MongoDB running locally (or a connection string to a hosted cluster)

Start MongoDB if it is not already running:

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu / Debian
sudo systemctl start mongod
```

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment

```bash
cp .env.example server/.env
```

Then edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/preppulse_ai
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173

# Optional — omit or leave empty to use the built-in rubric evaluator
AI_API_KEY=
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
AI_TIMEOUT_MS=12000
```

`JWT_SECRET` must be changed for anything beyond local development. Never commit
`server/.env`.

### 4. Seed the database

```bash
cd server
npm run seed
```

The API also **auto-seeds on boot when the database is empty**, so this step is
optional on a fresh machine. Seeding is idempotent: it only inserts what is missing,
so re-running it will not duplicate questions or history.

This creates:

- 32 interview questions and 24 MCQs across the four tracks
- the demo student with 6 interview sessions and 4 practice attempts
- the demo admin

### 5. Run the app

Two terminals:

```bash
# Terminal 1 — API on :5000
cd server && npm run dev

# Terminal 2 — client on :5173
cd client && npm run dev
```

Open <http://localhost:5173> and sign in with **Demo student login**.

Vite proxies `/api` to `http://localhost:5000`, so no client-side URL configuration
is needed.

---

## API overview

| Method | Route | Access |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Public (always creates a student) |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Auth |
| `PATCH` | `/api/auth/profile` | Auth |
| `POST` | `/api/auth/password` | Auth |
| `GET` | `/api/dashboard` | Auth |
| `POST` | `/api/interview/start` | Auth |
| `POST` | `/api/interview/submit` | Auth |
| `GET` | `/api/interview/:id` | Auth (own sessions) |
| `POST` | `/api/practice/quiz` | Auth |
| `POST` | `/api/practice/submit` | Auth |
| `GET` | `/api/questions` | Auth |
| `POST` | `/api/bookmarks` | Auth (toggle) |
| `GET` | `/api/admin/stats` | **Admin** |
| `GET` `POST` `PUT` `DELETE` | `/api/admin/questions[/:id]` | **Admin** |

---

## Evaluation behaviour

`server/src/services/evaluator.ts` exports `evaluateAnswer`, which:

1. Returns a rubric score immediately if `AI_API_KEY` is unset.
2. Otherwise calls an OpenAI-compatible chat completions endpoint with a bounded
   timeout, asking for strict JSON.
3. Falls back to the rubric on any missing config, non-2xx response, timeout, or
   malformed payload, so a failed AI call never loses a student's answer.

Both paths return the same shape:

```ts
{ score, technicalScore, communicationScore, matchedKeywords, missingKeywords, feedback, idealAnswer }
```

---

## Preview adapter

`worker/index.js` mirrors the API on Cloudflare Workers with KV storage, used only for
the hosted preview. It is not part of the MERN deliverable and is not required to run
the project locally. Point it at the built client with `wrangler.jsonc` if you want a
serverless demo.

---

## Scripts

**server**

```bash
npm run dev        # watch mode via tsx
npm run seed       # seed the database
npm start          # run once with tsx
npm run typecheck  # tsc --noEmit
```

**client**

```bash
npm run dev        # Vite dev server
npm run build      # typecheck + production build
npm run preview    # serve the production build
```
