// Shared question bank used by the Express server seeder and the Worker preview.
// 32 interview questions + 24 MCQs across four categories.

export const CATEGORIES = [
  'MERN Stack',
  'Python & Data Science',
  'DSA & Problem Solving',
  'Aptitude & Logic',
];

const interview = [
  // ---------- MERN Stack ----------
  {
    category: 'MERN Stack',
    difficulty: 'easy',
    questionText: 'What is the difference between state and props in React?',
    idealAnswer:
      'Props are read-only inputs passed down from a parent component. State is data owned and mutated by the component itself, usually through hooks such as useState. Props flow one way (parent to child), while state changes trigger a re-render of the component that owns it.',
    keywords: ['props', 'state', 'read-only', 'parent', 'useState', 're-render'],
  },
  {
    category: 'MERN Stack',
    difficulty: 'easy',
    questionText: 'Explain how the virtual DOM helps React render updates efficiently.',
    idealAnswer:
      'React keeps a lightweight tree of elements in memory. On a state change it builds a new tree, diffs it against the previous one, and commits only the minimal real DOM mutations. That reconciliation avoids expensive full-page DOM operations.',
    keywords: ['virtual dom', 'diff', 'reconciliation', 'minimal', 're-render'],
  },
  {
    category: 'MERN Stack',
    difficulty: 'medium',
    questionText: 'How does useEffect cleanup work, and when would you use it?',
    idealAnswer:
      'A function returned from useEffect runs before the effect re-runs and when the component unmounts. It is used to clear timers, abort fetches, and remove event listeners so no stale work continues after the component is gone.',
    keywords: ['useEffect', 'cleanup', 'unmount', 'timer', 'listener', 'abort'],
  },
  {
    category: 'MERN Stack',
    difficulty: 'medium',
    questionText: 'Walk through how an Express middleware chain handles an authenticated request.',
    idealAnswer:
      'The request enters the first middleware, which can read headers, verify a JWT, attach req.user and call next(). Each middleware either ends the response or forwards with next(). Errors passed to next(err) jump to the four-argument error handler at the end of the chain.',
    keywords: ['middleware', 'jwt', 'next', 'req.user', 'error handler'],
  },
  {
    category: 'MERN Stack',
    difficulty: 'medium',
    questionText: 'What is Mongoose population and when should you avoid it?',
    idealAnswer:
      'populate() replaces a stored ObjectId with the referenced document. It performs extra queries, so it is best avoided in large list endpoints or hot paths where denormalising a small copy of the data, or an aggregation $lookup, is cheaper.',
    keywords: ['populate', 'ObjectId', 'reference', 'query', 'aggregation', 'denormalise'],
  },
  {
    category: 'MERN Stack',
    difficulty: 'hard',
    questionText: 'How would you protect a REST API against common attacks?',
    idealAnswer:
      'Hash passwords with bcrypt, sign short-lived JWTs, validate every body with a schema, scope routes with a role guard, set CORS to known origins, use helmet for headers, rate-limit auth endpoints, never trust client role fields, and store secrets in environment variables.',
    keywords: ['bcrypt', 'jwt', 'validation', 'cors', 'rate limit', 'helmet', 'role'],
  },
  {
    category: 'MERN Stack',
    difficulty: 'medium',
    questionText: 'Compare useMemo and useCallback, with a practical example.',
    idealAnswer:
      'useMemo caches a computed value; useCallback caches a function identity. Both help when a value or callback feeds a memoised child or an effect dependency list. They are optimisation tools and should not be added everywhere by default.',
    keywords: ['useMemo', 'useCallback', 'memoise', 'identity', 'dependency'],
  },
  {
    category: 'MERN Stack',
    difficulty: 'easy',
    questionText: 'What problem does CORS solve and how do you configure it in Express?',
    idealAnswer:
      'CORS tells the browser which other origins may read responses from this API. In Express you apply the cors middleware, ideally with an explicit origin allowlist, allowed methods and credentials settings rather than a wildcard in production.',
    keywords: ['cors', 'origin', 'browser', 'allowlist', 'middleware'],
  },
  // ---------- Python & Data Science ----------
  {
    category: 'Python & Data Science',
    difficulty: 'easy',
    questionText: 'What is the difference between a list and a tuple in Python?',
    idealAnswer:
      'Lists are mutable, dynamically sized and use square brackets. Tuples are immutable, fixed-size and hashable when their elements are, which makes them suitable for dictionary keys and returning fixed records.',
    keywords: ['list', 'tuple', 'mutable', 'immutable', 'hashable'],
  },
  {
    category: 'Python & Data Science',
    difficulty: 'medium',
    questionText: 'How do you handle missing values in a pandas DataFrame?',
    idealAnswer:
      'Start with isna().sum() to measure gaps. Then either drop rows with dropna, impute with fillna or a per-column strategy such as median, or model the missingness. The choice depends on how much is missing and whether it is random.',
    keywords: ['pandas', 'isna', 'dropna', 'fillna', 'impute', 'median'],
  },
  {
    category: 'Python & Data Science',
    difficulty: 'medium',
    questionText: 'Explain the bias-variance tradeoff in a model you have tuned.',
    idealAnswer:
      'High bias underfits because the model is too simple; high variance overfits by memorising noise. Regularisation, more data, feature selection and cross-validation help find the balance. I inspect train versus validation error to see which side dominates.',
    keywords: ['bias', 'variance', 'underfit', 'overfit', 'regularisation', 'cross-validation'],
  },
  {
    category: 'Python & Data Science',
    difficulty: 'hard',
    questionText: 'How does gradient boosting differ from a random forest?',
    idealAnswer:
      'A random forest trains many deep trees independently on bootstrapped samples and averages them to cut variance. Gradient boosting adds shallow trees sequentially, each fitting the residual errors of the current ensemble, which reduces bias and needs careful learning-rate and depth tuning.',
    keywords: ['random forest', 'boosting', 'sequential', 'residual', 'variance', 'learning rate'],
  },
  {
    category: 'Python & Data Science',
    difficulty: 'easy',
    questionText: 'What does the with statement do when opening a file?',
    idealAnswer:
      'It uses the context manager protocol so the file is closed automatically, even if an exception is raised inside the block. That prevents leaked file handles.',
    keywords: ['with', 'context manager', 'close', 'exception', 'file'],
  },
  {
    category: 'Python & Data Science',
    difficulty: 'medium',
    questionText: 'When would you use a groupby aggregation instead of a pivot table?',
    idealAnswer:
      'groupby is better for summarising along one or more keys into a compact Series or DataFrame. A pivot table reshapes into a matrix for cross-tabulation, so it suits two categorical dimensions and reporting layouts.',
    keywords: ['groupby', 'pivot', 'aggregate', 'reshape', 'categorical'],
  },
  {
    category: 'Python & Data Science',
    difficulty: 'hard',
    questionText: 'How do you evaluate an imbalanced classification model?',
    idealAnswer:
      'Accuracy hides the minority class, so I use precision, recall, F1 and PR-AUC, plus a confusion matrix. I choose the metric from the cost of false positives versus false negatives, and use stratified splits or class weighting.',
    keywords: ['imbalanced', 'precision', 'recall', 'f1', 'pr-auc', 'confusion matrix', 'stratified'],
  },
  {
    category: 'Python & Data Science',
    difficulty: 'medium',
    questionText: 'What is the purpose of a virtual environment?',
    idealAnswer:
      'It isolates a project’s Python interpreter and installed packages so dependency versions do not clash between projects. You activate it and install into it, and record exact versions in requirements.txt.',
    keywords: ['virtual environment', 'isolate', 'dependencies', 'requirements', 'activate'],
  },
  // ---------- DSA ----------
  {
    category: 'DSA & Problem Solving',
    difficulty: 'easy',
    questionText: 'Compare arrays and linked lists.',
    idealAnswer:
      'Arrays give O(1) indexed access but O(n) insertion in the middle due to shifting. Linked lists give O(1) insertion and deletion given a node reference but O(n) access. Arrays also have better cache locality.',
    keywords: ['array', 'linked list', 'o(1)', 'o(n)', 'insert', 'cache'],
  },
  {
    category: 'DSA & Problem Solving',
    difficulty: 'medium',
    questionText: 'How would you detect a cycle in a linked list?',
    idealAnswer:
      'Use Floyd’s tortoise and hare: advance one pointer by one node and another by two. If they meet there is a cycle; if the fast pointer reaches null there is none. This runs in O(n) time and O(1) space.',
    keywords: ['floyd', 'tortoise', 'hare', 'cycle', 'o(1)', 'pointer'],
  },
  {
    category: 'DSA & Problem Solving',
    difficulty: 'medium',
    questionText: 'When is a hash map preferred over sorting an array?',
    idealAnswer:
      'When you need O(1) average lookups or to count frequencies in one pass, a hash map wins. Sorting costs O(n log n) but gives ordered traversal and uses less memory when order matters.',
    keywords: ['hash map', 'o(1)', 'lookup', 'frequency', 'sorting', 'o(n log n)'],
  },
  {
    category: 'DSA & Problem Solving',
    difficulty: 'hard',
    questionText: 'Explain dynamic programming using the coin change problem.',
    idealAnswer:
      'Define dp[amount] as the fewest coins to make that amount. Set dp[0]=0 and each state to the minimum over dp[amount - coin] + 1. Filling bottom-up is O(amount × coins), far better than exponential recursion.',
    keywords: ['dynamic programming', 'dp', 'subproblem', 'bottom-up', 'o(amount', 'minimum'],
  },
  {
    category: 'DSA & Problem Solving',
    difficulty: 'easy',
    questionText: 'What is the time complexity of binary search and why?',
    idealAnswer:
      'Binary search is O(log n) because each comparison halves the remaining search space. It requires the array to be sorted and uses constant extra space.',
    keywords: ['binary search', 'o(log n)', 'halve', 'sorted', 'constant'],
  },
  {
    category: 'DSA & Problem Solving',
    difficulty: 'medium',
    questionText: 'How does a stack differ from a queue, and when do you use each?',
    idealAnswer:
      'A stack is LIFO and suits recursion, undo history and parsing. A queue is FIFO and suits breadth-first traversal, task scheduling and buffering.',
    keywords: ['stack', 'queue', 'lifo', 'fifo', 'dfs', 'bfs'],
  },
  {
    category: 'DSA & Problem Solving',
    difficulty: 'hard',
    questionText: 'Outline how Dijkstra’s algorithm finds shortest paths.',
    idealAnswer:
      'It keeps a min-heap of (distance, node), starting with the source at zero. It repeatedly settles the closest unsettled node and relaxes its outgoing edges when a shorter distance is found. With a binary heap it runs in O((V+E) log V) for non-negative weights.',
    keywords: ['dijkstra', 'min-heap', 'relax', 'shortest path', 'non-negative', 'o((v+e)'],
  },
  {
    category: 'DSA & Problem Solving',
    difficulty: 'medium',
    questionText: 'How do you find the kth largest element in an array?',
    idealAnswer:
      'A min-heap of size k gives O(n log k) while streaming. Quickselect averages O(n) expected time by partitioning, though its worst case is O(n²).',
    keywords: ['heap', 'quickselect', 'partition', 'o(n log k)', 'o(n)'],
  },
  // ---------- Aptitude ----------
  {
    category: 'Aptitude & Logic',
    difficulty: 'easy',
    questionText: 'A train travels 240 km in 3 hours. What is its average speed?',
    idealAnswer:
      'Average speed is distance divided by time, so 240 / 3 = 80 km/h. State the formula and unit.',
    keywords: ['80', 'km/h', 'distance', 'time', 'formula'],
  },
  {
    category: 'Aptitude & Logic',
    difficulty: 'medium',
    questionText: 'If a shop gives 20% off and then 10% off the reduced price, what is the total discount?',
    idealAnswer:
      'Take 100 → 80 after 20% off → 72 after 10%. The total discount is 28%, not 30%, because the second discount applies to the lower price.',
    keywords: ['28', '72', 'successive', 'discount', 'not 30'],
  },
  {
    category: 'Aptitude & Logic',
    difficulty: 'medium',
    questionText: 'Explain how you would solve a work-rate problem with two workers.',
    idealAnswer:
      'Convert each worker’s time into a rate, add the rates, then invert. If A finishes in 6 days and B in 12, combined rate is 1/6 + 1/12 = 1/4, so together they take 4 days.',
    keywords: ['rate', '1/6', '1/12', '4 days', 'invert'],
  },
  {
    category: 'Aptitude & Logic',
    difficulty: 'easy',
    questionText: 'What comes next: 2, 6, 12, 20, 30, ?',
    idealAnswer:
      'Differences are 4, 6, 8, 10, so the next difference is 12, giving 42. The nth term is n(n+1).',
    keywords: ['42', 'n(n+1)', 'difference', 'pattern'],
  },
  {
    category: 'Aptitude & Logic',
    difficulty: 'hard',
    questionText: 'How do you approach a seating-arrangement puzzle under time pressure?',
    idealAnswer:
      'Translate each clue into a fixed or relative position, draw slots, place the most constrained element first, and record eliminations. Work from certainties outward and verify the final arrangement against every clue.',
    keywords: ['arrangement', 'constraint', 'slots', 'elimination', 'verify'],
  },
  {
    category: 'Aptitude & Logic',
    difficulty: 'medium',
    questionText: 'A bag has 5 red and 3 blue balls. What is the probability of drawing two reds without replacement?',
    idealAnswer:
      'First draw is 5/8, second is 4/7, so the product is 20/56 = 5/14 ≈ 0.357. Explain why the denominator drops without replacement.',
    keywords: ['5/8', '4/7', '5/14', 'without replacement', 'probability'],
  },
  {
    category: 'Aptitude & Logic',
    difficulty: 'medium',
    questionText: 'If all roses are flowers and some flowers fade quickly, what can you conclude?',
    idealAnswer:
      'Nothing definite about roses fading. The second statement only guarantees some flowers fade; those could be non-roses. Avoid the fallacy of the undistributed middle.',
    keywords: ['cannot conclude', 'some', 'fallacy', 'undistributed', 'no certainty'],
  },
  {
    category: 'Aptitude & Logic',
    difficulty: 'easy',
    questionText: 'How would you estimate 48 × 52 mentally?',
    idealAnswer:
      'Use the difference of squares: (50 − 2)(50 + 2) = 2500 − 4 = 2496. Explaining the shortcut matters more than the number.',
    keywords: ['2496', 'difference of squares', '2500', 'shortcut'],
  },
];

// Build 20+ MCQs: 6 per major area (24 total).
const mcqs = [
  {
    category: 'MERN Stack',
    difficulty: 'easy',
    questionText: 'Which hook lets a function component hold local state?',
    options: ['useEffect', 'useState', 'useMemo', 'useContext'],
    correctOption: 1,
    idealAnswer: 'useState returns a value and a setter that triggers re-render.',
  },
  {
    category: 'MERN Stack',
    difficulty: 'easy',
    questionText: 'In Express, which function passes control to the next middleware?',
    options: ['next()', 'continue()', 'send()', 'forward()'],
    correctOption: 0,
    idealAnswer: 'next() forwards the request to the next matching middleware or route.',
  },
  {
    category: 'MERN Stack',
    difficulty: 'medium',
    questionText: 'What does Mongoose populate() do?',
    options: ['Creates an index', 'Validates a schema', 'Replaces an ObjectId with the referenced document', 'Seeds the database'],
    correctOption: 2,
    idealAnswer: 'populate() resolves a reference field into the stored document.',
  },
  {
    category: 'MERN Stack',
    difficulty: 'medium',
    questionText: 'Which HTTP status fits a request with a valid token but insufficient role?',
    options: ['401 Unauthorized', '403 Forbidden', '404 Not Found', '422 Unprocessable'],
    correctOption: 1,
    idealAnswer: '401 means unauthenticated; 403 means authenticated but not allowed.',
  },
  {
    category: 'MERN Stack',
    difficulty: 'medium',
    questionText: 'What is the main purpose of the dependency array in useEffect?',
    options: ['Ordering effects', 'Deciding when the effect re-runs', 'Caching the result', 'Preventing renders'],
    correctOption: 1,
    idealAnswer: 'React re-runs the effect when a listed dependency changes.',
  },
  {
    category: 'MERN Stack',
    difficulty: 'hard',
    questionText: 'Which is the safest way to store the JWT on the client for a standard SPA?',
    options: ['localStorage always', 'Hard-coded in the bundle', 'An httpOnly cookie', 'The URL query string'],
    correctOption: 2,
    idealAnswer: 'httpOnly cookies are not readable by JavaScript, reducing XSS token theft.',
  },
  {
    category: 'Python & Data Science',
    difficulty: 'easy',
    questionText: 'Which structure is immutable in Python?',
    options: ['list', 'dict', 'set', 'tuple'],
    correctOption: 3,
    idealAnswer: 'Tuples cannot be changed after creation.',
  },
  {
    category: 'Python & Data Science',
    difficulty: 'easy',
    questionText: 'Which pandas method drops rows containing missing values?',
    options: ['dropna()', 'fillna()', 'isna()', 'notnull()'],
    correctOption: 0,
    idealAnswer: 'dropna() removes rows or columns with NaNs.',
  },
  {
    category: 'Python & Data Science',
    difficulty: 'medium',
    questionText: 'A model has low training error and high validation error. What is happening?',
    options: ['Underfitting', 'Overfitting', 'Data leakage', 'Perfect generalisation'],
    correctOption: 1,
    idealAnswer: 'That gap is the classic overfitting signature.',
  },
  {
    category: 'Python & Data Science',
    difficulty: 'medium',
    questionText: 'What does a confusion matrix show?',
    options: ['Feature importance', 'Predicted versus actual class counts', 'Learning rate schedule', 'Correlation of inputs'],
    correctOption: 1,
    idealAnswer: 'It tabulates true/false positives and negatives.',
  },
  {
    category: 'Python & Data Science',
    difficulty: 'medium',
    questionText: 'Which metric is most useful for a rare positive class?',
    options: ['Accuracy', 'Recall', 'Mean squared error', 'R²'],
    correctOption: 1,
    idealAnswer: 'Recall shows how many real positives were found.',
  },
  {
    category: 'Python & Data Science',
    difficulty: 'hard',
    questionText: 'What is the role of the learning rate in gradient descent?',
    options: ['Number of features', 'Step size of each update', 'Size of the dataset', 'Regularisation strength'],
    correctOption: 1,
    idealAnswer: 'The learning rate scales each parameter update.',
  },
  {
    category: 'DSA & Problem Solving',
    difficulty: 'easy',
    questionText: 'What is the average time complexity of binary search?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctOption: 1,
    idealAnswer: 'Each step halves the search space.',
  },
  {
    category: 'DSA & Problem Solving',
    difficulty: 'easy',
    questionText: 'Which data structure is LIFO?',
    options: ['Queue', 'Stack', 'Heap', 'Graph'],
    correctOption: 1,
    idealAnswer: 'A stack removes the most recently added item first.',
  },
  {
    category: 'DSA & Problem Solving',
    difficulty: 'medium',
    questionText: 'Which technique detects a cycle in a linked list in O(1) space?',
    options: ['Hash set of nodes', 'Floyd’s tortoise and hare', 'Sorting the list', 'Binary search'],
    correctOption: 1,
    idealAnswer: 'Two pointers at different speeds meet inside a cycle.',
  },
  {
    category: 'DSA & Problem Solving',
    difficulty: 'medium',
    questionText: 'What is the worst-case time complexity of quicksort?',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
    correctOption: 2,
    idealAnswer: 'Bad pivots degrade it to quadratic time.',
  },
  {
    category: 'DSA & Problem Solving',
    difficulty: 'hard',
    questionText: 'Dijkstra’s algorithm fails when the graph contains…',
    options: ['Cycles', 'Negative edge weights', 'More than 1000 nodes', 'Directed edges'],
    correctOption: 1,
    idealAnswer: 'Negative weights break the greedy settlement order.',
  },
  {
    category: 'DSA & Problem Solving',
    difficulty: 'medium',
    questionText: 'Which approach solves coin change most efficiently?',
    options: ['Naive recursion', 'Memoised dynamic programming', 'Linear scan', 'Sorting only'],
    correctOption: 1,
    idealAnswer: 'DP stores subproblem results and avoids exponential repeats.',
  },
  {
    category: 'Aptitude & Logic',
    difficulty: 'easy',
    questionText: 'A car covers 150 km in 2 hours. Its average speed is…',
    options: ['50 km/h', '75 km/h', '100 km/h', '300 km/h'],
    correctOption: 1,
    idealAnswer: '150 / 2 = 75 km/h.',
  },
  {
    category: 'Aptitude & Logic',
    difficulty: 'medium',
    questionText: 'Successive discounts of 20% and 10% equal a single discount of…',
    options: ['30%', '28%', '26%', '25%'],
    correctOption: 1,
    idealAnswer: '0.8 × 0.9 = 0.72, so 28% off.',
  },
  {
    category: 'Aptitude & Logic',
    difficulty: 'easy',
    questionText: 'Next in the series 2, 6, 12, 20, 30, …',
    options: ['36', '40', '42', '44'],
    correctOption: 2,
    idealAnswer: 'Differences increase by 2 each time; 30 + 12 = 42.',
  },
  {
    category: 'Aptitude & Logic',
    difficulty: 'medium',
    questionText: 'Two red cards are drawn without replacement. P(both red) from 5 red, 3 blue is…',
    options: ['5/14', '25/64', '5/8', '3/8'],
    correctOption: 0,
    idealAnswer: '(5/8) × (4/7) = 20/56 = 5/14.',
  },
  {
    category: 'Aptitude & Logic',
    difficulty: 'medium',
    questionText: 'A can do a job in 6 days, B in 12. Working together they take…',
    options: ['3 days', '4 days', '5 days', '9 days'],
    correctOption: 1,
    idealAnswer: 'Rates 1/6 + 1/12 = 1/4, so 4 days.',
  },
  {
    category: 'Aptitude & Logic',
    difficulty: 'hard',
    questionText: 'Which conclusion is valid: all roses are flowers; some flowers fade fast.',
    options: ['All roses fade fast', 'Some roses fade fast', 'No rose fades fast', 'Nothing certain about roses'],
    correctOption: 3,
    idealAnswer: 'The fading flowers may not be roses.',
  },
];

export const QUESTIONS = [
  ...interview.map((q) => ({ ...q, type: 'interview', options: [], correctOption: null })),
  ...mcqs.map((q) => ({
    ...q,
    type: 'mcq',
    keywords: (q.idealAnswer || '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 5),
  })),
];

export default { CATEGORIES, QUESTIONS };
