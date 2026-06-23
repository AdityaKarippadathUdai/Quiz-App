import mongoose, { Schema, Document } from "mongoose";

export enum QuizDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  marks: number;
}

export interface IQuiz extends Document {
  title: string;
  description: string;
  category: string;
  difficulty: QuizDifficulty;
  thumbnail?: string;
  timeLimit: number; // in minutes
  negativeMarking: boolean;
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  question: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
  },
  options: {
    type: [String],
    required: [true, "Options are required"],
    validate: {
      validator: (val: string[]) => val.length >= 2,
      message: "A question must have at least 2 options",
    },
  },
  correctAnswer: {
    type: String,
    required: [true, "Correct answer is required"],
    trim: true,
  },
  explanation: {
    type: String,
    trim: true,
    default: "",
  },
  marks: {
    type: Number,
    required: [true, "Marks are required"],
    min: [1, "Marks must be at least 1"],
    default: 1,
  },
});

const QuizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      maxlength: [150, "Quiz title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Quiz description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Quiz category is required"],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: Object.values(QuizDifficulty),
      default: QuizDifficulty.MEDIUM,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    timeLimit: {
      type: Number,
      required: [true, "Time limit is required (in minutes)"],
      min: [1, "Time limit must be at least 1 minute"],
    },
    negativeMarking: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: {
      type: [QuestionSchema],
      required: [true, "At least one question is required"],
      validate: {
        validator: (val: IQuestion[]) => val.length >= 1,
        message: "A quiz must have at least one question",
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Quiz = mongoose.model<IQuiz>("Quiz", QuizSchema);
