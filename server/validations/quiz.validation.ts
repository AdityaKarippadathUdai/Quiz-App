import { z } from "zod";
import { QuizDifficulty } from "../models/Quiz.js";

const questionValidationSchema = z.object({
  question: z
    .string({ required_error: "Question text is required" })
    .min(5, "Question must be at least 5 characters long")
    .trim(),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "A question must have at least 2 options"),
  correctAnswer: z
    .string({ required_error: "Correct answer choice is required" })
    .min(1, "Correct answer choice cannot be empty")
    .trim(),
  explanation: z.string().optional(),
  marks: z
    .number()
    .min(1, "Marks must be at least 1")
    .default(1),
});

export const quizCreateSchema = z.object({
  title: z
    .string({ required_error: "Quiz title is required" })
    .min(3, "Title must be at least 3 characters long")
    .max(150, "Title cannot exceed 150 characters")
    .trim(),
  description: z
    .string({ required_error: "Quiz description is required" })
    .min(10, "Description must be at least 10 characters long")
    .trim(),
  category: z
    .string({ required_error: "Quiz category is required" })
    .min(2, "Category must be at least 2 characters long")
    .trim(),
  difficulty: z.nativeEnum(QuizDifficulty).default(QuizDifficulty.MEDIUM),
  thumbnail: z.string().optional(),
  timeLimit: z
    .number({ required_error: "Time limit is required" })
    .min(1, "Time limit must be at least 1 minute"),
  negativeMarking: z.boolean().default(false),
  questions: z
    .array(questionValidationSchema)
    .min(1, "A quiz must contain at least one question"),
});

export const quizUpdateSchema = quizCreateSchema.partial();
export const publishToggleSchema = z.object({
  isPublished: z.boolean({ required_error: "isPublished boolean state is required" }),
});
