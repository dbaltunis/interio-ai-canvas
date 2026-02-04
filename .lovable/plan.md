

# Show Welcome Video to Every New User - Database-Backed Approach

## Overview

Currently, the welcome video tutorial uses `localStorage` to track if a user has seen it. This has two problems:
1. **Not persistent across devices** - A user who signs up on mobile won't see the video when they log in on desktop
2. **Can be cleared** - If browser storage is cleared, the video shows again

The solution is to use the existing `app_user_flags` database table (already used by `WelcomeTour`) to track this at the account level, ensuring **every single new user** sees the video exactly once, on any device.

---

## Current State

| Component | Storage Method | Issue |
|-----------|---------------|-------|
| `ShowcaseLightbulb.tsx` | `localStorage` (`showcase_last_seen_version`) | Per-browser only |
| `WelcomeTour.tsx` | `app_user_flags` table (`has_seen_product_tour`) | Already database-backed |

---

## Solution

### 1. Create a Database Flag for the Welcome Video

Use the existing `app_user_flags` table with a new flag: `has_seen_welcome_video`

This table already exists and works well for `WelcomeTour` - we simply add another flag.

---

### 2. Create a Global Auto-Trigger Component

Create a new component `WelcomeVideoAutoTrigger.tsx` that:
- Runs for all authenticated users
- Checks if `has_seen_welcome_video` flag exists and is `true`
- If not, automatically opens the video player
- Once opened, marks the flag as `true` in the database

This component will be mounted in `App.tsx` (inside the authenticated route) so it runs regardless of which page the user lands on.

---

### 3. Keep ShowcaseLightbulb as Manual Re-watch Button

The lightbulb button stays in the dashboard header for users who want to re-watch the video manually. Remove only the auto-open logic from it.

---

### 4. Disable WelcomeTour Auto-Open (Optional)

Since the cinematic video is more comprehensive, we can disable the auto-open of the older 4-step `WelcomeTour` to avoid overwhelming new users with two tours. Users can still access it from Tips & Guidance if needed.

---

## Implementation Details

### A. New Component: `WelcomeVideoAutoTrigger.tsx`

```tsx
// src/components/showcase/WelcomeVideoAutoTrigger.tsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { WelcomeVideoPlayer } from "./WelcomeVideoPlayer";
import { welcomeSteps, welcomeChapters } from "./ShowcaseLightbulb";

export const WelcomeVideoAutoTrigger = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Check database flag on mount
  useEffect(() => {
    if (!user || hasChecked) return;

    const checkWelcomeVideoStatus = async () => {
      const { data, error } = await supabase
        .from('app_user_flags')
        .select('enabled')
        .eq('user_id', user.id)
        .eq('flag', 'has_seen_welcome_video')
        .maybeSingle();

      // If no flag or flag is false, show the video
      if (error || !data || !data.enabled) {
        setIsOpen(true);
        // Mark as seen immediately
        await markAsSeen();
      }
      setHasChecked(true);
    };

    checkWelcomeVideoStatus();
  }, [user, hasChecked]);

  const markAsSeen = useCallback(async () => {
    if (!user) return;
    
    await supabase.from('app_user_flags').upsert({
      user_id: user.id,
      flag: 'has_seen_welcome_video',
      enabled: true,
    }, { onConflict: 'user_id,flag' });
  }, [user]);

  // Don't render anything until we've checked
  if (!hasChecked || !user) return null;

  return (
    <WelcomeVideoPlayer
      open={isOpen}
      onOpenChange={setIsOpen}
      steps={welcomeSteps}
      chapters={welcomeChapters}
    />
  );
};
```

---

### B. Export Steps from ShowcaseLightbulb

Add exports at the end of `ShowcaseLightbulb.tsx`:

```tsx
// Export for use by WelcomeVideoAutoTrigger
export { welcomeSteps, welcomeChapters };
```

Also remove the auto-open localStorage logic (lines 137-141):

```tsx
// REMOVE this block:
// if (!lastSeen) {
//   setIsOpen(true);
//   localStorage.setItem(STORAGE_KEY, APP_VERSION);
//   setHasNewContent(false);
// }
```

Keep the version check for the "glow" effect on new content.

---

### C. Mount in App.tsx

Add the auto-trigger inside the authenticated routes:

```tsx
import { WelcomeVideoAutoTrigger } from "@/components/showcase/WelcomeVideoAutoTrigger";

// Inside the authenticated/protected section of routes:
<WelcomeVideoAutoTrigger />
```

---

### D. Disable WelcomeTour Auto-Open (Optional)

In `WelcomeTour.tsx`, comment out the auto-open logic (line 78):

```tsx
// BEFORE:
setTimeout(() => setIsOpen(true), 1500);

// AFTER:
// Auto-open disabled - cinematic welcome video handles first-time users
// setTimeout(() => setIsOpen(true), 1500);
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/showcase/WelcomeVideoAutoTrigger.tsx` | **CREATE** - Global auto-trigger component |
| `src/components/showcase/ShowcaseLightbulb.tsx` | **MODIFY** - Export steps, remove auto-open logic |
| `src/App.tsx` | **MODIFY** - Mount `WelcomeVideoAutoTrigger` |
| `src/components/teaching/WelcomeTour.tsx` | **MODIFY** - Disable auto-open (optional) |

---

## User Experience Flow

```text
New User Signs Up
       ↓
Redirected to Dashboard (or any page)
       ↓
WelcomeVideoAutoTrigger checks database
       ↓
No "has_seen_welcome_video" flag found
       ↓
┌─────────────────────────────────────┐
│  🎬 Welcome Video Opens!            │
│                                     │
│  Scene 0: "Welcome to InterioApp!"  │
│  Scene 1-8: Full product showcase   │
│  Scene 9: Help system & support     │
└─────────────────────────────────────┘
       ↓
Flag saved to database: enabled = true
       ↓
User closes video → Never auto-opens again
       ↓
Can re-watch anytime via 💡 lightbulb button
```

---

## Why This Approach Works

| Feature | localStorage (Old) | Database (New) |
|---------|-------------------|----------------|
| Persists across devices | No | Yes |
| Survives browser clear | No | Yes |
| Works on first login | Yes | Yes |
| Per-account tracking | No | Yes |
| Already proven | - | Yes (WelcomeTour uses it) |

This ensures that every single new user who creates an account will see the welcome video exactly once, regardless of which device or browser they use.

