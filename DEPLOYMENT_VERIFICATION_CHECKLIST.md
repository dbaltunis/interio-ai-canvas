# Deployment Verification Checklist

## Critical Fixes Implemented

### ✅ Fix #1: Hardcoded EUR Currency Default
**Problem:** `defaultMeasurementUnits` had `currency: 'EUR'` hardcoded  
**Impact:** Users would randomly see EUR when settings failed to load  
**Fix:** Changed default from 'EUR' to 'USD' in `useBusinessSettings.ts` line 69  
**File:** `src/hooks/useBusinessSettings.ts`

### ✅ Fix #2: Hardcoded GBP in Multiple Files
**Files Fixed:**
- `src/hooks/useQuotationSync.ts` - Removed 'GBP' fallbacks
- `src/utils/windowSummaryExtractors.ts` - Removed 'GBP' default
- `src/components/job-creation/CalculationBreakdown.tsx` - Dynamic currency
- `src/hooks/useQuoteItems.ts` - Changed to 'USD' minimal fallback
- `src/components/jobs/tabs/QuotationTab.tsx` - Dynamic currency extraction

### ✅ Fix #3: Data Isolation Breach
**Problem:** Inventory and options leaking between accounts  
**Fix:** Added explicit `.eq("user_id", user.id)` filters  
**Files:**
- `src/hooks/useEnhancedInventory.ts` (lines 112, 137)

### ✅ Fix #4: Quote Auto-Sync Overwriting User Edits
**Problem:** Logo and custom notes being erased  
**Fix:** Protected user-edited fields from auto-sync  
**File:** `src/hooks/useQuotationSync.ts` (line 545-553)

### ✅ Fix #5: Comprehensive Cache Invalidation
**Problem:** Settings changes not propagating to all components  
**Fix:** Added invalidation for all currency-dependent queries  
**File:** `src/hooks/useBusinessSettings.ts` (lines 142-149, 175-182)

---

## Verification Steps

### 1. Currency Consistency Test
- [ ] Login as User A
- [ ] Go to Settings → Personal Settings → Measurement Units
- [ ] Change currency to NZD
- [ ] Verify Dashboard shows NZ$
- [ ] Go to any Job/Project
- [ ] Verify Quote shows NZ$
- [ ] Go to any Document
- [ ] Verify all prices show NZ$
- [ ] Change currency to GBP
- [ ] Verify ALL locations update to £

**Expected Result:** Currency should be consistent EVERYWHERE and update immediately when changed

### 2. Data Isolation Test
- [ ] Login as User A
- [ ] Create inventory item "Test Item A"
- [ ] Create option "Test Option A"
- [ ] Logout
- [ ] Login as User B
- [ ] Check inventory - should NOT see "Test Item A"
- [ ] Check options - should NOT see "Test Option A"
- [ ] Create inventory item "Test Item B"
- [ ] Create option "Test Option B"
- [ ] Logout
- [ ] Login as User A
- [ ] Verify ONLY see "Test Item A" and "Test Option A"
- [ ] Verify do NOT see User B's items

**Expected Result:** Complete data isolation between accounts

### 3. Quote Logo Persistence Test
- [ ] Create a quote
- [ ] Upload company logo
- [ ] Save quote
- [ ] Make a change to window measurements
- [ ] Wait for auto-sync (5 seconds)
- [ ] Verify logo is STILL there
- [ ] Edit quote notes
- [ ] Wait for auto-sync
- [ ] Verify notes are STILL there

**Expected Result:** User-edited fields persist through auto-sync

### 4. Settings Propagation Test
- [ ] Open app in two browser tabs
- [ ] Tab 1: Go to Dashboard
- [ ] Tab 2: Go to Settings
- [ ] Tab 2: Change currency from USD to EUR
- [ ] Tab 2: Save settings
- [ ] Tab 1: Refresh or wait 5 seconds
- [ ] Tab 1: Verify Dashboard now shows EUR

**Expected Result:** Settings changes propagate across all components

### 5. No Fallback Test
- [ ] Configure all settings properly
- [ ] Use app normally for 30 minutes
- [ ] Monitor console for "using defaults" warnings
- [ ] Verify no EUR appears anywhere
- [ ] Verify no GBP appears anywhere
- [ ] Verify only configured currency shows

**Expected Result:** No fallback currencies should appear when settings are configured

---

## Files Changed Summary

### Core Fixes (11 files):
1. `src/hooks/useBusinessSettings.ts` - Default currency + cache invalidation
2. `src/hooks/useQuotationSync.ts` - Remove hardcoded GBP + protect user edits
3. `src/hooks/useEnhancedInventory.ts` - Add user_id filtering
4. `src/utils/windowSummaryExtractors.ts` - Remove hardcoded GBP
5. `src/components/job-creation/CalculationBreakdown.tsx` - Dynamic currency
6. `src/hooks/useQuoteItems.ts` - Remove hardcoded GBP
7. `src/components/jobs/tabs/QuotationTab.tsx` - Dynamic currency

### Documentation (2 files):
8. `CRITICAL_BUGS_FIXED.md` - Detailed fix log
9. `DEPLOYMENT_VERIFICATION_CHECKLIST.md` - This file

---

## Known Issues Still Under Investigation

### Issue #6: Measurement Worksheet Errors
- User reported "SAME measurement worksheet issues/errors I pointed yesterday"
- Need user to clarify specific issues
- Status: AWAITING USER INPUT

### Issue #7: Random Unit Changes
- May be resolved by default currency fix + cache invalidation
- Need to test thoroughly
- Status: TESTING REQUIRED

---

## Rollback Plan (If Needed)

### If Currency Issues Persist:
1. Check browser cache - hard refresh (Cmd/Ctrl + Shift + R)
2. Check localStorage for stale data
3. Verify database has correct measurement_units JSON
4. Check RLS policies are allowing reads
5. Verify `get_user_account_id()` function returns correct values

### If Data Isolation Breach Persists:
1. Run query: `SELECT * FROM treatment_options WHERE account_id IS NULL;`
2. Check if ghost options exist without account_id
3. Verify RLS policies are enabled: `SELECT tablename, policyname FROM pg_policies WHERE tablename='treatment_options';`
4. Test `get_user_account_id()` function directly

### If Quote Logo Keeps Disappearing:
1. Check `useQuotationSync.ts` line 545-553
2. Verify `company_logo_url` is NOT in the update mutation
3. Check if other code is calling updateQuote elsewhere
4. Verify RLS allows partial updates

---

## Testing Completion Sign-off

- [ ] All 5 verification tests completed
- [ ] No regressions found
- [ ] Currency displays consistently
- [ ] Data isolation verified
- [ ] Quote edits persist
- [ ] Settings propagate immediately
- [ ] No fallback currencies appear

**Tester Name:** _________________  
**Date:** _________________  
**Approved for Production:** YES / NO

---

## Production Deployment Steps

1. ✅ All fixes committed
2. ✅ All tests passing
3. [ ] Verification checklist completed
4. [ ] No console errors
5. [ ] Performance check (load times normal)
6. [ ] Deploy to staging
7. [ ] Re-run verification on staging
8. [ ] Deploy to production
9. [ ] Monitor for 24 hours
10. [ ] User acceptance testing

---

## Support Contact

If issues persist after deployment:
1. Check `CRITICAL_BUGS_FIXED.md` for detailed fix information
2. Run database linter: `supabase db lint`
3. Check RLS policies
4. Verify business_settings table has correct data
5. Contact dev team with specific reproduction steps
