

# Simple Update Notification Banner

## What You're Getting

A simple, non-intrusive banner at the top of the screen that:
1. Appears when you deploy a new version
2. Shows a friendly message recommending to refresh
3. Has a "Refresh Now" button
4. Can be dismissed

---

## Visual Design Preview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  🎉 New update available (v2.4.1) • Please refresh to get the latest       │
│                                                      [Refresh Now]  [×]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Colors & Styling:**
- **Background**: Soft blue gradient (`bg-gradient-to-r from-blue-500/10 to-primary/10`)
- **Border**: Subtle blue border (`border-blue-200 dark:border-blue-800`)
- **Icon**: Sparkles emoji or Lucide `Sparkles` icon
- **Text**: Clean, readable (`text-foreground`)
- **Refresh Button**: Primary color, pill-shaped
- **Close Button**: Subtle X icon on the right

**Mobile Responsive**: Stacks vertically on small screens

---

## How It Works

1. **On app load**: Check `localStorage` for the last seen version
2. **Compare**: If current version > stored version → show banner
3. **On dismiss**: Store current version in `localStorage`, hide banner
4. **On refresh click**: Store version + reload the page

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/version/UpdateBanner.tsx` | **Create** | The notification banner component |
| `src/App.tsx` | **Modify** | Add banner after AuthProvider (line ~177) |
| `src/constants/version.ts` | Already updated | Version is 2.4.1 |

---

## Component Code

**UpdateBanner.tsx** - Simple, clean banner:

```tsx
import { useState, useEffect } from "react";
import { X, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/constants/version";

const LAST_SEEN_VERSION_KEY = "interioapp_last_seen_version";

export const UpdateBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem(LAST_SEEN_VERSION_KEY);
    
    // Show banner if no version stored or version is different
    if (!lastSeenVersion || lastSeenVersion !== APP_VERSION) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(LAST_SEEN_VERSION_KEY, APP_VERSION);
    setIsVisible(false);
  };

  const handleRefresh = () => {
    localStorage.setItem(LAST_SEEN_VERSION_KEY, APP_VERSION);
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] animate-fade-in">
      <div className="bg-gradient-to-r from-blue-500/10 via-primary/5 to-blue-500/10 
                      border-b border-blue-200 dark:border-blue-800/50 
                      px-4 py-2.5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Message */}
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-foreground">
              <span className="font-medium">New update available</span>
              <span className="text-muted-foreground ml-1">(v{APP_VERSION})</span>
              <span className="hidden sm:inline text-muted-foreground"> • Save your work and refresh for the latest features</span>
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              size="sm" 
              onClick={handleRefresh}
              className="h-7 px-3 text-xs font-medium rounded-full"
            >
              <RefreshCw className="h-3 w-3 mr-1.5" />
              Refresh Now
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground 
                         hover:bg-foreground/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## App.tsx Integration

Add the banner inside the BrowserRouter, right after NavObserver:

```tsx
// Line ~176 in App.tsx
<BrowserRouter>
  <NavObserver />
  <UpdateBanner />  {/* ← Add here */}
  <AuthProvider>
```

**Note**: Placed before AuthProvider so it shows even during login/logout.

---

## After Implementation

Once I implement this:
1. The banner will automatically appear in your preview
2. You'll see exactly how it looks
3. You can click "Refresh Now" or dismiss it
4. It will remember your choice via localStorage

---

## Summary

| Item | Status |
|------|--------|
| Version constant | ✅ Already 2.4.1 |
| Banner component | 🔧 Will create |
| App integration | 🔧 Will add import + component |
| Immediate visibility | ✅ Will show in preview |

