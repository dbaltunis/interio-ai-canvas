import { useEffect, useState } from "react";

// Compact mode hook with persistence and html class for global styling hooks
export function useCompactMode() {
  const [compact, setCompact] = useState<boolean>(() => {
    try {
      return localStorage.getItem("ui.compactMode") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const cls = "compact";
    const root = document.documentElement;
    if (compact) {
      root.classList.add(cls);
    } else {
      root.classList.remove(cls);
    }
  }, [compact]);

  const toggleCompact = () => {
    setCompact((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ui.compactMode", next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  return { compact, toggleCompact };
}
