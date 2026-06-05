# Python Edition – Adaptive & Interactive Learning Assistant

A modern, AI-powered Python learning platform with structured lessons, quizzes, an interactive compiler, adaptive recommendations, progress analytics, projects, challenges, and a leaderboard.

## 🚀 Live Demo

- **Frontend:** https://python-edition-web.onrender.com
- **API:** https://python-edition-api.onrender.com

## ✨ Features

### Core Learning Experience
- **36+ Structured Lessons** across Beginner, Intermediate, Advanced, and Projects
- **Interactive Quizzes** with IRT-based difficulty adaptation
- **Coding Challenges** with real-time test case validation
- **Monaco Editor** for writing and executing Python code
- **Voice Hints** and downloadable lesson notes

### Adaptive Learning Engine
- **Item Response Theory (IRT)** for ability estimation (θ score)
- **Spaced Repetition (SM-2)** for optimal review scheduling
- **Topic-Level Mastery** tracking with confidence and retention scores
- **Knowledge Graph** for prerequisite-based recommendations
- **Learning Velocity** classification (accelerating/stable/struggling/expert)
- **Learning Style Detection** (theory-oriented vs hands-on)

### AI-Powered Tutor
- **Context-Aware Chat** with lesson-specific guidance
- **Multiple Modes:** Tutor, Hint, Debug, Revision
- **Adaptive Responses** based on user ability and learning style
- **Code Review** and error explanation

### Progress & Analytics
- **Weekly Activity Charts** with modern gradient styling
- **Challenge Completion Tracking**
- **Quiz Accuracy Trend Analysis**
- **Time by Topic Distribution**
- **GitHub-Style Learning Heatmap**
- **XP & Level Progression**
- **Streak Tracking** with freeze tokens

### Review System
- **Smart Review Center** with priority scoring
- **Due Reviews** with retention prediction
- **High-Risk Topic Alerts**
- **Forgotten Concept Identification**

### Gamification
- **XP System** with level progression
- **Achievement Badges**
- **Weekly Goals** with adaptive targets
- **Milestone Celebrations**
- **Leaderboard** for challenges

### Projects & Challenges
- **6 Real-World Projects:** Calculator, To-Do, Weather, Chatbot, Expense Tracker, AI mini-projects
- **3 Coding Challenges** with test cases
- **Project-Based Learning** with guided implementation

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Monaco Editor |
| **Backend** | Node.js, Express |
| **Database** | MongoDB Atlas |
| **Auth** | JWT with bcrypt |
| **AI** | OpenAI/OpenRouter API |
| **Deployment** | Render (Static Site + Web Service) |

## 📁 Project Structure

```
Python_Edition/
├── client/                 # React frontend
│   └── src/
│       ├── pages/          # Dashboard, courses, lessons, compiler, etc.
│       ├── components/     # Layout, glass cards, theme provider
│       └── lib/            # API client
├── server/                 # Express API
│   └── src/
│       ├── models/         # User, Lesson, Progress, AdaptiveProfile, etc.
│       ├── routes/         # REST API routes
│       ├── utils/          # Adaptive learning algorithms (IRT, SM-2, etc.)
│       └── seed/           # Curriculum seed data (36+ lessons)
└── package.json            # Root scripts (dev, build, seed)
```

## 🚦 Quick Start (Local Development)

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **Python 3** (for code execution in the compiler)

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

This loads **36 lessons** (beginner, intermediate, advanced, projects), **6 projects**, **3 challenges**, and creates an admin account.

### 4. Run the app (Local Development Only)

```bash
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:5000

**Note:** Local development requires MongoDB and Python 3 installed. For the live demo, use the links at the top of this README.

## 🌐 Deployment

The application is deployed on Render using the free tier:

- **Frontend:** Render Static Site (React/Vite build)
- **Backend:** Render Web Service (Node.js Express)
- **Database:** MongoDB Atlas (Free M0 tier)

See [DEPLOY_RENDER.md](./DEPLOY_RENDER.md) for detailed deployment instructions.

## 📊 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/lessons` | List lessons |
| GET | `/api/lessons/adaptive` | Personalized recommendations |
| POST | `/api/compiler/run` | Execute Python code |
| GET | `/api/progress` | User analytics |
| GET | `/api/adaptive/profile` | Adaptive learning profile |
| GET | `/api/adaptive/plan` | Personalized learning path |
| GET | `/api/adaptive/review-center` | Review schedule |
| POST | `/api/ai/chat` | AI tutor chat |

## 🎯 Adaptive Learning Features

### Item Response Theory (IRT)
- 1PL/2PL logistic model for ability estimation
- Ability score (θ) ranging from -3 to +3
- Item difficulty (b) and discrimination (a) parameters
- Expected quiz performance calculation

### Spaced Repetition (SM-2)
- SuperMemo 2 algorithm implementation
- Quality mapping from quiz scores
- Ease factor adjustment
- Interval calculation for optimal review timing

### Topic-Level Mastery
- Per-concept mastery tracking
- Confidence score estimation
- Retention score calculation
- Error frequency tracking
- Mastery decay over time

### Knowledge Graph
- Concept relationships and prerequisites
- Prerequisite mastery checking
- Intelligent remediation recommendations

### Learning Velocity
- Improvement rate calculation
- Challenge success trend tracking
- Velocity classification (accelerating/stable/struggling/expert)

## 📚 Curriculum

### Beginner
- Variables & Data Types
- Operators & Expressions
- Control Flow (if/else)
- Loops (for/while)
- Functions
- Lists & Tuples
- Dictionaries
- String Manipulation

### Intermediate
- Object-Oriented Programming
- File Handling
- Exception Handling
- Modules & Packages
- Decorators
- Generators
- List Comprehensions
- Lambda Functions

### Advanced
- Async/Await
- Context Managers
- Metaclasses
- Design Patterns
- API Integration
- Database Operations
- Testing & Debugging

### Projects
- Calculator Application
- To-Do List Manager
- Weather App
- Chatbot
- Expense Tracker
- AI Mini-Projects

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

---

Built with ❤️ for Python learners everywhere.
