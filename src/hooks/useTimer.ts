import { useRef, useState, useCallback, useEffect } from "react";

interface TimerState {
  whiteTime: number;
  blackTime: number;
}

export function useTimer(
  initialTime: number | null,
  increment: number,
  onTimeout: (color: "w" | "b") => void,
) {
  const [times, setTimes] = useState<TimerState>({
    whiteTime: initialTime ?? Infinity,
    blackTime: initialTime ?? Infinity,
  });
  const [activeColor, setActiveColor] = useState<"w" | "b" | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);

  const noLimit = initialTime === null;

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const elapsed = (now - lastTickRef.current) / 1000;
    lastTickRef.current = now;

    setTimes((prev) => {
      const key = activeColor === "w" ? "whiteTime" : "blackTime";
      const newTime = Math.max(0, prev[key] - elapsed);
      if (newTime <= 0) {
        onTimeout(activeColor!);
        return { ...prev, [key]: 0 };
      }
      return { ...prev, [key]: newTime };
    });
  }, [activeColor, onTimeout]);

  useEffect(() => {
    if (isRunning && activeColor && !noLimit) {
      lastTickRef.current = Date.now();
      intervalRef.current = setInterval(tick, 100);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [isRunning, activeColor, tick, noLimit]);

  const switchTurn = useCallback(
    (to: "w" | "b") => {
      if (!noLimit && activeColor && activeColor !== to) {
        setTimes((prev) => {
          const key = activeColor === "w" ? "whiteTime" : "blackTime";
          return { ...prev, [key]: prev[key] + increment };
        });
      }
      setActiveColor(to);
      setIsRunning(true);
    },
    [activeColor, increment, noLimit],
  );

  const reset = useCallback(
    (time: number | null) => {
      stop();
      setTimes({
        whiteTime: time ?? Infinity,
        blackTime: time ?? Infinity,
      });
      setActiveColor(null);
    },
    [stop],
  );

  const pause = useCallback(() => {
    stop();
  }, [stop]);

  return {
    whiteTime: times.whiteTime,
    blackTime: times.blackTime,
    activeColor,
    switchTurn,
    reset,
    pause,
    noLimit,
  };
}
