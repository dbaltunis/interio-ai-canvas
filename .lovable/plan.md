

# Fix: Wrong Status Value ("trialing" instead of "trial")

## The Problem (Simple)

The database only accepts these status values: `trial`, `active`, `canceled`, `past_due`, `unpaid`

The code was sending: `"trialing"` (wrong spelling)

The database rejected it with error code `23514` (check constraint violation).

## The Fix

Change ONE line in `src/hooks/useAdminAccounts.ts`:

```typescript
// Line 253 - BEFORE (wrong):
status: "trialing",

// Line 253 - AFTER (correct):
status: "trial",
```

## Why This Kept Failing

Every time you clicked the button, it sent the wrong status value. The RLS changes I made earlier were for a different issue (viewing profiles). The actual insert error was this typo the entire time.

The network request showed the error clearly:
```json
{
  "code": "23514",
  "message": "new row for relation \"user_subscriptions\" violates check constraint \"user_subscriptions_status_check\""
}
```

## Summary

| What | Detail |
|------|--------|
| File to change | `src/hooks/useAdminAccounts.ts` |
| Line | 253 |
| Wrong value | `"trialing"` |
| Correct value | `"trial"` |

