/**
 * Unique coding challenges per lesson — NOT copies of lesson examples.
 */

export function getCodingChallengeForLesson(title, category, difficulty) {
  const challenges = EXERCISE_BANK[title];
  if (challenges) return challenges;

  return {
    problemStatement: `Apply "${title}" in a small program that solves a new problem (do not copy the lesson example verbatim).`,
    examples: [{ input: "", output: "See problem" }],
    constraints: ["Use concepts from this lesson only", "Code must run without errors"],
    hints: ["Break the problem into steps", "Test with print() first"],
    starterCode: "# Write your solution below\n",
    testCases: [
      { input: "", expectedOutput: "ok", hidden: true },
    ],
    xpReward: difficulty === "hard" ? 50 : difficulty === "medium" ? 35 : 25,
    timeEstimate: difficulty === "hard" ? "20 min" : "12 min",
    difficultyLabel: difficulty,
  };
}

const EXERCISE_BANK = {
  "Introduction to Python": {
    problemStatement:
      "Write a program that prints your name on the first line and your favorite number on the second line.",
    examples: [{ input: "", output: "Alice\n42" }],
    constraints: ["Use two print() calls", "No input() required"],
    hints: ["print('Alice')", "Second print for the number"],
    starterCode: "# Print name then favorite number\n",
    testCases: [
      { input: "", expectedOutput: "Alice\n42", hidden: false },
      {
        input: "",
        expectedOutput: "",
        hidden: true,
        matcher: "twoNonEmptyLinesSecondNumeric",
      },
    ],
    xpReward: 20,
    timeEstimate: "8 min",
    difficultyLabel: "easy",
  },
  Variables: {
    problemStatement:
      "Create variables `item` (string) and `price` (number). Print: `Total: <price>` where price is 19.99.",
    examples: [{ input: "", output: "Total: 19.99" }],
    constraints: ["Use variables", "Output must match exactly"],
    hints: ["item = 'book'", "price = 19.99"],
    starterCode: "item = 'book'\nprice = 19.99\n# print total\n",
    testCases: [{ input: "", expectedOutput: "Total: 19.99", hidden: false }],
    xpReward: 25,
    timeEstimate: "10 min",
    difficultyLabel: "easy",
  },
  "Data Types": {
    problemStatement:
      "Store age=25 and height=1.75. Print two lines: `int` and `float` showing their types using type().__name__.",
    examples: [{ input: "", output: "int\nfloat" }],
    constraints: ["Use type().__name__"],
    hints: ["print(type(age).__name__)"],
    starterCode: "age = 25\nheight = 1.75\n",
    testCases: [{ input: "", expectedOutput: "int\nfloat", hidden: false }],
    xpReward: 25,
    timeEstimate: "12 min",
    difficultyLabel: "easy",
  },
  Operators: {
    problemStatement: "Read two numbers from input (one per line). Print their sum and product on separate lines.",
    examples: [{ input: "3\n4\n", output: "7\n12" }],
    constraints: ["Use int() conversion"],
    hints: ["a = int(input())"],
    starterCode: "a = int(input())\nb = int(input())\n",
    testCases: [
      { input: "3\n4\n", expectedOutput: "7\n12", hidden: false },
      { input: "10\n2\n", expectedOutput: "12\n20", hidden: true },
    ],
    xpReward: 30,
    timeEstimate: "12 min",
    difficultyLabel: "easy",
  },
  "Conditional Statements": {
    problemStatement:
      "Read an integer score. Print `Pass` if score >= 50, else print `Fail`.",
    examples: [{ input: "55\n", output: "Pass" }, { input: "40\n", output: "Fail" }],
    constraints: ["One if/else only"],
    hints: ["if score >= 50:"],
    starterCode: "score = int(input())\n",
    testCases: [
      { input: "55\n", expectedOutput: "Pass", hidden: false },
      { input: "40\n", expectedOutput: "Fail", hidden: true },
    ],
    xpReward: 30,
    timeEstimate: "12 min",
    difficultyLabel: "easy",
  },
  Loops: {
    problemStatement: "Print numbers 1 to 5, each on its own line.",
    examples: [{ input: "", output: "1\n2\n3\n4\n5" }],
    constraints: ["Use a for loop with range"],
    hints: ["for i in range(1, 6):"],
    starterCode: "# use for loop\n",
    testCases: [{ input: "", expectedOutput: "1\n2\n3\n4\n5", hidden: false }],
    xpReward: 30,
    timeEstimate: "12 min",
    difficultyLabel: "easy",
  },
  Functions: {
    problemStatement:
      "Define `double(n)` that returns n*2. Read n, print the result.",
    examples: [{ input: "7\n", output: "14" }],
    constraints: ["Must use def"],
    hints: ["return n * 2"],
    starterCode: "def double(n):\n    pass\n\nn = int(input())\n",
    testCases: [
      { input: "7\n", expectedOutput: "14", hidden: false },
      { input: "0\n", expectedOutput: "0", hidden: true },
    ],
    xpReward: 35,
    timeEstimate: "15 min",
    difficultyLabel: "easy",
  },
  Lists: {
    problemStatement:
      "Given `nums = [4, 1, 9, 3]`, print the maximum value using max() without sorting manually.",
    examples: [{ input: "", output: "9" }],
    constraints: ["Use max(nums)"],
    hints: ["print(max(nums))"],
    starterCode: "nums = [4, 1, 9, 3]\n",
    testCases: [{ input: "", expectedOutput: "9", hidden: false }],
    xpReward: 30,
    timeEstimate: "10 min",
    difficultyLabel: "easy",
  },
  Strings: {
    problemStatement:
      "Read a word. Print it reversed (use slicing).",
    examples: [{ input: "hello\n", output: "olleh" }],
    constraints: ["Use [::-1]"],
    hints: ["word[::-1]"],
    starterCode: "word = input()\n",
    testCases: [
      { input: "hello\n", expectedOutput: "olleh", hidden: false },
      { input: "abc\n", expectedOutput: "cba", hidden: true },
    ],
    xpReward: 30,
    timeEstimate: "12 min",
    difficultyLabel: "easy",
  },
  "Exception Handling": {
    problemStatement:
      "Read input. Try converting to int and print it. On ValueError print `invalid`.",
    examples: [{ input: "42\n", output: "42" }, { input: "x\n", output: "invalid" }],
    constraints: ["Use try/except ValueError"],
    hints: ["except ValueError:"],
    starterCode: "s = input()\n",
    testCases: [
      { input: "42\n", expectedOutput: "42", hidden: false },
      { input: "x\n", expectedOutput: "invalid", hidden: true },
    ],
    xpReward: 40,
    timeEstimate: "15 min",
    difficultyLabel: "medium",
  },
  Decorators: {
    problemStatement:
      "Define decorator `shout` that uppercases function return. `greet()` returns 'hi'. Print greet() after decoration.",
    examples: [{ input: "", output: "HI" }],
    constraints: ["Use nested function decorator"],
    hints: ["def shout(fn): ... wrapper ..."],
    starterCode: "def shout(fn):\n    def wrapper():\n        pass\n    return wrapper\n\n@shout\ndef greet():\n    return 'hi'\n",
    testCases: [{ input: "", expectedOutput: "HI", hidden: false }],
    xpReward: 50,
    timeEstimate: "20 min",
    difficultyLabel: "hard",
  },
};
