# Phase 2: Settings Inheritance Test Report

**Test Date:** 2025-11-02  
**Status:** ⚠️ ISSUES FOUND - REQUIRES FIXES

---

## 🔍 Executive Summary

Settings inheritance is **partially working** but has critical gaps:

- ✅ **Security Infrastructure**: RLS policies and functions exist
- ✅ **Frontend Hooks**: Inheritance logic implemented in hooks
- ⚠️ **Data State**: Only 1 of 2 parent accounts has settings configured
- ❌ **Child Accounts**: 5 child users have NO settings (inheriting correctly via hooks)
- ⚠️ **Cost Visibility**: Settings exist but markup display not yet implemented in UI

---

## 📊 Current Database State

### Account Structure
```
Total Users: 9
├── Parent Accounts: 4
│   ├── 2 Owners (1 with settings, 1 without)
│   └── 2 Staff (standalone, no team)
└── Child Accounts: 5 (all under Owner ec930f73)
    ├── 4 Admins (team members)
    └── 1 Staff (team member)
```

### Business Settings Analysis

| User ID | Role | Account Type | Has Own Settings | Parent Account | Measurement Units | Cost Visibility |
|---------|------|--------------|------------------|----------------|-------------------|-----------------|
| `ec930f73...` | Owner | PARENT | ✅ YES | - | metric/GBP | managers:false, staff:false |
| `1ae8503a...` | Owner | PARENT | ❌ NO | - | - | - |
| `40967b56...` | Staff | PARENT | ❌ NO | - | - | - |
| `7ba0003a...` | Staff | PARENT | ❌ NO | - | - | - |
| `2a842cd3...` | Admin | CHILD | ❌ NO (inherit) | `ec930f73...` | - | - |
| `4cd6cae9...` | Admin | CHILD | ❌ NO (inherit) | `ec930f73...` | - | - |
| `59ca604b...` | Admin | CHILD | ❌ NO (inherit) | `ec930f73...` | - | - |
| `de33894d...` | Admin | CHILD | ❌ NO (inherit) | `ec930f73...` | - | - |
| `5b090e31...` | Staff | CHILD | ❌ NO (inherit) | `ec930f73...` | - | - |

**Key Finding:** Child accounts correctly don't have their own settings (designed to inherit).

---

## ✅ What's Working

### 1. Database Functions ✅
- `get_account_owner()` - Returns correct parent account ID
- `get_user_role()` - Securely fetches roles from user_roles table
- `has_role()` - Role checking function exists
- `is_admin()` - Admin status checking

### 2. RLS Policies ✅
Business settings table has 7 policies:
- ✅ "Account users can view business settings" - uses `get_account_owner()`
- ✅ "Child users can view parent business settings" - uses `get_account_owner()`
- ✅ "Users can view business settings" - direct access
- ✅ "Users can create business settings" - with admin check
- ✅ "Users can update business settings" - with admin check
- ✅ "Users can delete business settings" - with admin check
- ✅ "read business_settings" - admin/owner role check

### 3. Frontend Hooks ✅
**`useBusinessSettings` (lines 68-112):**
```typescript
// Correctly implements inheritance:
1. First tries to get user's own settings
2. If not found, calls get_account_owner()
3. Fetches parent account's settings
4. Returns inherited settings
```

**`useAccountSettings` (lines 17-54):**
```typescript
// Also implements inheritance:
1. Checks account_owner_id for own settings
2. Falls back to parent_account_id from user_profiles
3. Returns parent settings if own settings not found
```

---

## ⚠️ Issues Found

### ISSUE #1: Inconsistent Settings Coverage 🔴

**Problem:** Only 1 of 9 users has business settings configured.

**Impact:**
- 8 users will get `null` from `useBusinessSettings()`
- Default measurement units used (from code defaults)
- No currency/units configured for most users

**Root Cause:** New accounts don't auto-create default settings

**Recommendation:** Create default business settings for all parent accounts

---

### ISSUE #2: Cost Visibility Settings Not Applied in UI 🟡

**Problem:** Settings exist (`show_vendor_costs_to_managers`, `show_vendor_costs_to_staff`) but:
- ❌ No UI components check these settings
- ❌ Vendor costs still visible to all roles
- ❌ Markup percentage not displayed anywhere

**Current State:**
- Settings in database: ✅ Exist
- `useUserRole` hook: ✅ Returns `canViewVendorCosts` and `canViewMarkup`
- UI implementation: ❌ Not enforced

**Affected Pages:**
- Inventory management (shows costs to everyone)
- Quote generation (doesn't show markup %)
- Job cards (no profit margin display)
- Product templates (vendor costs visible)

---

### ISSUE #3: Measurement Units Not Propagating 🟡

**Problem:** Only 1 account has measurement units set (metric/GBP)

**Expected Behavior:**
- All 5 child accounts should inherit metric/GBP from parent
- Standalone users need their own defaults

**Current Behavior:**
- `useBusinessSettings()` will return parent's units for children ✅
- But parent (ec930f73) is the ONLY one with units set
- Other 3 standalone accounts have no units configured

**Test Needed:**
1. Login as child user (Admin under ec930f73)
2. Verify they see metric/GBP units
3. Create a project and check measurement display

---

### ISSUE #4: No Settings Inheritance UI Indicator 🟡

**Problem:** Users don't know if they're using inherited vs custom settings

**Current Implementation:**
- `SettingsInheritanceInfo` component exists ✅
- But only used in specific places
- No visual indication on settings pages

**Recommendation:**
- Add inheritance indicator to all settings pages
- Show "Using organization settings" badge
- Option to "Create custom settings" for team members

---

## 🧪 Testing Checklist

### Test 1: Currency & Measurement Units Inheritance
- [ ] Login as child user (Admin - `2a842cd3...`)
- [ ] Navigate to Settings > Business
- [ ] Verify units show as metric/cm/GBP (inherited)
- [ ] Create a new project
- [ ] Add measurements - verify they use inherited units
- [ ] Check if currency displays correctly in quotes

### Test 2: Cost Visibility Settings
- [ ] Login as Owner (`ec930f73...`)
- [ ] Go to Settings > Markup & Tax
- [ ] Toggle "Show vendor costs to managers" ON
- [ ] Toggle "Show vendor costs to staff" OFF
- [ ] Save settings
- [ ] Login as Admin (Manager role)
- [ ] Verify vendor costs ARE visible in inventory
- [ ] Login as Staff
- [ ] Verify vendor costs ARE NOT visible

### Test 3: Settings Inheritance Flow
- [ ] Login as child user (Admin)
- [ ] Check if settings page shows inheritance indicator
- [ ] Verify they CANNOT edit inherited settings
- [ ] Test "Create custom settings" option (if available)
- [ ] Verify creating custom settings overrides inheritance

### Test 4: Permission Propagation
- [ ] Login as Owner
- [ ] Change Admin role to Staff
- [ ] Verify permissions update immediately
- [ ] Check if cost visibility changes
- [ ] Verify role shows correctly in team list

---

## 🔧 Recommended Fixes (Priority Order)

### Priority 1: Create Default Settings for All Accounts 🔴
**Estimated Time:** 1 session

Create a migration to:
1. Generate default business_settings for users without them
2. Set sensible defaults (USD, imperial units)
3. Preserve existing settings for Owner `ec930f73...`

### Priority 2: Implement Cost Visibility UI Controls 🔴
**Estimated Time:** 2-3 sessions

Update these components:
1. Inventory tables - hide vendor costs based on `canViewVendorCosts`
2. Quote generation - add markup % display (if `canViewMarkup`)
3. Job cards - show profit margins (if `canViewMarkup`)
4. Product templates - respect cost visibility settings

### Priority 3: Add Settings Inheritance Indicators 🟡
**Estimated Time:** 1 session

1. Add `SettingsInheritanceInfo` to all settings tabs
2. Show "Inherited from Organization" badges
3. Add tooltip explaining inheritance
4. Disable editing of inherited fields (read-only)

### Priority 4: Test Multi-User Scenarios 🟢
**Estimated Time:** 1-2 sessions

1. Test all 9 users with different roles
2. Verify settings inheritance works
3. Test permission boundaries
4. Document any edge cases found

---

## 📈 Success Criteria

Phase 2 will be considered **COMPLETE** when:

- ✅ All parent accounts have business settings configured
- ✅ Child accounts successfully inherit parent settings
- ✅ Cost visibility settings enforced in ALL UI locations
- ✅ Markup % displays correctly based on role permissions
- ✅ Settings inheritance clearly indicated in UI
- ✅ Multi-user testing passes for all 9 users
- ✅ No console errors related to settings/permissions
- ✅ Documentation updated with inheritance patterns

---

## 🚀 Next Steps

**Immediate Actions:**
1. Fix default settings creation (Priority 1)
2. Implement cost visibility UI (Priority 2)
3. Add inheritance indicators (Priority 3)
4. Run comprehensive testing (Priority 4)

**After Phase 2:**
- Move to Phase 3: Markup Display System (full implementation)
- Then Phase 4: Shopify Calculator Integration
- Then Phase 5: Work Orders System

---

## 📝 Notes

- Security infrastructure is solid ✅
- Inheritance logic exists in hooks ✅
- Main gap is UI implementation and default data
- No breaking changes needed
- Can be fixed incrementally without migrations
