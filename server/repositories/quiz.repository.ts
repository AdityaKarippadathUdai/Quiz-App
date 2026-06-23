import { Quiz, IQuiz } from "../models/Quiz.js";

export class QuizRepository {
  /**
   * Find quiz by ID
   */
  static async findById(id: string): Promise<IQuiz | null> {
    return Quiz.findById(id).populate("createdBy", "name email").exec();
  }

  /**
   * Find all quizzes with filters and pagination
   */
  static async findAll(filters: {
    category?: string;
    difficulty?: string;
    isPublished?: boolean;
    search?: string;
  } = {}, page = 1, limit = 10): Promise<{ quizzes: IQuiz[]; total: number }> {
    const query: any = {};

    if (filters.category) {
      query.category = { $regex: new RegExp(filters.category, "i") };
    }
    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }
    if (typeof filters.isPublished === "boolean") {
      query.isPublished = filters.isPublished;
    }
    if (filters.search) {
      query.$or = [
        { title: { $regex: new RegExp(filters.search, "i") } },
        { description: { $regex: new RegExp(filters.search, "i") } },
      ];
    }

    const total = await Quiz.countDocuments(query);
    const quizzes = await Quiz.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { quizzes, total };
  }

  /**
   * Create and save a new quiz
   */
  static async create(quizData: Partial<IQuiz>): Promise<IQuiz> {
    const newQuiz = new Quiz(quizData);
    return newQuiz.save();
  }

  /**
   * Update quiz by ID
   */
  static async update(id: string, updateData: Partial<IQuiz>): Promise<IQuiz | null> {
    return Quiz.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Delete quiz by ID
   */
  static async delete(id: string): Promise<IQuiz | null> {
    return Quiz.findByIdAndDelete(id).exec();
  }
}
