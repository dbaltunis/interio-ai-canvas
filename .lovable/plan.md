

# Automated Sequence Corruption Fix for ALL Users

## Current State Analysis

I found **3 corrupted sequences** in your database affecting **multiple accounts**:

| User | Entity Type | Current next_number | Problem |
|------|-------------|---------------------|---------|
| `708d8e36...` (your account) | job | 20,251,077 | Date-like value causing truncation |
| `708d8e36...` (your account) | invoice | 20,251,042 | Date-like value causing truncation |
| `ec930f73...` | draft | 631,695 | Abnormally high value |

### Impact on Real Data

27 projects across multiple users have `JOB-202` as their job number:
- User `2641d922...`: **24 duplicates**
- User `f04d68cb...`: 1 duplicate
- User `643b724f...`: 1 duplicate
- User `982ae33e...`: 1 duplicate

---

## Solution: Automated Migration

I will create a database migration that:

1. **Detects** all corrupted sequences (where `next_number > 100000` - unrealistically high)
2. **Calculates** the correct `next_number` based on actual data used
3. **Resets** sequences to proper sequential values
4. **Fixes** padding to a sensible minimum (4 digits)

### Migration Logic

```sql
-- For each corrupted sequence, find the highest actual number used
-- and set next_number = max_used + 1

-- Example for job sequences:
UPDATE number_sequences ns
SET 
  next_number = COALESCE(
    (SELECT MAX(
      CASE 
        WHEN p.job_number ~ '^[A-Z]+-[0-9]+$' 
        THEN REGEXP_REPLACE(p.job_number, '[^0-9]', '', 'g')::INTEGER 
        ELSE 0 
      END
    ) + 1
    FROM projects p 
    WHERE p.user_id = ns.user_id),
    1
  ),
  padding = GREATEST(ns.padding, 4)  -- Ensure at least 4-digit padding
WHERE ns.next_number > 100000  -- Only fix corrupted sequences
  AND ns.entity_type = 'job';
```

---

## What This Fixes

### Before Migration

| User | Entity | next_number | New jobs get |
|------|--------|-------------|--------------|
| `708d8e36...` | job | 20,251,077 | `JOB-202` (truncated!) |
| `708d8e36...` | invoice | 20,251,042 | `INV-20251042` (8 padding) |

### After Migration

| User | Entity | next_number | New jobs get |
|------|--------|-------------|--------------|
| `708d8e36...` | job | 85 | `JOB-0085` (correct!) |
| `708d8e36...` | invoice | 1 | `INV-0001` (reset, no invoices found) |

---

## Files to Modify

| File | Action |
|------|--------|
| `supabase/migrations/[new].sql` | Create automated fix for all corrupted sequences |

---

## Migration Safety

The migration is **safe** because:

1. **Only affects corrupted data** - WHERE clause limits to `next_number > 100000`
2. **Preserves user prefixes** - Doesn't change custom prefixes users have set
3. **Uses actual data** - Calculates based on real max numbers in use
4. **Falls back safely** - If no documents exist, resets to 1
5. **Increases padding** - Ensures at least 4 digits to prevent future truncation

---

## Scope: All Entity Types

The migration will fix corrupted sequences for:
- `job` → Based on `projects.job_number`
- `invoice` → Based on `quotes.invoice_number`
- `quote` → Based on `quotes.quote_number`
- `draft` → Based on `quotes.quote_number` (drafts)
- `order` → Based on `quotes.order_number`

Each entity type gets its own calculation based on the appropriate source table.

