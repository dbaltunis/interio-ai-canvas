

# Enhanced Welcome Video Tutorial with Calendar Scene

## Overview

Extend the existing `WelcomeVideoPlayer` system to include:
1. **New "Welcome" chapter** - A warm greeting scene BEFORE the current Intro
2. **New "Calendar" chapter** - Showcasing Google Calendar integration, booking templates, and client booking experience

Both scenes will use the exact same animation framework (`framer-motion`), timing utilities (`inPhase`, `phaseProgress`, `typingProgress`), and visual style as the existing 6 scenes.

---

## Current Structure

The welcome video system consists of:
- `ShowcaseLightbulb.tsx` - Trigger button + chapter/step definitions
- `WelcomeVideoPlayer.tsx` - Cinematic player with progress, navigation
- `WelcomeVideoSteps.tsx` - 6 scene components (715 lines)
- `demoAnimations.ts` - Animation utilities

Current flow: Intro → Dashboard → Theme → Jobs → Project → Closing

**New flow**: Welcome → Intro → Dashboard → Theme → Jobs → Project → Calendar → Closing

---

## Technical Implementation

### Phase 1: New "Welcome" Scene

**New Component: `Scene0Welcome`**

A warm, personalized greeting before showing the product:
- Large animated "👋" wave emoji
- "Welcome to InterioApp!" headline with staggered letter animation
- Subtitle: "Let's show you around your new platform"
- Soft pulsing background gradient
- Duration: 4 seconds (quick and welcoming)

Animation phases:
- 0.0-0.3: Wave emoji animates in with bounce
- 0.2-0.6: Headline types in letter by letter
- 0.4-0.8: Subtitle fades up
- 0.8-1.0: Gentle transition glow

---

### Phase 2: New "Calendar" Scene

**New Component: `Scene7Calendar`**

A multi-phase scene demonstrating the complete calendar workflow:

**Sub-phases (total duration: 12 seconds):**

1. **Phase 0.0-0.25: Calendar View Overview**
   - Shows the main calendar interface (week view)
   - Events visible (like the screenshot provided)
   - Highlights "Google Sync" toggle in top-right (ON state)
   - Visual indicator: "Two-way sync with Google Calendar"

2. **Phase 0.25-0.50: Booking Template Setup**
   - Dropdown menu appears: "New Booking Template"
   - Shows template creation: "Installation Appointment"
   - Duration selector: "30 minutes"
   - Focus ring on "Create Template" button

3. **Phase 0.50-0.80: Client Booking Experience**
   - Transition to the public booking page (as per screenshot 3)
   - Split panel: Company branding on left, calendar picker on right
   - Date selection animation (day lights up)
   - Time slots appear: 09:00, 10:30, 12:00, 13:30
   - Client selects a time (focus ring → click)
   - Form fields: Name, Email, Phone
   - "Confirm Booking" button pressed

4. **Phase 0.80-1.0: Success Confirmation**
   - Confetti particles (small, celebratory)
   - "Booking Confirmed!" message
   - Shows: Event added to calendar automatically
   - Badge: "Synced to Google Calendar ✓"

**Visual Design:**
- Use the same card/border/muted styles as other scenes
- Show the actual InterioApp logo
- Use realistic data: "Holly - Blind Installation, 10:30"
- Match the Calendly-inspired split-panel layout from screenshots

---

### Phase 3: Update Chapter/Step Definitions

**Modify: `src/components/showcase/ShowcaseLightbulb.tsx`**

```text
Update chapters array:
1. Add "welcome" chapter at position 0
2. Add "calendar" chapter after "project"

Update steps array:
1. Add Scene0Welcome as first step (before Intro)
2. Add Scene7Calendar after Project scene
3. Renumber: Now 8 steps total
```

New chapters array:
```
welcome → intro → dashboard → theme → jobs → project → calendar → closing
```

New steps:
```
1. Scene0Welcome (4s, chapter: welcome)
2. Scene1IntroLogo (5s, chapter: intro)
3. Scene2Dashboard (8s, chapter: dashboard)
4. Scene3ThemeToggle (6s, chapter: theme)
5. Scene4JobsNotes (8s, chapter: jobs)
6. Scene5ProjectDeepDive (15s, chapter: project)
7. Scene7Calendar (12s, chapter: calendar)  ← NEW
8. Scene6Closing (5s, chapter: closing)
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/showcase/ShowcaseLightbulb.tsx` | Add 2 new chapters, 2 new steps, import new scene components |
| `src/components/help/tutorial-steps/WelcomeVideoSteps.tsx` | Add `Scene0Welcome` and `Scene7Calendar` components (~200 new lines) |

---

## Scene0Welcome Implementation Details

```text
Component structure:
- Full-height centered flex container
- Animated background gradient (subtle pulse)
- Wave emoji with spring bounce animation
- "Welcome to InterioApp!" with gradient text on key words
- Subtitle with fade-up animation
- Optional: small "Press → to continue" hint at bottom
```

Animation sequence:
```text
Phase    Element
0.0      Background gradient starts pulsing
0.1      Wave emoji scales in with bounce
0.25     "Welcome to" text appears
0.35     "InterioApp!" appears with primary color
0.5      Subtitle fades up
0.8      Gentle glow intensifies (transition hint)
```

---

## Scene7Calendar Implementation Details

```text
Component structure:
1. Main container with rounded corners and border
2. Header bar with InterioApp logo and "Calendar" nav highlighted
3. Content area that transforms between:
   - Full calendar week view
   - Template creation dialog
   - Public booking split-panel view
   - Success confirmation overlay
```

Animation sequence:
```text
Phase     Content
0.00-0.25 Calendar week view with events + Google Sync badge
0.25-0.40 "New Booking Template" dropdown opens
0.40-0.50 Template form appears, focus ring on create button
0.50-0.55 Transition to public booking page (split layout)
0.55-0.65 Date picker: day gets selected (ring → fill)
0.65-0.72 Time slots animate in, one gets selected
0.72-0.80 Client form fills: "Sarah Johnson", email types
0.80-0.85 "Confirm" button clicks
0.85-1.00 Success overlay with confetti + Google sync badge
```

---

## Visual Elements to Include

From the provided screenshots:

**Calendar View (Screenshot 2):**
- Week view with dates (Sun-Sat)
- Green event cards: "testing new appointment 10:30"
- Blue cards: "Test d 09:00-09:30"
- Right sidebar: "New Booking Template", "Manage Templates", "View Bookings", "Analytics"
- "Google Sync" toggle (ON)

**Public Booking (Screenshot 3):**
- Left panel: Dark slate gradient, logo (80px), company name, phone
- Template name: "testing new appointment"
- Duration: "30 minutes"
- Footer: "Secure booking powered by InterioApp"
- Right panel: Date picker calendar, time slots grid
- Clean white background

---

## Auto-Open for New Users

The `ShowcaseLightbulb` already checks `localStorage` for `showcase_last_seen_version`. When the version changes, it shows the glow indicator.

**To auto-open for first-time users:**
- Check if `showcase_last_seen_version` is null/empty on mount
- If null → auto-open the dialog (`setIsOpen(true)`)
- This provides the welcome experience on first login

This is a simple addition: ~3 lines in the existing `useEffect` in `ShowcaseLightbulb.tsx`.

---

## Total New Code

| Component | Lines |
|-----------|-------|
| Scene0Welcome | ~50 lines |
| Scene7Calendar | ~200 lines |
| ShowcaseLightbulb changes | ~30 lines |
| **Total** | ~280 new lines |

All new code follows the exact patterns already established in `WelcomeVideoSteps.tsx`.

