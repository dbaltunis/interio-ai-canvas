
# New User Guidance Implementation Plan

## Overview

This plan creates a modern, mobile-first onboarding experience for all new users. The system will provide:

1. **Welcome Modal** - First-time user greeting with quick orientation
2. **Persistent Help Buttons** - Pulsing "?" icons on every major page
3. **Missing Help Content** - Dashboard and Calendar section documentation
4. **Consistent Integration** - Replace custom help icons with unified SectionHelpButton

---

## Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| `WelcomeTour` | Exists but basic | 4-step dialog, queries `app_user_flags` |
| `SectionHelpButton` | Exists with pulse animation | Works well, needs rollout |
| `sectionHelp.ts` | Partial content | Missing: `dashboard`, `calendar` |
| Dashboard header | Has `ShowcaseLightbulb` | No SectionHelpButton |
| Jobs header | Has custom `HelpIcon` | Should use SectionHelpButton |
| Library header | No help | Needs SectionHelpButton |
| Calendar toolbar | No help | Needs SectionHelpButton |
| Clients | Already has SectionHelpButton | OK |
| Messages | Already has SectionHelpButton | OK |

---

## Implementation

### Phase 1: Enhanced Welcome Experience

**New Component: `src/components/onboarding/NewUserWelcome.tsx`**

A modern, mobile-optimized welcome modal that appears for first-time users:

- Friendly greeting with user's name
- 3 quick-start tips with icons:
  - "Every page has a ? button for help"
  - "Start by adding your first client"
  - "Explore Settings to customize your business"
- Large touch-friendly buttons
- Option to "Show me around" (triggers existing WelcomeTour)
- Queries `app_user_flags` for `has_seen_welcome` flag
- Responsive design: full-screen on mobile, centered modal on desktop

**Visual Design:**
- Soft gradient background
- Animated entrance (slide-up on mobile, scale on desktop)
- Primary action: "Get Started" button
- Secondary: "Take the Tour" link

---

### Phase 2: Missing Help Content

**Update: `src/config/sectionHelp.ts`**

Add documentation for Dashboard and Calendar:

```text
dashboard:
  title: "Dashboard"
  icon: LayoutDashboard
  briefDescription: "Your command center - see pending quotes, upcoming appointments, and key business metrics at a glance."
  keyPoints:
    - View today's appointments and tasks
    - Track pending quotes and their values
    - See client activity and recent updates
    - Quick actions to create jobs or add clients
  relatedSections: ["Jobs", "Clients", "Calendar"]

calendar:
  title: "Calendar & Scheduling"
  icon: Calendar
  briefDescription: "Manage appointments, installations, and team schedules. Sync with Google Calendar for seamless coordination."
  keyPoints:
    - Create appointments for consultations and installations
    - Drag and drop to reschedule events
    - Filter by team member, event type, or status
    - Set up booking templates for client self-scheduling
    - Sync bidirectionally with Google Calendar
  relatedSections: ["Jobs", "Team"]
```

---

### Phase 3: Consistent Help Button Rollout

**Update: `src/components/dashboard/WelcomeHeader.tsx`**

Add SectionHelpButton next to the ShowcaseLightbulb:

```tsx
import { SectionHelpButton } from "@/components/help/SectionHelpButton";

// In the actions area (line ~77):
<SectionHelpButton sectionId="dashboard" className="ml-1" />
```

**Update: `src/components/jobs/JobsPageHeader.tsx`**

Replace custom HelpIcon with SectionHelpButton:

```tsx
import { SectionHelpButton } from "@/components/help/SectionHelpButton";

// Replace lines 16-17:
<SectionHelpButton sectionId="jobs" />
```

**Update: `src/components/library/LibraryHeader.tsx`**

Add help button to the header section (inside the main header div, after the title):

```tsx
import { SectionHelpButton } from "@/components/help/SectionHelpButton";

// After line 55 (after the subtitle):
<div className="flex items-center gap-2">
  <SectionHelpButton sectionId="library" />
</div>
```

**Update: `src/components/calendar/CalendarSyncToolbar.tsx`**

Add help button in the right actions section:

```tsx
import { SectionHelpButton } from "@/components/help/SectionHelpButton";

// In the right section (around line 253):
<SectionHelpButton sectionId="calendar" />
```

---

### Phase 4: App Integration

**Update: `src/App.tsx` or main layout**

Add the NewUserWelcome component to render on first login:

```tsx
import { NewUserWelcome } from "@/components/onboarding/NewUserWelcome";

// Inside authenticated layout:
<NewUserWelcome />
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/onboarding/NewUserWelcome.tsx` | Welcome modal for first-time users |
| `src/components/onboarding/index.ts` | Export barrel file |

## Files to Modify

| File | Change |
|------|--------|
| `src/config/sectionHelp.ts` | Add `dashboard` and `calendar` content |
| `src/components/dashboard/WelcomeHeader.tsx` | Add SectionHelpButton |
| `src/components/jobs/JobsPageHeader.tsx` | Replace HelpIcon with SectionHelpButton |
| `src/components/library/LibraryHeader.tsx` | Add SectionHelpButton to header |
| `src/components/calendar/CalendarSyncToolbar.tsx` | Add SectionHelpButton |
| `src/App.tsx` or layout component | Mount NewUserWelcome |

---

## Mobile-First Design Principles

The NewUserWelcome component will follow these principles:

1. **Full-screen on mobile** - No small modals on phones
2. **Large touch targets** - Minimum 44px tap areas
3. **Bottom-anchored actions** - Primary buttons within thumb reach
4. **Reduced content** - Fewer words, more visual cues
5. **Swipe gestures** - Support swipe-to-dismiss on mobile
6. **Fast animations** - 200-300ms transitions, no jarring effects

---

## User Flow

```text
New User Signs Up
      ↓
Profile Created (via fixed trigger)
      ↓
First Login to Dashboard
      ↓
NewUserWelcome Modal Appears
  ├─→ "Get Started" → Closes modal, pulses appear on help buttons
  └─→ "Take the Tour" → Launches WelcomeTour (existing)
      ↓
User Navigates to Any Page
      ↓
Sees Pulsing ? Button (first visit to each section)
      ↓
Clicks ? → Help Sheet with Quick Guide
      ↓
Pulse Stops (marked as clicked)
```

---

## Testing Checklist

After implementation, verify:

- [ ] New account sees welcome modal on first login
- [ ] Welcome modal is full-screen on mobile
- [ ] "Take the Tour" triggers WelcomeTour
- [ ] Dashboard has pulsing ? button on first visit
- [ ] Jobs has pulsing ? button on first visit
- [ ] Library has pulsing ? button on first visit
- [ ] Calendar has pulsing ? button on first visit
- [ ] Clicking ? opens help sheet with content
- [ ] Pulse stops after clicking
- [ ] Existing Clients/Messages help buttons still work
