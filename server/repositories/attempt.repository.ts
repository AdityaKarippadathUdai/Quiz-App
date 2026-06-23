import { Attempt, IAttempt } from "../models/Attempt.js";

export class AttemptRepository {
  /**
   * Find attempt by ID
   */
  static async findById(id: string): Promise<IAttempt | null> {
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
    const newAttempt = new Attempt(attemptData);
    return newAttempt.save();
  }

  /**
   * Update attempt data
   */
  static async update(id: string, updateData: Partial<IAttempt>): Promise<IAttempt | null> {
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
    return Attempt.find({
      $or: [{ quizId }, { quiz: quizId }],
      status: "COMPLETED",
    })
      .sort({ score: -1, timeTaken: 1 })
      .exec();
  }
}
