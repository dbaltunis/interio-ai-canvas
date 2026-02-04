
## Fix Teaching Spotlight Performance & Functionality

This plan addresses the critical issues causing app slowness and the Add Client spotlight not appearing correctly.

---

### Issues Found

| Problem | Root Cause |
|---------|------------|
| App extremely slow | Teaching system creating infinite state update loop - `showCount` incrementing thousands of times |
| Tooltip not appearing | Wrong section detection ("projects" vs "job-details") |
| Two "Got it" buttons | Copy-paste bug in TeachingActiveSpotlight.tsx |
| React context error on hot reload | Component accessing context before provider ready |
| AddClientButton not found | Component defined after first use during hot reload |

---

### Technical Changes

#### 1. Fix Infinite Loop in TeachingContext.tsx

The `setCurrentPage` function is causing infinite re-renders because:
- It updates `progress.showCounts` state
- This changes the dependency array of `setCurrentPage` 
- Which triggers more calls to `setCurrentPage`

**Fix**: Add a guard to prevent duplicate teaching activations:

```typescript
// Add a ref to track last shown teaching
const lastShownRef = useRef<string | null>(null);

// In setCurrentPage, before showing teaching:
if (lastShownRef.current === next.id) {
  return; // Already showing this one
}
lastShownRef.current = next.id;
```

Also remove `progress.showCounts` from the dependency array of `setCurrentPage`.

#### 2. Remove Duplicate "Got it" Button

In `TeachingActiveSpotlight.tsx`, remove the duplicate button (lines 251-258):

```tsx
// REMOVE this duplicate:
<Button 
  onClick={handleComplete}
  className="w-full gap-2"
  size="sm"
>
  <Check className="h-3.5 w-3.5" />
  Got it
</Button>
```

#### 3. Add Error Boundary to Teaching Components

Wrap `useTeaching()` calls in a try-catch for hot reload safety:

```typescript
// In TeachingActiveSpotlight.tsx
let teaching;
try {
  teaching = useTeaching();
} catch (e) {
  return null; // Gracefully handle missing provider during HMR
}
```

Alternatively, use a safe hook pattern with null check.

#### 4. Move AddClientButton Definition Earlier

In `ProjectDetailsTab.tsx`, move the `AddClientButton` component definition **before** any hooks that might cause early returns, ensuring it's always defined when referenced.

#### 5. Unify Tooltip Styling

The `TeachingTrigger` + `TeachingPopover` combination should be removed for the Add Client button. Instead, rely only on the global `TeachingOverlay` for the floating bubble. The `TeachingTrigger` should only handle the pulse animation, not render its own popover.

**Option A (Recommended)**: Change `TeachingTrigger` to NOT render a popover, just apply animation classes.

**Option B**: Keep `TeachingTrigger` but pass a prop to disable its popover when using global overlay.

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/TeachingContext.tsx` | Add guard to prevent duplicate/infinite teaching shows, fix dependency array |
| `src/components/teaching/TeachingActiveSpotlight.tsx` | Remove duplicate button, add HMR error protection |
| `src/components/jobs/tabs/ProjectDetailsTab.tsx` | Move `AddClientButton` definition earlier in component |
| `src/components/teaching/TeachingTrigger.tsx` | Add option to disable popover when using global overlay |

---

### Expected Results

After these changes:
- App will no longer be slow (no more infinite state loops)
- Teaching tooltip will appear correctly when viewing job details
- Only one "Got it" button will show
- No more React context errors during development
- Clean, consistent tooltip styling
