

# Update Version Tracking Files

## Overview
Update the `cache-bust.txt` and `version.ts` files to document the three fixes we just implemented, ensuring proper version tracking and deployment cache invalidation.

## Changes to Make

### File 1: `public/cache-bust.txt`

Update with current timestamp and the three fixes:

```text
Build timestamp: 2026-01-23T15:45:00Z
Version: 2.3.16
Changes:
- CRITICAL FIX: Fixed infinite recursion in RLS policies using SECURITY DEFINER functions
- FIX: Fabric pricing now correctly uses cost_price with impliedMarkup flag
- FIX: Shared work order links now work for authenticated users (updated RLS policies)
- FIX: Signup rate limit errors now show user-friendly countdown timer
- Previous: Removed 30-minute session timeout - users stay logged in via Supabase auto-refresh
- Previous: Added userId to ALL inventory cache keys for multi-account isolation
- Previous: Clear ALL cached data on logout to prevent cross-account data leakage
- Previous: Invalidate all queries on sign-in to force fresh data fetch
- Previous: Heading options now available for all fabric treatments
- Custom document template creation with drag-and-drop blocks
- Hardware category for inventory management
- Products & Services can be added to projects and quotes
- RLS security hardening with 60+ policy fixes
- Performance and stability improvements
```

### File 2: `src/constants/version.ts`

Update version number and build date:

```typescript
export const APP_VERSION = "2.3.16";
export const APP_BUILD_DATE = "2026-01-23";
export const APP_BUILD_TIMESTAMP = "2026-01-23T15:45:00Z";
```

## Summary of Documented Fixes

| Fix | Description |
|-----|-------------|
| Issue 1 | Fabric pricing correctly uses `cost_price` with `impliedMarkup` flag |
| Issue 2 | Shared work order links work for authenticated users via updated RLS |
| Issue 3 | Signup rate limit shows friendly countdown instead of cryptic error |
| Hotfix | Fixed infinite recursion in RLS policies using SECURITY DEFINER functions |

## Files to Modify

| File | Purpose |
|------|---------|
| `public/cache-bust.txt` | Document changes for cache invalidation |
| `src/constants/version.ts` | Bump version number to 2.3.16 |

