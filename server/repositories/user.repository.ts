import { User, IUser } from "../models/User.js";

export class UserRepository {
  /**
   * Find user by database ID
   */
  static async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  /**
   * Find user by unique email.
   * Can optionally include password field.
   */
  static async findByEmail(email: string, includePassword = false): Promise<IUser | null> {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select("+password");
    }
    return query.exec();
  }

  /**
   * Create and persist a new user
   */
  static async create(userData: Partial<IUser>): Promise<IUser> {
    const newUser = new User(userData);
    return newUser.save();
  }

  /**
   * Update fields for a specific user
   */
  static async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  /**
   * Delete a user by ID
   */
  static async delete(id: string): Promise<IUser | null> {
    return User.findByIdAndDelete(id).exec();
  }
}
