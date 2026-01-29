
# Document Numbering System Fix

## Problems Identified

After thorough investigation, I found **three critical issues** with your document numbering system:

### Issue 1: Duplicate Job Numbers (JOB-0202 everywhere)

**Root Cause**: Your job sequence has `next_number = 20251077` but `padding = 3`. PostgreSQL's `LPAD` function with a length shorter than the string **truncates** it:

```
LPAD('20251077', 3, '0') → '202'
```

Every new job gets `JOB-202` because the sequence keeps incrementing (20251077 → 20251078 → 20251079...) but all truncate to `202`.

**Evidence from database**:
- `number_sequences` for job: `next_number = 20251077`, `padding = 3`
- 27 projects all have `job_number = 'JOB-202'`

---

### Issue 2: Invoice Numbers Skipping (001 → 003)

**Root Cause**: The `get_next_sequence_number` function atomically increments the counter **every time it's called**, even if the generated number is never saved.

**The industry standard** (QuickBooks, Xero, FreshBooks):
- Number is **reserved** only when document is **saved/finalized**
- "Draft" documents don't consume sequence numbers
- Discarded documents don't create gaps

**Current behavior**:
1. You create invoice → calls `get_next_sequence_number` → returns `INV-001`, increments to 2
2. You "downgrade" (don't save) → number 001 is lost
3. You create invoice again → calls `get_next_sequence_number` → returns `INV-002`, increments to 3
4. You upgrade again → returns `INV-003`

---

### Issue 3: Corrupted Sequence Numbers

**Root Cause**: At some point, date values (like `20251077` - possibly meant to be 2025-10-77) were incorrectly written to the `next_number` column instead of sequential integers.

**Affected sequences for your account**:
| Type | Current next_number | Should be ~|
|------|---------------------|------------|
| Job | 20,251,077 | ~90 |
| Invoice | 20,251,042 | ~85 |
| Draft | 207 | OK |
| Quote | 10 | OK |
| Order | 88 | OK |

---

## Solution Plan

### Part 1: Fix Database Function (prevent truncation)

Modify `get_next_sequence_number` to handle large numbers correctly:

```sql
-- Use GREATEST to ensure padding is at least the number's length
v_result := v_prefix || LPAD(
  v_current_number::TEXT, 
  GREATEST(v_padding, LENGTH(v_current_number::TEXT)), 
  '0'
);
```

---

### Part 2: Implement Industry-Standard "Reserve on Save" Pattern

**New Approach**:

1. **Preview numbers** - Show what the next number *would be* without consuming it
2. **Reserve on save** - Only increment sequence when document is actually saved
3. **Reuse cancelled numbers** - Track voided/cancelled numbers in a pool table for reuse (optional - regulatory for some industries)

**Files to modify**:
- `supabase/migrations/` - New migration for updated function
- `src/hooks/useProjects.ts` - Generate number on save, not on form load
- `src/hooks/useQuotes.ts` - Same pattern
- `src/components/jobs/EditableDocumentNumber.tsx` - Remove auto-generate on mount

**New database function**: `preview_next_sequence_number` (read-only, no increment)

---

### Part 3: Reset Corrupted Sequences

**One-time data fix** (SQL to run):

```sql
-- Reset job sequence based on actual highest job number used
UPDATE number_sequences 
SET next_number = COALESCE(
  (SELECT MAX(REGEXP_REPLACE(job_number, '[^0-9]', '', 'g')::INTEGER) + 1 
   FROM projects 
   WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
   AND job_number ~ '^[A-Z]+-[0-9]+$'),
  1
)
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' 
AND entity_type = 'job';

-- Same for invoice
UPDATE number_sequences 
SET next_number = COALESCE(
  (SELECT MAX(REGEXP_REPLACE(invoice_number, '[^0-9]', '', 'g')::INTEGER) + 1 
   FROM quotes 
   WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
   AND invoice_number ~ '^[A-Z]+-[0-9]+$'),
  1
)
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' 
AND entity_type = 'invoice';
```

---

### Part 4: Display Fix (remove truncation formatting)

The `formatJobNumber` function in `src/lib/format-job-number.ts` truncates to last 4 digits. This hides issues but also hides real numbers.

**Options**:
1. **Keep full number visible** - Show `JOB-20251077` as-is
2. **Smart truncation** - Only truncate if > 8 digits, showing first 2 + last 4

I recommend **showing full numbers** for clarity and trust.

---

## Implementation Order

1. **Fix the function** - Prevent LPAD truncation (migration)
2. **Reset corrupted data** - One-time SQL fix via Cloud View
3. **Update display** - Show full job numbers
4. **Implement reserve-on-save** - Industry standard pattern
5. **Add preview capability** - Show next number without consuming

---

## Industry Standard Comparison

| Feature | QuickBooks | Xero | Current App | After Fix |
|---------|------------|------|-------------|-----------|
| Sequential numbers | Yes | Yes | No (gaps) | Yes |
| Reserve on save only | Yes | Yes | No | Yes |
| Preview next number | Yes | Yes | No | Yes |
| Never skip/duplicate | Yes | Yes | No | Yes |
| Allow manual override | Yes | Yes | Yes | Yes |
| Sync after manual entry | Yes | Yes | Partial | Yes |

---

## Files to Create/Modify

| File | Change |
|------|--------|
| `supabase/migrations/[new].sql` | Fix LPAD truncation, add preview function |
| `src/lib/format-job-number.ts` | Remove/update truncation logic |
| `src/hooks/useProjects.ts` | Move number generation to save time |
| `src/hooks/useQuotes.ts` | Same pattern |
| `src/components/jobs/EditableDocumentNumber.tsx` | Preview number instead of consuming |
| `src/hooks/useNumberSequences.ts` | Add `previewNextNumber` function |
