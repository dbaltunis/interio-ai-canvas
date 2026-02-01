

# Plan: Fix Reported Bugs

## Overview

This plan addresses two specific bugs that have been reported and verified in the codebase:

1. **Deposit Display Bug** - Shows percentage even when fixed amount is configured
2. **Measurement Input Scrolling Bug** - Mouse wheel accidentally changes values

---

## Bug #1: Deposit Display Bug

### Problem

When a deposit is configured as a "Fixed Amount" (not percentage-based), the quote still displays it as a percentage:

```
Current (WRONG):     "Deposit Required (50%):"  ← Shows percentage when fixed amount used
Expected (CORRECT):  "Deposit (Fixed Amount):"  ← Should indicate fixed amount mode
```

### Root Cause

The code in 3 locations hardcodes `{projectData.payment.percentage || 50}%`:

| File | Line | Current Code |
|------|------|--------------|
| `LivePreview.tsx` | 1464 | `Deposit Required ({projectData.payment.percentage \|\| 50}%):` |
| `LivePreview.tsx` | 1513 | `Pay Deposit ({projectData.payment.percentage \|\| 50}%)` |
| `BlockRenderer.tsx` | 701 | `Deposit ({projectData.payment.percentage \|\| 50}%):` |

### Fix Logic

```text
IF payment.percentage exists AND payment.percentage > 0:
    → Display: "Deposit (XX%)"
ELSE (fixed amount mode):
    → Display: "Deposit (Fixed Amount)" or just "Deposit Required"
```

### Implementation

**File: `src/components/settings/templates/visual-editor/LivePreview.tsx`**

Line 1464 - Change from:
```typescript
Deposit Required ({projectData.payment.percentage || 50}%):
```
To:
```typescript
Deposit Required{projectData.payment.percentage > 0 ? ` (${projectData.payment.percentage}%)` : ''}:
```

Line 1513 - Change from:
```typescript
Pay Deposit ({projectData.payment.percentage || 50}%)
```
To:
```typescript
Pay Deposit{projectData.payment.percentage > 0 ? ` (${projectData.payment.percentage}%)` : ''}
```

**File: `src/components/settings/templates/visual-editor/shared/BlockRenderer.tsx`**

Line 701 - Change from:
```typescript
Deposit ({projectData.payment.percentage || 50}%):
```
To:
```typescript
Deposit{projectData.payment.percentage > 0 ? ` (${projectData.payment.percentage}%)` : ''}:
```

---

## Bug #2: Measurement Input Scrolling Bug

### Problem

When a user scrolls their mouse wheel while hovering over a number input field, the value accidentally changes. This is a common UX issue with HTML number inputs.

### Affected Files

| File | Number Input Count |
|------|-------------------|
| `MeasurementInputs.tsx` | 6 inputs (rail_width, drop, stackback, etc.) |
| `VisualMeasurementSheet.tsx` | 2+ inputs (rail_width, drop) |
| `MeasurementViewDialog.tsx` | Dynamic inputs |
| `TreatmentMeasurementsCard.tsx` | 7+ inputs |

### Fix Strategy

Add `onWheel` event handler to prevent scroll-based value changes:

```typescript
onWheel={(e) => e.currentTarget.blur()}
```

This blurs the input when scrolling, preventing the value change without interfering with intentional scrolling on the page.

### Implementation

**File: `src/components/shared/measurement-visual/MeasurementInputs.tsx`**

Add `onWheel` handler to both Input components (lines 47 and 76):

```typescript
<Input
  id={key}
  type="number"
  value={measurements[key] || ""}
  onChange={(e) => handleInputChange(key, e.target.value)}
  onWheel={(e) => e.currentTarget.blur()}  // ← ADD THIS
  placeholder="0"
  readOnly={readOnly}
  className="pr-12"
/>
```

**File: `src/components/measurements/VisualMeasurementSheet.tsx`**

Add `onWheel` handler to inputs at lines 1191 and 1216:

```typescript
<Input 
  id="rail_width" 
  type="number" 
  inputMode="decimal" 
  step="0.25" 
  value={measurements.rail_width || ""} 
  onChange={e => handleInputChange("rail_width", e.target.value)} 
  onWheel={(e) => e.currentTarget.blur()}  // ← ADD THIS
  onFocus={e => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })} 
  ...
/>
```

**File: `src/components/measurements/MeasurementViewDialog.tsx`**

Add `onWheel` handler at line 62:

```typescript
<Input
  type="number"
  value={editedMeasurements[key] || ''}
  onChange={(e) => setEditedMeasurements(prev => ({...}))}
  onWheel={(e) => e.currentTarget.blur()}  // ← ADD THIS
/>
```

**File: `src/components/job-creation/treatment-pricing/TreatmentMeasurementsCard.tsx`**

Add `onWheel` handler to all 7 number inputs (lines 25, 36, 47, 67, 78, 89, 100, 120):

```typescript
<Input
  id="rail_width"
  type="number"
  step="0.25"
  value={formData.rail_width}
  onWheel={(e) => e.currentTarget.blur()}  // ← ADD THIS
/>
```

---

## Files to Modify

| File | Bug Fixed | Changes |
|------|-----------|---------|
| `LivePreview.tsx` | Deposit Display | 2 lines (1464, 1513) |
| `BlockRenderer.tsx` | Deposit Display | 1 line (701) |
| `MeasurementInputs.tsx` | Scroll Prevention | 2 inputs |
| `VisualMeasurementSheet.tsx` | Scroll Prevention | 2 inputs |
| `MeasurementViewDialog.tsx` | Scroll Prevention | 1 input |
| `TreatmentMeasurementsCard.tsx` | Scroll Prevention | 7 inputs |

---

## Testing After Implementation

### Deposit Display Bug
1. Create or open a project with a quote
2. Go to Payment config → Select "Deposit" → Select "Fixed Amount"
3. Set a specific amount (e.g., $500)
4. Save the payment config
5. View the quote preview
6. **Verify**: Label should NOT show "(50%)" but just "Deposit Required:" or similar

### Measurement Scroll Bug
1. Open any job with a measurement worksheet
2. Enter a value in a measurement field (e.g., Width = 100)
3. Hover over the input field
4. Scroll the mouse wheel up/down
5. **Verify**: The value should NOT change when scrolling

