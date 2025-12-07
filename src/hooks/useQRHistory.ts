import { useState, useEffect, useCallback } from "react";

export interface QRHistoryItem {
  id: string;
  timestamp: number;
  qrType: string;
  value: string;
  preview: string;
  config: {
    fgColor: string;
    bgColor: string;
    dotStyle: string;
    cornerStyle: string;
    frameType: string;
    frameText: string;
    frameColor: string;
  };
  isFavorite: boolean;
}

const STORAGE_KEY = "qr-history";
const MAX_HISTORY = 50;

export const useQRHistory = () => {
  const [history, setHistory] = useState<QRHistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const saveToStorage = useCallback((items: QRHistoryItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const addToHistory = useCallback((item: Omit<QRHistoryItem, "id" | "timestamp" | "isFavorite">) => {
    const newItem: QRHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      isFavorite: false,
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const toggleFavorite = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    history,
    addToHistory,
    toggleFavorite,
    removeFromHistory,
    clearHistory,
  };
};
