

# Apple-Style Update Announcement Modal

## Overview

Replace the current top-of-page banner notification with a beautiful, centered Apple-style modal that automatically appears for users who haven't seen the new version. This will provide a premium "what's new" experience similar to Apple's software update announcements.

---

## UI/UX Preview (What It Will Look Like)

```text
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│           ╔═══════════════════════════════════════════╗             │
│           ║                                           ║             │
│           ║      ✨  What's New in v2.4.2             ║             │
│           ║         January 29, 2026                  ║             │
│           ║                                           ║             │
│           ║  ─────────────────────────────────────    ║             │
│           ║                                           ║             │
│           ║  ★ HIGHLIGHTS                             ║             │
│           ║                                           ║             │
│           ║  • 4x Performance Improvement             ║             │
│           ║    Database compute upgraded for          ║             │
│           ║    faster loading across all features     ║             │
│           ║                                           ║             │
│           ║  • Team Access Control (Australasia)      ║             │
│           ║    Invite users & limit project access    ║             │
│           ║                                           ║             │
│           ║  ─────────────────────────────────────    ║             │
│           ║                                           ║             │
│           ║  ✦ NEW FEATURES                           ║             │
│           ║                                           ║             │
│           ║  • Multi-Team Assignment                  ║             │
│           ║    Delegate projects to multiple team     ║             │
│           ║    members with granular access control   ║             │
│           ║                                           ║             │
│           ║  • Project Creation Fix                   ║             │
│           ║    Resolved "Failed to create" error      ║             │
│           ║    for all user types                     ║             │
│           ║                                           ║             │
│           ║  ─────────────────────────────────────    ║             │
│           ║                                           ║             │
│           ║  ✦ IMPROVEMENTS                           ║             │
│           ║                                           ║             │
│           ║  • Document numbering fixed               ║             │
│           ║  • Markup settings preserve 0% values     ║             │
│           ║  • Work order sharing RLS policies        ║             │
│           ║  • Notification trigger stability         ║             │
│           ║                                           ║             │
│           ║  ─────────────────────────────────────    ║             │
│           ║                                           ║             │
│           ║         ┌────────────────────┐            ║             │
│           ║         │  ✓ Got it, thanks  │            ║             │
│           ║         └────────────────────┘            ║             │
│           ║                                           ║             │
│           ╚═══════════════════════════════════════════╝             │
│                                                                     │
│                    (blurred backdrop overlay)                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Update Version Constants

**File:** `src/constants/version.ts`

```typescript
export const APP_VERSION = "2.4.2";
export const APP_BUILD_DATE = "2026-01-29";
export const APP_BUILD_TIMESTAMP = "2026-01-29T21:00:00Z";
```

This version bump will:
- Reset the `interioapp_last_seen_version` check for ALL users
- Trigger the new modal to appear automatically

---

### 2. Create Apple-Style Announcement Modal

**New File:** `src/components/version/UpdateAnnouncementModal.tsx`

**Design Elements:**
- **Framer Motion animations** - Smooth slide-up + fade-in entrance
- **Glassmorphism overlay** - Premium blurred backdrop
- **Apple-inspired typography** - Clean, centered headers
- **Gradient accents** - Subtle primary color highlights
- **Emoji icons** - Visual categorization (★ Highlights, ✦ Features)
- **Single CTA button** - "Got it, thanks" dismissal

**Animation Specs:**
```typescript
// Modal entrance
initial: { opacity: 0, scale: 0.95, y: 20 }
animate: { opacity: 1, scale: 1, y: 0 }
exit: { opacity: 0, scale: 0.95, y: -10 }
transition: { type: "spring", damping: 25, stiffness: 300 }

// Overlay
initial: { opacity: 0 }
animate: { opacity: 1 }
exit: { opacity: 0 }
```

**Auto-show Logic:**
- Checks `localStorage` for `interioapp_last_seen_version`
- Shows modal if version differs from `APP_VERSION`
- Marks as seen when user clicks "Got it"

---

### 3. Replace UpdateBanner in App.tsx

**File:** `src/App.tsx`

Replace:
```typescript
import { UpdateBanner } from "./components/version/UpdateBanner";
// ...
<UpdateBanner />
```

With:
```typescript
import { UpdateAnnouncementModal } from "./components/version/UpdateAnnouncementModal";
// ...
<UpdateAnnouncementModal />
```

---

### 4. Update Database Release Notes

**Migration:** Update `app_versions` table with v2.4.2 content

```sql
-- Set previous version as not current
UPDATE app_versions SET is_current = false WHERE is_current = true;

-- Insert new version
INSERT INTO app_versions (
  version,
  version_type,
  release_date,
  is_current,
  is_published,
  release_notes
) VALUES (
  'v2.4.2',
  'minor',
  '2026-01-29',
  true,
  true,
  '{
    "summary": "Major performance upgrade and team collaboration features for all users.",
    "highlights": [
      "4x Performance Improvement - Database compute upgraded for faster loading",
      "Team Access Control (Australasia) - Invite users and limit project access",
      "Project Creation Fixed - No more \"Failed to create\" errors"
    ],
    "newFeatures": [
      {
        "title": "Multi-Team Assignment",
        "description": "Delegate projects to multiple team members with granular access control. Owners and staff avatars displayed inline."
      },
      {
        "title": "Limit Access Feature",
        "description": "Control which team members can see specific projects. Full access vs assignment-based visibility."
      }
    ],
    "improvements": [
      "Document numbering sequences reset and stabilized (JOB-0085+)",
      "Markup settings now preserve explicit 0% values for Australasia market",
      "Work order sharing RLS policies fixed for authenticated users",
      "Notification triggers use correct column references",
      "Client name resolution fixed in team assignment flow"
    ],
    "security": [
      "RLS policy consolidation for notifications table",
      "SECURITY DEFINER functions properly bypass user checks"
    ]
  }'::jsonb
);
```

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `src/constants/version.ts` | Edit | Bump to v2.4.2 |
| `src/components/version/UpdateAnnouncementModal.tsx` | Create | New Apple-style modal |
| `src/App.tsx` | Edit | Replace UpdateBanner with new modal |
| `supabase/migrations/[new].sql` | Create | Add v2.4.2 release notes |

---

## Mobile Responsive Design

The modal will be fully responsive:
- **Desktop:** 500px max-width, centered
- **Tablet:** 90% width, larger touch targets
- **Mobile:** Full width with 16px margins, scrollable content

---

## Key Differences from Current Banner

| Current (Banner) | New (Modal) |
|------------------|-------------|
| Top-of-page strip | Centered modal overlay |
| Easy to miss | Impossible to miss |
| Minimal info | Full release notes |
| Refresh button | "Got it" acknowledgment |
| Plain styling | Apple-inspired premium UI |

