import { useEffect } from "react";

// Global safety net to ensure the app never remains unclickable after a dialog/overlay closes
export function InteractionUnlockGuard() {
  useEffect(() => {
    const root = () => document.getElementById("root");

    const hasOpenOverlays = () => {
      // Radix portals/dialogs, alert-dialogs, sheets/drawers (common patterns)
      return Boolean(
        document.querySelector(
          '[data-radix-portal] [data-state="open"], [role="dialog"][data-state="open"], [data-vaul-drawer][data-state="open"], .vaul-drawer[data-state="open"]'
        )
      );
    };

    const unlock = () => {
      try {
        if (hasOpenOverlays()) return; // do not unlock while something is open

        // Clear pointer-events locks
        root()?.classList.remove("pointer-events-none");
        document.body.classList.remove("pointer-events-none");

        // Explicitly clear inert/aria-hidden on root and body
        const r = root();
        if (r?.hasAttribute("inert")) r.removeAttribute("inert");
        if (r?.getAttribute("aria-hidden") === "true") r.removeAttribute("aria-hidden");
        if (document.body.hasAttribute("inert")) document.body.removeAttribute("inert");
        if (document.body.getAttribute("aria-hidden") === "true") document.body.removeAttribute("aria-hidden");

        // Sweep the whole app and remove stray blockers
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        const toCheck: Element[] = [];
        while (walker.nextNode()) toCheck.push(walker.currentNode as Element);
        for (const el of toCheck) {
          if (el.hasAttribute("inert")) el.removeAttribute("inert");
          if (el.getAttribute("aria-hidden") === "true") el.removeAttribute("aria-hidden");
        }
      } catch {}
    };

    // Observe DOM changes to auto-unlock when overlays are gone
    const observer = new MutationObserver(() => {
      unlock();
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-hidden", "inert", "class", "data-state"],
    });

    // Also attempt unlock on visibility and route changes
    const onVisibility = () => unlock();
    const onPointerDown = () => unlock();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointerdown", onPointerDown, true);

    // Try an initial unlock just in case we mounted in a bad state
    unlock();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);

  return null;
}
