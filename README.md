# Python Edition – Adaptive & Interactive Learning Assistant

A modern, AI-powered Python learning platform with structured lessons, quizzes, an interactive compiler, adaptive recommendations, progress analytics, projects, challenges, and a leaderboard.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Monaco Editor |
| **Backend** | Node.js, Express |
| **Database** | MongoDB |
| **Auth** | JWT |

## Project Structure

```
Python_Edition/
├── client/                 # React frontend
│   └── src/
│       ├── pages/          # Dashboard, courses, lessons, compiler, etc.
│       ├── components/     # Layout, glass cards, theme provider
│       └── lib/            # API client
├── server/                 # Express API
│   └── src/
│       ├── models/         # User, Lesson, Progress, Project, Challenge
│       ├── routes/         # REST API routes
│       └── seed/           # Curriculum seed data (36+ lessons)
└── package.json            # Root scripts (dev, build, seed)
```

## Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **Python 3** (for code execution in the compiler)

## Quick Start

### 1. Install dependencies

```bash
npm install
cd server && npm install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your MongoDB URI and JWT secret.

### 3. Seed the database

```bash
npm run seed
```

This loads **36 lessons** (beginner, intermediate, advanced, projects), **6 projects**, **3 challenges**, and an admin user:

- Email: `admin@pythonedition.com`
- Password: `admin123`

### 4. Run the app

```bash
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:5000

## Features

- **Authentication** — Sign up, login, forgot/reset password, JWT, profile
- **Dashboard** — Streak, progress, continue learning, adaptive recommendations
- **Courses** — Beginner, Intermediate, Advanced, Projects
- **Lessons** — Theory, syntax, examples, exercises, quizzes, bookmarks, voice hints, notes download
- **Compiler** — Monaco editor, run Python, save snippets
- **Adaptive learning** — Performance tracking, easier/harder suggestions, revision topics
- **Progress** — Charts, badges, category breakdown
- **Projects** — Calculator, To-Do, Weather, Chatbot, Expense Tracker, AI mini projects
- **Challenges & leaderboard** — Daily tasks, points
- **AI assistant** — In-app Python tutor chat
- **Admin panel** — User and content analytics

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/lessons` | List lessons |
| GET | `/api/lessons/adaptive` | Personalized recommendations |
| POST | `/api/compiler/run` | Execute Python code |
| GET | `/api/progress` | User analytics |

## License

MIT
