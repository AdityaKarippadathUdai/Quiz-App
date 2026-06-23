import { GoogleGenAI, Type } from "@google/genai";
import { QuizDifficulty } from "../models/Quiz.js";
import { AppError } from "../middleware/errorMiddleware.js";

export interface IGeneratedQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface IGeneratedQuizResponse {
  questions: IGeneratedQuestion[];
}

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AppError("GEMINI_API_KEY environment variable is required but missing from settings.", 500, "MISSING_GEMINI_KEY");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export class AIService {
  /**
   * Generates a list of quiz questions based on topic, difficulty, and number of questions
   */
  static async generateQuizQuestions(
    topic: string,
    difficulty: QuizDifficulty,
    numQuestions: number
  ): Promise<IGeneratedQuizResponse> {
    const client = getAiClient();

    const prompt = `Generate a multiple choice quiz about "${topic}".
Difficulty Level: ${difficulty}
Number of Questions: ${numQuestions}

Instructions:
1. Generate exactly ${numQuestions} high-quality, technically accurate questions.
2. For each question, provide exactly 4 distinct and plausible options.
3. Mark one of these options as the correct answer. The value of "answer" must match the option text EXACTLY.
4. Provide a clear, detailed, and educational explanation for why that option is correct.
5. Ensure the content matches the "${difficulty}" difficulty level (easy, medium, or hard).`;

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert curriculum developer, educator, and assessment specialist. Your goal is to write accurate, engaging, and clear quiz questions with constructive explanations for why the correct answer is right.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                description: "List of generated quiz questions.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: {
                      type: Type.STRING,
                      description: "The text of the quiz question."
                    },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Exactly 4 options/choices for the multiple choice question."
                    },
                    answer: {
                      type: Type.STRING,
                      description: "The correct option text, which MUST EXACTLY match one of the strings in the options array."
                    },
                    explanation: {
                      type: Type.STRING,
                      description: "A detailed explanation of why the answer is correct."
                    }
                  },
                  required: ["question", "options", "answer", "explanation"]
                }
              }
            },
            required: ["questions"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new AppError("Gemini AI service returned an empty response.", 502, "AI_EMPTY_RESPONSE");
      }

      const parsed: IGeneratedQuizResponse = JSON.parse(responseText.trim());

      // Validation and repair layer
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new AppError("Invalid quiz structure returned from AI.", 502, "AI_INVALID_STRUCTURE");
      }

      const validatedQuestions: IGeneratedQuestion[] = [];

      for (const q of parsed.questions) {
        if (!q.question || !q.options || !Array.isArray(q.options) || !q.answer) {
          continue; // skip incomplete questions
        }

        // Clean options and ensure unique elements
        let cleanOptions = q.options.map(opt => opt.trim()).filter(Boolean);
        if (cleanOptions.length < 2) {
          continue; // must have at least 2 options
        }

        let answer = q.answer.trim();

        // If options don't contain the answer, append it or correct it
        if (!cleanOptions.includes(answer)) {
          // Check if there is a close match, otherwise add it
          const match = cleanOptions.find(opt => opt.toLowerCase() === answer.toLowerCase());
          if (match) {
            answer = match;
          } else {
            cleanOptions[0] = answer; // replace the first option with the correct answer
          }
        }

        validatedQuestions.push({
          question: q.question.trim(),
          options: cleanOptions,
          answer: answer,
          explanation: q.explanation ? q.explanation.trim() : "No explanation provided.",
        });
      }

      if (validatedQuestions.length === 0) {
        throw new AppError("AI failed to produce any valid quiz questions.", 502, "AI_VALIDATION_FAILED");
      }

      return {
        questions: validatedQuestions,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error("[AIService] Generation Error:", error);
      throw new AppError(
        error.message || "Failed to generate quiz questions using Gemini AI.",
        error.status || 500,
        "AI_GENERATION_FAILED"
      );
    }
  }
}
