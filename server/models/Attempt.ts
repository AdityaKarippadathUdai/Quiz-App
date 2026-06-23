import mongoose, { Schema, Document } from "mongoose";

export enum AttemptStatus {
  STARTED = "STARTED",
  COMPLETED = "COMPLETED",
}

export interface IAnswer {
  questionId: string;
  selectedOption: string;
  savedAt: Date;
}

export interface IAttempt extends Document {
  user: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  answers: IAnswer[];
  score: number;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  totalMarks: number;
  timeSpent: number; // in seconds
  status: AttemptStatus;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  questionId: {
    type: String,
    required: true,
  },
  selectedOption: {
    type: String,
    required: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

const AttemptSchema = new Schema<IAttempt>(
  {
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
