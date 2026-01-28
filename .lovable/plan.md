

# The ACTUAL Fix (1 Line)

## What's Wrong

Line 254 in `src/hooks/useAdminAccounts.ts`:
```typescript
subscription_type: "trial",  // WRONG - "trial" is not allowed
```

The database only accepts: `standard`, `partner`, `reseller`, `test`, `lifetime`, `invoice`

## The Fix

Change line 254:
```typescript
subscription_type: "standard",  // CORRECT
```

## Summary

| Field | Current (Wrong) | Correct |
|-------|----------------|---------|
| `status` | `"trial"` | `"trial"` (already fixed) |
| `subscription_type` | `"trial"` | `"standard"` |

The `status` field uses `trial` to indicate trial period.
The `subscription_type` field uses `standard` to indicate normal billing type.

These are two different fields with different allowed values.

