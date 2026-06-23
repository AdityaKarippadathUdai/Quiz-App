import { z } from "zod";

const answerItemSchema = z.object({
  questionId: z.string().optional(),
  questionIndex: z.number().nonnegative().optional(),
  selectedOption: z.string({ required_error: "selectedOption choice is required" }),
  isCorrect: z.boolean().optional(),
});

export const saveProgressSchema = z.object({
  answers: z.array(answerItemSchema),
  timeSpent: z.number().nonnegative().default(0),
});

export const submitAttemptSchema = z.object({
  answers: z.array(answerItemSchema).optional(),
  timeSpent: z.number().nonnegative().optional(),
});
