

# Implementation Plan: Fix TWC Backfill & Invitation System

## Summary

This plan addresses three critical data/process issues:
1. **TWC items missing color data** - causing vertical blinds and awnings not to price
2. **Invitation resend doesn't extend expiration** - Greg's invitation is expired
3. **No visibility of expired status** - admins can't tell which invitations need renewal

---

## Task 1: Create Admin TWC Backfill Tool

### Purpose
Allow System Owner/admin to run backfill for **all accounts** at once, without requiring each user to log in.

### New Edge Function: `twc-admin-backfill`

**Location**: `supabase/functions/twc-admin-backfill/index.ts`

**Logic**:
```text
1. Verify caller is System Owner role (security check)
2. Get all unique user_ids that have TWC items
3. For each account:
   - Run the same color extraction logic as twc-update-existing
   - Extract primary color from TWC metadata
   - Populate compatible_treatments based on subcategory
   - Set pricing_method if missing
4. Return summary: { accounts_processed, items_updated, primary_colors_set }
```

**Config Update**: Add to `supabase/config.toml`:
```toml
[functions.twc-admin-backfill]
verify_jwt = true
```

---

## Task 2: Fix Invitation Resend to Extend Expiration

### Problem
Current resend logic just re-sends the email with the same token but **doesn't extend `expires_at`**. This means:
- Greg's invitation expired Jan 28
- Clicking "Resend" still sends an expired token
- User cannot accept the invitation

### Solution (SaaS Standard Pattern)
Before sending the invitation email, update the `expires_at` to 7 days from now.

**File**: `src/hooks/useUserInvitations.ts`

**Change** (in `useResendInvitation` around line 285):

```typescript
// BEFORE calling send-invitation, extend the expiration
const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

const { error: updateError } = await supabase
  .from("user_invitations")
  .update({ expires_at: newExpiresAt })
  .eq("id", invitation.id);

if (updateError) {
  console.error("Failed to extend invitation expiration:", updateError);
  // Continue anyway - email will still be sent
}
```

This follows SaaS standards like:
- **Slack**: Invitation links extend expiration when resent
- **Notion**: "Resend invite" refreshes the link
- **Linear**: "Send again" resets the timer

---

## Task 3: Show Expired Status in UI

### Problem
Admins can't visually distinguish between:
- Active invitations (can still be accepted)
- Expired invitations (need resend to work again)

### Solution
Add expired detection and visual indicator in `PendingInvitations.tsx`

**File**: `src/components/settings/user-management/PendingInvitations.tsx`

**Changes**:

1. Add expired detection:
```typescript
const isExpired = new Date(invitation.expires_at) < new Date();
```

2. Show expired badge with red styling:
```tsx
{isExpired && (
  <Badge variant="destructive" className="text-xs">
    Expired
  </Badge>
)}
```

3. Update resend button tooltip for expired invitations:
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={() => resendInvitation.mutate(invitation)}
  title={isExpired ? "Renew & resend invitation" : "Resend invitation email"}
>
```

4. Show expiration time:
```tsx
<div className="text-xs text-muted-foreground">
  {isExpired ? (
    <span className="text-destructive">Expired {formatDistanceToNow(new Date(invitation.expires_at))} ago</span>
  ) : (
    <span>Expires in {formatDistanceToNow(new Date(invitation.expires_at))}</span>
  )}
</div>
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/twc-admin-backfill/index.ts` | **CREATE** | Admin backfill for all accounts |
| `supabase/config.toml` | **MODIFY** | Add new function config |
| `src/hooks/useUserInvitations.ts` | **MODIFY** | Reset expiration on resend |
| `src/components/settings/user-management/PendingInvitations.tsx` | **MODIFY** | Show expired status + expiry time |

---

## Expected Results After Implementation

### For TWC Pricing Issues
1. Admin (you) runs the new backfill from browser console:
   ```javascript
   await supabase.functions.invoke('twc-admin-backfill')
   ```
2. All 1,025 TWC items across 4 accounts get color data
3. Vertical blinds + awnings start pricing correctly in Greg's account

### For Greg's Invitation
1. You'll see his invitation marked as **Expired** (red badge)
2. Click resend → expiration extends by 7 days
3. Greg receives fresh email and can now accept

### UI Improvements
- Clear visual distinction: Active (green/neutral) vs Expired (red)
- Shows time remaining or time since expiry
- Resend button works for both active and expired invitations

