export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum ThemePreference {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isBlocked: boolean;
  themePreference: ThemePreference;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export enum QuizDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  marks: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: QuizDifficulty;
  thumbnail?: string;
  timeLimit: number; // in minutes
  negativeMarking: boolean;
  isPublished: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export enum AttemptStatus {
  STARTED = "STARTED",
  COMPLETED = "COMPLETED",
}

export interface Answer {
  questionId?: string;
  questionIndex: number;
  selectedOption: string;
  isCorrect?: boolean;
  savedAt?: string;
}

export interface Attempt {
  _id: string;
  userId: string;
  quizId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | string;
  quiz: Quiz | string;
  answers: Answer[];
  score: number;
  percentage: number;
  rank: number;
  timeTaken: number; // in seconds
  timeSpent: number; // in seconds
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  totalMarks: number;
  status: AttemptStatus;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
