# Options Management Testing Guide

## What Was Fixed

### 1. **CRITICAL SECURITY FIX: Data Isolation Breach**
**Problem**: Options from Daniel's account (and other accounts) were appearing in your account  
**Root Cause**: Two overly permissive RLS policies:
- `treatment_options` table: "Admins can manage treatment options" 
- `option_values` table: "Admins can manage option values"

These policies used `is_admin_or_owner()` function that bypassed account isolation, allowing ANY admin/owner to see ALL accounts' data.

**Fix Applied**:
- ✅ Dropped "Admins can manage treatment options" policy (previous fix)
- ✅ Dropped "Admins can manage option values" policy (this fix)
- ✅ Account-scoped policies remain active and enforce proper isolation

**Expected Result**: You should ONLY see YOUR account's options. The "test: aaasdasf" option from Daniel's account should disappear immediately.

---

### 2. **UI/UX Improvements: Prevent Accidental Deletions**
**Problem**: Hide and Delete buttons were overlapping and easy to click by mistake  
**Issues**:
- Tiny icon-only buttons (8x8 pixels)
- Too close together (2px gap)
- Entire row was clickable to edit (competed with action buttons)
- No visual separation between actions

**Fix Applied**:
- ✅ Removed click-to-edit on entire row (prevents accidental edits)
- ✅ Buttons now have text labels: "Edit", "Hide"/"Show", "Delete"
- ✅ Increased spacing between buttons (12px gap)
- ✅ Larger touch targets (36px height, proper padding)
- ✅ Delete button now styled as "destructive" (red) for clear visual warning
- ✅ All buttons have tooltips for clarity

**Expected Result**: Actions are now clearly separated and much harder to trigger accidentally.

---

## How to Test

### **Test 1: Verify Data Isolation (CRITICAL)**

1. **Go to**: Settings → Window Coverings Management → Options tab
2. **Select**: Roller Blinds treatment type
3. **Check each option type** (Roll Direction, Fascia Types, Control Types, etc.)
4. **Verify**: 
   - ❌ "test: aaasdasf" option should NOT appear (it belongs to another account)
   - ✅ Only YOUR created options should appear
   - ✅ System default options should appear (marked with "System Default" badge)

**If you still see "test: aaasdasf" or other unknown options**: 
- Refresh the page (Ctrl+R / Cmd+R)
- Clear browser cache
- Check your account ID matches the option's account_id in database

---

### **Test 2: Verify Options Appear in Templates**

1. **Create a new option**:
   - Go to Settings → Window Coverings → Options
   - Select "Roller Blinds"
   - Select an option type (e.g., "Fascia Types")
   - Click "Add Option"
   - Enter name: "My Test Fascia"
   - Set price: $50.00
   - Click "Create"

2. **Check it appears in template**:
   - Go to Settings → Window Coverings → My Templates
   - Edit your Roller Blind template
   - Go to "Options" tab
   - **Verify**: "My Test Fascia" appears in Fascia Types list
   - **Verify**: Price shows as $50.00

3. **Check it appears in calculator**:
   - Go to create a new job/quote
   - Select Roller Blind treatment
   - **Verify**: "My Test Fascia" appears in options dropdown
   - **Verify**: Price calculates correctly when selected

---

### **Test 3: Verify UI/UX Improvements**

1. **Go to**: Settings → Window Coverings → Options
2. **Select any treatment type** with existing options
3. **Check button layout**:
   - ✅ "Edit" button is clearly labeled (blue outline)
   - ✅ "Hide" button is clearly labeled (gray)
   - ✅ "Delete" button is clearly labeled (red destructive)
   - ✅ Buttons have proper spacing (not cramped)
   - ✅ Clicking anywhere on the row does NOT trigger edit
   - ✅ Only clicking "Edit" button triggers edit

4. **Test actions**:
   - Click "Edit" - should open edit form
   - Click "Hide" - option should become semi-transparent with "Hidden" badge
   - Click "Show" (on hidden option) - should restore visibility
   - Hover over "Delete" - should show tooltip warning

---

### **Test 4: Cross-Account Isolation (If you have multiple accounts)**

If you have access to multiple accounts (e.g., sub-users, team members):

1. **In Account A**: Create a unique option (e.g., "Account A Special Option")
2. **Switch to Account B**
3. **Verify**: "Account A Special Option" does NOT appear in Account B
4. **Create option in Account B** with same name
5. **Switch back to Account A**
6. **Verify**: Only Account A's version appears (not Account B's)

---

## Expected Outcomes

### ✅ **Success Indicators**
- [ ] Only YOUR account's options visible
- [ ] "test: aaasdasf" and other unknown options disappeared
- [ ] New options created in Settings appear immediately in templates
- [ ] New options created in Settings appear in calculator
- [ ] Buttons are clearly labeled and well-spaced
- [ ] Edit only triggers when clicking "Edit" button
- [ ] Delete button looks dangerous (red)
- [ ] System defaults show "System Default" badge and cannot be deleted

### ❌ **Failure Indicators**
- [ ] Still seeing "test: aaasdasf" or other unknown options
- [ ] Options created in Settings don't appear in templates
- [ ] Options created in Settings don't appear in calculator
- [ ] Buttons still overlap or are hard to click
- [ ] Clicking anywhere on row triggers edit

---

## Troubleshooting

### **Problem**: Still seeing other accounts' options after fix
**Solutions**:
1. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache and cookies
3. Log out and log back in
4. Check database directly (if you have access):
   ```sql
   -- Should only show YOUR account_id
   SELECT account_id, key, label, treatment_category 
   FROM treatment_options 
   WHERE treatment_category = 'roller_blinds'
   ```

### **Problem**: Options not appearing in templates/calculator
**Solutions**:
1. Verify option is not hidden (check for "Hidden" badge)
2. Verify option is for correct treatment_category (roller_blinds vs roller_blind)
3. Check template has Options tab configured
4. Refresh template cache: Edit and save template

### **Problem**: Buttons still overlapping or hard to click
**Solutions**:
1. Hard refresh browser to clear cached CSS
2. Check browser zoom level (should be 100%)
3. Try different browser to rule out browser-specific issues
4. Check screen size (mobile vs desktop - buttons adapt to screen size)

---

## Database Verification (For Technical Users)

If you have database access, verify the fixes:

```sql
-- 1. Verify RLS policies are correct
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('treatment_options', 'option_values')
ORDER BY tablename, policyname;

-- Should NOT show "Admins can manage" policies anymore

-- 2. Check your account's options only
SELECT 
  to1.key,
  to1.label,
  to1.treatment_category,
  COUNT(ov.id) as num_values
FROM treatment_options to1
LEFT JOIN option_values ov ON ov.option_id = to1.id
WHERE to1.account_id = (
  SELECT COALESCE(parent_account_id, user_id) 
  FROM user_profiles 
  WHERE user_id = auth.uid()
)
GROUP BY to1.key, to1.label, to1.treatment_category
ORDER BY to1.treatment_category, to1.key;

-- 3. Verify no cross-account data leaks
SELECT DISTINCT account_id, COUNT(*) 
FROM treatment_options 
GROUP BY account_id;

-- Should only show YOUR account_id
```

---

## Questions?

If you encounter issues or have questions about the fixes:
1. **Document exactly what you see** (screenshots help!)
2. **Note which test step failed**
3. **Check browser console for errors** (F12 → Console tab)
4. **Verify your account ID** to ensure you're testing with correct account
