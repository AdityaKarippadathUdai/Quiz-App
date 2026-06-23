import { User, IUser } from "../models/User.js";
import { isMongoConnected } from "../config/db.js";
import { mockUsers, MockUserDoc } from "./fallbackStore.js";
import bcryptjs from "bcryptjs";

export class UserRepository {
  /**
   * Find user by database ID
   */
  static async findById(id: string): Promise<IUser | null> {
    if (!isMongoConnected) {
      const u = mockUsers.find((x) => x._id === id || x.id === id);
      return u ? (u as any) : null;
    }
    return User.findById(id);
  }

  /**
   * Find user by unique email.
   * Can optionally include password field.
   */
  static async findByEmail(email: string, includePassword = false): Promise<IUser | null> {
    if (!isMongoConnected) {
      const u = mockUsers.find((x) => x.email.toLowerCase() === email.toLowerCase());
      return u ? (u as any) : null;
    }
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
    if (!isMongoConnected) {
      let password = userData.password;
      if (password && !password.startsWith("$2")) {
        const salt = await bcryptjs.genSalt(10);
        password = await bcryptjs.hash(password, salt);
      }
      const u = new MockUserDoc({ ...userData, password });
      mockUsers.push(u);
      return u as any;
    }
    const newUser = new User(userData);
    return newUser.save();
  }

  /**
   * Update fields for a specific user
   */
  static async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    if (!isMongoConnected) {
      const index = mockUsers.findIndex((x) => x._id === id || x.id === id);
      if (index === -1) return null;
      const u = mockUsers[index];
      const updated = new MockUserDoc({
        ...u,
        ...updateData,
        updatedAt: new Date()
      });
      mockUsers[index] = updated;
      return updated as any;
    }
    return User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  /**
   * Delete a user by ID
   */
  static async delete(id: string): Promise<IUser | null> {
    if (!isMongoConnected) {
      const index = mockUsers.findIndex((x) => x._id === id || x.id === id);
      if (index === -1) return null;
      const u = mockUsers[index];
      mockUsers.splice(index, 1);
      return u as any;
    }
    return User.findByIdAndDelete(id).exec();
  }
}
