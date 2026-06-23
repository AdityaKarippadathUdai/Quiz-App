# Quiz Platform production-Grade API & Real-Time Specifications

This document outlines the REST API and Socket.IO WebSocket interfaces configured for the production-grade Quiz Platform.

---

## 1. REST API Interface

All standard REST endpoints are versioned under `/api/v1/*`.

### Authentication Endpoints (`/api/v1/auth`)

#### `POST /register`
Creates a new player or admin account on the platform.
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123",
    "avatar": "https://example.com/avatar.png"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "data": {
      "user": { "id": "user_id_123", "name": "Jane Doe", "email": "jane@example.com", "role": "PLAYER" }
    }
  }
  ```

#### `POST /login`
Authenticates user and returns credentials + cookie session tokens.
- **Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "token": "jwt_access_token_string",
      "user": { "id": "user_id_123", "name": "Jane Doe", "role": "PLAYER" }
    }
  }
  ```

---

### Quiz Endpoints (`/api/v1/quizzes`)

#### `GET /`
Fetches a paginated, filtered list of live quizzes. (Backed by high-speed Redis caching).
- **Query Params**:
  - `page`: Page index (default: `1`)
  - `limit`: Page limit size (default: `10`)
  - `category`: Filter category string (e.g., `Science`)
  - `difficulty`: Filter difficulty enum (`easy`, `medium`, `hard`)
  - `search`: Search query string
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "message": "Quizzes list loaded successfully.",
    "data": [
      {
        "id": "quiz_123",
        "title": "Quantum Computing 101",
        "category": "Science",
        "difficulty": "medium",
        "questionsCount": 10
      }
    ],
    "meta": { "page": 1, "limit": 10, "total": 1 }
  }
  ```

#### `POST /`
Creates a new quiz (Creators / Admins only). Invalidates the `quizzes:*` cache.
- **Body**:
  ```json
  {
    "title": "Astronomy Essentials",
    "category": "Science",
    "difficulty": "easy",
    "timeLimit": 600,
    "questions": [
      {
        "text": "What is the closest planet to the Sun?",
        "options": ["Venus", "Mercury", "Earth", "Mars"],
        "correctAnswer": "Mercury",
        "marks": 5
      }
    ]
  }
  ```

#### `PUT /:id`
Updates quiz details. Invalidates `quizzes:*` and `quiz:id` caches.

#### `PATCH /:id/publish`
Toggles the publication status of a quiz draft. If set to `true`, broadcasts a real-time `notification` socket event to all players.

---

### Assessment Session Endpoints (`/api/v1/attempts`)

#### `POST /start/:quizId`
Initiates a timed, secure quiz taking session.
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "message": "Assessment session initiated successfully.",
    "data": {
      "attempt": {
        "id": "attempt_987",
        "quizId": "quiz_123",
        "status": "started",
        "answers": []
      }
    }
  }
  ```

#### `PUT /progress/:attemptId`
Autosaves progressive question responses and time tracking safely.
- **Body**:
  ```json
  {
    "answers": [
      { "questionIndex": 0, "selectedOption": "Mercury" }
    ],
    "timeSpent": 45
  }
  ```

#### `POST /submit/:attemptId`
Finalizes score, computes rank metrics, clears all related caches, and broadcasts real-time Socket.IO leaderboard update events.

---

### Scoreboard & Analytics Endpoints (`/api/v1/analytics`)

#### `GET /leaderboard/global`
Retrieves top platform scoring users. Cache-accelerated via Redis.
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "data": [
      { "name": "Jane Doe", "totalScore": 95, "quizzesTaken": 3 }
    ]
  }
  ```

#### `GET /leaderboard/quiz/:quizId`
Fetches strict, ordered rank lists for a specific quiz (Rank 1 to N).
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "data": {
      "quiz": { "title": "Quantum Computing 101" },
      "leaderboard": [
        { "rank": 1, "name": "Jane Doe", "score": 45, "timeTaken": 120 }
      ]
    }
  }
  ```

---

## 2. Real-Time WebSocket Interface (Socket.IO)

Clients establish persistent WebSockets bound on the default reverse proxy port (`3000`).

### Client Emit Events

#### `user_joined`
Registers a connected client to enable presence logs and specific room updates.
- **Payload**:
  ```json
  {
    "userId": "user_id_123",
    "username": "Jane Doe"
  }
  ```

#### `quiz_started`
Informs the server that a player is taking a specific quiz.
- **Payload**:
  ```json
  {
    "quizId": "quiz_123",
    "title": "Quantum Computing 101"
  }
  ```

---

### Server Broadcast Events

#### `notification`
Pushes live pop-ups, achievement milestones, and new quiz releases to all active clients.
- **Payload**:
  ```json
  {
    "id": "rand_id_123",
    "title": "New Quiz Published! 🚀",
    "message": "Challenge yourself with 'Astronomy Essentials'!",
    "type": "success",
    "timestamp": "2026-06-23T10:03:07.000Z"
  }
  ```

#### `leaderboard_update`
Instructs clients looking at scoreboards to immediately trigger background refetches.
- **Payload**:
  ```json
  {
    "quizId": "quiz_123",
    "updatedAt": "2026-06-23T10:03:07.000Z"
  }
  ```

#### `presence_update`
Broadcasts a updated array of active user indicators.
- **Payload**:
  ```json
  [
    { "username": "Jane Doe", "activeQuizId": "quiz_123" }
  ]
  ```
