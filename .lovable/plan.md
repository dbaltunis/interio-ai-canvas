
# Fix Quote Display Breaking - Invalid UUID "0" Error

## Problem Identified
The quote is not displaying because an invalid UUID `"0"` is being passed to database queries.

### Root Cause
In `src/components/jobs/JobDetailPage.tsx` line 1088:
```typescript
<QuotationTab projectId={jobId} quoteId={typeof currentQuotes != 'undefined' && currentQuotes.length > 0 ? currentQuotes[0].id : '0'}/>
```

When `currentQuotes` is empty or undefined, the code passes `'0'` as the `quoteId`. This invalid string then flows to:
1. `QuotationTab` component
2. `useRooms(projectId, quoteId)` hook (line 136)
3. Supabase query: `.eq("quote_id", quoteId)` (useRooms.ts line 27)
4. PostgreSQL throws: "invalid input syntax for type uuid: '0'"

### Database Error Flow
```text
JobDetailPage (quoteId='0')
    ↓
QuotationTab (receives quoteId='0')
    ↓
useRooms(projectId, '0')
    ↓
supabase.from("rooms").eq("quote_id", '0')
    ↓
PostgreSQL Error: invalid input syntax for type uuid
```

## Solution

### File to Modify
`src/components/jobs/JobDetailPage.tsx`

### Change Required
Line 1088 - Replace `'0'` with `undefined`:

**Before:**
```typescript
<QuotationTab projectId={jobId} quoteId={typeof currentQuotes != 'undefined' && currentQuotes.length > 0 ? currentQuotes[0].id : '0'}/>
```

**After:**
```typescript
<QuotationTab projectId={jobId} quoteId={currentQuotes && currentQuotes.length > 0 ? currentQuotes[0].id : undefined}/>
```

This ensures that when there's no quote available, `undefined` is passed instead of `'0'`, which the hooks already handle correctly (they return empty arrays when quoteId is undefined).

## Why This Happened
This appears to be legacy code where someone used `'0'` as a fallback placeholder value, not realizing it would be used in a UUID-type database query. The hooks expect either a valid UUID or `undefined` - not a string like `'0'`.

## Impact
- **Quote display**: Will work again once valid/undefined quoteId is passed
- **Room fetching**: Will correctly return empty array when no quote exists
- **Treatment fetching**: Same fix applies (useTreatments also receives quoteId)
- **No breaking changes**: The hooks already handle undefined gracefully

## Testing After Fix
1. Open any job with treatments - quote should display
2. Create a new job with no quote yet - should show empty state (not error)
3. Add treatments and save - quote should update and display correctly
