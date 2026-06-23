export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum ThemePreference {
  LIGHT = "light",
  DARK = "dark",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isBlocked: boolean;
  themePreference: ThemePreference;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}
