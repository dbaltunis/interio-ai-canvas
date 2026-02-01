
# Add Missing Columns to Jobs Table

## Overview

The jobs table customization is missing 5 columns that you need. I'll add them to both the column preferences hook and the table rendering logic.

---

## Current vs Required Columns

| # | Your Request | Current Status | Action |
|---|-------------|----------------|--------|
| 1 | Create Date | ✅ Exists as "Created" | No change |
| 2 | Job No. | ✅ Exists | No change |
| 3 | Client Name | ✅ Exists as "Client" | No change |
| 4 | Area | ❌ Missing | **ADD** |
| 5 | Total Amount | ✅ Exists as "Total" | No change |
| 6 | Advance Received | ❌ Missing | **ADD** |
| 7 | Balance Amount | ❌ Missing | **ADD** |
| 8 | Start Date | ❌ Missing | **ADD** |
| 9 | Due Date | ❌ Missing | **ADD** |
| 10 | Team | ✅ Exists | No change |
| 11 | Status | ✅ Exists | No change |
| 12 | Messages | ✅ Exists | No change |
| 13 | Actions | ✅ Exists | No change |

---

## New Columns to Add

### 1. Area
- **Source**: Client's address or project location
- **Display**: City/suburb from client address (e.g., "Melbourne", "Sydney")
- **Note**: Will show client's suburb/city when available

### 2. Advance Received
- **Source**: `quotes.amount_paid` field
- **Display**: Currency formatted (e.g., "$500.00")
- **Shows**: How much the client has already paid

### 3. Balance Amount
- **Source**: Calculated as `total_amount - amount_paid`
- **Display**: Currency formatted (e.g., "$1,500.00")
- **Shows**: Outstanding amount to be collected

### 4. Start Date
- **Source**: `projects.start_date` field
- **Display**: Date format (e.g., "15 Jan 2025")
- **Shows**: When work is scheduled to begin

### 5. Due Date
- **Source**: `projects.due_date` field
- **Display**: Date format (e.g., "28 Feb 2025")
- **Shows**: Deadline for project completion

---

## Implementation Plan

### File 1: `src/hooks/useColumnPreferences.ts`

Add the 5 new columns to the default configuration:

```typescript
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'job_no', label: 'Job No', visible: true, order: 0, locked: true },
  { id: 'client', label: 'Client', visible: true, order: 1 },
  { id: 'area', label: 'Area', visible: true, order: 2 },        // NEW
  { id: 'total', label: 'Total', visible: true, order: 3 },
  { id: 'advance', label: 'Advance', visible: true, order: 4 },  // NEW
  { id: 'balance', label: 'Balance', visible: true, order: 5 },  // NEW
  { id: 'start_date', label: 'Start Date', visible: false, order: 6 }, // NEW (hidden by default)
  { id: 'due_date', label: 'Due Date', visible: true, order: 7 },     // NEW
  { id: 'status', label: 'Status', visible: true, order: 8 },
  { id: 'created', label: 'Created', visible: true, order: 9 },
  { id: 'emails', label: 'Messages', visible: true, order: 10 },
  { id: 'team', label: 'Team', visible: true, order: 11 },
  { id: 'actions', label: 'Actions', visible: true, order: 12, locked: true },
];
```

**Also add migration logic** to merge new columns with existing saved preferences (so users don't lose their customizations).

### File 2: `src/components/jobs/JobsTableView.tsx`

Add rendering logic for each new column in the `renderCellContent` function:

```typescript
case 'area':
  // Show client suburb/city
  const clientAddress = client?.address || '';
  const suburb = client?.suburb || client?.city || '';
  return (
    <span className="text-sm text-muted-foreground">
      {suburb || '—'}
    </span>
  );

case 'advance':
  // Show amount paid
  const advanceQuote = quotes.find(q => q.amount_paid > 0) || quotes[0];
  const amountPaid = advanceQuote?.amount_paid || 0;
  return (
    <span className="font-medium text-green-600">
      {amountPaid > 0 ? formatCurrency(amountPaid, userCurrency) : '—'}
    </span>
  );

case 'balance':
  // Calculate balance = total - paid
  const balanceQuote = quotes.find(q => q.status !== 'draft') || quotes[0];
  const total = balanceQuote?.total_amount || 0;
  const paid = balanceQuote?.amount_paid || 0;
  const balance = total - paid;
  return (
    <span className={balance > 0 ? "font-medium text-amber-600" : "text-muted-foreground"}>
      {balance > 0 ? formatCurrency(balance, userCurrency) : '—'}
    </span>
  );

case 'start_date':
  return (
    <span className="text-sm">
      {project.start_date 
        ? new Date(project.start_date).toLocaleDateString() 
        : '—'}
    </span>
  );

case 'due_date':
  const dueDate = project.due_date ? new Date(project.due_date) : null;
  const isOverdue = dueDate && dueDate < new Date();
  return (
    <span className={isOverdue ? "text-destructive font-medium" : "text-sm"}>
      {dueDate ? dueDate.toLocaleDateString() : '—'}
    </span>
  );
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useColumnPreferences.ts` | Add 5 new column definitions + migration logic for existing users |
| `src/components/jobs/JobsTableView.tsx` | Add rendering logic for 5 new column types |

---

## What This Adds

After implementation:
- **Area column**: Shows client's location/suburb
- **Advance column**: Shows payments received (green when paid)
- **Balance column**: Shows outstanding amount (amber when balance due)
- **Start Date column**: Shows project start date
- **Due Date column**: Shows deadline (red if overdue)

---

## Technical Notes

### Migration for Existing Users

Users who have already customized their columns have preferences saved in localStorage. The implementation will:
1. Check if new columns exist in saved preferences
2. If missing, merge new columns with saved preferences
3. Preserve user's existing visibility and order choices

### Column Visibility Defaults

- **Area**: Visible by default
- **Advance**: Visible by default
- **Balance**: Visible by default  
- **Start Date**: Hidden by default (optional detail)
- **Due Date**: Visible by default (important for scheduling)
