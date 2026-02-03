

## Fix Account Health Dashboard - Edge Functions Failing

### Root Cause Identified

The Account Health Dashboard is not working because the edge functions are trying to query a column `is_system_owner` that **does not exist** in the `user_profiles` table.

**Database Schema Analysis:**
- The `user_profiles` table has a `role` column (values: 'Owner', 'System Owner', 'Admin', 'Staff', etc.)
- There is **no** `is_system_owner` boolean column
- The edge functions query for `is_system_owner, role` which causes a SQL error
- The SQL error is caught and returned as 403 "Access denied"

**Current State:**
| Account Type | Count |
|--------------|-------|
| Owner | 14 |
| Admin | 9 |
| Staff | 7 |
| Dealer | 2 |
| System Owner | 1 (Darius B.) |

---

### Solution: Fix Edge Functions

Update both edge functions to only check the `role` column (which exists and works correctly):

**Files to modify:**
1. `supabase/functions/get-account-health/index.ts`
2. `supabase/functions/saas-consistency-audit/index.ts`

---

### Technical Changes

#### 1. get-account-health/index.ts

**Before (lines 71-82):**
```typescript
const { data: userProfile, error: profileError } = await supabaseAdmin
  .from('user_profiles')
  .select('is_system_owner, role')  // ❌ is_system_owner doesn't exist
  .eq('user_id', user.id)
  .single();

if (profileError || (!userProfile?.is_system_owner && userProfile?.role !== 'System Owner')) {
```

**After:**
```typescript
const { data: userProfile, error: profileError } = await supabaseAdmin
  .from('user_profiles')
  .select('role')  // ✅ Only select role
  .eq('user_id', user.id)
  .single();

if (profileError || userProfile?.role !== 'System Owner') {
```

#### 2. saas-consistency-audit/index.ts

**Before (lines 124-130):**
```typescript
const { data: userProfile } = await supabaseAdmin
  .from('user_profiles')
  .select('is_system_owner, role')  // ❌ is_system_owner doesn't exist
  .eq('user_id', user.id)
  .single();

if (!userProfile?.is_system_owner && userProfile?.role !== 'System Owner') {
```

**After:**
```typescript
const { data: userProfile, error: profileError } = await supabaseAdmin
  .from('user_profiles')
  .select('role')  // ✅ Only select role
  .eq('user_id', user.id)
  .single();

if (profileError || userProfile?.role !== 'System Owner') {
```

---

### Additional Enhancement: Show All Account Types

The current `get-account-health` function only fetches accounts with `role = 'Owner'`. We should include 'System Owner' accounts as well.

**Current (line 90):**
```typescript
.eq('role', 'Owner')
```

**After:**
```typescript
.in('role', ['Owner', 'System Owner'])
```

This matches the `saas-consistency-audit` function which already uses `.in('role', ['Owner', 'System Owner'])`.

---

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/get-account-health/index.ts` | Remove `is_system_owner` from SELECT, fix role check, include System Owner accounts |
| `supabase/functions/saas-consistency-audit/index.ts` | Remove `is_system_owner` from SELECT, fix role check |

---

### Expected Outcome

After implementation:
- Account Health Dashboard will load correctly with all 15 Owner/System Owner accounts
- "Run Full Audit" button will work and return comprehensive audit data
- Health scores, permissions, settings, and subscription status will display correctly
- The user (Darius B. - System Owner) will have full access to the dashboard

---

### Account Health Summary (Expected After Fix)

Based on database analysis, here's what the dashboard should show:

| Account | Permission Count | Business Settings | Subscription |
|---------|-----------------|-------------------|--------------|
| InterioApp DEMO | 64/77 | ✅ | ✅ |
| CHRISTOS FOUNDOULIS | 77/77 | ❌ | ❌ |
| InterioApp support | 77/77 | ✅ | ✅ |
| Homekaara | 77/77 | ✅ | ✅ |
| Interioapp Admin | 77/77 | ✅ | ❌ |
| Darius B. (System Owner) | 77/77 | ✅ | ❌ |
| ... and 9 more accounts |

