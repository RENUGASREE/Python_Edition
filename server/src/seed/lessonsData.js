/**
 * Curriculum seed — all Python topics with full lesson structure.
 * Each lesson follows the required JSON format for the platform.
 */
import { getCodingChallengeForLesson } from "./lessonExercises.js";

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildLesson({ title, category, order, difficulty, content }) {
  return {
    slug: slugify(title),
    title,
    category,
    order,
    difficulty,
    estimated_time: content.estimated_time || "20 min",
    objectives: content.objectives,
    theory: content.theory,
    real_world_example: content.real_world_example,
    syntax: content.syntax,
    code_example: content.code_example,
    output_example: content.output_example,
    common_mistakes: content.common_mistakes,
    tips: content.tips,
    exercise: content.exercise,
    quiz: content.quiz,
    summary: content.summary,
    codingChallenge: getCodingChallengeForLesson(title, category, difficulty),
    isPublished: true,
  };
}

/** Template factory for consistent, realistic lesson bodies */
function topicContent(name, concept, codeSample, output, extra = {}) {
  return {
    estimated_time: extra.time || "18 min",
    objectives: [
      `Understand what ${name} means in Python`,
      `Write correct ${name} syntax in programs`,
      `Apply ${name} in a small practical exercise`,
      ...(extra.objectives || []),
    ],
    theory: `${concept}\n\nPython makes ${name} approachable for beginners while remaining powerful for production code. Read the syntax block, run the example, then try the mini exercise.`,
    real_world_example:
      extra.analogy ||
      `Think of ${name} like organizing tools in a workshop — everything has a place, a label, and a clear way to use it.`,
    syntax: extra.syntax || `# ${name} — basic syntax\n${codeSample.split("\n")[0]}`,
    code_example: codeSample,
    output_example: output,
    common_mistakes: extra.mistakes || [
      "Forgetting indentation in Python blocks",
      "Using = instead of == in comparisons",
      "Typos in variable names",
    ],
    tips: extra.tips || [
      "Run small snippets in the built-in compiler after each section",
      "Use print() to inspect values while learning",
      "Read error messages from the bottom line upward",
    ],
    exercise:
      extra.exercise ||
      `Write a short program that demonstrates ${name}. Add comments explaining each step.`,
    quiz: extra.quiz || [
      {
        question: `Which statement best describes ${name}?`,
        type: "mcq",
        options: ["A core Python concept", "A database only feature", "Not used in Python 3", "Only for experts"],
        answer: "A core Python concept",
        explanation: `${name} is fundamental to Python programming.`,
      },
      {
        question: `What is a valid use of ${name}?`,
        type: "mcq",
        options: ["As shown in the lesson example", "Only inside HTML", "Requires Java compiler", "Cannot run locally"],
        answer: "As shown in the lesson example",
      },
      {
        question: "Fill in: Python uses _____ for code blocks.",
        type: "fill",
        options: ["indentation", "braces", "semicolons", "tabs only"],
        answer: "indentation",
      },
    ],
    summary: `You learned ${name}: the concept, syntax, example output, common pitfalls, and a hands-on exercise. Review the quiz and bookmark this lesson for revision.`,
  };
}

const BEGINNER = [
  ["Introduction to Python", "Python is a high-level, interpreted language known for readable syntax.", 'print("Hello, Python Edition!")\nprint(3 + 5)', "Hello, Python Edition!\n8"],
  ["Variables", "Variables are names that refer to values in memory.", 'name = "Asha"\nage = 21\nprint(name, age)', "Asha 21"],
  ["Data Types", "Python has int, float, str, bool, and more — type() reveals them.", 'x = 42\ny = 3.14\nprint(type(x), type(y))', "<class 'int'> <class 'float'>"],
  ["Operators", "Arithmetic (+, -, *, /), comparison (==, !=), and logical (and, or).", "a, b = 10, 3\nprint(a // b, a % b, a ** b)", "3 1 1000"],
  ["Conditional Statements", "if/elif/else branch execution based on conditions.", 'score = 85\nif score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelse:\n    print("C")', "B"],
  ["Loops", "for and while repeat blocks; range() generates sequences.", "total = 0\nfor n in range(1, 6):\n    total += n\nprint(total)", "15"],
  ["Functions", "def creates reusable blocks; return sends values back.", "def area(w, h):\n    return w * h\nprint(area(4, 5))", "20"],
  ["Lists", "Ordered mutable sequences — indexing and slicing.", "nums = [10, 20, 30]\nnums.append(40)\nprint(nums[1], len(nums))", "20 3"],
  ["Tuples", "Immutable ordered pairs — great for fixed records.", "point = (3, 4)\nx, y = point\nprint(x + y)", "7"],
  ["Dictionaries", "Key-value maps for fast lookup.", 'user = {"name": "Ravi", "role": "student"}\nprint(user["name"])', "Ravi"],
  ["Sets", "Unordered collections of unique elements.", "tags = {1, 2, 2, 3}\ntags.add(4)\nprint(tags)", "{1, 2, 3, 4}"],
  ["Strings", "Text processing with slicing, methods, and f-strings.", 'greeting = "python"\nprint(greeting.upper(), f"Learn {greeting}!")', "PYTHON Learn python!"],
];

const INTERMEDIATE = [
  ["File Handling", "open(), read/write, and with for safe file access.", 'with open("notes.txt", "w") as f:\n    f.write("Hello file")\nprint("saved")', "saved"],
  ["Exception Handling", "try/except/finally guards against runtime errors.", 'try:\n    x = int("42")\nexcept ValueError:\n    x = 0\nprint(x)', "42"],
  ["OOP", "Classes bundle data and behavior; objects are instances.", "class Dog:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return f\"{self.name} says woof!\"\nd = Dog(\"Max\")\nprint(d.speak())", "Max says woof!"],
  ["Modules", "Import reusable code: import math, from os import path.", "import math\nprint(math.sqrt(16))", "4.0"],
  ["Libraries", "pip installs packages like requests, pandas.", "# pip install requests\nprint('Use libraries to avoid reinventing wheels')", "Use libraries to avoid reinventing wheels"],
  ["JSON", "json.dumps/loads for APIs and config files.", 'import json\ndata = {"lang": "python"}\nprint(json.dumps(data))', '{"lang": "python"}'],
  ["APIs", "HTTP clients fetch remote data (conceptual demo).", "print('GET https://api.example.com/data')\nprint('status: 200')", "GET https://api.example.com/data\nstatus: 200"],
  ["Decorators", "Functions that wrap functions — @timer above defs.", "def loud(fn):\n    def wrapper():\n        print('start')\n        return fn()\n    return wrapper\n@loud\ndef hi():\n    print('hi')\nhi()", "start\nhi"],
  ["Iterators", "__iter__ and __next__ traverse sequences manually.", "nums = iter([1, 2])\nprint(next(nums), next(nums))", "1 2"],
  ["Generators", "yield produces lazy sequences, memory efficient.", "def countdown(n):\n    while n:\n        yield n\n        n -= 1\nprint(list(countdown(3)))", "[3, 2, 1]"],
];

const ADVANCED = [
  ["Multithreading", "threading runs tasks concurrently (I/O bound).", "import threading\nprint('Threads share memory — use locks for safety')", "Threads share memory — use locks for safety"],
  ["Async Programming", "async/await for concurrent I/O without blocking.", "import asyncio\nasync def main():\n    print('async hello')\nasyncio.run(main())", "async hello"],
  ["NumPy", "ndarray vectorized math for numeric computing.", "try:\n    import numpy as np\n    a = np.array([1,2,3])\n    print(a * 2)\nexcept ImportError:\n    print('[1 2 3] * 2  # install numpy')", "[2 4 6]"],
  ["Pandas", "DataFrames for tables, CSV, and analysis.", "print('import pandas as pd; df = pd.read_csv(\"data.csv\")')", "import pandas as pd; df = pd.read_csv(\"data.csv\")"],
  ["Machine Learning Basics", "sklearn fit/predict pattern for simple models.", "print('from sklearn.linear_model import LinearRegression')", "from sklearn.linear_model import LinearRegression"],
  ["Flask", "Micro web framework — routes return responses.", "print('from flask import Flask; app = Flask(__name__)')", "from flask import Flask; app = Flask(__name__)"],
  ["Django", "Batteries-included web framework with ORM.", "print('django-admin startproject mysite')", "django-admin startproject mysite"],
  ["Data Visualization", "matplotlib/plotly charts from data.", "print('import matplotlib.pyplot as plt; plt.plot([1,2,3])')", "import matplotlib.pyplot as plt; plt.plot([1,2,3])"],
];

export function generateAllLessons() {
  const lessons = [];
  let order = 0;

  for (const [title, concept, code, output] of BEGINNER) {
    lessons.push(
      buildLesson({
        title,
        category: "beginner",
        order: order++,
        difficulty: "easy",
        content: topicContent(title, concept, code, output, {
          analogy: `Beginner path: ${title} is a building block — master it before moving on.`,
        }),
      })
    );
  }

  order = 0;
  for (const [title, concept, code, output] of INTERMEDIATE) {
    lessons.push(
      buildLesson({
        title,
        category: "intermediate",
        order: order++,
        difficulty: "medium",
        content: topicContent(title, concept, code, output, { time: "25 min" }),
      })
    );
  }

  order = 0;
  for (const [title, concept, code, output] of ADVANCED) {
    lessons.push(
      buildLesson({
        title,
        category: "advanced",
        order: order++,
        difficulty: "hard",
        content: topicContent(title, concept, code, output, { time: "30 min" }),
      })
    );
  }

  // Project-category lessons (guided project walkthroughs)
  const projectLessons = [
    ["Build a Calculator", "CLI calculator with functions for + - * /"],
    ["To-Do App", "List tasks, add, complete, and save to file"],
    ["Weather App", "Fetch weather JSON from a public API"],
    ["Chatbot", "Rule-based replies using dictionaries"],
    ["Expense Tracker", "Track spending with categories in CSV"],
    ["AI Mini Projects", "Sentiment tagger using simple word lists"],
  ];
  order = 0;
  for (const [title, desc] of projectLessons) {
    lessons.push(
      buildLesson({
        title,
        category: "projects",
        order: order++,
        difficulty: order < 3 ? "easy" : "medium",
        content: topicContent(
          title,
          desc,
          `# ${title}\nprint('Starter project — extend in the IDE')\n`,
          "Starter project — extend in the IDE",
          {
            time: "45 min",
            exercise: `Complete the ${title} project: plan features, implement core logic, test edge cases.`,
            quiz: [
              { question: `What is the main goal of ${title}?`, type: "mcq", options: [desc, "Sort emails only", "Compile C code", "None"], answer: desc },
              { question: "Should you test edge cases?", type: "mcq", options: ["Yes", "No", "Only in production", "Never"], answer: "Yes" },
            ],
          }
        ),
      })
    );
  }

  return lessons;
}

export const PROJECTS = [
  {
    slug: "calculator",
    title: "Calculator",
    difficulty: "beginner",
    description: "Build a command-line calculator supporting basic operations.",
    objectives: ["Parse user input", "Handle divide-by-zero", "Loop until exit"],
    starterCode: "def add(a, b):\n    return a + b\n\n# TODO: subtract, multiply, divide\n",
    hints: ["Use float() for numbers", "Wrap input in try/except"],
    estimatedHours: 2,
    tags: ["functions", "conditionals"],
  },
  {
    slug: "todo-app",
    title: "To-Do App",
    difficulty: "beginner",
    description: "Manage tasks with add, list, complete, and delete.",
    objectives: ["Use a list of dicts", "Persist to JSON file", "Menu-driven CLI"],
    starterCode: "tasks = []\n\ndef show_menu():\n    print('1. Add  2. List  3. Done  4. Quit')\n",
    hints: ["json.dump for save", "enumerate when listing"],
    estimatedHours: 3,
    tags: ["lists", "json", "files"],
  },
  {
    slug: "weather-app",
    title: "Weather App",
    difficulty: "intermediate",
    description: "Fetch and display weather using a public API.",
    objectives: ["HTTP GET request", "Parse JSON response", "Format output"],
    starterCode: "# import requests\n# city = input('City: ')\n",
    hints: ["Use requests.get", "Check response.status_code"],
    estimatedHours: 4,
    tags: ["apis", "json"],
  },
  {
    slug: "chatbot",
    title: "Chatbot",
    difficulty: "intermediate",
    description: "Rule-based chatbot with keyword intents.",
    objectives: ["Map keywords to responses", "Conversation loop", "Optional file log"],
    starterCode: "responses = {'hello': 'Hi there!', 'bye': 'Goodbye!'}\n",
    hints: ["Normalize input with .lower()", "Default fallback response"],
    estimatedHours: 3,
    tags: ["dictionaries", "strings"],
  },
  {
    slug: "expense-tracker",
    title: "Expense Tracker",
    difficulty: "intermediate",
    description: "Track expenses by category with monthly summaries.",
    objectives: ["CSV read/write", "Aggregate totals", "Filter by month"],
    starterCode: "import csv\n# expenses: date, amount, category\n",
    hints: ["Use csv.DictReader", "datetime for parsing dates"],
    estimatedHours: 5,
    tags: ["files", "data"],
  },
  {
    slug: "ai-mini-projects",
    title: "AI Mini Projects",
    difficulty: "advanced",
    description: "Sentiment scorer and word frequency analyzer without heavy ML.",
    objectives: ["Tokenize text", "Score positive/negative words", "Display results"],
    starterCode: "positive = {'good', 'great', 'excellent'}\nnegative = {'bad', 'terrible'}\n",
    hints: ["Split on whitespace", "Count matches"],
    estimatedHours: 6,
    tags: ["nlp", "sets"],
  },
];

export const CHALLENGES = [
  {
    title: "Sum Two Numbers",
    difficulty: "easy",
    description: "Read two integers and print their sum.",
    starterCode: "a = int(input())\nb = int(input())\nprint(a + b)",
    testCases: [{ input: "2\n3\n", expectedOutput: "5" }],
    points: 10,
    daily: true,
  },
  {
    title: "Reverse a String",
    difficulty: "easy",
    description: "Print the reverse of the input string.",
    starterCode: "s = input()\nprint(s[::-1])",
    testCases: [{ input: "hello\n", expectedOutput: "olleh" }],
    points: 15,
  },
  {
    title: "Print Hello",
    difficulty: "easy",
    description: "Print exactly: Hello, Python Edition!",
    starterCode: 'print("Hello, Python Edition!")',
    testCases: [{ input: "", expectedOutput: "Hello, Python Edition!" }],
    points: 10,
  },
];
