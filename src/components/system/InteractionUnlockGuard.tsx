import { useEffect } from "react";

// Global safety net to ensure the app never remains unclickable after a dialog/overlay closes
export function InteractionUnlockGuard() {
  useEffect(() => {
    const root = () => document.getElementById("root");

    const hasOpenOverlays = () => {
      // Only consider true blocking overlays (dialogs, alert dialogs, drawers)
      // Do NOT consider dropdowns, selects, or popovers as blocking overlays
      return Boolean(
        document.querySelector(
          [
            '[role="dialog"][data-state="open"]:not([data-radix-select-content]):not([data-radix-dropdown-menu-content])',
            '[role="alertdialog"][data-state="open"]',
            '[data-vaul-drawer][data-state="open"]',
            '.vaul-drawer[data-state="open"]',
          ].join(', ')
        )
      );
    };

    const unlock = () => {
      try {
        if (hasOpenOverlays()) return; // do not unlock while something is open

        // Clear pointer-events locks (classes and inline styles)
        root()?.classList.remove("pointer-events-none");
        document.body.classList.remove("pointer-events-none");
        const r = root();
        if (r) {
          (r as HTMLElement).style.pointerEvents = "";
          (r as HTMLElement).style.removeProperty("pointer-events");
        }
        document.body.style.pointerEvents = "";
        document.body.style.removeProperty("pointer-events");
        document.body.style.overflow = "";
        document.body.style.removeProperty("overflow");

        // Explicitly clear inert/aria-hidden on html, root and body
        const html = document.documentElement;
        if (html.hasAttribute("inert")) html.removeAttribute("inert");
        if (html.getAttribute("aria-hidden") === "true") html.removeAttribute("aria-hidden");
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

        // Debug: log once per unlock execution
        console.info("[InteractionUnlockGuard] unlock executed");
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

    // Also attempt unlock on route changes (commenting out visibilitychange to prevent navigation issues)
    const onVisibility = () => {
      // Only unlock if document is visible and no overlays are open
      if (document.visibilityState === 'visible' && !hasOpenOverlays()) {
        unlock();
      }
    };
    const onPointerDown = () => unlock();
    // Temporarily disabled to prevent navigation issues: document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointerdown", onPointerDown, true);

    // Try an initial unlock just in case we mounted in a bad state
    unlock();

    return () => {
      observer.disconnect();
      // document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);

  return null;
}
