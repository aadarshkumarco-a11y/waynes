"use client";

import { useEffect, useState } from "react";

// Reads completed lesson ids for a user+course from localStorage (persisted
// alongside the Zustand store). Re-reads on window focus so the player UI
// stays in sync after markLessonComplete writes.
export function useCompletedLessons(userId: string | undefined, courseId: string) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!userId || !courseId) return;
    const key = `progress-${userId}-${courseId}`;
    const read = () => {
      try {
        const raw = localStorage.getItem(key);
        setCompleted(raw ? (JSON.parse(raw) as string[]) : []);
      } catch {
        setCompleted([]);
      }
    };
    read();
    const onFocus = () => {
      read();
      setVersion((v) => v + 1);
    };
    window.addEventListener("focus", onFocus);
    const id = setInterval(read, 1500);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(id);
    };
  }, [userId, courseId]);

  return { completed, version };
}
