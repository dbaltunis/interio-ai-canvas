

# Deep Codebase Investigation Report and Fix Plan

## Overview

I have thoroughly read through every file related to the issues your team reported. This plan covers all findings and proposed fixes. I want to be transparent: I will explain exactly what each issue is, why it happens, and what the minimal safe fix looks like -- so you can approve with confidence.

---

## Issue 1: Team Group -- Cannot Scroll Member List

**File:** `src/components/calendar/TeamGroupManager.tsx` (line 126)

**Root Cause:** The `ScrollArea` has `max-h-[240px]` which should enable scrolling. However, the Radix ScrollArea component needs an explicit `h-[240px]` (fixed height) rather than just `max-h` to properly calculate the scrollable region. When there are many team members, the content overflows but the scrollbar never appears because `max-h` alone doesn't trigger Radix's internal scroll detection.

**Fix:** Change `max-h-[240px]` to `h-[240px]` on the `ScrollArea`, or wrap the inner content in an additional overflow container. This is a CSS-only change -- zero logic impact.

---

## Issue 2: Messages Tab Disabled on Some Accounts

**File:** `src/components/layout/ResponsiveHeader.tsx` (lines 137-166, 222-226)

**Root Cause Found:** The Messages tab has TWO independent disable conditions:

1. **Permission check** (line 223): `canViewEmails === false` -- disables if user lacks `view_emails` permission. All roles except "User" and "Dealer" have this permission, so this is correct.

2. **Email provider configuration check** (lines 137-166, 225): `hasEmailsConfigured === false` -- this query checks if the account owner has an active SendGrid or Resend integration with a valid API key. **If the account owner has NOT set up SendGrid/Resend, the Messages tab is disabled for ALL team members on that account, even Owners/Admins.**

This means: accounts that haven't configured an email sending provider yet will see Messages as disabled. The original intent was to hide it for accounts without email capability, but the logic is too aggressive -- it blocks access to the tab entirely, including viewing past emails and templates.

**Fix options:**
- Option A (recommended): Only disable Messages if `canViewEmails === false` (permission-based). Remove the `hasEmailsConfigured` check entirely. Inside the Messages tab itself, show a "Configure email provider" prompt when they try to send.
- Option B: Keep the check but only for non-Owner/Admin roles. Let Owners and Admins always access it so they can configure it.

---

## Issue 3: Service Options Pricing Unit Behavior

**Current Behavior (by design):** The pricing unit (Per Window / Per Room / Per Job / Per Hour / etc.) is stored as metadata on each service option but is currently used only as a label. When a service is added to a quote, it's added as a line item with quantity, and the price is simply `price x quantity` regardless of the unit type.

**What your team expected:** The unit should automatically calculate based on the number of windows/rooms in the job. For example, "Per Window" at $50 with 5 windows should auto-calculate to $250.

**Assessment:** This is a feature enhancement, not a bug. The current system works correctly as a simple quantity-based pricing model. Making the unit actually drive automatic quantity calculation would require connecting service options to room/window counts from the job, which is a larger feature. No changes needed now -- this is working as designed.

---

## Issue 4: Build Errors (10 TypeScript Errors)

These are preventing the app from building. Here are the exact fixes:

### 4A. `display_name` does not exist on `TeamMember` (4 errors)

**Files:** `AppointmentSharingDialog.tsx` (lines 89-90, 129-130) and `CalendarSharingDialog.tsx` (lines 88-89, 128-129)

**Root Cause:** The `TeamMember` interface maps the database `display_name` column to a property called `name` (in `useTeamMembers.ts` line 57: `name: p.display_name`). The Opus-generated sharing dialogs reference `member.display_name` which doesn't exist on the interface.

**Fix:** Replace `member.display_name` with `member.name` and `member?.display_name` with `member?.name` in all 4 locations.

**Risk: None** -- the underlying data is identical, this is just the correct property name.

### 4B. `integration_type` not typed as literal (4 errors)

**Files:** `CWSystemsIntegrationTab.tsx` (line 40) and `NormanIntegrationTab.tsx` (line 40)

**Root Cause:** `integration_type: 'cw_systems'` is inferred as `string` rather than the literal `'cw_systems'`. The `IntegrationType` union requires specific string literals.

**Fix:** Add `as const` after the string literal: `integration_type: 'cw_systems' as const` and `integration_type: 'norman_australia' as const`.

**Risk: None** -- zero runtime change, purely TypeScript type narrowing.

### 4C. `${{invoice_amount}}` template literal error (1 error)

**File:** `emailTemplates.ts` (line 443)

**Root Cause:** `${{invoice_amount}}` inside a template literal is parsed by TypeScript as `${({invoice_amount})}` -- a shorthand property reference. The intent is to output the literal text `$` followed by the template placeholder `{{invoice_amount}}`.

**Fix:** Escape as `\${{invoice_amount}}`.

**Risk: None** -- the rendered HTML output is identical.

### 4D. `useCalendarSharing.ts` type cast errors (2 errors)

**File:** `useCalendarSharing.ts` (lines 41, 68)

**Root Cause:** `calendar_delegations` and `appointment_shares` tables are not in the auto-generated Supabase types. The `as any` on `.from()` handles the query, but the final cast from the query result to the custom interface fails TypeScript's overlap check.

**Fix:** Change `as CalendarDelegation[]` to `as unknown as CalendarDelegation[]` and same for `AppointmentShare[]`.

**Risk: None** -- same runtime behavior, satisfies TypeScript strict checking.

### 4E. `useServiceOptions.ts` table not in types (multiple errors)

**File:** `useServiceOptions.ts` (lines 62-63, 88-89, 125-127, 155-156, 185)

**Root Cause:** `service_options` table exists in the database but not in the generated TypeScript types file.

**Fix:** Cast each `.from('service_options')` to `.from('service_options' as any)`.

**Risk: None** -- the table exists in the database, queries work correctly at runtime.

---

## Issue 5: Permissions Not Reflecting Role Changes

**File:** `src/hooks/usePermissions.ts` (lines 91-95)

**Root Cause Confirmed:**
```
staleTime: 5 * 60 * 1000,      // 5 minutes cache
refetchOnWindowFocus: false,     // No refresh on tab switch
refetchOnMount: false,           // No refresh on component remount
```

When a user's role is changed (e.g., Admin to Owner), the permissions query continues serving the cached (old role) data for up to 5 minutes. Even switching browser tabs won't trigger a refresh.

**Fix:** Change `staleTime` to `60 * 1000` (1 minute) and set `refetchOnWindowFocus: true`. This way, after a role change, the user sees updated permissions within 1 minute or immediately upon switching tabs.

**Risk: Low** -- slightly more database queries, but the permissions table is tiny and the query is fast.

---

## Issue 6: Supplier Ordering -- "No Items to Order"

**File:** `src/hooks/useProjectSuppliers.ts`

**Root Cause Analysis:** The detection logic works by scanning `quoteItems` for:
- **TWC:** Looks for `twc_item_number` in `item.product_details`, `item.metadata`, or `item.twc_item_number` (lines 100-106)
- **Vendors (Norman, Capitol, etc.):** Looks for `item.inventory_item_id`, then joins with `enhanced_inventory_items` to find `vendor_id` (lines 135-166)

The "No items to order" message appears when `supplier.items.length === 0` (line 152 of SupplierOrderingDropdown).

**Likely causes for your partners:**
1. Products added to quotes don't have `twc_item_number` metadata set (TWC products not synced from TWC catalog)
2. Products don't have an `inventory_item_id` linking them to inventory records that have a `vendor_id`
3. Products were manually added to quotes rather than selected from the synced catalog

**This is a data/setup issue, not a code bug.** The detection logic is correct. To fix for specific accounts, we need to verify their products have the proper vendor linkage. No code changes needed -- this requires account setup verification.

---

## Issue 7: RFMS API Sync Errors

**Files:** `supabase/functions/rfms-sync-customers/index.ts`, `supabase/functions/rfms-sync-quotes/index.ts`

**Assessment:** Without seeing the specific error message from the screenshot, the edge functions look structurally sound. They handle session management, authentication, and error reporting correctly. The most common RFMS failure modes are:
- Session token expiration (RFMS uses async session-based auth)
- API endpoint URL misconfiguration
- Store queue parameter issues

**Recommendation:** I should check the edge function logs when your team shares the specific error message. This needs runtime debugging, not code changes.

---

## Issue 8: Google/Outlook/Nylas Calendar Integration

**Assessment:** The Nylas integration code (`useNylasCalendar.ts`) is architecturally complete with OAuth popup flow, bidirectional sync, and webhook support. Google Calendar has a known "code displayed at end" issue (OAuth redirect not completing). These are configuration/credentials issues, not code bugs.

**Recommendation:** These need account-specific setup -- OAuth redirect URIs, API credentials, and Nylas admin account configuration. Not code changes.

---

## Implementation Order (Safest First)

1. Fix 10 build errors (4A-4E) -- zero logic risk, just TypeScript corrections
2. Fix team group scroll bug -- CSS-only change
3. Fix Messages disabled issue -- logic change in ResponsiveHeader
4. Improve permissions cache refresh -- config change in usePermissions

**Files that will NOT be touched:**
- `src/engine/formulas/*` (calculation engine)
- `src/constants/permissions.ts` (permission definitions)
- Any edge functions
- Any database migrations
- Any integration logic

