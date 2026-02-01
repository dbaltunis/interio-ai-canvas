
# Plan: Fix Remaining Date Format Issues

## Problem Summary

Based on the investigation and user screenshots, the date format is **NOT correctly applied** across several critical areas despite having "DD/MM/YYYY" configured in user preferences.

### Screenshot Evidence

| Area | Current Display | Expected (DD/MM/YYYY) | Status |
|------|-----------------|----------------------|--------|
| Work Order - Project name | "New Job 1/27/2026" | "New Job 27/01/2026" | ❌ BUG |
| Work Order - CREATED field | "2026-01-27" | "27/01/2026" | ❌ BUG |
| Timeline picker | "January 1st, 2026" | "01/01/2026" | ❌ BUG |
| Quote header | "01/01/2026" | "01/01/2026" | ✅ OK |
| Job list | "27/01/2026" | "27/01/2026" | ✅ OK |

---

## Root Causes Identified

### 1. Job Creation Names (JobsPage.tsx)
**File:** `src/components/jobs/JobsPage.tsx`
**Lines:** 283, 351

When creating new jobs, the project name includes a date formatted with `toLocaleDateString()` which uses browser locale instead of user preferences:

```typescript
// Line 283
name: `New Job ${new Date().toLocaleDateString()}`,

// Line 351
name: `Job ${quote.quote_number || new Date().toLocaleDateString()}`,
```

**Impact:** Project names are stored in the database with incorrect date format.

---

### 2. Work Order Data Binding (workOrderDataBinding.ts)
**File:** `src/utils/workOrderDataBinding.ts`
**Lines:** 76-77

The work order header dates use `toLocaleDateString()`:

```typescript
createdDate: project?.created_at ? new Date(project.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
dueDate: project?.due_date ? new Date(project.due_date).toLocaleDateString() : '',
```

**Impact:** Work order "CREATED" field shows wrong format (ISO or US format).

---

### 3. Timeline Date Picker (ProjectDetailsTab.tsx)
**File:** `src/components/jobs/tabs/ProjectDetailsTab.tsx`
**Lines:** 465, 525

The start/due date buttons use `format(date, "PPP")` which produces "January 1st, 2026" format regardless of user preferences:

```typescript
{project.start_date ? format(new Date(project.start_date), "PPP") : 'Set start date'}
{project.due_date ? format(new Date(project.due_date), "PPP") : 'Set due date'}
```

**Impact:** Timeline shows long English format instead of user's configured format.

---

### 4. EditableLivePreview (Template Editor)
**File:** `src/components/settings/templates/visual-editor/EditableLivePreview.tsx`
**Lines:** 477-479

Token resolution uses `toLocaleDateString()`:

```typescript
date: project.created_at ? new Date(project.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
due_date: project.due_date ? new Date(project.due_date).toLocaleDateString() : ...
```

**Impact:** Template editor preview shows wrong date format.

---

## Implementation Plan

### Fix 1: JobsPage.tsx - Use User's Date Format in Job Names

Add the `useFormattedDate` hook or use a synchronous format helper:

```typescript
// Option A: Use formatDateSync with user preferences
import { formatDateSync } from "@/utils/dateFormatUtils";
import { useUserPreferences } from "@/hooks/useUserPreferences";

// Inside component:
const { data: userPreferences } = useUserPreferences();
const dateFormat = userPreferences?.date_format || 'MM/dd/yyyy';

// Then use in job creation:
name: `New Job ${format(new Date(), convertToDateFnsFormat(dateFormat))}`,
```

**Files to modify:**
- `src/components/jobs/JobsPage.tsx` (lines 283, 351)

---

### Fix 2: workOrderDataBinding.ts - Accept Date Format Parameter

Make the function accept user's date format as a parameter:

```typescript
export const buildWorkOrderData = (
  project: any,
  treatments: any[],
  rooms: any[],
  templateSettings: any,
  userDateFormat: string = 'MM/dd/yyyy'  // Add parameter
): WorkOrderData => {
  // Use date-fns format with user preference
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return format(new Date(dateStr), userDateFormat);
  };
  
  return {
    header: {
      ...
      createdDate: formatDate(project?.created_at) || format(new Date(), userDateFormat),
      dueDate: formatDate(project?.due_date),
      ...
    },
    ...
  };
};
```

**Files to modify:**
- `src/utils/workOrderDataBinding.ts` (lines 43, 76-77)
- `src/components/jobs/tabs/WorkOrderTab.tsx` (line 132 - pass user format)

---

### Fix 3: ProjectDetailsTab.tsx - Use User's Date Format

Replace hardcoded "PPP" format with user's configured format:

```typescript
import { useUserPreferences } from "@/hooks/useUserPreferences";

// Inside component:
const { data: userPreferences } = useUserPreferences();
const dateFnsFormat = userPreferences?.date_format === 'dd/MM/yyyy' ? 'dd/MM/yyyy' :
                      userPreferences?.date_format === 'yyyy-MM-dd' ? 'yyyy-MM-dd' :
                      userPreferences?.date_format === 'dd-MMM-yyyy' ? 'dd-MMM-yyyy' :
                      'MM/dd/yyyy';

// Then in JSX:
{project.start_date ? format(new Date(project.start_date), dateFnsFormat) : 'Set start date'}
{project.due_date ? format(new Date(project.due_date), dateFnsFormat) : 'Set due date'}
```

**Files to modify:**
- `src/components/jobs/tabs/ProjectDetailsTab.tsx` (lines 465, 525)

---

### Fix 4: EditableLivePreview.tsx - Use formatInTimeZone with User Preferences

Similar to how LivePreview.tsx does it correctly, update EditableLivePreview:

```typescript
import { formatInTimeZone } from "date-fns-tz";
import { useUserPreferences } from "@/hooks/useUserPreferences";

// Inside component:
const { data: userPreferences } = useUserPreferences();
const userTimezone = userPreferences?.timezone || 'UTC';
const userDateFormat = convertToDateFnsFormat(userPreferences?.date_format || 'MM/dd/yyyy');

// Then in token resolution:
date: project.created_at 
  ? formatInTimeZone(new Date(project.created_at), userTimezone, userDateFormat) 
  : formatInTimeZone(new Date(), userTimezone, userDateFormat),
```

**Files to modify:**
- `src/components/settings/templates/visual-editor/EditableLivePreview.tsx` (lines 477-479)

---

## Files to Modify Summary

| File | Lines | Change Description |
|------|-------|-------------------|
| `src/components/jobs/JobsPage.tsx` | 283, 351 | Use user date format in job names |
| `src/utils/workOrderDataBinding.ts` | 43, 76-77 | Accept userDateFormat parameter |
| `src/components/jobs/tabs/WorkOrderTab.tsx` | 132 | Pass user date format to buildWorkOrderData |
| `src/components/jobs/tabs/ProjectDetailsTab.tsx` | 465, 525 | Use user date format instead of "PPP" |
| `src/components/settings/templates/visual-editor/EditableLivePreview.tsx` | 477-479 | Use formatInTimeZone with user preferences |

---

## Testing Checklist

After implementation:

1. **Job Creation Test:**
   - Set date format to "DD/MM/YYYY" in Settings > Personal
   - Create a new job
   - Verify job name shows date as "27/01/2026" not "1/27/2026"

2. **Work Order Test:**
   - Open any job > Work Order tab
   - Verify "CREATED" field shows "27/01/2026" not "2026-01-27"

3. **Timeline Test:**
   - Open any job with dates set
   - Verify timeline shows "27/01/2026" not "January 27th, 2026"

4. **Template Editor Test:**
   - Go to Settings > Templates > Edit any template
   - Verify date fields in preview use correct format
