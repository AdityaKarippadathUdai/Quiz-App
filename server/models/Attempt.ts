import mongoose, { Schema, Document } from "mongoose";

export enum AttemptStatus {
  STARTED = "STARTED",
  COMPLETED = "COMPLETED",
}

export interface IAnswer {
  questionId?: string;
  questionIndex: number;
  selectedOption: string;
  isCorrect?: boolean;
  savedAt?: Date;
}

export interface IAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId; // compatibility alias
  quiz: mongoose.Types.ObjectId; // compatibility alias
  answers: IAnswer[];
  score: number;
  percentage: number;
  rank: number;
  timeTaken: number; // in seconds
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  totalMarks: number;
  timeSpent: number; // compatibility alias
  status: AttemptStatus;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  questionId: {
    type: String,
  },
  questionIndex: {
    type: Number,
    required: true,
  },
  selectedOption: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

const AttemptSchema = new Schema<IAttempt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    answers: {
      type: [AnswerSchema],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    correctAnswersCount: {
      type: Number,
      default: 0,
    },
    incorrectAnswersCount: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(AttemptStatus),
      default: AttemptStatus.STARTED,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Attempt = mongoose.model<IAttempt>("Attempt", AttemptSchema);
