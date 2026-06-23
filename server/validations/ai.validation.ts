import { z } from "zod";
import { QuizDifficulty } from "../models/Quiz.js";

export const aiGenerateSchema = z.object({
  topic: z
    .string({ required_error: "Topic is required" })
    .min(2, "Topic must be at least 2 characters long")
    .max(100, "Topic cannot exceed 100 characters")
    .trim(),
  difficulty: z.nativeEnum(QuizDifficulty).default(QuizDifficulty.MEDIUM),
  numQuestions: z
    .number({ required_error: "Number of questions is required" })
    .int()
    .min(1, "Must generate at least 1 question")
    .max(20, "Cannot generate more than 20 questions at a time")
    .default(5),
});

export const aiSaveSchema = z.object({
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
  timeLimit: z
    .number({ required_error: "Time limit is required" })
    .min(1, "Time limit must be at least 1 minute"),
  negativeMarking: z.boolean().default(false),
  questions: z
    .array(
      z.object({
        question: z.string().min(5, "Question must be at least 5 characters long").trim(),
        options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "Must have at least 2 options"),
        correctAnswer: z.string().min(1, "Correct answer choice is required").trim(),
        explanation: z.string().optional(),
        marks: z.number().min(1).default(1),
      })
    )
    .min(1, "Must contain at least one question"),
});
