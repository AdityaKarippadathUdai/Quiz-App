import { Quiz, IQuiz } from "../models/Quiz.js";
import { isMongoConnected } from "../config/db.js";
import { mockQuizzes, mockUsers } from "./fallbackStore.js";
import mongoose from "mongoose";

export class QuizRepository {
  /**
   * Find quiz by ID
   */
  static async findById(id: string): Promise<IQuiz | null> {
    if (!isMongoConnected) {
      const q = mockQuizzes.find(x => x._id === id || x.id === id);
      if (!q) return null;
      const creator = mockUsers.find(u => u._id === q.createdBy) || { name: "Admin", email: "admin@quiz.com" };
      return {
        ...q,
        createdBy: {
          _id: creator._id,
          id: creator._id,
          name: creator.name,
          email: creator.email
        }
      } as any;
    }
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
    if (!isMongoConnected) {
      let filtered = [...mockQuizzes];
      if (filters.category) {
        filtered = filtered.filter(q => q.category && q.category.toLowerCase().includes(filters.category!.toLowerCase()));
      }
      if (filters.difficulty) {
        filtered = filtered.filter(q => q.difficulty === filters.difficulty);
      }
      if (typeof filters.isPublished === "boolean") {
        filtered = filtered.filter(q => q.isPublished === filters.isPublished);
      }
      if (filters.search) {
        const srch = filters.search.toLowerCase();
        filtered = filtered.filter(q => 
          (q.title && q.title.toLowerCase().includes(srch)) || 
          (q.description && q.description.toLowerCase().includes(srch))
        );
      }

      const total = filtered.length;
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);

      const populated = paginated.map(q => {
        const creator = mockUsers.find(u => u._id === q.createdBy) || { name: "Admin", email: "admin@quiz.com" };
        return {
          ...q,
          createdBy: {
            _id: creator._id,
            id: creator._id,
            name: creator.name,
            email: creator.email
          }
        };
      });

      return { quizzes: populated as any[], total };
    }

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
    if (!isMongoConnected) {
      const _id = new mongoose.Types.ObjectId().toString();
      const newQ = {
        _id,
        id: _id,
        ...quizData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockQuizzes.push(newQ);
      return newQ as any;
    }
    const newQuiz = new Quiz(quizData);
    return newQuiz.save();
  }

  /**
   * Update quiz by ID
   */
  static async update(id: string, updateData: Partial<IQuiz>): Promise<IQuiz | null> {
    if (!isMongoConnected) {
      const index = mockQuizzes.findIndex(x => x._id === id || x.id === id);
      if (index === -1) return null;
      const updated = {
        ...mockQuizzes[index],
        ...updateData,
        updatedAt: new Date()
      };
      mockQuizzes[index] = updated;
      return updated as any;
    }
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
    if (!isMongoConnected) {
      const index = mockQuizzes.findIndex(x => x._id === id || x.id === id);
      if (index === -1) return null;
      const deleted = mockQuizzes[index];
      mockQuizzes.splice(index, 1);
      return deleted as any;
    }
    return Quiz.findByIdAndDelete(id).exec();
  }
}
