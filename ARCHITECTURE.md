# Quiz Platform Architecture Blueprint

This document defines the production-grade architectural blueprint for the Quiz Platform, designed to scale to millions of requests with a robust, modular, and type-safe foundation.

---

## 1. System Topology Overview

```
               [ Client Browser ]
                       │ (React 19 / Redux Toolkit / Tailwind)
                       ▼
            [ Vite Reverse Proxy / Port 3000 ]
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
  [ Express App ]             [ Dev Assets Server ]
  (Port 3000 API)             (HMR / Static Assets)
         │
         ├───────────────────────────┬───────────────────────────┐
         ▼                           ▼                           ▼
[ Auth Service ]            [ Quiz Service ]            [ AI Gen (Gemini API) ]
 (JWT / Hash)                (Mongoose Models)           (@google/genai SDK)
         │                           │
         └─────────────┬─────────────┘
                       ▼
                [ MongoDB Atlas ]
```

---

## 2. Directory Structure

This structure separates concerns using a **Feature-Based Frontend** and a **Repository-Service-Controller (RSC) Backend** architecture.

```text
quiz-platform/
├── .env.example                  # Environment variable contract
├── .gitignore                    # Git exclusions
├── index.html                    # Frontend SPA entry HTML
├── metadata.json                 # AI Studio applet configuration
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # Shared TS compiler configuration
├── vite.config.ts                # Vite configurations with custom proxy rules
├── ARCHITECTURE.md               # [THIS FILE] System architectural blueprint
│
├── server.ts                     # Express entrypoint & Vite middleware orchestrator
│
├── src/                          # FRONTEND SOURCE
│   ├── main.tsx                  # React DOM entry point
│   ├── App.tsx                   # Main React component & routing configuration
│   ├── index.css                 # Global styles (Tailwind v4 imports)
│   │
│   ├── assets/                   # Static assets, branding, global SVGs
│   │
│   ├── components/               # GLOBAL REUSABLE UI (Atomic / Shadcn)
│   │   ├── ui/                   # Primitive components (Button, Input, Card, etc.)
│   │   └── layout/               # Shell structures (Navbar, Sidebar, Footer)
│   │
│   ├── context/                  # Global React contexts (e.g., ThemeContext)
│   │
│   ├── features/                 # FEATURE-BASED MODULES (Encapsulated slices)
│   │   ├── auth/                 # Authentication & authorization features
│   │   │   ├── components/       # LoginCard, RegisterForm, ProtectedRoute
│   │   │   ├── services/         # authApiSlice (RTK Query login/register)
│   │   │   ├── store/            # authSlice (JWT & User state)
│   │   │   └── pages/            # LoginPage, RegisterPage
│   │   │
│   │   ├── quizzes/              # Quiz core features
│   │   │   ├── components/       # QuizCard, QuestionViewer, QuestionForm
│   │   │   ├── services/         # quizApiSlice (CRUD Quizzes, AI Gen endpoint)
│   │   │   ├── hooks/            # useQuizTimer, useQuizDraft
│   │   │   └── pages/            # QuizListPage, QuizDetailPage, QuizCreatePage
│   │   │
│   │   ├── attempts/             # Quiz attempt, tracking & user answer sheet
│   │   │   ├── components/       # AnswerSheet, TimerBar, AttemptSummary
│   │   │   ├── services/         # attemptApiSlice (Submit attempt, live answers)
│   │   │   └── pages/            # ActiveQuizPage, AttemptResultPage
│   │   │
│   │   ├── leaderboard/          # Global & quiz-specific rankings
│   │   │   ├── components/       # LeaderboardTable, TopThreePodium
│   │   │   ├── services/         # leaderboardApiSlice
│   │   │   └── pages/            # LeaderboardPage
│   │   │
│   │   └── analytics/            # Admin metrics & personal growth charts
│   │       ├── components/       # StatsOverviewCard, ScoreDistributionChart
│   │       ├── services/         # analyticsApiSlice
│   │       └── pages/            # DashboardPage, UserProfilePage
│   │
│   ├── hooks/                    # Global React custom hooks (e.g., useDebounce)
│   ├── lib/                      # External library clients (e.g., axios/fetch configs)
│   ├── store/                    # Redux store core configuration
│   │   ├── index.ts              # Redux configureStore & RTK Query middleware config
│   │   └── rootReducer.ts        # Combined slice reducers
│   │
│   └── types/                    # Shared frontend TypeScript interfaces
│
└── server/                       # BACKEND SOURCE
    ├── config/                   # Configuration adapters (db.ts, gemini.ts)
    │
    ├── middleware/               # HTTP Interceptors & security gates
    │   ├── auth.middleware.ts    # JWT validity & role check (USER vs ADMIN)
    │   ├── error.middleware.ts   # Centralized error handler & status mapper
    │   └── rateLimiter.ts        # Redis/In-memory protection middleware
    │
    ├── models/                   # MONGOOSE SCHEMAS (Data shapes)
    │   ├── User.ts               # Core users, password hashes & roles
    │   ├── Quiz.ts               # Quizzes, complex question nodes & configurations
    │   ├── Attempt.ts            # User answers, timing details, calculated scores
    │   └── Leaderboard.ts        # Cached global standings & ranks
    │
    ├── repositories/             # PERSISTENCE INTERACTION LAYER (Data encapsulation)
    │   ├── user.repository.ts    # MongoDB operations for Users
    │   ├── quiz.repository.ts    # MongoDB operations for Quizzes
    │   ├── attempt.repository.ts # MongoDB operations for Attempts
    │   └── base.repository.ts    # Abstract Generic Repository for CRUD reuse
    │
    ├── services/                 # BUSINESS LOGIC LAYER (Pure workflows)
    │   ├── auth.service.ts       # Hash verification, session generation, refresh tokens
    │   ├── quiz.service.ts       # Validating questions, publishing quizzes
    │   ├── attempt.service.ts    # Scoring algorithm, response alignment, caching records
    │   └── ai.service.ts         # Prompts to @google/genai SDK, structured output parsing
    │
    ├── controllers/              # HTTP ADAPTERS (Payload sanitization & parsing)
    │   ├── auth.controller.ts    # Handlers for authorization endpoints
    │   ├── quiz.controller.ts    # Handlers for quiz CRUD & generation
    │   ├── attempt.controller.ts # Handlers for starting & finishing attempts
    │   └── analytics.controller.ts # Handlers for dashboard metrics
    │
    └── routes/                   # ENDPOINT REGISTER MAPS
        ├── index.ts              # Global router registry (/api/v1)
        ├── auth.routes.ts        # Authorization router
        ├── quiz.routes.ts        # Quiz router
        ├── attempt.routes.ts     # Attempt router
        └── analytics.routes.ts   # Analytics router
```

---

## 3. Package Dependencies Specification

These packages are required to boot, build, compile, and run the production-grade application seamlessly.

### Core Dependencies (Runtime)
```json
{
  "dependencies": {
    "express": "^4.21.2",
    "mongoose": "^8.9.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^8.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^17.2.3",
    "@google/genai": "^2.4.0",
    "zod": "^3.24.0",
    
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "react-router-dom": "^7.1.0",
    "@reduxjs/toolkit": "^2.5.0",
    "react-redux": "^9.2.0",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "recharts": "^2.15.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.1"
  }
}
```

### Dev Dependencies (Build-time & Tooling)
```json
{
  "devDependencies": {
    "typescript": "~5.8.2",
    "vite": "^6.2.3",
    "@vitejs/plugin-react": "^5.0.4",
    "@tailwindcss/vite": "^4.1.14",
    "tailwindcss": "^4.1.14",
    "esbuild": "^0.25.0",
    "tsx": "^4.21.0",
    "@types/express": "^4.17.21",
    "@types/mongoose": "^5.11.97",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.14.0"
  }
}
```

---

## 4. Environment Variables Contract

Defines the variables needed for operations. These are declared in `.env.example` as a contract:

```env
# SERVER PORTS & DOMAINS
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000

# DATABASE CONNECTIONS
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/quizdb?retryWrites=true&w=majority

# SECURITY CREDENTIALS
JWT_SECRET=super_secret_production_key_change_me_immediately
JWT_EXPIRATION=1d
JWT_REFRESH_SECRET=super_secret_refresh_key_change_me_immediately
JWT_REFRESH_EXPIRATION=7d

# EXTERNAL AI CORES
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 5. Development Workflow & Production Packaging

Vite acts as the fast bundler. Node.js with native type-stripping support or packaged transpilation compiles the custom express server.

### Scripts Configuration (`package.json`)
```json
{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs"
  }
}
```

### Single Express Server Setup (`server.ts`)
```ts
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Router Layer
  // app.use("/api/v1", apiRouter);

  // Health-check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date() });
  });

  if (process.env.NODE_ENV !== "production") {
    // Vite Dev Middleware Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production SPA static distribution
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SYSTEM] Server listening on http://0.0.0.0:${PORT} [ENV: ${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer();
```

---

## 6. Scalable Frontend Architecture Explanation

### Feature-Based Organization
Rather than splitting files by visual roles (`/components`, `/pages`, `/hooks`), code is organized around business domain features inside `src/features/`.

#### Benefits:
1. **Self-Containment**: A developer working on the `attempts` features can find the forms, services, slices, hooks, and pages in a single nested directory.
2. **Minimal Merge Conflicts**: Parallel developers working on distinct scopes do not touch shared folder maps.
3. **Optimized Code Splitting**: Vite bundle optimization easily maps chunks to features, preventing large application payloads.

### Redux Toolkit & RTK Query Orchestration
RTK Query encapsulates client-side server caching:
- Automatically handles requests, errors, loading indicators, and deduplication.
- Triggers mutations for quiz actions that immediately refresh the leaderboard cache (`invalidateTags` mechanism).
- Eliminates manual `useEffect` logic for fetching, reducing React 19 re-render cycles.

---

## 7. Scalable Backend Architecture (RSC Pattern)

Our architecture is separated into distinct layers of concern, adhering strictly to **Solid design principles**:

```
[ Request Client ]
       │
       ▼
[ Routes Map ] -> Maps routes directly to designated Controllers
       │
       ▼
[ Controller Adapter ] -> Validates HTTP body payloads & isolates Express context
       │
       ▼
[ Service Layer ] -> Handles transactional rules, validation & business metrics
       │
       ▼
[ Repository Adapter ] -> Abstracts the Database Driver (Mongoose)
       │
       ▼
[ Database Model ] -> Defines Schema shapes
```

### 1. Controllers (Adapter Layer)
- **Role**: Parse query parameters, sanitize bodies, extract user contexts from authentication tokens, and return clean JSON response payloads.
- **Rules**: Zero DB interactions, zero business validations.

### 2. Services (Domain Layer)
- **Role**: Houses the real business rules. (e.g. "Calculate dynamic point rewards based on time elapsed", "Validate if AI quiz questions align with target categories").
- **Rules**: Fully DB-engine agnostic, highly testable unit files.

### 3. Repositories (Persistence Layer)
- **Role**: Direct Mongoose query statements, aggregate aggregations, database pagination, transaction limits.
- **Rules**: Serves as the sole database touchpoint, protecting models from leaking into services.

---

## 8. AI Core Generation Orchestration

Leveraging the official `@google/genai` TypeScript SDK, the quiz engine can generate structured schemas dynamically.

### Concept Layout
```ts
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateAIQuiz(topic: string, questionCount: number) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate a detailed trivia quiz about: ${topic}. Count: ${questionCount} questions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswerIndex: { type: Type.INTEGER }
              },
              required: ["questionText", "options", "correctAnswerIndex"]
            }
          }
        },
        required: ["title", "questions"]
      }
    }
  });

  return JSON.parse(response.text);
}
```
This ensures the generator returns a strictly valid JSON schema that can be saved directly to the database via the **QuizRepository**.
