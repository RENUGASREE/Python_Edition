# Adaptive Learning Engine

Python Edition uses a **rule-based + psychometric** adaptive layer (not a black-box ML model), suitable for production on MongoDB + Render.

## Features

### 1. IRT-style assessment (Item Response Theory)
- Each quiz item has difficulty `b` and discrimination `a` (defaults from lesson difficulty).
- Learner **ability θ (theta)** updates after every quiz from item-level right/wrong.
- Dashboard shows θ, predicted quiz performance, and per-lesson fit.

### 2. Spaced repetition (SM-2)
- After each quiz, the lesson is scheduled for review (`SpacedReview` collection).
- **Forgetting curve**: retention estimate shown on dashboard for due items.
- Due reviews are injected into the **personalized path** as `spaced_review` steps.

### 3. Path rewrite on mistakes
- `LearningEvent` logs wrong quiz items and failed challenges.
- Path planner inserts **remediation** steps before new content when mistakes occurred in the last 14 days.

### 4. Real-time difficulty targeting
- `targetDifficulty` (easy / medium / hard) derived from θ.
- Recommendations rank incomplete lessons by fit to current ability.
- Lesson page shows whether the lesson is *optimal*, *challenging*, or *review* for the learner.

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/lessons/adaptive` | Full adaptive plan (dashboard) |
| `GET /api/adaptive/plan` | Same plan |
| `GET /api/adaptive/profile` | θ, mastery, reviews due |
| `GET /api/lessons/:slug` | Includes `adaptive` context |

Events are recorded on quiz submit, challenge submit, and lesson complete.

## Models

- `AdaptiveProfile` — θ, topic mastery, path
- `SpacedReview` — SM-2 intervals
- `LearningEvent` — mistake / progress log
