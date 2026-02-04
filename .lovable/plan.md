
# Enhance Project Scene with Window Creation Workflow

## Overview

Enhance `Scene5ProjectDeepDive` to showcase the complete quoting workflow:
1. **Add Window button** - Click to open the window design popup
2. **Treatment Selection** - Select "Curtains" from treatment grid
3. **Fabric/Library Selection** - Browse and select fabric with pricing
4. **Measurements** - Fill in dimensions, curtain type, heading, hardware
5. **Save & Complete** - Window added to project quote

This demonstrates the core value proposition: how users create professional quotes with window treatments.

---

## Current Scene5 Structure

| Phase | Current Content | Duration |
|-------|-----------------|----------|
| 0.00-0.10 | Client tab (overview) | 10% |
| 0.10-0.20 | Project tab (rooms) | 10% |
| 0.20-0.65 | Quote tab (payment, email) | 45% |
| 0.65-0.80 | Workroom tab | 15% |
| 0.80-1.00 | Installation + share | 20% |

## Proposed Enhanced Structure

To fit the window creation workflow, I'll restructure the phases:

| Phase | Content | Duration |
|-------|---------|----------|
| 0.00-0.08 | Client tab (overview) | 8% |
| 0.08-0.18 | Project tab (rooms + Add Window button focused) | 10% |
| **0.18-0.52** | **NEW: Window Creation Popup** | **34%** |
| 0.52-0.70 | Quote tab (shows completed quote with payment) | 18% |
| 0.70-0.82 | Workroom tab (scrolling work order) | 12% |
| 0.82-1.00 | Installation + share | 18% |

**Scene duration remains 15 seconds** (15000ms)

---

## NEW: Window Creation Popup Flow (34% of scene)

Based on the provided screenshots, this popup has a step-by-step flow:

```text
Window Selected → Treatment → Library → Measurements → Save
```

### Sub-phases within Window Creation (0.18-0.52):

| Phase | Action | Visual |
|-------|--------|--------|
| 0.18-0.20 | Click "Add Window" button | Focus ring → click |
| 0.20-0.24 | Popup opens, Step 1 active | Shows stepper: Window Selected ✓ → Treatment → Library → Measurements |
| 0.24-0.30 | Treatment grid appears | Show CURTAINS, BLINDS, PANEL_GLIDE categories |
| 0.30-0.33 | Click "Curtains" card | Focus ring on Curtains → selected |
| 0.33-0.36 | Step 2 completes, move to Library | Stepper updates: ✓ Treatment → Library active |
| 0.36-0.40 | Fabric grid appears | Show 4 fabric cards with prices (ADARA, etc.) |
| 0.40-0.43 | Click fabric card | Select "ADARA - £26.50/m" |
| 0.43-0.46 | Step 3 completes, move to Measurements | Stepper updates: ✓ Library → Measurements active |
| 0.46-0.50 | Measurement worksheet appears | Rail Width, Curtain Drop, Heading Type, Hardware |
| 0.50-0.51 | Dimensions type in | "200" → "cm", "240" → "cm" |
| 0.51-0.52 | Click Save | Button animates → popup closes |

---

## Visual Elements from Screenshots

### Treatment Selection Step (Screenshot 1)
- Header: Design: Window 1 | Treatment: Untitled | Description: Optional...
- Stepper: ✓ Window Selected → Treatment (blue) → Library (orange) → Measurements (gray)
- Search bar: "Search treatments: roller blinds, curtains, shutters..."
- Treatment categories: CURTAINS, PANEL_GLIDE
- Treatment cards: Curtain, Curtains, Drapery blackout (with images)

### Library/Fabric Selection (Screenshot 2)
- Stepper: ✓ Window Selected → ✓ Treatment → Library (blue) → Measurements (pink)
- Type filters: Blockout, Light Filter, Wide (300cm+)
- Fabric cards grid: 4 columns
  - Card structure: Star icon, fabric image/placeholder, Name, Size, "For: curtains", Price, "Out" badge

### Measurements Worksheet (Screenshot 3)
- Title: "Window Measurement Worksheet"
- Left: Curtain diagram with drag handles
- Right form:
  - Rail Width: input with cm unit
  - Curtain Drop: input with cm unit
  - Curtain Type: Radio buttons (Pair/Single)
  - Heading Type: Dropdown (S-Fold 100% Bla... 2.2x)
  - Hardware: Dropdown selector

---

## Technical Implementation

### 1. Add new phase variables in Scene5ProjectDeepDive

```tsx
// Window Creation Popup phases
const showAddWindowButton = inPhase(phase, 0.12, 0.20);
const focusAddWindow = inPhase(phase, 0.16, 0.18);
const showWindowPopup = inPhase(phase, 0.18, 0.52);
const showTreatmentStep = inPhase(phase, 0.20, 0.36);
const selectCurtains = inPhase(phase, 0.30, 0.33);
const showLibraryStep = inPhase(phase, 0.36, 0.46);
const selectFabric = inPhase(phase, 0.40, 0.43);
const showMeasurementsStep = inPhase(phase, 0.46, 0.52);
const measurementsTyping = inPhase(phase, 0.48, 0.51);
const widthValue = typingProgress(phase, 0.48, 0.495, "200");
const dropValue = typingProgress(phase, 0.495, 0.51, "240");
const saveClick = inPhase(phase, 0.51, 0.52);
```

### 2. Add Window Popup Component Structure

```text
<AnimatePresence>
  {showWindowPopup && (
    <motion.div className="absolute inset-0 bg-black/40 z-50">
      <motion.div className="bg-background rounded-xl border shadow-xl">
        
        {/* Header: Design | Treatment | Description */}
        <div className="header-bar">...</div>
        
        {/* Stepper: Window Selected → Treatment → Library → Measurements */}
        <div className="stepper">...</div>
        
        {/* Step Content */}
        <AnimatePresence mode="wait">
          {showTreatmentStep && <TreatmentGrid />}
          {showLibraryStep && <FabricGrid />}
          {showMeasurementsStep && <MeasurementWorksheet />}
        </AnimatePresence>
        
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### 3. Stepper Visual Design

```text
┌─────────────────────────────────────────────────────────────────────┐
│  ✓ Window Selected  →  Treatment  →  Library  →  Measurements      │
│       (green)          (blue/active)   (orange)     (gray)          │
└─────────────────────────────────────────────────────────────────────┘
```

State transitions:
- Phase 0.20-0.36: Treatment active (blue)
- Phase 0.36-0.46: Treatment ✓, Library active (blue)
- Phase 0.46-0.52: Library ✓, Measurements active (blue)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/help/tutorial-steps/WelcomeVideoSteps.tsx` | Major update to Scene5ProjectDeepDive (~150-200 new lines) |

---

## Detailed Animation Sequence

```text
Time    Phase   Action
0.00    0.00    Client tab visible
1.2s    0.08    Transition to Project tab
1.8s    0.12    Show rooms list
2.4s    0.16    Focus ring on "Add Window" button  
2.7s    0.18    Click → Window popup opens
3.0s    0.20    Treatment step active, grid animates in
4.5s    0.30    Focus ring on "Curtains" card
4.95s   0.33    Click → selected state
5.4s    0.36    Transition to Library step
6.0s    0.40    Focus ring on ADARA fabric
6.45s   0.43    Click → selected
6.9s    0.46    Transition to Measurements step
7.2s    0.48    Rail Width typing: "200"
7.65s   0.51    Curtain Drop typing: "240"
7.8s    0.52    Save clicked → popup closes
7.8s    0.52    Quote tab visible with new line item
```

---

## Updated Scene5 Step Labels

The scene description in ShowcaseLightbulb.tsx remains:
```tsx
title: "Project Details"
description: "Quote, Payment, Work Orders, Installation & Team Sharing"
```

But the actual flow now demonstrates the complete workflow from adding a window treatment through to sharing with the team.

---

## New Visual Components Needed

### 1. Treatment Cards Grid
- 3 cards: Curtain, Curtains, Drapery blackout
- Image placeholders with subtle curtain illustration
- Selection ring animation

### 2. Fabric Cards Grid  
- 4 cards in 2x2 grid
- Star (favorite) icon in top-left
- Fabric name, width, price
- "For: curtains" tag
- "Out" stock badge (optional)

### 3. Measurement Worksheet
- Simple curtain diagram (rectangle with curtain shapes)
- Rail Width + Curtain Drop inputs
- Pair/Single radio buttons
- Heading Type dropdown

---

## Code Structure Summary

The popup will be implemented as an overlay within Scene5ProjectDeepDive:

```tsx
{/* Window Creation Popup */}
<AnimatePresence>
  {showWindowPopup && (
    <motion.div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div className="bg-background w-full max-w-[95%] h-[85%] rounded-xl border shadow-xl overflow-hidden flex flex-col">
        
        {/* Header Row: Design | Treatment | Description */}
        <div className="flex items-center gap-2 px-4 py-2 border-b">
          <div className="flex-1 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="text-sm">Design: <strong>Window 1</strong></span>
          </div>
          <div className="flex-1">Treatment: <strong>{currentTreatment}</strong></div>
          <X className="h-4 w-4 cursor-pointer" />
        </div>
        
        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 py-3 border-b">
          <StepperItem label="Window Selected" status="complete" />
          <StepperArrow />
          <StepperItem label="Treatment" status={treatmentStatus} />
          <StepperArrow />
          <StepperItem label="Library" status={libraryStatus} />
          <StepperArrow />
          <StepperItem label="Measurements" status={measurementsStatus} />
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden p-4">
          {showTreatmentStep && <TreatmentContent />}
          {showLibraryStep && <LibraryContent />}
          {showMeasurementsStep && <MeasurementsContent />}
        </div>
        
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## Summary

This enhancement adds the critical "Add Window → Quote" workflow to the Project scene, showing:

1. How to add a new window treatment
2. Selecting treatment type (Curtains)
3. Browsing and selecting fabrics with pricing
4. Entering measurements with visual diagram
5. Saving to generate the quote line item

Total new code: ~200 lines added to Scene5ProjectDeepDive
Duration: Stays at 15 seconds
Files modified: 1 (WelcomeVideoSteps.tsx)
