import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemePreference } from "../types.js";

interface ThemeContextType {
  theme: ThemePreference;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial theme from localStorage, default to SYSTEM
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    const savedTheme = localStorage.getItem("theme-preference") as ThemePreference;
    if (Object.values(ThemePreference).includes(savedTheme)) {
      return savedTheme;
    }
    return ThemePreference.SYSTEM;
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Function to set and persist theme preference
  const setTheme = (newTheme: ThemePreference) => {
    setThemeState(newTheme);
    localStorage.setItem("theme-preference", newTheme);
  };

  // Toggle helper for simple binary toggling
  const toggleTheme = () => {
    if (theme === ThemePreference.LIGHT) {
      setTheme(ThemePreference.DARK);
    } else if (theme === ThemePreference.DARK) {
      setTheme(ThemePreference.SYSTEM);
    } else {
      setTheme(ThemePreference.LIGHT);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = () => {
      let activeTheme: "light" | "dark" = "light";

      if (theme === ThemePreference.DARK) {
        activeTheme = "dark";
      } else if (theme === ThemePreference.LIGHT) {
        activeTheme = "light";
      } else {
        // SYSTEM theme: resolve using the media query
        activeTheme = mediaQuery.matches ? "dark" : "light";
      }

      setResolvedTheme(activeTheme);

      // Apply the tailwind theme classes
      root.classList.remove("light", "dark");
      root.classList.add(activeTheme);
    };

    updateTheme();

    // Listen for system theme changes if theme is set to SYSTEM
    if (theme === ThemePreference.SYSTEM) {
      const listener = () => updateTheme();
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
