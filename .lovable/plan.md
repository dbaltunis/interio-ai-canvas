
# Critical Investigation Report: Systemic Account Creation Failures

## Executive Summary

After deep investigation, I've identified **5 critical issues** that are breaking new accounts and affecting existing accounts. These are systemic bugs, not isolated incidents.

---

## Issue 1: Missing User Profiles (ROOT CAUSE)

### Finding
**34 out of 70 users (48%) are missing `user_profiles` rows!**

| Metric | Value |
|--------|-------|
| Total auth.users | 70 |
| Total user_profiles | 36 |
| Missing profiles | 34 |

### Root Cause
The `handle_new_user` database trigger has a silent failure mode. When it encounters ANY error, it:
1. Logs the error with `RAISE LOG`
2. Returns `NEW` anyway (allowing auth user creation to succeed)
3. **Does NOT create the profile**

The trigger's `EXCEPTION WHEN OTHERS` block masks the failure:
```sql
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user error for %: %', NEW.id, SQLERRM;
    RETURN NEW;  -- Silently continues even if profile creation failed!
END;
```

### Impact on LaEla Account (baltunis+laela)
- **Auth user created**: Yes (Feb 4, 15:55)
- **user_roles created**: Yes (`Owner` role exists)
- **user_permissions created**: Yes (64 permissions)
- **business_settings created**: Yes (company: LaEla)
- **user_profiles created**: **NO - MISSING**

### Technical Fix Required
1. **Database migration** to fix the trigger to properly raise exceptions
2. **One-time repair script** to create missing profiles for all 34 affected users
3. **Edge function update** to `create-admin-account` to verify profile creation succeeded

---

## Issue 2: Settings Access Blocked

### Finding
The Settings page uses `useUserRole()` which queries `user_profiles` to get `parent_account_id`. When the profile is missing:
- `profile` is null
- `isOwner` check passes (from `user_roles` table)
- BUT the frontend logic in `Settings.tsx` still blocks access

### Code Path
```tsx
// Settings.tsx line 23-24
const { data: userRoleData, isLoading: roleLoading } = useUserRole();
const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;

// Line 58-62 - Permission check that can fail
const canViewSettings = userRoleData?.isSystemOwner
  ? true
  : (isOwner || isAdmin)
      ? !hasAnyExplicitPermissions || hasViewSettingsPermission
      : hasViewSettingsPermission;
```

The problem: `hasAnyExplicitPermissions` is `true` (64 permissions exist), so it checks `hasViewSettingsPermission` which requires querying `user_permissions`. But when the profile is missing, the RLS policies may block these queries silently.

### Technical Fix Required
Add defensive fallback: If user has `Owner` role in `user_roles` table BUT no profile exists, grant settings access.

---

## Issue 3: Library Crashes (ErrorBoundary)

### Finding
The Library page uses `useEffectiveAccountOwner()` hook which:
1. Queries `user_profiles` for `parent_account_id`
2. Uses `.single()` which throws on no results
3. Has error handling, but downstream hooks may still fail

### Code Path
```tsx
// useEffectiveAccountOwner.ts line 21-30
const { data: profile, error } = await supabase
  .from("user_profiles")
  .select("parent_account_id")
  .eq("user_id", user.id)
  .single();  // This throws PGRST116 when no row found

if (error) {
  console.warn('...');
  return { effectiveOwnerId: user.id, currentUserId: user.id };  // Fallback exists
}
```

The fallback DOES exist, but the error is still logged and may cause issues in components that expect the profile to exist.

### Technical Fix Required
1. Change `.single()` to `.maybeSingle()` for graceful handling
2. Add explicit empty state in `ModernInventoryDashboard` for new users

---

## Issue 4: WhatsApp "Ready" Badge is Hardcoded

### Finding
The WhatsApp status shows "Ready" even when no Twilio is configured.

### Code Location
`src/components/jobs/email/EmailSettings.tsx` lines 326-329:
```tsx
<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
  <Check className="h-3 w-3 mr-1" />
  Ready
</Badge>
```

The `hasCustomTwilio` variable exists (line 314) but is NOT used for the badge.

### Technical Fix Required
Make badge conditional on `hasCustomTwilio`:
```tsx
<Badge variant="outline" className={hasCustomTwilio ? "bg-green-50..." : "bg-amber-50..."}>
  {hasCustomTwilio ? (
    <><Check className="h-3 w-3 mr-1" />Ready</>
  ) : (
    <><AlertCircle className="h-3 w-3 mr-1" />Sandbox Mode</>
  )}
</Badge>
```

---

## Issue 5: No Welcome/Onboarding Experience

### Finding
New users get no guidance when they first log in. No welcome message, no tooltips, no "?" help buttons on pages.

### Technical Fix Required (Phase 2)
1. Create `NewUserWelcome` component with mobile-first design
2. Add `SectionHelpButton` to all major page headers
3. Implement persistent help tooltips for key actions

---

## Repair Plan

### Step 1: Immediate Database Repair (P0)
Create migration to:
1. Create missing `user_profiles` for all 34 affected users
2. Update the `handle_new_user` trigger to NOT silently fail

```sql
-- Repair missing profiles from user_roles + business_settings data
INSERT INTO user_profiles (user_id, display_name, role, parent_account_id, is_active, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)),
  COALESCE(ur.role::text, 'Owner'),
  NULL,
  true,
  au.created_at,
  now()
FROM auth.users au
LEFT JOIN user_profiles up ON up.user_id = au.id
LEFT JOIN user_roles ur ON ur.user_id = au.id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
```

### Step 2: Code Fixes (P0)
1. **Settings.tsx**: Add defensive owner check
2. **useEffectiveAccountOwner.ts**: Change `.single()` to `.maybeSingle()`
3. **EmailSettings.tsx**: Fix WhatsApp badge to use `hasCustomTwilio`

### Step 3: Trigger Fix (P0)
Update `handle_new_user` to:
1. Use explicit error handling per-step
2. Log detailed errors for debugging
3. Consider NOT swallowing exceptions for profile creation

---

## Files to Modify

| Priority | File/Resource | Change |
|----------|---------------|--------|
| P0 | Database Migration | Repair 34 missing profiles + fix trigger |
| P0 | `src/pages/Settings.tsx` | Add defensive owner check |
| P0 | `src/hooks/useEffectiveAccountOwner.ts` | Change `.single()` to `.maybeSingle()` |
| P0 | `src/components/jobs/email/EmailSettings.tsx` | Fix WhatsApp badge |
| P1 | `src/components/inventory/ModernInventoryDashboard.tsx` | Add empty state for new users |
| P2 | New `NewUserWelcome` component | Welcome experience |

---

## Why This Keeps Happening

The root issue is that the app has grown complex with many database triggers, RLS policies, and cascading effects. When the `handle_new_user` trigger silently fails:
1. Auth user is created (user can log in)
2. Some seeding succeeds (roles, permissions, business_settings)
3. Profile creation fails silently
4. All frontend code expecting a profile breaks

This is a **systemic architecture issue** - silent failures are masking critical problems. The fix requires both:
1. **Immediate repair** of existing broken accounts
2. **Long-term fix** to prevent silent failures in triggers
