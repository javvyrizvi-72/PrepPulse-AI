// Demo history so the dashboard renders meaningful charts immediately.
import { gradeAnswer } from './analytics.js';
import { QUESTIONS } from './questions.js';

const interviewByCategory = (category) =>
  QUESTIONS.filter((q) => q.type === 'interview' && q.category === category);

// Realistic answers keyed by question text fragments.
const SAMPLE_ANSWERS = [
  {
    match: 'difference between state and props',
    answer:
      'Props are read-only values passed from a parent component, while state is data a component owns and updates with useState. Props flow one way down the tree. When state changes React re-renders that component and its children.',
  },
  {
    match: 'virtual DOM',
    answer:
      'React keeps a lightweight virtual DOM in memory. On a state change it builds a new tree and diffs it against the old one during reconciliation, then applies only the minimal set of real DOM updates. That avoids expensive layout work.',
  },
  {
    match: 'useEffect cleanup',
    answer:
      'The function returned from useEffect is the cleanup. It runs before the effect runs again and on unmount. I use it to clear timers, abort fetch calls with an AbortController, and remove window event listeners so nothing stale keeps running.',
  },
  {
    match: 'middleware chain',
    answer:
      'Each Express middleware receives req, res and next. It can read headers, verify the JWT, attach req.user and call next to continue. If auth fails it returns 401 directly. Errors passed as next(err) go to the error handler at the end.',
  },
  {
    match: 'Mongoose population',
    answer:
      'populate replaces an ObjectId reference with the actual document. It costs extra queries, so I avoid it on large list endpoints and denormalise a small summary instead, or use an aggregation lookup when I need flexibility.',
  },
  {
    match: 'protect a REST API',
    answer:
      'I hash passwords with bcrypt, issue short-lived JWTs, validate request bodies, add a role guard on admin routes, restrict CORS to known origins, apply helmet, and rate-limit the login route. Secrets stay in environment variables and the client never sends its own role.',
  },
  {
    match: 'useMemo and useCallback',
    answer:
      'useMemo caches a computed value between renders and useCallback caches a function reference. They matter when the value feeds a memoised child or an effect dependency. I only add them after measuring, not by default.',
  },
  {
    match: 'CORS',
    answer:
      'CORS is a browser rule about which origins may read API responses. I enable the cors middleware with an explicit origin allowlist rather than a wildcard, and set allowed methods and credentials deliberately.',
  },
  {
    match: 'list and a tuple',
    answer:
      'Lists are mutable and can grow, using square brackets. Tuples are immutable and fixed size, and they are hashable when their elements are, so they work well as dictionary keys or for returning a fixed record.',
  },
  {
    match: 'missing values',
    answer:
      'First I measure gaps with isna().sum(). Then I either drop rows with dropna or impute, for example filling a numeric column with its median. The decision depends on how much is missing and whether it is missing at random.',
  },
  {
    match: 'bias-variance',
    answer:
      'High bias means underfitting and high variance means overfitting. I plot training versus validation error to see which dominates, then use regularisation, more data, or feature selection with cross-validation to balance them.',
  },
  {
    match: 'gradient boosting',
    answer:
      'Random forest builds many trees independently and averages them, mostly reducing variance. Gradient boosting builds shallow trees sequentially, each fitting the residuals of the ensemble, which reduces bias but needs a careful learning rate and depth.',
  },
  {
    match: 'with statement',
    answer:
      'The with statement uses the context manager protocol so the file closes automatically even if an exception is raised. That prevents leaked file handles.',
  },
  {
    match: 'groupby',
    answer:
      'groupby summarises by one or more keys into a compact table. A pivot table reshapes into a matrix across two categorical dimensions, which is better for reporting. I choose groupby for aggregation and pivot for cross-tabs.',
  },
  {
    match: 'imbalanced classification',
    answer:
      'Accuracy is misleading when one class is rare, so I report precision, recall, F1 and PR-AUC with a confusion matrix. I pick the metric from the real cost of false positives versus false negatives and use stratified splits and class weights.',
  },
  {
    match: 'virtual environment',
    answer:
      'A virtual environment isolates a project’s interpreter and packages so versions do not conflict between projects. I activate it, install dependencies there, and pin exact versions in requirements.txt.',
  },
  {
    match: 'arrays and linked lists',
    answer:
      'Arrays give constant-time indexed access but inserting in the middle is linear because elements shift. Linked lists insert and delete in constant time given a node reference but access is linear. Arrays also have better cache locality.',
  },
  {
    match: 'cycle in a linked list',
    answer:
      'I use Floyd’s tortoise and hare. One pointer moves one node, the other moves two. If they meet there is a cycle, and if the fast pointer reaches null there is none. This is linear time and constant space.',
  },
  {
    match: 'hash map',
    answer:
      'A hash map gives average constant-time lookups and one-pass frequency counting. Sorting costs n log n but produces ordered data. I use a hash map for lookups and sorting when I need order.',
  },
  {
    match: 'coin change',
    answer:
      'I define dp[amount] as the fewest coins for that amount, set dp[0] to zero, and fill bottom-up taking the minimum of dp[amount - coin] plus one. That is O(amount times coins) instead of exponential recursion.',
  },
  {
    match: 'binary search',
    answer:
      'Binary search is logarithmic because each comparison halves the remaining space. It requires sorted input and constant extra space.',
  },
  {
    match: 'stack differ from a queue',
    answer:
      'A stack is LIFO and suits recursion, undo and parsing. A queue is FIFO and suits breadth-first search, scheduling and buffering.',
  },
  {
    match: 'Dijkstra',
    answer:
      'It keeps a min-heap of distance and node, starts the source at zero, settles the closest node, and relaxes outgoing edges whenever a shorter distance appears. With a binary heap it needs non-negative weights and runs in order V plus E log V.',
  },
  {
    match: 'kth largest',
    answer:
      'A min-heap of size k gives n log k time while streaming. Quickselect averages linear time by partitioning, though the worst case is quadratic.',
  },
  {
    match: 'average speed',
    answer:
      'Average speed is distance over time, so 240 divided by 3 is 80 kilometres per hour.',
  },
  {
    match: 'total discount',
    answer:
      'Starting from 100, a 20 percent discount gives 80, then 10 percent off that gives 72. The total discount is 28 percent, not 30, because the second discount applies to the reduced price.',
  },
  {
    match: 'work-rate',
    answer:
      'I convert each time into a rate. A is one sixth per day and B is one twelfth, so together one quarter per day, which means four days.',
  },
  {
    match: 'comes next',
    answer:
      'The differences are four, six, eight and ten, so the next difference is twelve and the answer is 42. The rule is n times n plus one.',
  },
  {
    match: 'seating-arrangement',
    answer:
      'I draw the slots, translate each clue into a fixed or relative position, and place the most constrained person first. I record eliminations and then verify the final layout against every clue.',
  },
  {
    match: 'probability of drawing two reds',
    answer:
      'The first draw is five eighths and the second is four sevenths because the denominator drops without replacement. Multiplying gives twenty over fifty-six, or five fourteenths.',
  },
  {
    match: 'all roses are flowers',
    answer:
      'I cannot conclude anything about roses fading. The fading flowers might be a different kind, so the statement only tells us that some flowers fade.',
  },
  {
    match: '48 × 52',
    answer:
      'I use the difference of squares. Fifty minus two times fifty plus two is 2500 minus four, which is 2496.',
  },
];

function answerFor(questionText) {
  const entry = SAMPLE_ANSWERS.find((s) => questionText.toLowerCase().includes(s.match.toLowerCase()));
  return entry ? entry.answer : '';
}

export function buildSessions() {
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  // Progressive improvement across 6 sessions, oldest first.
  // factor = share of the model answer the student managed at that point.
  const plan = [
    { category: 'MERN Stack', difficulty: 'easy', daysAgo: 41, factor: 0.42 },
    { category: 'DSA & Problem Solving', difficulty: 'easy', daysAgo: 33, factor: 0.55 },
    { category: 'Aptitude & Logic', difficulty: 'medium', daysAgo: 24, factor: 0.78 },
    { category: 'Python & Data Science', difficulty: 'medium', daysAgo: 16, factor: 0.8 },
    { category: 'MERN Stack', difficulty: 'medium', daysAgo: 8, factor: 0.88 },
    { category: 'DSA & Problem Solving', difficulty: 'medium', daysAgo: 2, factor: 1 },
  ];

  return plan.map(({ category, difficulty, daysAgo, factor }) => {
    const pool = interviewByCategory(category);
    const picked = pool.slice(0, 4);
    const responses = picked.map((q, i) => {
      const full = answerFor(q.questionText) || `In short, ${q.idealAnswer.split('.')[0]}.`;
      // Older sessions keep fewer sentences, which lowers keyword coverage.
      const sentences = full.split(/(?<=\.)\s+/);
      const keep = Math.max(1, Math.round(sentences.length * factor));
      const userAnswer = sentences.slice(0, Math.min(sentences.length, keep)).join(' ');

      const graded = gradeAnswer(userAnswer, q);
      return {
        questionText: q.questionText,
        userAnswer,
        score: graded.score,
        technicalScore: graded.technicalScore,
        communicationScore: graded.communicationScore,
        matchedKeywords: graded.matchedKeywords,
        missingKeywords: graded.missingKeywords,
        feedback: graded.feedback,
        idealAnswer: q.idealAnswer,
      };
    });

    const overall = Math.round(
      (responses.reduce((a, r) => a + r.score, 0) / Math.max(responses.length, 1)) * 10
    ) / 10;
    const readiness =
      overall >= 8 ? 'Interview Ready' : overall >= 6.5 ? 'Nearly Ready' : overall >= 4.5 ? 'Developing' : 'Needs Practice';

    return {
      category,
      difficulty,
      responses,
      overallScore: overall,
      readinessLevel: readiness,
      createdAt: new Date(now - daysAgo * day),
    };
  });
}

export function buildAttempts() {
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  return [
    { category: 'MERN Stack', score: 8, totalQuestions: 10, daysAgo: 38 },
    { category: 'MERN Stack', score: 9, totalQuestions: 10, daysAgo: 21 },
    { category: 'DSA & Problem Solving', score: 7, totalQuestions: 10, daysAgo: 14 },
    { category: 'Aptitude & Logic', score: 10, totalQuestions: 10, daysAgo: 5 },
  ].map((a) => ({ ...a, createdAt: new Date(now - a.daysAgo * day) }));
}

