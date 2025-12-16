# User Management System Documentation

## Overview

The user management system supports multi-tenant account structures with automatic permission inheritance, role-based access control, and seamless invitation workflows.

---

## Quick Setup for New Accounts

### Automatic Initialization
When a new account is created, the system automatically:
- Creates user profile with default role (Owner for new accounts)
- Seeds default permissions based on role
- Initializes account settings:
  - Measurement units: MM (millimeters)
  - Currency: Based on locale
  - Tax settings: Default rates
- Creates number sequences (JOB, QUO, ORD, INV)
- Links to parent account (if invited)

### What New Users Get
| Component | Default |
|-----------|---------|
| Measurement Unit | MM |
| Currency | USD (or locale-based) |
| Tax Rate | 0% |
| Role | Owner (new) / Invited role |
| Permissions | All for Owner / Role-based |

---

## Key Features

### 1. Account Hierarchy
- **Account Owners**: Can invite and manage users in their account
- **Child Accounts**: Inherit settings from parent accounts
- **Automatic Linking**: Users are automatically linked to the correct account structure

### 2. Role-Based Permissions
- **Owner**: Full access to all features and user management
- **Admin**: Most features except some management functions
- **Manager**: Can view and create across all account data
- **Staff**: Limited access to basic functions
- **User**: Basic profile access only

### 3. Automatic Systems

#### Permission Synchronization
- Permissions are automatically synced when roles change
- Missing permissions are automatically added
- Database triggers ensure consistency

#### Settings Inheritance
- Account settings (currency, measurement units) inherit from parent accounts
- Business settings automatically cascade to child users
- No manual configuration needed

#### Invitation System
- Generic invitation acceptance process
- Automatic permission seeding based on role
- Proper account linking for all users

## Database Functions

### Core Functions
1. `accept_user_invitation(token, user_id)` - Handles invitation acceptance
2. `fix_user_permissions_for_role(user_id)` - Ensures user has correct permissions
3. `get_default_permissions_for_role(role)` - Returns permissions for role
4. `get_inherited_account_settings(user_id)` - Gets settings with inheritance
5. `get_inherited_business_settings(user_id)` - Gets business settings with inheritance

### Automatic Triggers
1. `sync_permissions_on_role_change()` - Auto-syncs permissions when role changes
2. `log_permission_change()` - Logs all permission changes for audit

## Frontend Hooks

### Permission Management
- `usePermissions()` - Check user permissions
- `useHasPermission(permission)` - Check specific permission
- `useUserManagement()` - Manage user roles and permissions

### Data Access
- `useClients()` - Respects permission-based filtering
- `useProjects()` - Automatic account-level access
- `useAccountSettings()` - Inheritance from parent accounts
- `useBusinessSettings()` - Inheritance from parent accounts

### User Display
- `useUserDisplay()` - Consistent user display across app
- Handles display names, initials, and avatars consistently

## RLS Policies

### Account-Level Access
```sql
-- Clients and Projects are visible across account structure
(get_account_owner(auth.uid()) = get_account_owner(user_id)) 
AND (has_permission('view_clients') OR has_permission('view_all_clients'))
```

### Permission-Based Filtering
All data access respects both account boundaries and user permissions.

## Adding New Features

### 1. For New Data Tables
1. Add RLS policies following the account pattern
2. Use `get_account_owner()` for account-level access
3. Check appropriate permissions with `has_permission()`

### 2. For New Permissions
1. Add to `ROLE_PERMISSIONS` in `useUserManagement.ts`
2. Update `get_default_permissions_for_role()` function
3. Run permission fix for existing users

### 3. For New Settings
1. Use inheritance pattern in hooks
2. Check parent account settings if user settings don't exist
3. Follow the pattern in `useAccountSettings` and `useBusinessSettings`

## Security Considerations

1. **RLS Policies**: All tables have proper row-level security
2. **Permission Validation**: Database functions validate permissions
3. **Account Isolation**: Users can only access their account's data
4. **Audit Logging**: All permission changes are logged
5. **Automatic Cleanup**: Permissions are kept in sync automatically

---

## New Permissions (December 2025)

### Added Permissions
| Permission | Description | Default Access |
|------------|-------------|----------------|
| `view_messages` | Team communication access | Manager+ |
| `view_markups` | See cost/profit/margins (sensitive) | Manager+ |
| `view_team_performance` | See other users' KPIs (sensitive) | Manager+ |

### Permission Aliases
For backward compatibility, old permission names map to new granular versions:

| Old Permission | Maps To |
|----------------|---------|
| `view_jobs` | `view_all_jobs`, `view_assigned_jobs` |
| `view_clients` | `view_all_clients`, `view_assigned_clients` |
| `view_calendar` | `view_all_calendar`, `view_own_calendar` |
| `view_analytics` | `view_team_performance` |

### Checking Permissions
```typescript
// Old way (still works)
const canViewJobs = useHasPermission('view_jobs');

// New granular way
const canViewAllJobs = useHasPermission('view_all_jobs');
const canViewAssignedJobs = useHasPermission('view_assigned_jobs');
```

---

## Team Member Invitation Flow

### Step 1: Send Invitation
1. Go to **Settings → Team**
2. Click **+ Invite Member**
3. Enter email and select role
4. Click **Send Invitation**

### Step 2: User Accepts
1. User receives email with invitation link
2. Clicks link to create account (or login)
3. System automatically:
   - Links user to parent account
   - Assigns selected role
   - Seeds role-based permissions
   - Inherits account settings

### Step 3: Verify Access
1. New user logs in
2. Sees shared account data (clients, projects)
3. Has permissions based on assigned role

---

## Permission Quick Reference

### By Role

| Permission | Owner | Admin | Manager | Staff |
|------------|-------|-------|---------|-------|
| View all jobs | ✅ | ✅ | ✅ | ❌ |
| View own jobs | ✅ | ✅ | ✅ | ✅ |
| Create jobs | ✅ | ✅ | ✅ | ✅ |
| Delete jobs | ✅ | ✅ | ❌ | ❌ |
| View all clients | ✅ | ✅ | ✅ | ❌ |
| View assigned clients | ✅ | ✅ | ✅ | ✅ |
| View markups | ✅ | ✅ | ✅ | ❌ |
| View team performance | ✅ | ✅ | ✅ | ❌ |
| Manage team | ✅ | ✅ | ❌ | ❌ |
| Manage settings | ✅ | ✅ | ❌ | ❌ |

### Custom Permissions
Override role defaults per user:
1. Settings → Team → [User]
2. Enable **Custom Permissions**
3. Toggle individual permissions
4. Changes apply immediately

---

## Future Maintenance

### When Adding Roles
1. Update `ROLE_PERMISSIONS` constant
2. Update `get_default_permissions_for_role()` function
3. Update frontend `rolePermissions` object
4. Test invitation and permission flows

### When Adding Permissions
1. Add to appropriate roles in all three places above
2. Run the fix function for existing users
3. Update any permission guards in components

### When Debugging Permission Issues
1. Use `fix_user_permissions_for_role(user_id)` to repair permissions
2. Check the permission audit log for changes
3. Verify RLS policies are properly configured
4. Ensure account linking is correct in user_profiles

This system is designed to be self-maintaining and will automatically handle most user management scenarios without manual intervention.