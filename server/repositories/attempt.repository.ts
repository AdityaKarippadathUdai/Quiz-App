import { Attempt, IAttempt } from "../models/Attempt.js";

export class AttemptRepository {
  /**
   * Find attempt by ID
   */
  static async findById(id: string): Promise<IAttempt | null> {
    return Attempt.findById(id)
      .populate("user", "name email")
      .populate("quiz", "title category difficulty timeLimit negativeMarking questions")
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
    return Attempt.find({ user: userId })
      .populate("quiz", "title category difficulty timeLimit")
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find active attempts by user for a specific quiz
   */
  static async findActiveAttempt(userId: string, quizId: string): Promise<IAttempt | null> {
    return Attempt.findOne({
      user: userId,
      quiz: quizId,
      status: "STARTED",
    }).exec();
  }
}
