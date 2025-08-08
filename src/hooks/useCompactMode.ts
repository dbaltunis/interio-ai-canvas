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

  // Keep all hook instances in sync across the app
  useEffect(() => {
    const storageKey = "ui.compactMode";

    const handleExternalChange = () => {
      try {
        const next = localStorage.getItem(storageKey) === "1";
        setCompact(next);
      } catch {}
    };

    const handleCustomEvent = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      if (typeof detail === "boolean") setCompact(detail);
    };

    window.addEventListener("storage", handleExternalChange);
    window.addEventListener("compact-mode-change", handleCustomEvent as EventListener);
    return () => {
      window.removeEventListener("storage", handleExternalChange);
      window.removeEventListener("compact-mode-change", handleCustomEvent as EventListener);
    };
  }, []);

  const toggleCompact = () => {
    setCompact((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ui.compactMode", next ? "1" : "0");
        window.dispatchEvent(new CustomEvent("compact-mode-change", { detail: next }));
      } catch {}
      return next;
    });
  };

  return { compact, toggleCompact };
}
