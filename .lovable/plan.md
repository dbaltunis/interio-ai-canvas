

## Remove Teaching Spotlight from Jobs Page

Clean surgical removal of the teaching spotlight system from the Jobs page to restore performance. Infrastructure files remain intact for future use.

---

### Changes Overview

| File | Action | Description |
|------|--------|-------------|
| `src/components/jobs/tabs/ProjectDetailsTab.tsx` | Modify | Remove all teaching imports, hooks, and wrapper components |
| `src/config/teachingPoints.ts` | Modify | Remove `app-job-add-client` teaching point config |
| `src/index.css` | Modify | Remove teaching animation CSS (optional cleanup) |

---

### Technical Details

#### 1. ProjectDetailsTab.tsx

**Remove import (line 34):**
```tsx
// DELETE THIS LINE:
import { TeachingTrigger, useTeachingTrigger } from "@/components/teaching";
```

**Remove hook usage (lines 433-435):**
```tsx
// DELETE THESE LINES:
const { isActive: isAddClientTeachingActive } = useTeachingTrigger('app-job-add-client');
const showAddClientTeaching = !selectedClient && !isReadOnly;
```

**Replace AddClientButton component (lines 437-458):**

Before:
```tsx
const AddClientButton = () => (
  <TeachingTrigger 
    teachingId="app-job-add-client" 
    autoShow={showAddClientTeaching}
    autoShowDelay={800}
  >
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => setShowClientSearch(true)}
      disabled={isReadOnly}
      className={cn(
        "shrink-0 h-8 w-8 p-0",
        isAddClientTeachingActive && !selectedClient && "teaching-pulse-ring ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      data-teaching="add-client-action"
    >
      {selectedClient ? <Edit className="h-3.5 w-3.5" /> : <Plus className="h-4 w-4" />}
    </Button>
  </TeachingTrigger>
);
```

After (simple button, no teaching wrapper):
```tsx
const AddClientButton = () => (
  <Button 
    variant="ghost" 
    size="sm"
    onClick={() => setShowClientSearch(true)}
    disabled={isReadOnly}
    className="shrink-0 h-8 w-8 p-0"
  >
    {selectedClient ? <Edit className="h-3.5 w-3.5" /> : <Plus className="h-4 w-4" />}
  </Button>
);
```

---

#### 2. teachingPoints.ts

Remove the `app-job-add-client` entry from the teaching points array (around lines 333-341):

```tsx
// DELETE THIS ENTIRE BLOCK:
{
  id: 'app-job-add-client',
  title: 'Add or Create a Client',
  description: 'Click here to assign an existing client or create a new one for this project.',
  targetSelector: '[data-teaching="add-client-action"]',
  position: 'bottom',
  trigger: { type: 'empty_state', page: '/app', section: 'job-details' },
  priority: 'high',
  category: 'app',
},
```

---

#### 3. index.css (Optional Cleanup)

Remove teaching animation CSS (lines 1079-1102):

```css
/* DELETE THESE LINES: */
@keyframes teaching-blink { ... }
.teaching-blink { ... }
@keyframes teaching-pulse-ring { ... }
.teaching-pulse-ring { ... }
```

Note: Keep these if other pages still use the teaching system.

---

### What Gets Preserved

The following infrastructure files remain untouched for future use:
- `src/components/teaching/` folder (all components)
- `src/contexts/TeachingContext.tsx`
- `src/config/teachingPoints.ts` (other teaching points remain)

---

### Expected Results

After these changes:
- Jobs page performance returns to normal immediately
- No more infinite render loops from teaching hooks
- "Add Client" button works as a standard button
- Teaching system infrastructure remains available for future features

