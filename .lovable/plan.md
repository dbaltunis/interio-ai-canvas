
# Improve Project Scene with Beautiful Sketches & Extended Timing

## Overview

Enhance `Scene5ProjectDeepDive` in the welcome video tutorial to:
1. **Add proper curtain and blind visual sketches** in the treatment selection grid (replacing generic icons)
2. **Extend timing** to give users more time to understand each step
3. **Match the actual app flow** more accurately

---

## Current Issues

| Issue | Current State | Fix |
|-------|---------------|-----|
| Treatment cards use generic `Layers` icon | No visual distinction between curtains/blinds/shutters | Add proper SVG sketches for each treatment type |
| Timing too fast | Each step flashes by quickly | Extend scene duration from 15s to 18s and redistribute phases |
| Measurement diagram is basic | Simple dashed rectangle with no character | Add a proper curtain sketch with folds and rail |

---

## Implementation

### Phase 1: Extend Scene Duration

Update `ShowcaseLightbulb.tsx` to increase Scene5's duration:

```text
Current: 15000ms (15 seconds)
New: 18000ms (18 seconds)
```

This gives 3 extra seconds to slow down the window creation workflow.

---

### Phase 2: Redistribute Timing Phases

**Current phases (15s):**
- 0.00-0.08: Client tab (1.2s)
- 0.08-0.18: Project tab (1.5s)
- 0.18-0.52: Window popup (5.1s) ← Too fast
- 0.52-0.70: Quote tab (2.7s)
- 0.70-0.82: Workroom (1.8s)
- 0.82-1.00: Installation (2.7s)

**New phases (18s):**
- 0.00-0.06: Client tab (1.1s)
- 0.06-0.14: Project tab (1.4s)
- 0.14-0.55: Window popup (7.4s) ← MORE TIME
  - 0.14-0.16: Focus on "Add Window" button
  - 0.16-0.30: Treatment step (2.5s) - more time to see options
  - 0.30-0.40: Library step (1.8s)
  - 0.40-0.55: Measurements step (2.7s) - more time to see form
- 0.55-0.70: Quote tab (2.7s)
- 0.70-0.82: Workroom (2.2s)
- 0.82-1.00: Installation (3.2s)

---

### Phase 3: Add Curtain & Blind Sketches to Treatment Cards

Replace the generic `Layers` icon in treatment cards with inline SVG sketches:

**Curtain Sketch:**
```text
Visual elements:
- Horizontal rail/rod at top
- Two draped curtain panels with graceful folds
- Soft curves showing fabric draping
- Floor-length appearance
```

**Roller Blind Sketch:**
```text
Visual elements:
- Roller mechanism cylinder at top
- Fabric panel partially rolled down
- Bottom bar/hembar
- Control chain on one side
```

**Shutters Sketch:**
```text
Visual elements:
- Frame with vertical divider
- Horizontal louver slats
- Panel hinges indicated
```

---

### Phase 4: Improve Measurement Diagram

Replace the current basic curtain diagram (lines 931-943) with a proper visual that shows:

```text
Improved diagram:
- Window frame with glass panes
- Curtain rail mounted above window
- Two curtain panels with elegant S-fold draping
- Tie-backs suggested
- Clear width/drop dimension lines with arrows
- "Pair" label showing it's a pair of curtains
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/showcase/ShowcaseLightbulb.tsx` | Update Scene5 duration from 15000 to 18000ms |
| `src/components/help/tutorial-steps/WelcomeVideoSteps.tsx` | Update Scene5ProjectDeepDive with new phases, sketches, and improved diagram |

---

## Treatment Sketches Implementation

### CurtainSketch Component (inline in Scene5)

```text
<svg viewBox="0 0 60 60" className="w-full h-full">
  {/* Rail */}
  <rect x="5" y="8" width="50" height="3" rx="1" fill="currentColor" opacity="0.7"/>
  
  {/* Left curtain panel with folds */}
  <path d="M8 11 Q8 35 12 55 L22 55 Q18 35 20 11 Z" fill="currentColor" opacity="0.25"/>
  <path d="M12 11 Q13 35 17 55" stroke="currentColor" opacity="0.3" strokeWidth="0.5" fill="none"/>
  
  {/* Right curtain panel with folds */}
  <path d="M52 11 Q52 35 48 55 L38 55 Q42 35 40 11 Z" fill="currentColor" opacity="0.25"/>
  <path d="M48 11 Q47 35 43 55" stroke="currentColor" opacity="0.3" strokeWidth="0.5" fill="none"/>
  
  {/* Decorative rings */}
  <circle cx="10" cy="10" r="1.5" fill="currentColor" opacity="0.5"/>
  <circle cx="50" cy="10" r="1.5" fill="currentColor" opacity="0.5"/>
</svg>
```

### RollerBlindSketch Component (inline in Scene5)

```text
<svg viewBox="0 0 60 60" className="w-full h-full">
  {/* Roller mechanism */}
  <rect x="8" y="8" width="44" height="5" rx="2.5" fill="currentColor" opacity="0.6"/>
  
  {/* Blind fabric */}
  <rect x="10" y="13" width="40" height="35" fill="currentColor" opacity="0.2"/>
  
  {/* Fabric texture lines */}
  <line x1="10" y1="23" x2="50" y2="23" stroke="currentColor" opacity="0.1" strokeWidth="0.5"/>
  <line x1="10" y1="33" x2="50" y2="33" stroke="currentColor" opacity="0.1" strokeWidth="0.5"/>
  <line x1="10" y1="43" x2="50" y2="43" stroke="currentColor" opacity="0.1" strokeWidth="0.5"/>
  
  {/* Bottom bar */}
  <rect x="10" y="48" width="40" height="3" rx="1" fill="currentColor" opacity="0.5"/>
  
  {/* Control chain */}
  <line x1="48" y1="13" x2="48" y2="55" stroke="currentColor" opacity="0.4" strokeWidth="1"/>
  <circle cx="48" cy="55" r="2" fill="currentColor" opacity="0.4"/>
</svg>
```

### ShutterSketch Component (inline in Scene5)

```text
<svg viewBox="0 0 60 60" className="w-full h-full">
  {/* Frame */}
  <rect x="8" y="8" width="44" height="48" rx="1" stroke="currentColor" opacity="0.5" strokeWidth="1.5" fill="none"/>
  
  {/* Center divider */}
  <line x1="30" y1="8" x2="30" y2="56" stroke="currentColor" opacity="0.5" strokeWidth="1.5"/>
  
  {/* Left panel louvers */}
  {[0,1,2,3,4,5,6].map(i => (
    <rect x="10" y={12 + i*6} width="18" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
  ))}
  
  {/* Right panel louvers */}
  {[0,1,2,3,4,5,6].map(i => (
    <rect x="32" y={12 + i*6} width="18" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
  ))}
</svg>
```

---

## Improved Measurement Diagram

Replace lines 929-944 with a more detailed curtain visualization:

```text
<div className="bg-muted/30 rounded-lg p-4 flex items-center justify-center relative">
  {/* Window frame */}
  <div className="relative w-40 h-48">
    {/* Window background */}
    <div className="absolute inset-x-4 top-8 bottom-4 border-2 border-muted-foreground/30 bg-sky-50 dark:bg-sky-950/30 rounded">
      {/* Window panes */}
      <div className="absolute inset-1 grid grid-cols-2 gap-1">
        <div className="bg-sky-100/50 dark:bg-sky-900/30 border border-muted-foreground/10"/>
        <div className="bg-sky-100/50 dark:bg-sky-900/30 border border-muted-foreground/10"/>
      </div>
    </div>
    
    {/* Curtain rail */}
    <div className="absolute top-4 left-0 right-0 h-2 bg-muted-foreground/60 rounded-full"/>
    
    {/* Left curtain with S-folds */}
    <div className="absolute left-0 top-6 w-12 bottom-0 bg-primary/20 rounded-b-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/20"/>
      {/* Fold lines */}
      <div className="absolute top-4 bottom-0 left-3 w-px bg-primary/30"/>
      <div className="absolute top-4 bottom-0 left-7 w-px bg-primary/30"/>
    </div>
    
    {/* Right curtain with S-folds */}
    <div className="absolute right-0 top-6 w-12 bottom-0 bg-primary/20 rounded-b-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-l from-primary/30 via-primary/10 to-primary/20"/>
      {/* Fold lines */}
      <div className="absolute top-4 bottom-0 right-3 w-px bg-primary/30"/>
      <div className="absolute top-4 bottom-0 right-7 w-px bg-primary/30"/>
    </div>
    
    {/* Width dimension line */}
    <div className="absolute -top-1 left-0 right-0 flex items-center">
      <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-r-[5px] border-transparent border-r-blue-500"/>
      <div className="flex-1 border-t border-blue-500"/>
      <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-blue-500"/>
    </div>
    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-blue-600 font-medium">Rail Width</span>
    
    {/* Drop dimension line */}
    <div className="absolute top-6 -right-4 bottom-0 flex flex-col items-center">
      <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[5px] border-transparent border-b-green-500"/>
      <div className="flex-1 border-r border-green-500"/>
      <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[5px] border-transparent border-t-green-500"/>
    </div>
    <span className="absolute top-1/2 -right-8 -translate-y-1/2 text-[9px] text-green-600 font-medium rotate-90">Drop</span>
  </div>
</div>
```

---

## Summary of Changes

| Change | Impact |
|--------|--------|
| Scene duration 15s → 18s | +3 seconds for better comprehension |
| Treatment cards with SVG sketches | Visual clarity - users can see curtain vs blind |
| Improved measurement diagram | Professional appearance matching app quality |
| Redistributed phases | More time on window popup (5.1s → 7.4s) |

**Total new/modified code:** ~120 lines

**Files modified:** 2
- `src/components/showcase/ShowcaseLightbulb.tsx` (1 line - duration change)
- `src/components/help/tutorial-steps/WelcomeVideoSteps.tsx` (~120 lines - sketches + timing + diagram)
