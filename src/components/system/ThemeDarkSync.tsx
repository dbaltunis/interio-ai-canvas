import { useEffect } from "react";
import { useTheme } from "next-themes";

// Ensures Tailwind `dark:` variants are active for custom dark themes
export function ThemeDarkSync() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    const hasMidnight = root.classList.contains("midnight");
    const hasGraphite = root.classList.contains("apple-graphite");
    const wantsDark = hasMidnight || hasGraphite || theme === "dark" || resolvedTheme === "dark";

    if (wantsDark) {
      root.classList.add("dark");
      try {
        (root.style as any).colorScheme = "dark";
      } catch {}
    } else {
      root.classList.remove("dark");
      try {
        (root.style as any).colorScheme = "";
      } catch {}
    }
  }, [theme, resolvedTheme]);

  // Initial check on mount (covers SSR/initial render)
  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("midnight") || root.classList.contains("apple-graphite")) {
      root.classList.add("dark");
      try {
        (root.style as any).colorScheme = "dark";
      } catch {}
    }
  }, []);

  return null;
}
