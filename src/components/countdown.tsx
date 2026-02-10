
"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownProps {
  initialSeconds: number;
  onEnd?: () => void;
  showIcon?: boolean;
}

export const Countdown = ({
  initialSeconds,
  onEnd,
  showIcon = true,
}: CountdownProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      if (onEnd) {
        onEnd();
      }
      return;
    }
    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds, onEnd]);

  const displayMinutes = Math.floor(seconds / 60);
  const displaySeconds = seconds % 60;

  return (
    <div className="flex items-center justify-center gap-2 font-mono text-lg">
      {showIcon && <Clock className="h-5 w-5" />}
      <span>
        {String(displayMinutes).padStart(2, "0")}:
        {String(displaySeconds).padStart(2, "0")}
      </span>
    </div>
  );
};
