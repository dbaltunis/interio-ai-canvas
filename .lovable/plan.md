

# Native-Feel Loading Experience Overhaul

## Summary

Implement modern SaaS loading patterns across the entire application to eliminate visual "bouncing," double loading states, and layout shifts. The goal is to reduce 5-7 jarring transitions down to 1-2 graceful ones per navigation.

---

## Files to Modify

| File | Key Changes |
|------|-------------|
| `src/components/calendar/skeleton/CalendarSkeleton.tsx` | Fix row heights: 48px → 32px to match actual calendar |
| `src/components/calendar/CalendarView.tsx` | Return `null` instead of spinner during permission check |
| `src/components/calendar/WeeklyCalendarView.tsx` | Use `useLayoutEffect` + instant scroll to 7 AM |
| `src/components/jobs/JobsPage.tsx` | Return `null` instead of permission loading card |
| `src/components/jobs/JobsTableView.tsx` | Add staggered `animate-fade-in` to table rows |
| `src/pages/Index.tsx` | Replace `<div>Loading...</div>` with proper skeletons |
| `src/components/settings/NumberSequenceSettings.tsx` | Replace "Loading..." text with skeleton |
| `src/components/settings/tabs/TreatmentTypesTab.tsx` | Replace "Loading..." text with skeleton |

---

## Technical Changes

### 1. CalendarSkeleton Dimension Fix
- Change `h-[48px]` → `h-[32px]` for row heights
- Change `${index * 48}px` → `${index * 32}px` for positioning
- Change `min-h-[1152px]` → `min-h-[768px]` for container

### 2. Remove Double Loading States
Return `null` in components during permission checks to let Suspense skeleton persist:
- `CalendarView.tsx`: Remove internal spinner (lines 193-202)
- `JobsPage.tsx`: Remove permission loading Card (lines 398-409)
- `Index.tsx`: Return skeleton instead of inline spinner

### 3. Instant Calendar Scroll
Replace `useEffect` with `useLayoutEffect` and remove `behavior: 'smooth'` to position calendar at 7 AM before browser paints.

### 4. Graceful Data Population
Add staggered animations to data items:
```typescript
style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
className="animate-fade-in"
```

### 5. Replace Plain Loading Text
Convert all `<div>Loading...</div>` to proper skeleton components matching the final layout.

---

## Expected Results

| Before | After |
|--------|-------|
| 5-7 visual state changes | 1-2 graceful transitions |
| Layout bouncing/shifting | Stable layout throughout |
| Visible scroll animations | Content appears pre-positioned |
| Data "pops" in abruptly | Smooth staggered fade-in |
| Feels broken/old | Feels like Linear, Notion, Figma |

