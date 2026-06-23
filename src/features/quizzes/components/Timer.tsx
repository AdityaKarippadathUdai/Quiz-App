import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface TimerProps {
  initialSeconds: number;
  onTick: (remainingSeconds: number) => void;
  onExpire: () => void;
}

export const Timer: React.FC<TimerProps> = ({ initialSeconds, onTick, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        onTick(next);
        if (next <= 0) {
          clearInterval(interval);
          onExpire();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onTick, onExpire]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isLowTime = secondsLeft < 60;

  return (
    <div
      id="quiz-timer"
      className={`flex items-center space-x-2 rounded-2xl px-4 py-2 border transition-all duration-300 ${
        isLowTime
          ? "border-red-300 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 animate-pulse"
          : "border-gray-200 bg-gray-50 text-gray-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
      }`}
    >
      {isLowTime ? (
        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
      ) : (
        <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
      )}
      <span className="font-mono text-sm font-extrabold tracking-wider">
        {formatTime(secondsLeft)}
      </span>
    </div>
  );
};
