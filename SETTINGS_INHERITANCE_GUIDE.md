# Settings Inheritance System - Implementation Guide

## ✅ What's Fixed

All invited team members (child accounts) now automatically inherit the following settings from the parent organization account:

### 1. **Currency & Measurement Units** ✅ 
- Child users inherit metric/imperial system selection
- All length, area, fabric units inherited
- Currency settings inherited
- **Location**: Settings > Measurement Units tab
- **Visual Indicator**: Blue info banner shows when using inherited settings

### 2. **Company Information** ✅
- Company name, logo, contact details
- Business address, phone, email, website
- Tax settings and ABN
- **Location**: Settings > Business tab
- **Accessed via**: `useBusinessSettings()` hook

### 3. **Product Templates** ✅
- All curtain/blind templates created by parent account
- Custom features and specifications
- Pricing configurations
- **Database**: `curtain_templates` table
- **Access**: Child users can SELECT parent templates via RLS

### 4. **Inventory Items** ✅
- All inventory items (fabrics, hardware, etc.)
- Stock levels and pricing
- Custom categories
- **Database**: `enhanced_inventory_items` table
- **Access**: Child users can SELECT parent inventory via RLS

### 5. **Email Settings** ✅
- From email address and name
- Reply-to email
- Email signature
- **Location**: Settings > Email Settings
- **Accessed via**: `useEmailSettings()` hook

### 6. **User Preferences** ✅
- Timezone, language
- Date/time formats
- **Database**: `user_preferences` table
- **Accessed via**: `useUserPreferences()` hook

## 🔐 Database Security (RLS Policies)

The following RLS policies enable secure settings inheritance:

```sql
-- User Preferences
"Child users can view parent preferences"
USING (auth.uid() = user_id OR get_account_owner(auth.uid()) = user_id)

-- Business Settings  
"Child users can view parent business settings"
USING (get_account_owner(auth.uid()) = user_id)

-- Email Settings
"Users can view account email settings"  
USING (get_account_owner(auth.uid()) = get_account_owner(user_id))

-- Product Templates
"Child users can view parent templates"
USING (user_id = auth.uid() OR get_account_owner(auth.uid()) = user_id OR is_system_default = true)

-- Inventory Items
"Child users can view parent inventory"
USING (user_id = auth.uid() OR get_account_owner(auth.uid()) = user_id)
```

## ⚙️ How It Works

1. **Frontend Hooks**: Each hook first tries to fetch the user's own settings
2. **Fallback Logic**: If not found, calls `get_account_owner()` RPC to get parent account ID
3. **RLS Validation**: Database RLS policies verify the user can access parent's data
4. **Seamless Inheritance**: Child user sees parent's data as if it were their own

## 🚫 What Cannot Be Inherited (Requires Individual Setup)

### 1. **Calendar Integration** ❌ Cannot Inherit
- **Why**: OAuth tokens are personal and tied to individual Google accounts
- **Solution**: Each team member must connect their own Google Calendar
- **Location**: Settings > Integrations > Google Calendar
- **Action Required**: Click "Connect Google Calendar" for each user

### 2. **Third-Party Integrations** ❌ Cannot Inherit
- SendGrid API keys (if using personal accounts)
- Zoom/Teams meeting credentials  
- Custom API integrations
- **Why**: Security - API credentials should not be shared
- **Solution**: Admin sets up organization-level integrations or users connect their own

## 📋 Admin Checklist

When inviting new team members, ensure you have configured:

- ✅ Business Settings (company info, units)
- ✅ Email Settings (from address, signature)
- ✅ Product Templates (all curtain/blind types)
- ✅ Inventory Items (fabrics, hardware)
- ✅ User Permissions (what they can access)

Team members will automatically inherit all these settings.

## 🎨 UI Indicators

### Settings Inheritance Info Component
```tsx
<SettingsInheritanceInfo 
  settingsType="measurement units" 
  isInheriting={true}
/>
```

Shows blue info banner when:
- User is a team member (has parent_account_id)
- Currently viewing inherited settings
- Explains that changes will create custom settings

### User Management Tab
New alert added to explain inheritance system to admins.

## 🔧 Technical Implementation

### Key Files Updated:
- `src/hooks/useUserPreferences.ts` - Added inheritance logic
- `src/hooks/useBusinessSettings.ts` - Already had inheritance
- `src/hooks/useEmailSettings.ts` - Already had inheritance
- `src/hooks/useEnhancedEmailSettings.ts` - Fixed inheritance detection
- `src/components/settings/SettingsInheritanceInfo.tsx` - New component
- `src/components/settings/tabs/MeasurementUnitsTab.tsx` - Added indicator
- `src/components/settings/tabs/UserManagementTab.tsx` - Added explanation

### Database Migrations:
- `20251101225409_...` - User roles system (Phase 1)
- `20251101230xxx_...` - Settings inheritance RLS policies (Phase 2)

## 🧪 Testing Inheritance

To verify inheritance is working:

1. Log in as parent account
2. Set business settings, units, email settings
3. Create product templates and inventory
4. Invite a new team member
5. Log in as team member
6. Verify all settings are visible
7. Check blue info banner appears on settings pages

## 📊 Verification Query

```sql
-- Verify child can access parent's data
SELECT 
  'business_settings' as type,
  EXISTS (SELECT 1 FROM business_settings WHERE user_id = 'parent_id') as accessible
UNION ALL
SELECT 'email_settings', EXISTS (...)
-- ... etc
```

## 🎯 Next Steps

- ✅ Phase 1: Role System Security - COMPLETE
- ✅ Phase 2: Settings Inheritance - COMPLETE
- 🔄 Phase 3: Shopify Product Calculators
- 🔄 Phase 4: Markup Display System  
- 🔄 Phase 5: Work Orders System
- 🔄 Phase 6: Complete Testing

## 🐛 Troubleshooting

**Issue**: Team member not seeing parent's settings
- Check: User has `parent_account_id` set correctly in `user_profiles`
- Check: RLS policies are enabled on tables
- Check: `get_account_owner()` function returns correct parent ID

**Issue**: Settings showing wrong currency/units
- Solution: Refresh page after invitation accepted
- Check: `useUserPreferences` hook is being used
- Check: `useBusinessSettings` hook is being used

**Issue**: "Cannot connect calendar"
- Expected: Each user must connect their own Google Calendar
- Not a bug: OAuth tokens cannot be shared for security reasons
