

# Fix Dealer Chat Visibility - Complete the Missing Components

## Problem

The initial fix updated some components but **3 components were missed** and still bypass the dealer filtering by using raw `useTeamPresence()` directly instead of the filtered version.

**Components still broken:**

| Component | Location | Issue |
|-----------|----------|-------|
| `TeamMembersWidget.tsx` | Dashboard | Uses `useTeamPresence()` directly on line 33 |
| `TeamPresenceCard.tsx` | Sidebar | Uses `useTeamPresence()` directly on line 8 |
| `ModernUserPresence.tsx` | Floating button | Should already work via PresenceContext, but needs verification |

---

## Solution

Update all remaining components to use `useFilteredTeamPresence` instead of `useTeamPresence`.

---

## Technical Changes

### 1. TeamMembersWidget.tsx

**File:** `src/components/dashboard/TeamMembersWidget.tsx`

**Change import (line 10):**
```typescript
// FROM:
import { useTeamPresence } from "@/hooks/useTeamPresence";

// TO:
import { useFilteredTeamPresence } from "@/hooks/useFilteredTeamPresence";
```

**Change usage (line 33):**
```typescript
// FROM:
const { data: presenceData = [] } = useTeamPresence();

// TO:
const { data: presenceData = [] } = useFilteredTeamPresence();
```

**Also add dealer filtering to `otherTeamMembers` (around line 183):**
```typescript
import { useIsDealer } from "@/hooks/useIsDealer";

// Inside component:
const { data: isDealer } = useIsDealer();
const DEALER_VISIBLE_ROLES = ['Owner', 'Admin', 'System Owner'];

// Update filtering logic:
const otherTeamMembers = teamMembers.filter(member => {
  if (member.id === user?.id) return false; // Exclude current user
  
  // Dealers can only see Owners/Admins/System Owners
  if (isDealer) {
    return DEALER_VISIBLE_ROLES.includes(member.role || '');
  }
  
  return true;
});
```

---

### 2. TeamPresenceCard.tsx

**File:** `src/components/team/TeamPresenceCard.tsx`

**Change import (line 4):**
```typescript
// FROM:
import { useTeamPresence } from "@/hooks/useTeamPresence";

// TO:
import { useFilteredTeamPresence } from "@/hooks/useFilteredTeamPresence";
```

**Change usage (line 8):**
```typescript
// FROM:
const { data, isLoading } = useTeamPresence();

// TO:
const { data, isLoading } = useFilteredTeamPresence();
```

---

### 3. ModernUserPresence.tsx (Verification)

**File:** `src/components/collaboration/ModernUserPresence.tsx`

This component uses `useUserPresence()` which gets data from `PresenceContext`. Since `PresenceContext` now uses `useFilteredTeamPresence()`, this **should already be working**.

However, as a safety measure, add explicit dealer filtering:

**Add imports:**
```typescript
import { useAuth } from '@/components/auth/AuthProvider';
import { useIsDealer } from '@/hooks/useIsDealer';
import { useMemo } from 'react';
```

**Add filtering:**
```typescript
const { user } = useAuth();
const { data: isDealer } = useIsDealer();
const DEALER_VISIBLE_ROLES = ['Owner', 'Admin', 'System Owner'];

// Filter activeUsers
const filteredUsers = useMemo(() => {
  const others = activeUsers.filter(u => u.user_id !== user?.id);
  
  if (isDealer) {
    return others.filter(u => 
      DEALER_VISIBLE_ROLES.includes(u.user_profile?.role || '')
    );
  }
  
  return others;
}, [activeUsers, user?.id, isDealer]);

// Then use filteredUsers instead of activeUsers throughout the component
```

---

## Files to Modify

| File | Type | Change |
|------|------|--------|
| `src/components/dashboard/TeamMembersWidget.tsx` | Edit | Switch to `useFilteredTeamPresence`, add dealer filtering for `teamMembers` |
| `src/components/team/TeamPresenceCard.tsx` | Edit | Switch to `useFilteredTeamPresence` |
| `src/components/collaboration/ModernUserPresence.tsx` | Edit | Add explicit dealer filtering as safety measure |

---

## What This Fixes

| Location | Before | After |
|----------|--------|-------|
| Dashboard "Team" widget | Dealers see ALL team members | Dealers only see Owners/Admins |
| Team Presence Card | Dealers see ALL team members | Dealers only see Owners/Admins |
| Floating Team Pulse | Dealers see ALL team members | Dealers only see Owners/Admins |
| Team Hub Chat | Already fixed | Already fixed |
| Direct Messages list | Already fixed | Already fixed |
| Active Users Dropdown | Already fixed | Already fixed |

---

## Summary

The initial fix was incomplete - it updated the core hooks and some components, but missed 3 components that directly use the raw `useTeamPresence` hook. This plan completes the fix by updating all remaining components.

