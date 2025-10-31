import { useEffect } from "react";
import { useTheme } from "next-themes";

// Ensures Tailwind `dark:` variants are active for custom dark themes
export function ThemeDarkSync() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    const wantsDark = theme === "dark" || resolvedTheme === "dark";

    try {
      console.debug("[ThemeDarkSync] sync", { theme, resolvedTheme, wantsDark });
    } catch {}

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

    try {
      console.debug("[ThemeDarkSync] classList", Array.from(root.classList));
    } catch {}
  }, [theme, resolvedTheme]);

  // Initial check on mount (covers SSR/initial render)
  useEffect(() => {
    const root = document.documentElement;
    const hasCustomDark = false; // No custom dark themes anymore
    if (hasCustomDark) {
      root.classList.add("dark");
      try {
        (root.style as any).colorScheme = "dark";
      } catch {}
    }
    try {
      console.debug("[ThemeDarkSync] mount", { hasCustomDark, classList: Array.from(root.classList) });
    } catch {}
  }, []);

  return null;
}
