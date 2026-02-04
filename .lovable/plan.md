

# Fix Team Members Cannot Save Business Settings

## Problem Identified

When you give a team member (Admin, Staff) access to settings, they can VIEW business details but **cannot SAVE** them. This happens because:

1. The **UPDATE** mutation correctly uses `effectiveOwnerId` (the account owner)
2. The **CREATE** mutation incorrectly uses `user.id` (the team member)

This means:
- If owner already has settings → team member can update ✅
- If owner has no settings yet → team member cannot create ❌

You want to delegate setup to team members, but they get errors when trying to save!

---

## Root Cause

**File:** `src/hooks/useBusinessSettings.ts`

**Line 195 (CREATE):**
```tsx
user_id: user.id,  // ❌ Uses team member's ID
```

**Lines 227-233 (UPDATE):**
```tsx
const { data: profile } = await supabase
  .from("user_profiles")
  .select("parent_account_id")
  .eq("user_id", user.id)
  .maybeSingle();

const effectiveOwnerId = profile?.parent_account_id || user.id;
// ✅ Correctly uses owner's ID
```

---

## Solution

Add the same `effectiveOwnerId` logic to `useCreateBusinessSettings` so team members can create settings on behalf of the account owner.

**Before (broken):**
```tsx
export const useCreateBusinessSettings = () => {
  return useMutation({
    mutationFn: async (settings) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('business_settings')
        .insert({
          ...settings,
          user_id: user.id,  // ❌ WRONG - uses team member's ID
        })
```

**After (fixed):**
```tsx
export const useCreateBusinessSettings = () => {
  return useMutation({
    mutationFn: async (settings) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // ✅ Get effective account owner for multi-tenant support
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("parent_account_id")
        .eq("user_id", user.id)
        .maybeSingle();

      const effectiveOwnerId = profile?.parent_account_id || user.id;

      const { data, error } = await supabase
        .from('business_settings')
        .insert({
          ...settings,
          user_id: effectiveOwnerId,  // ✅ CORRECT - uses owner's ID
        })
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useBusinessSettings.ts` | Add `effectiveOwnerId` lookup to `useCreateBusinessSettings` mutation |

---

## Verification Steps

After fix, test with:
1. Log in as a Staff/Admin team member with settings access
2. Go to Settings → Business Details
3. Try to save company name, address, etc.
4. Verify it saves without errors
5. Log in as the Owner and verify the settings appear correctly

---

## Summary

| Scenario | Before Fix | After Fix |
|----------|------------|-----------|
| Owner saves settings | ✅ Works | ✅ Works |
| Team member updates existing settings | ✅ Works | ✅ Works |
| Team member creates new settings | ❌ **Errors/Fails** | ✅ Works |

This fix enables the workflow you described: giving a team member permission to set up the app on your behalf.

