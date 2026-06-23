export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum ThemePreference {
  LIGHT = "light",
  DARK = "dark",
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
  questionId: string;
  selectedOption: string;
  savedAt?: string;
}

export interface Attempt {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | string;
  quiz: Quiz | string;
  answers: Answer[];
  score: number;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  totalMarks: number;
  timeSpent: number; // in seconds
  status: AttemptStatus;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

