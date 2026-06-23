import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRefreshMutation, useLogoutMutation } from "../services/authApiSlice.js";
import { setCredentials, logOut } from "../store/authSlice.js";
import { RootState } from "../../../store/index.js";
import { User, ThemePreference } from "../../../types.js";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  theme: ThemePreference;
  toggleTheme: () => void;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Theme Management (load from user profile themePreference, localStorage, or system preference)
  const [theme, setTheme] = useState<ThemePreference>(() => {
    if (user?.themePreference) return user.themePreference;
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === ThemePreference.DARK || savedTheme === ThemePreference.LIGHT) {
      return savedTheme;
    }
    return ThemePreference.LIGHT;
  });

  const [refreshSession] = useRefreshMutation();
  const [logoutApi] = useLogoutMutation();

  // Handle application boot verification
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        // Attempt session rotation on reload if cookie has active httpOnly token or localStorage claims auth
        if (localStorage.getItem("token")) {
          const response = await refreshSession().unwrap();
          if (response.success && response.data) {
            dispatch(setCredentials(response.data));
            if (response.data.user.themePreference) {
              setTheme(response.data.user.themePreference);
            }
          }
        }
      } catch (err) {
        console.warn("[AUTH] Auto-session restore bypassed or expired.");
        dispatch(logOut());
      } finally {
        setIsInitializing(false);
      }
    };

    bootstrapAuth();
  }, [dispatch, refreshSession]);

  // Sync class state to document tag
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(ThemePreference.LIGHT, ThemePreference.DARK);
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === ThemePreference.LIGHT ? ThemePreference.DARK : ThemePreference.LIGHT));
  };

  const logoutUser = async () => {
    try {
      await logoutApi().unwrap();
    } catch (err) {
      console.error("[AUTH] Logout endpoint failed", err);
    } finally {
      dispatch(logOut());
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isInitializing,
        theme,
        toggleTheme,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
