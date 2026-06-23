import { z } from "zod";

const answerItemSchema = z.object({
  questionId: z.string({ required_error: "questionId is required" }),
  selectedOption: z.string({ required_error: "selectedOption choice is required" }),
});

export const saveProgressSchema = z.object({
  answers: z.array(answerItemSchema),
  timeSpent: z.number().nonnegative().default(0),
});

export const submitAttemptSchema = z.object({
  answers: z.array(answerItemSchema).optional(),
  timeSpent: z.number().nonnegative().optional(),
});
