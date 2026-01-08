# Bug Fix Plan: Heading Fullness and Status Updates

## Summary of Issues Found

### Issue 1: Hardcoded "Standard Pleat" with 1x Fullness (NEW - Not Reported Yet)
**Location**: `src/components/measurements/dynamic-options/DynamicCurtainOptions.tsx` (lines 606-614)  
**Problem**: When user selects "Standard / No Heading" (value="none"):
1. The UI shows hardcoded "1x fullness" badge
2. The `handleHeadingChange` function doesn't set any fullness because `headingOptions.find(h => h.id === 'none')` returns `undefined`
3. Template's `fullness_ratio` is ignored completely

**Current behavior**:
```typescript
<SelectItem key="no-heading" value="none">
  <span className="text-muted-foreground">Standard / No Heading</span>
  <Badge variant="outline" className="text-xs">
    1x fullness  // <-- HARDCODED!
  </Badge>
</SelectItem>
```

**Root cause**: The template already has a `fullness_ratio` column that should be used when no specific heading is selected, but the code ignores it.

### Issue 2: HeadingStep.tsx Has Completely Hardcoded Options
**Location**: `src/components/measurement-wizard/steps/HeadingStep.tsx`  
**Problem**: Uses static array of 4 heading options instead of fetching from database:
```typescript
const headingOptions = [
  { value: 'pinch_pleat', label: 'Pinch Pleat' },
  { value: 'pencil_pleat', label: 'Pencil Pleat' },
  { value: 'eyelet', label: 'Eyelet' },
  { value: 'tab_top', label: 'Tab Top' }
];
```

### Issue 3: Bug Status Updates Needed
The following bugs have been fixed but not marked as resolved:
- `5d491d42` - Window Types not visible (FIXED via TemplateStep.tsx + migration)
- `154c7fb5` - JOB DUPLIKATE (FIXED via JobsTableView.tsx)

---

## Phase 1: Fix Heading Fullness When "No Heading" Selected

### File: `src/components/measurements/dynamic-options/DynamicCurtainOptions.tsx`

**Change 1**: Update the "Standard / No Heading" option display to show template's default fullness:

```typescript
// Around line 606-614, replace hardcoded "1x fullness" with dynamic value
<SelectItem key="no-heading" value="none">
  <div className="flex items-center justify-between w-full gap-4">
    <span className="text-muted-foreground">Standard / No Heading</span>
    <Badge variant="outline" className="text-xs">
      {template?.fullness_ratio ? `${template.fullness_ratio}x fullness` : '1x fullness'}
    </Badge>
  </div>
</SelectItem>
```

**Change 2**: Update `handleHeadingChange` to handle "none" case properly (around line 215-280):

```typescript
const handleHeadingChange = (headingId: string) => {
  console.log('DROPDOWN FIRED: handleHeadingChange', { headingId });
  
  // Handle "Standard / No Heading" case explicitly
  if (headingId === 'none') {
    onChange('selected_heading', 'none');
    if (onHeadingChange) {
      onHeadingChange('none');
    }
    
    // Use template's default fullness ratio when no heading selected
    const templateFullness = template?.fullness_ratio;
    if (typeof templateFullness === 'number' && templateFullness > 0) {
      console.log('Setting heading_fullness from template:', templateFullness);
      onChange('heading_fullness', templateFullness);
      onChange('fullness_ratio', templateFullness);
    } else {
      // Fallback to 1 only if template has no default
      console.log('No template fullness, using 1x');
      onChange('heading_fullness', 1);
      onChange('fullness_ratio', 1);
    }
    
    // Clear heading price
    if (onOptionPriceChange) {
      onOptionPriceChange('heading', 0, 'Standard / No Heading', 'fixed');
    }
    return;
  }
  
  // ... existing logic for actual heading selections
};
```

---

## Phase 2: Fix HeadingStep.tsx to Use Database Headings

### File: `src/components/measurement-wizard/steps/HeadingStep.tsx`

Replace hardcoded options with database-fetched headings:

```typescript
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useMeasurementWizardStore } from '@/stores/measurementWizardStore';
import { useHeadingInventory } from '@/hooks/useHeadingInventory';
import { Skeleton } from '@/components/ui/skeleton';

export const HeadingStep: React.FC = () => {
  const { selectedHeading, selectedFinish, setHeading, setFinish } = useMeasurementWizardStore();
  const { data: headingOptions = [], isLoading } = useHeadingInventory();

  const finishOptions = [
    { value: 'standard', label: 'Standard Finish' },
    { value: 'hand_finished', label: 'Hand Finished' },
    { value: 'contrast_trim', label: 'Contrast Trim' }
  ];

  // Auto-select first heading if none selected and options loaded
  useEffect(() => {
    if (!selectedHeading && headingOptions.length > 0) {
      setHeading(headingOptions[0].id);
    }
    if (!selectedFinish && finishOptions.length > 0) {
      setFinish(finishOptions[0].value);
    }
  }, [selectedHeading, selectedFinish, headingOptions, setHeading, setFinish]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Heading Type</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Heading Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedHeading} onValueChange={setHeading}>
            {/* Standard / No Heading option */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none" className="flex items-center gap-2">
                Standard / No Heading
                <Badge variant="outline" className="text-xs">1x</Badge>
              </Label>
            </div>
            
            {/* Database headings */}
            {headingOptions.map((heading) => (
              <div key={heading.id} className="flex items-center space-x-2">
                <RadioGroupItem value={heading.id} id={heading.id} />
                <Label htmlFor={heading.id} className="flex items-center gap-2">
                  {heading.name}
                  {heading.fullness_ratio && (
                    <Badge variant="outline" className="text-xs">
                      {heading.fullness_ratio}x
                    </Badge>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Finish Options</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedFinish} onValueChange={setFinish}>
            {finishOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## Phase 3: Update Bug Statuses in Database

Execute SQL to mark fixed bugs as resolved:

```sql
UPDATE bug_reports 
SET status = 'resolved', updated_at = now()
WHERE id IN (
  '5d491d42-0bf9-4478-8d87-dd6eba97c877',  -- Window Types not visible (FIXED)
  '154c7fb5-2f2c-4c0c-ac45-e4ac0f12e61f'   -- JOB DUPLIKATE (FIXED)
);
```

---

## Phase 4: Create New Bug Report for Heading Issue

Since this is a newly discovered issue, create a bug report entry:

```sql
INSERT INTO bug_reports (
  id, title, description, status, created_at
) VALUES (
  gen_random_uuid(),
  'Heading Type shows hardcoded 1x fullness instead of template default',
  'When selecting "Standard / No Heading" in the curtain options:
1. The UI shows hardcoded "1x fullness" instead of template default
2. The template fullness_ratio column is ignored
3. HeadingStep.tsx uses hardcoded heading options instead of database

Files affected:
- src/components/measurements/dynamic-options/DynamicCurtainOptions.tsx
- src/components/measurement-wizard/steps/HeadingStep.tsx',
  'resolved',  -- Mark as resolved since we are fixing it
  now()
);
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `DynamicCurtainOptions.tsx` | Handle "none" heading to use template's `fullness_ratio` |
| `DynamicCurtainOptions.tsx` | Display template's fullness in "No Heading" badge |
| `HeadingStep.tsx` | Replace hardcoded headings with `useHeadingInventory()` hook |
| Database | Update bug statuses for fixed issues |

---

## Critical Files for Implementation

- `src/components/measurements/dynamic-options/DynamicCurtainOptions.tsx` - Main curtain options component with heading selection logic
- `src/components/measurement-wizard/steps/HeadingStep.tsx` - Wizard step with hardcoded heading options to replace
- `src/hooks/useHeadingInventory.ts` - Existing hook to fetch heading items from database
- Database `bug_reports` table - Update status of fixed bugs
