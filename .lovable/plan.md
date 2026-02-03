

## Fix Teaching Tooltip Behavior - "Got It" vs "Don't Show Again"

Currently, clicking "Got it" permanently hides a teaching tooltip. This plan changes the behavior so tooltips continue appearing until explicitly dismissed with "Don't show again."

---

### Current Behavior vs. Desired Behavior

| Button | Current | Desired |
|--------|---------|---------|
| **Got it** | Permanently hidden | Just closes for this session, shows again on next page visit |
| **Don't show again** | Permanently hidden | Permanently hidden (forever) |

---

### File Changes

**1. `src/contexts/TeachingContext.tsx`**
- Modify `dismissTeaching()` to NOT add to `seenTeachingPoints` - just close the popover
- Add a new `sessionDismissed` state (not persisted to localStorage) to track tooltips dismissed this session
- Keep `dismissForever()` as-is for permanent dismissal

**2. `src/components/teaching/TeachingPopover.tsx`**  
- Restore the "Don't show again" button (currently hidden with `showDontShowAgain={false}`)
- Style it as a small, subtle link or text button below "Got it"
- Make it clearly secondary to "Got it"

**3. `src/components/teaching/TeachingTrigger.tsx`**
- Update to check `sessionDismissed` instead of `hasSeenTeaching` for determining if tooltip should show
- Keep permanent dismiss check for `dismissedForever`

---

### Implementation Details

**TeachingContext changes:**

```typescript
// Add session-only tracking (not persisted)
const [sessionDismissed, setSessionDismissed] = useState<string[]>([]);

// dismissTeaching - just close for this session
const dismissTeaching = useCallback((id: string) => {
  setSessionDismissed(prev => 
    prev.includes(id) ? prev : [...prev, id]
  );
  
  if (activeTeaching?.id === id) {
    setActiveTeaching(null);
  }
}, [activeTeaching]);

// Add query for session dismissed
const isSessionDismissed = useCallback((id: string): boolean => {
  return sessionDismissed.includes(id);
}, [sessionDismissed]);
```

**TeachingTrigger check updates:**

```typescript
// Before showing, check:
// 1. Not dismissed forever (permanent)
// 2. Not dismissed this session
if (isDismissedForever(teachingId) || isSessionDismissed(teachingId)) return;
```

**TeachingPopover UI:**

```tsx
{/* Primary action */}
<Button onClick={onDismiss}>Got it</Button>

{/* Small secondary action */}
<button 
  onClick={onDismissForever}
  className="text-xs text-muted-foreground hover:text-foreground mt-1"
>
  Don't show again
</button>
```

---

### Expected Behavior After Fix

| Scenario | What Happens |
|----------|--------------|
| User clicks "Got it" | Tooltip closes, will show again on next page/project |
| User clicks "Don't show again" | Tooltip never shows for this user again |
| User logs out and back in | "Got it" dismissals reset, permanent ones persist |
| Different user on same browser | Gets fresh teaching experience (localStorage per user auth would be ideal future enhancement) |

---

### Files to Modify

1. `src/contexts/TeachingContext.tsx` - Add session-only dismissal tracking
2. `src/components/teaching/TeachingPopover.tsx` - Show small "Don't show again" button
3. `src/components/teaching/TeachingTrigger.tsx` - Use session-dismissed check instead of seen check

