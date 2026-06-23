import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext.js";
import { ThemePreference } from "../types.js";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getThemeIcon = (t: ThemePreference) => {
    switch (t) {
      case ThemePreference.LIGHT:
        return <Sun className="h-4 w-4 text-amber-500 shrink-0" />;
      case ThemePreference.DARK:
        return <Moon className="h-4 w-4 text-indigo-400 shrink-0" />;
      case ThemePreference.SYSTEM:
        return <Monitor className="h-4 w-4 text-gray-500 dark:text-zinc-400 shrink-0" />;
    }
  };

  const getThemeLabel = (t: ThemePreference) => {
    switch (t) {
      case ThemePreference.LIGHT:
        return "Light";
      case ThemePreference.DARK:
        return "Dark";
      case ThemePreference.SYSTEM:
        return "System";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 rounded-xl border border-gray-100 bg-white p-2 text-gray-700 shadow-xs hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition cursor-pointer"
        title="Change appearance theme"
      >
        {getThemeIcon(theme)}
        <span className="text-xs font-semibold hidden sm:inline-block">
          {getThemeLabel(theme)}
        </span>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            {(Object.values(ThemePreference) as ThemePreference[]).map((pref) => {
              const isSelected = theme === pref;
              return (
                <button
                  key={pref}
                  type="button"
                  onClick={() => {
                    setTheme(pref);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50/50 text-indigo-600 dark:bg-zinc-800 dark:text-zinc-200"
                      : "text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {getThemeIcon(pref)}
                    <span>{getThemeLabel(pref)}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-zinc-200" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle;
