import { Attempt, IAttempt } from "../models/Attempt.js";
import { isMongoConnected } from "../config/db.js";
import { mockAttempts, mockUsers, mockQuizzes } from "./fallbackStore.js";
import mongoose from "mongoose";

export class AttemptRepository {
  /**
   * Find attempt by ID
   */
  static async findById(id: string): Promise<IAttempt | null> {
    if (!isMongoConnected) {
      const att = mockAttempts.find(x => x._id === id || x.id === id);
      if (!att) return null;
      
      const user = mockUsers.find(u => u._id === att.userId) || { name: "User", email: "user@quiz.com" };
      const quiz = mockQuizzes.find(q => q._id === att.quizId) || { title: "Quiz", category: "General", questions: [] };

      return {
        ...att,
        user: { _id: user._id, id: user._id, name: user.name, email: user.email },
        userId: { _id: user._id, id: user._id, name: user.name, email: user.email },
        quiz: { ...quiz },
        quizId: { ...quiz }
      } as any;
    }
    return Attempt.findById(id)
      .populate("user", "name email")
      .populate("userId", "name email")
      .populate("quiz", "title category difficulty timeLimit negativeMarking questions")
      .populate("quizId", "title category difficulty timeLimit negativeMarking questions")
      .exec();
  }

  /**
   * Create new attempt
   */
  static async create(attemptData: Partial<IAttempt>): Promise<IAttempt> {
    if (!isMongoConnected) {
      const _id = new mongoose.Types.ObjectId().toString();
      const newAtt = {
        _id,
        id: _id,
        status: "STARTED",
        score: 0,
        percentage: 0,
        answers: [],
        startedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...attemptData,
      };
      mockAttempts.push(newAtt);
      return newAtt as any;
    }
    const newAttempt = new Attempt(attemptData);
    return newAttempt.save();
  }

  /**
   * Update attempt data
   */
  static async update(id: string, updateData: Partial<IAttempt>): Promise<IAttempt | null> {
    if (!isMongoConnected) {
      const index = mockAttempts.findIndex(x => x._id === id || x.id === id);
      if (index === -1) return null;
      const updated = {
        ...mockAttempts[index],
        ...updateData,
        updatedAt: new Date()
      };
      mockAttempts[index] = updated;
      return updated as any;
    }
    return Attempt.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Find attempts made by a specific user
   */
  static async findByUser(userId: string): Promise<IAttempt[]> {
    if (!isMongoConnected) {
      const userAtts = mockAttempts.filter(x => 
        (x.userId && x.userId.toString() === userId.toString()) || 
        (x.user && x.user.toString() === userId.toString())
      );
      
      const populated = userAtts.map(att => {
        const quiz = mockQuizzes.find(q => q._id === att.quizId) || { title: "Quiz", category: "General" };
        return {
          ...att,
          quiz: { ...quiz },
          quizId: { ...quiz }
        };
      });

      populated.sort((a, b) => {
        const tA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const tB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return tB - tA;
      });
      return populated as any[];
    }
    return Attempt.find({
      $or: [{ userId: userId }, { user: userId }],
    })
      .populate("quiz", "title category difficulty timeLimit")
      .populate("quizId", "title category difficulty timeLimit")
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find active attempts by user for a specific quiz
   */
  static async findActiveAttempt(userId: string, quizId: string): Promise<IAttempt | null> {
    if (!isMongoConnected) {
      const att = mockAttempts.find(x => 
        ((x.userId && x.userId.toString() === userId.toString()) || (x.user && x.user.toString() === userId.toString())) &&
        ((x.quizId && x.quizId.toString() === quizId.toString()) || (x.quiz && x.quiz.toString() === quizId.toString())) &&
        x.status === "STARTED"
      );
      return att ? (att as any) : null;
    }
    return Attempt.findOne({
      $or: [{ userId: userId }, { user: userId }],
      $or: [{ quizId: quizId }, { quiz: quizId }],
      status: "STARTED",
    }).exec();
  }

  /**
   * Find all completed attempts for a quiz sorted by score desc, timeTaken asc
   */
  static async findCompletedAttemptsForQuiz(quizId: string): Promise<IAttempt[]> {
    if (!isMongoConnected) {
      const quizAtts = mockAttempts.filter(x => 
        ((x.quizId && x.quizId.toString() === quizId.toString()) || (x.quiz && x.quiz.toString() === quizId.toString())) &&
        x.status === "COMPLETED"
      );

      const populated = quizAtts.map(att => {
        const user = mockUsers.find(u => u._id === att.userId) || { name: "User", email: "user@quiz.com" };
        return {
          ...att,
          user: { _id: user._id, id: user._id, name: user.name, email: user.email },
          userId: { _id: user._id, id: user._id, name: user.name, email: user.email }
        };
      });

      populated.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.timeTaken - b.timeTaken;
      });

      return populated as any[];
    }
    return Attempt.find({
      $or: [{ quizId }, { quiz: quizId }],
      status: "COMPLETED",
    })
      .sort({ score: -1, timeTaken: 1 })
      .exec();
  }
}
