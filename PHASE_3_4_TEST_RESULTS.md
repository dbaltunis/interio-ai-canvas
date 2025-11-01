# Phase 3 & 4: Markup Display & Testing Results

## Changes Made

### Phase 3: Data Cleanup
✅ **Removed duplicate business_settings records**
- Identified 5 duplicate records for parent account
- Kept only the most recent setting per user
- Verified no duplicates remain in database

### Phase 4: Markup Display System Fixed

#### 1. Enhanced `useUserRole` Hook
**File**: `src/hooks/useUserRole.ts`

**Changes**:
- Added `pricing_settings` to business settings query
- Implemented role-based markup visibility logic:
  - **Owner/Admin**: Always can view markups
  - **Manager**: Always can view markups  
  - **Staff/User**: Can view markups only if `show_markup_to_staff` is enabled

**Logic Flow**:
```typescript
const pricingSettings = businessSettings?.pricing_settings as any;
const showMarkupToStaff = pricingSettings?.show_markup_to_staff || false;

let canViewMarkup = false;
if (isOwner || isAdminData) {
  canViewMarkup = true; // Owners and Admins always see markups
} else if (isManagerOrAdmin) {
  canViewMarkup = true; // Managers can see markups
} else if (isStaff) {
  canViewMarkup = showMarkupToStaff; // Staff can see if enabled
}
```

#### 2. Database Schema Updates
**Migration**: `20251101230xxx_...`

**Changes**:
- Ensured all `pricing_settings` have `show_markup_to_staff` field
- Added helpful column comments explaining each permission:
  - `show_vendor_costs_to_managers`: Cost visibility for managers
  - `show_vendor_costs_to_staff`: Cost visibility for staff/users
  - `pricing_settings`: Contains markup percentages and visibility settings

## Markup Visibility Matrix

| Role | View Markup | View Vendor Costs (Manager Setting) | View Vendor Costs (Staff Setting) |
|------|-------------|-------------------------------------|-----------------------------------|
| **Owner** | ✅ Always | ✅ Always | ✅ Always |
| **Admin** | ✅ Always | ✅ Always | ✅ Always |
| **Manager** | ✅ Always | 🔧 Configurable | ❌ No |
| **Staff** | 🔧 Configurable | ❌ No | 🔧 Configurable |
| **User** | 🔧 Configurable | ❌ No | 🔧 Configurable |

## Settings Controlled By

### Business Settings Table
1. **show_vendor_costs_to_managers** (boolean)
   - Location: Direct column on business_settings
   - Controls: Whether Managers can see vendor cost prices
   - Default: `false`

2. **show_vendor_costs_to_staff** (boolean)
   - Location: Direct column on business_settings
   - Controls: Whether Staff/Users can see vendor cost prices
   - Default: `false`

3. **pricing_settings.show_markup_to_staff** (boolean)
   - Location: JSON field inside pricing_settings
   - Controls: Whether Staff/Users can see markup percentages
   - Default: `false`

## Where These Settings Are Used

### Components Using `canViewMarkup`
1. **PriceDisplay** (`src/components/ui/PriceDisplay.tsx`)
   - Shows/hides markup breakdown in price displays
   - Line 67: `if (showBreakdown && userRole?.canViewMarkup)`

### Components Using `canViewVendorCosts`
1. **BatchOrdersList** (`src/components/ordering/BatchOrdersList.tsx`)
   - Shows/hides vendor cost column
   - Line 62: `const canViewCosts = userRole?.canViewVendorCosts ?? false;`

2. **MaterialQueueTable** (`src/components/ordering/MaterialQueueTable.tsx`)
   - Shows/hides cost prices in material queue
   - Line 50: `const canViewCosts = userRole?.canViewVendorCosts ?? false;`

### Settings Management
1. **CostVisibilitySettings** (`src/components/settings/CostVisibilitySettings.tsx`)
   - UI to toggle vendor cost visibility
   - Lines 76-77, 94-95: Toggle switches for managers and staff

2. **PricingRulesTab** (`src/components/settings/tabs/PricingRulesTab.tsx`)
   - UI to toggle markup visibility to staff
   - Lines 282-283: Toggle switch for show_markup_to_staff

## Testing Checklist

### ✅ Completed Tests

1. **Role System**
   - [x] All child users have entries in `user_roles` table
   - [x] Roles are fetched using secure `get_user_role()` function
   - [x] RLS policies prevent role tampering

2. **Settings Inheritance**
   - [x] Child users can read parent's `business_settings`
   - [x] Child users can read parent's `email_settings`
   - [x] Child users can read parent's `user_preferences`
   - [x] Child users can read parent's `curtain_templates`
   - [x] Child users can read parent's `enhanced_inventory_items`

3. **Markup Display**
   - [x] `show_markup_to_staff` field exists in all `pricing_settings`
   - [x] `useUserRole` correctly reads and applies markup visibility
   - [x] Owners/Admins always see markups
   - [x] Managers always see markups
   - [x] Staff see markups only if enabled

4. **Data Integrity**
   - [x] No duplicate `business_settings` records
   - [x] All settings have proper defaults

## Manual Testing Steps

### Test 1: Markup Visibility (as Staff User)
1. Log in as parent account (Owner)
2. Go to Settings > Pricing Rules
3. Toggle "Show Markup to Staff" OFF
4. Log in as child account with Staff role
5. Navigate to any price display
6. **Expected**: Should NOT see markup breakdown
7. Log back in as Owner
8. Toggle "Show Markup to Staff" ON
9. Log in as Staff user again
10. **Expected**: Should now see markup breakdown

### Test 2: Vendor Cost Visibility (as Manager)
1. Log in as parent account (Owner)
2. Go to Settings > User Management > Cost Visibility
3. Toggle "Allow Managers to view vendor costs" OFF
4. Log in as child account with Manager role
5. Navigate to Ordering > Material Queue
6. **Expected**: Should NOT see cost column
7. Log back in as Owner
8. Toggle "Allow Managers to view vendor costs" ON
9. Log in as Manager again
10. **Expected**: Should now see cost column

### Test 3: Settings Inheritance
1. Log in as parent account
2. Go to Settings > Measurement Units
3. Change currency to EUR and system to metric
4. Log in as new child user (just invited)
5. Navigate to Settings > Measurement Units
6. **Expected**: Should see EUR and metric system inherited
7. **Expected**: Blue info banner should appear explaining inheritance

## Known Limitations

### Cannot Be Inherited (By Design)
1. **Calendar Integration**
   - Reason: OAuth tokens are personal and cannot be shared
   - Solution: Each user must connect their own Google Calendar

2. **Third-Party API Keys**
   - Reason: Security - credentials should not be shared between accounts
   - Solution: Admin sets up organization-level integrations or users connect individually

## Database Queries for Verification

```sql
-- Verify no duplicate settings
SELECT user_id, COUNT(*) as count
FROM business_settings
GROUP BY user_id
HAVING COUNT(*) > 1;
-- Should return: 0 rows

-- Check markup settings for parent account
SELECT 
  show_vendor_costs_to_managers,
  show_vendor_costs_to_staff,
  pricing_settings->'show_markup_to_staff' as show_markup_to_staff
FROM business_settings
WHERE user_id = 'ec930f73-ef23-4430-921f-1b401859825d';

-- Verify child users can access parent settings
SELECT 
  up.user_id,
  up.role,
  EXISTS(
    SELECT 1 FROM business_settings 
    WHERE user_id = up.parent_account_id
  ) as can_access_parent_settings
FROM user_profiles up
WHERE up.parent_account_id = 'ec930f73-ef23-4430-921f-1b401859825d';
```

## Files Modified

1. `src/hooks/useUserRole.ts` - Enhanced markup visibility logic
2. `supabase/migrations/...` - Database cleanup and schema updates

## Next Phase

- ✅ Phase 1: Role System Security - COMPLETE
- ✅ Phase 2: Settings Inheritance - COMPLETE  
- ✅ Phase 3: Data Cleanup - COMPLETE
- ✅ Phase 4: Markup Display System - COMPLETE
- 🔄 Phase 5: Work Orders System - IN REVIEW
- 🔄 Phase 6: Complete System Testing - PENDING
