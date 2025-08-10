import { useEffect } from "react";

export function ThemeClassBridge() {
  useEffect(() => {
    const root = document.documentElement;

    const sync = () => {
      const hasMidnight = root.classList.contains("midnight");
      if (hasMidnight) {
        // Ensure Tailwind dark: variants apply when midnight theme is active
        root.classList.add("dark");
        // Improve native form controls appearance in dark contexts
        try {
          (root.style as any).colorScheme = "dark";
        } catch {}
      } else {
        // Let next-themes manage removing/adding classes for other themes
        if (!root.classList.contains("dark")) {
          try {
            (root.style as any).colorScheme = "";
          } catch {}
        }
      }
    };

    // Initial sync
    sync();

    // Observe class changes from next-themes
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "class") {
          sync();
        }
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return null;
}
