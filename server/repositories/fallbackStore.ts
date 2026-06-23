import bcryptjs from "bcryptjs";
import mongoose from "mongoose";

export class MockUserDoc {
  _id: string;
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  avatar?: string;
  isBlocked: boolean;
  themePreference: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any) {
    this._id = data._id || new mongoose.Types.ObjectId().toString();
    this.id = this._id;
    this.name = data.name || "";
    this.email = (data.email || "").toLowerCase();
    this.password = data.password;
    this.role = data.role || "USER";
    this.avatar = data.avatar || "";
    this.isBlocked = data.isBlocked || false;
    this.themePreference = data.themePreference || "light";
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    if (this.password.startsWith("$2")) {
      return bcryptjs.compare(candidatePassword, this.password);
    }
    return candidatePassword === this.password;
  }
}

// In-Memory collections
export const mockUsers: MockUserDoc[] = [];
export const mockQuizzes: any[] = [];
export const mockAttempts: any[] = [];

// Seed functions to initialize with default demo data
async function seedFallbackStore() {
  const adminSalt = await bcryptjs.genSalt(10);
  const adminHashedPassword = await bcryptjs.hash("admin123", adminSalt);
  
  const playerSalt = await bcryptjs.genSalt(10);
  const playerHashedPassword = await bcryptjs.hash("player123", playerSalt);

  const adminUser = new MockUserDoc({
    _id: "655b38dcf51a029a8c1f1111",
    name: "Platform Administrator",
    email: "admin@quiz.com",
    password: adminHashedPassword,
    role: "ADMIN",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
    isBlocked: false,
    themePreference: "dark",
  });

  const playerUser = new MockUserDoc({
    _id: "655b38dcf51a029a8c1f2222",
    name: "Alex Trivia Champ",
    email: "player@quiz.com",
    password: playerHashedPassword,
    role: "USER",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150",
    isBlocked: false,
    themePreference: "light",
  });

  mockUsers.push(adminUser, playerUser);

  // Seed default Quiz
  mockQuizzes.push({
    _id: "655b38dcf51a029a8c1f3333",
    id: "655b38dcf51a029a8c1f3333",
    title: "Quantum Mechanics & Modern Physics",
    description: "Dive into wave-particle duality, Schrödinger's cat, and Heisenberg's Uncertainty Principle in this advanced science challenge.",
    category: "Science",
    difficulty: "HARD",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&h=400",
    timeLimit: 15,
    negativeMarking: true,
    isPublished: true,
    createdBy: adminUser._id,
    questions: [
      {
        _id: "q1",
        question: "Which physicist formulated the Uncertainty Principle in quantum mechanics?",
        options: ["Werner Heisenberg", "Erwin Schrödinger", "Niels Bohr", "Albert Einstein"],
        correctAnswer: "Werner Heisenberg",
        explanation: "Werner Heisenberg introduced the Uncertainty Principle in 1927, stating that the position and momentum of a particle cannot both be precisely determined.",
        marks: 5,
      },
      {
        _id: "q2",
        question: "What is the phenomenon where two particles remain connected and instantaneously affect each other regardless of distance?",
        options: ["Quantum Superposition", "Quantum Entanglement", "Quantum Tunneling", "Wave Decofined state"],
        correctAnswer: "Quantum Entanglement",
        explanation: "Einstein called quantum entanglement 'spooky action at a distance.' It describes particles whose quantum states are intertwined.",
        marks: 5,
      },
      {
        _id: "q3",
        question: "In the famous Schrödinger's Cat thought experiment, in what state is the cat before the box is opened?",
        options: ["Dead", "Alive", "Superposition (Both Alive and Dead)", "Excited quantum state"],
        correctAnswer: "Superposition (Both Alive and Dead)",
        explanation: "The cat is considered simultaneously alive and dead (in a superposition of states) until the observation collapses the wave function.",
        marks: 5,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Seed some demo completions on our quiz
  mockAttempts.push({
    _id: "655b38dcf51a029a8c1f4444",
    id: "655b38dcf51a029a8c1f4444",
    userId: playerUser._id,
    quizId: "655b38dcf51a029a8c1f3333",
    user: playerUser._id,
    quiz: "655b38dcf51a029a8c1f3333",
    answers: [
      { questionIndex: 0, selectedOption: "Werner Heisenberg", isCorrect: true },
      { questionIndex: 1, selectedOption: "Quantum Entanglement", isCorrect: true },
      { questionIndex: 2, selectedOption: "Dead", isCorrect: false }
    ],
    score: 10,
    percentage: 67,
    rank: 1,
    timeTaken: 125,
    correctAnswersCount: 2,
    incorrectAnswersCount: 1,
    totalMarks: 15,
    status: "COMPLETED",
    startedAt: new Date(Date.now() - 3600000),
    completedAt: new Date(Date.now() - 3500000),
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3500000),
  });

  console.log("[FALLBACK] Seeded local in-memory database with Demo Admin, Player, Quiz and Attempt.");
}

seedFallbackStore();
