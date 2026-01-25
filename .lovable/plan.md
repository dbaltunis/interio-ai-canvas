

# Rename "Deal Value" to "Lifetime Value" & Calculate Sum of All Projects

## Overview
This plan implements your request to:
1. **Keep the "Stage" column as-is** - it displays the client's CRM relationship stage from your customizable settings
2. **Rename "Deal Value" to "Lifetime Value"** - clearer terminology for client relationship tracking
3. **Sum ALL project totals** for the lifetime value - not just closed projects

---

## Changes Summary

| File | Change |
|------|--------|
| `src/components/clients/ClientListView.tsx` | Rename column header from "Deal Value" to "Lifetime Value", update display logic |
| `src/hooks/useClientJobs.ts` | Change calculation to sum ALL projects instead of only closed/completed |

---

## Detailed Changes

### 1. Update Column Header (ClientListView.tsx)

**Line 278:** Change header text
```tsx
// Before
<TableHead className="font-normal">Deal Value</TableHead>

// After
<TableHead className="font-normal">Lifetime Value</TableHead>
```

### 2. Update Display Logic (ClientListView.tsx)

**Lines 362-377:** Simplify to prioritize lifetime value from projects

```tsx
// Before: Shows deal_value first, then totalValue as fallback
{(client.deal_value && client.deal_value > 0) ? (
  <div className="font-semibold text-foreground">
    {formatCurrency(client.deal_value)}
  </div>
) : (client.totalValue && client.totalValue > 0) ? (
  <div className="text-muted-foreground text-sm">
    {formatCurrency(client.totalValue)}
    <span className="text-xs block text-muted-foreground/70">(from projects)</span>
  </div>
) : (
  <div className="text-muted-foreground/60 text-sm">—</div>
)}

// After: Calculate combined lifetime value (projects + deal_value)
{(() => {
  const lifetimeValue = (client.totalValue || 0) + (client.deal_value || 0);
  return lifetimeValue > 0 ? (
    <div className="font-semibold text-foreground">
      {formatCurrency(lifetimeValue)}
    </div>
  ) : (
    <div className="text-muted-foreground/60 text-sm">—</div>
  );
})()}
```

### 3. Update Calculation Logic (useClientJobs.ts)

**Lines 40-64:** Remove the closed/completed filter to include ALL projects

```typescript
// Before: Only sums closed/completed projects
const closedProjects = (client.projects || []).filter(p => 
  ['closed', 'completed'].includes(p.status?.toLowerCase() || '')
);
const totalValue = closedProjects.reduce((sum, project) => { ... });

// After: Sum ALL projects for true lifetime value
const allProjects = client.projects || [];
const totalValue = allProjects.reduce((sum, project) => {
  const projectQuotes = project.quotes || [];
  if (projectQuotes.length > 0) {
    // Sum all quotes for the project (or take the highest/most recent)
    const projectTotal = projectQuotes.reduce((qSum, quote) => 
      qSum + parseFloat(quote.total_amount?.toString() || '0'), 0
    );
    return sum + projectTotal;
  }
  return sum;
}, 0);
```

---

## Result

After implementation:

| Scenario | Before | After |
|----------|--------|-------|
| Client with 2 projects (£5k + £10k) | Shows only if both closed | Shows £15,000 as Lifetime Value |
| Client with 1 closed, 1 active project | Shows only closed project value | Shows combined value of all projects |
| Column header | "Deal Value" | "Lifetime Value" |
| Client with £15k lost quote | Hidden (not closed) | Included in Lifetime Value |

---

## Technical Notes

- The `deal_value` field on the client record will be **added to** the project totals, giving a true lifetime value that includes both tracked projects AND any manually entered expected values
- This matches your CEO scenario: you'll see the total relationship value across ALL interactions, not just closed deals
- The "Stage" column remains tied to `client.funnel_stage` from your dynamic settings, representing the current CRM relationship status

