/**
 * Evaluate a coding challenge test case (exact match or custom matcher).
 */
export function evaluateTestCase(tc, { output, error }) {
  if (error) return false;
  const out = (output ?? "").trim();

  if (tc.matcher === "twoNonEmptyLinesSecondNumeric") {
    const lines = out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length !== 2) return false;
    return !Number.isNaN(Number(lines[1]));
  }

  return out === (tc.expectedOutput ?? "").trim();
}
