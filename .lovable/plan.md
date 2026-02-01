

# Plan: Remove Admin Button + End-to-End Testing

## Summary

The TWC backfill ran successfully and updated data across all 4 Australian client accounts. Now I'll remove the temporary admin button and verify the calculation fixes are working correctly.

---

## Verified Backfill Results

| Metric | Value |
|--------|-------|
| Accounts processed | 4 |
| Total TWC items | 1,025 |
| Items with color | 152 (14.8%) |
| Items updated | 54 |
| Compatible treatments set | All 1,025 |
| Pricing methods set | All 1,025 |

**Note**: The 873 items without color don't have color data in TWC's source system - this is expected and correct.

---

## Step 1: Remove Admin Tools Button

**File**: `src/components/settings/SettingsView.tsx`

Remove the temporary Admin Tools section (lines 49-72 and 343-376):

- Remove state variables: `isRunningBackfill`, `backfillResult`
- Remove `runTwcBackfill` function
- Remove the Admin Tools Card component

---

## Step 2: Verify Calculations Work End-to-End

After removing the button, I'll run browser automation to test the calculation system is working correctly for your Australian clients:

1. Open the app and navigate to the worksheets/calculator
2. Test fabric cost calculations with TWC products
3. Verify the pricing grid system is working
4. Confirm compatible treatments are filtering correctly

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/settings/SettingsView.tsx` | Remove admin tools section (temporary code) |

---

## Expected Outcome

1. Settings page returns to normal (no admin button)
2. TWC products work correctly in worksheets with:
   - Proper color filtering
   - Correct treatment associations
   - Working pricing calculations

