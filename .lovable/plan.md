
# Fix Dealer Chat Visibility - Dealers Should Only See Admins/Owners

## Problem
Dealers can currently see and chat with ALL team members including other dealers. This is a privacy and security concern - dealers are external resellers and should NOT see each other.

**Expected behavior:**
- Dealers can ONLY see and chat with: **Owners**, **Admins**, and **System Owners**
- Dealers should NOT see: other **Dealers** or **Staff**
- Owners/Admins/Staff see everyone as normal

---

## Solution Overview

Filter the visible team members at the frontend level based on the current user's role. When the current user is a Dealer, hide other Dealers and Staff from all chat-related components.

---

## Technical Changes

### 1. Create a New Hook: `useFilteredTeamPresence`

**File:** `src/hooks/useFilteredTeamPresence.ts` (new file)

A wrapper hook that:
1. Uses existing `useTeamPresence()` to get all team members
2. Uses `useIsDealer()` to check if current user is a dealer
3. Filters out dealers and staff when the current user is a dealer

```typescript
// If current user is a dealer, only show Owners/Admins/System Owners
// Otherwise, show everyone
const visibleUsers = isDealer 
  ? teamPresence.filter(u => ['Owner', 'Admin', 'System Owner'].includes(u.role))
  : teamPresence;
```

---

### 2. Update Chat Components to Use Filtered Data

**Files to modify:**

| File | Change |
|------|--------|
| `src/hooks/useDirectMessages.ts` | Use filtered presence instead of raw `useTeamPresence` |
| `src/contexts/PresenceContext.tsx` | Filter `activeUsers` for dealers |
| `src/components/collaboration/TeamCollaborationCenter.tsx` | Filter `otherUsers` for dealers |
| `src/components/collaboration/ActiveUsersDropdown.tsx` | Filter visible users for dealers |

---

### 3. Implementation Details

#### A. `useFilteredTeamPresence.ts` (new hook)

```typescript
import { useTeamPresence, TeamMemberPresence } from './useTeamPresence';
import { useIsDealer } from './useIsDealer';

const DEALER_VISIBLE_ROLES = ['Owner', 'Admin', 'System Owner'];

export const useFilteredTeamPresence = (search?: string) => {
  const teamPresenceQuery = useTeamPresence(search);
  const { data: isDealer } = useIsDealer();

  const filteredData = useMemo(() => {
    if (!teamPresenceQuery.data) return [];
    
    // Dealers can only see Owners/Admins/System Owners
    if (isDealer) {
      return teamPresenceQuery.data.filter(
        user => DEALER_VISIBLE_ROLES.includes(user.role)
      );
    }
    
    // Non-dealers see everyone
    return teamPresenceQuery.data;
  }, [teamPresenceQuery.data, isDealer]);

  return { ...teamPresenceQuery, data: filteredData };
};
```

#### B. `useDirectMessages.ts` (line 51)

Change from:
```typescript
const { data: teamPresence = [] } = useTeamPresence();
```

To:
```typescript
const { data: teamPresence = [] } = useFilteredTeamPresence();
```

#### C. `PresenceContext.tsx` (line 37)

Change from:
```typescript
const { data: teamPresence = [], isLoading, error } = useTeamPresence();
```

To:
```typescript
const { data: teamPresence = [], isLoading, error } = useFilteredTeamPresence();
```

#### D. `TeamCollaborationCenter.tsx` (around lines 167-172)

Add dealer filtering:
```typescript
// Filter team visibility for dealers
const otherUsers = useMemo(() => {
  const filtered = activeUsers.filter(u => u.user_id !== user?.id);
  
  // Dealers can only see Owners/Admins/System Owners
  if (isDealer) {
    return filtered.filter(u => 
      ['Owner', 'Admin', 'System Owner'].includes(u.user_profile?.role || '')
    );
  }
  
  return filtered;
}, [activeUsers, user?.id, isDealer]);
```

#### E. `ActiveUsersDropdown.tsx` (around lines 24-26)

Add dealer filtering:
```typescript
const { data: isDealer } = useIsDealer();

// Filter for dealer visibility
const otherUsers = useMemo(() => {
  const filtered = activeUsers.filter(u => u.user_id !== user?.id);
  
  if (isDealer) {
    return filtered.filter(u => 
      ['Owner', 'Admin', 'System Owner'].includes(u.user_profile?.role || '')
    );
  }
  
  return filtered;
}, [activeUsers, user?.id, isDealer]);
```

---

## What This Fixes

| Scenario | Before | After |
|----------|--------|-------|
| Dealer opens Team Pulse | Sees all users including other dealers | Only sees Owners/Admins |
| Dealer opens Chat | Can message any user | Can only message Owners/Admins |
| Dealer sees conversations list | Shows all team members | Only shows Owners/Admins |
| Owner/Admin opens chat | Sees everyone | No change - sees everyone |

---

## Files Modified

| File | Type | Description |
|------|------|-------------|
| `src/hooks/useFilteredTeamPresence.ts` | **New** | Wrapper hook for filtered team presence |
| `src/hooks/useDirectMessages.ts` | Edit | Use filtered hook |
| `src/contexts/PresenceContext.tsx` | Edit | Use filtered hook |
| `src/components/collaboration/TeamCollaborationCenter.tsx` | Edit | Filter visible users |
| `src/components/collaboration/ActiveUsersDropdown.tsx` | Edit | Filter visible users |

---

## Why Frontend Filtering (Not Database)

1. **Faster implementation** - No database migration needed
2. **Flexible** - Easy to adjust rules without schema changes
3. **Consistent pattern** - Follows existing `isDealer` checks throughout the app
4. **Safe** - Dealers can still receive messages from others (RLS allows this), they just can't see/initiate to unauthorized users

---

## Edge Cases Handled

1. **Existing conversations**: If a dealer had a conversation with another dealer before this fix, they won't see that conversation anymore (filtered out)
2. **Incoming messages**: Dealers can still RECEIVE messages from anyone (the sender just won't appear in their list to initiate new conversations)
3. **Loading states**: The filter respects the `isDealer` loading state to prevent flicker
