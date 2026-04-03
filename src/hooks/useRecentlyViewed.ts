import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "evnting_recently_viewed";
const MAX_ITEMS = 10;

export const useRecentlyViewed = () => {
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentIds));
    } catch {}
  }, [recentIds]);

  const addViewed = useCallback((id: string) => {
    setRecentIds((prev) => {
      const filtered = prev.filter((i) => i !== id);
      return [id, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const clearViewed = useCallback(() => {
    setRecentIds([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { recentIds, addViewed, clearViewed };
};
