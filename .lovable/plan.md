
## Fix "Add Client" Spotlight Tooltip

This plan addresses the issues you're seeing with the Add Client spotlight:

1. **Wrong tooltip showing** - "Column Customize" appears instead of "Add Client"
2. **Tooltip disappears quickly** - Race condition with element visibility
3. **Tooltip is too dark** - Need lighter, more user-friendly styling
4. **Plus icon should blink** - Add visual attention indicator

---

### Root Cause Analysis

The logs reveal the core problem:

```text
[Teaching] next: "app-jobs-column-customize"  <-- Wrong one!
```

When you're on the job details page, the section is still detected as `"projects"` (from the URL tab parameter). The teaching system then selects `app-jobs-column-customize` (which requires `section: 'projects'`) instead of `app-job-add-client`.

The Add Client button also loads **after** the initial page render (inside the job details panel), so the tooltip's target element isn't found immediately.

---

### Solution Overview

| Issue | Fix |
|-------|-----|
| Wrong tooltip selected | Add `section: 'job-details'` to the teaching config and detect when a job panel is open |
| Tooltip disappears | Increase retry attempts when looking for target element |
| Dark styling | Switch from `bg-primary` to `bg-popover` with subtle border |
| X and "Don't show again" visible | Remove these buttons, keep only "Got it" |
| Plus icon not blinking | Add pulse animation to the button when teaching is active |

---

### Technical Implementation

#### 1. Update Teaching Point Configuration

**File:** `src/config/teachingPoints.ts`

Change the Add Client teaching point to require `section: 'job-details'`:

```typescript
{
  id: 'app-job-add-client',
  title: 'Add or Create a Client',
  description: 'Click here to assign an existing client or create a new one for this project.',
  targetSelector: '[data-teaching="add-client-action"]',
  position: 'bottom',
  trigger: { type: 'empty_state', page: '/app', section: 'job-details' },
  priority: 'high',
  category: 'app',
}
```

#### 2. Detect Job Details Panel Open

**File:** `src/components/teaching/TeachingOverlay.tsx`

Update the route tracking logic to detect when a job ID is present in the URL:

```typescript
// In the useEffect that tracks route changes
const jobId = searchParams.get('jobId');

if (path === '/' || path === '/app') {
  page = '/app';
  // If job details panel is open, use 'job-details' section
  section = jobId ? 'job-details' : (tab || 'dashboard');
}
```

#### 3. Make Tooltip Lighter and Cleaner

**File:** `src/components/teaching/TeachingOverlay.tsx`

Update the bubble styling:

```text
Current (dark):
- bg-primary text-primary-foreground

New (light, friendly):
- bg-popover text-popover-foreground
- border-2 border-primary/30
- Icon uses bg-primary/10 text-primary
```

Remove the X close button from the header and the "Don't show again" link from the footer.

#### 4. Add Retry Logic for Target Element

**File:** `src/components/teaching/TeachingOverlay.tsx`

The current code only tries once to find the target element. Add retry logic:

```typescript
const positionBubble = () => {
  let targetEl = document.querySelector(activeTeaching.targetSelector);
  
  if (!targetEl) {
    // Element not found yet - retry after a delay
    retryCount.current++;
    if (retryCount.current < 5) {
      setTimeout(positionBubble, 300);
      return;
    }
    setPosition(null);
    return;
  }
  // ... rest of positioning logic
};
```

#### 5. Add Blinking Animation to Plus Icon

**File:** `src/components/jobs/tabs/ProjectDetailsTab.tsx`

Import the teaching hook and apply animation when active:

```typescript
import { useTeachingTrigger } from '@/components/teaching';

// Inside component:
const { isActive: isAddClientTeachingActive } = useTeachingTrigger('app-job-add-client');

// On the button:
<Button 
  className={cn(
    "shrink-0 h-8 w-8 p-0",
    isAddClientTeachingActive && "animate-pulse ring-2 ring-primary ring-offset-2"
  )}
>
```

**File:** `src/index.css`

Add a custom teaching pulse animation (more subtle than default):

```css
@keyframes teaching-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.teaching-blink {
  animation: teaching-blink 1s ease-in-out infinite;
}
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/config/teachingPoints.ts` | Add `section: 'job-details'` to the Add Client teaching point |
| `src/components/teaching/TeachingOverlay.tsx` | 1. Detect jobId for section mapping 2. Lighter styling 3. Remove X and "Don't show again" 4. Add retry logic |
| `src/components/jobs/tabs/ProjectDetailsTab.tsx` | Add blinking animation to Plus button when teaching active |
| `src/index.css` | Add custom `teaching-blink` animation |

---

### Expected Result

After these changes:
- The Add Client tooltip will **only** appear when viewing job details (not the jobs list)
- The tooltip will reliably find and attach to the Plus button
- Styling will be **light and friendly** (white background, subtle border)
- Only a "Got it" button will be shown (no X, no "Don't show again")
- The Plus icon will **gently blink** to draw user attention
