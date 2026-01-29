

# Fix Update Announcement Modal - Compact Design

## Problem
The current modal is too large and overwhelming. Users who just want to dismiss it are forced to see a wall of text.

## Solution
Create a **compact modal** with:
1. **Condensed header** - smaller padding, tighter typography
2. **Only show Highlights by default** - the 3 most important updates
3. **"View all updates" expandable link** - reveals remaining sections on click
4. **Smaller max-height** - `max-h-[40vh]` instead of `50vh`
5. **More compact list styling** - tighter spacing

---

## Visual Before/After

**BEFORE (Current):**
```text
┌─────────────────────────────────────┐
│      ✨ What's New                  │
│      Version 2.4.2                  │
│      January 29, 2026               │
├─────────────────────────────────────┤
│  ⚡ HIGHLIGHTS                      │
│  • 4x Performance...                │
│  • Team Access Control...           │
│  • Project Creation Fixed...        │
│                                     │
│  👥 NEW FEATURES                    │  ← All visible
│  • Multi-Team Assignment...         │     (overwhelming)
│  • Limit Access Feature...          │
│                                     │
│  🔧 IMPROVEMENTS                    │
│  • Document numbering...            │
│  • Markup settings...               │
│  • Work order sharing...            │
│  • Notification system...           │
│                                     │
│  🛡️ SECURITY                        │
│  • Enhanced RLS policies...         │
│  • Improved function security...    │
├─────────────────────────────────────┤
│      [ ✓ Got it, thanks ]           │
└─────────────────────────────────────┘
```

**AFTER (Fixed):**
```text
┌─────────────────────────────────┐
│     ✨ What's New               │
│     Version 2.4.2               │
│     January 29, 2026            │
├─────────────────────────────────┤
│  ⚡ HIGHLIGHTS                  │
│  • 4x Performance Improvement   │
│  • Team Access Control          │
│  • Project Creation Fixed       │
│                                 │
│     ▼ View all updates          │  ← Click to expand
├─────────────────────────────────┤
│    [ ✓ Got it, thanks ]         │
└─────────────────────────────────┘
```

**AFTER (Expanded):**
```text
┌─────────────────────────────────┐
│     ✨ What's New               │
│     Version 2.4.2               │
├─────────────────────────────────┤
│  ⚡ HIGHLIGHTS                  │
│  • 4x Performance Improvement   │
│  • Team Access Control          │
│  • Project Creation Fixed       │
│─────────────────────────────────│
│  👥 NEW FEATURES (scrollable)   │
│  • Multi-Team Assignment        │
│  • Limit Access Feature         │
│─────────────────────────────────│
│  🔧 IMPROVEMENTS                │
│  • Document numbering...        │
│  ...                            │
│                                 │
│     ▲ Show less                 │
├─────────────────────────────────┤
│    [ ✓ Got it, thanks ]         │
└─────────────────────────────────┘
```

---

## Technical Changes

### File: `src/components/version/UpdateAnnouncementModal.tsx`

**Changes:**
1. **Add state for expand/collapse**: `const [showAll, setShowAll] = useState(false)`

2. **Reduce modal width**: `max-w-md` instead of `max-w-lg`

3. **Compact header padding**: `px-5 py-4` instead of `px-6 py-6`

4. **Shorter list items**: Truncate long descriptions

5. **Split content into two groups**:
   - `highlightsOnly` - Just the first "Highlights" section (always visible)
   - `additionalContent` - New Features, Improvements, Security (hidden by default)

6. **Add expand/collapse toggle**:
   ```tsx
   <button onClick={() => setShowAll(!showAll)} className="...">
     <ChevronDown className={showAll ? "rotate-180" : ""} />
     {showAll ? "Show less" : "View all updates"}
   </button>
   ```

7. **AnimatePresence for expand animation**: Smooth height transition

8. **Reduce scrollable area**: `max-h-[35vh]` when expanded

9. **Compact footer**: `py-3` instead of `py-4`, smaller button

---

## Content Updates

**Highlights (Always Visible) - Shortened:**
- "4x Performance Improvement"
- "Team Access Control (Australasia)"  
- "Project Creation Fixed"

**Expanded Content (Click to Show):**
- New Features (2 items)
- Improvements (4 items, shortened)
- Security (2 items)

