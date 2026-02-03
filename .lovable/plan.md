

## User-Friendly Notification System - Minimal Buttons, Maximum Clarity

### Overview

Transform error notifications from scary technical alerts into calm, helpful guidance. Focus on **clear explanations and next steps in text** rather than action buttons. Action buttons will only appear for **session expiry** (critical) since that's the one case where the user truly needs to navigate.

---

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| **No scary red** | Use softer amber/orange for errors, friendly icons |
| **Plain language** | No technical jargon - explain what happened simply |
| **Next steps as text** | Tell users what to do in the message itself |
| **Minimal buttons** | Only "Log In Again" for session expiry - everything else is text guidance |
| **Stay visible** | Critical errors remain until user clicks X to dismiss |

---

### Error Categories & Messages

#### 1. Connection Issues
```
Icon: 📡 (wifi icon)
Title: Connection issue
Message: We couldn't reach the server. Check your internet connection and try again.
[No button - auto-dismisses after 8 seconds]
```

#### 2. Permission Errors
```
Icon: 🔒 (lock icon)
Title: Permission needed
Message: You don't have access to this action. If you need access, ask your account administrator.
[Stays visible until dismissed - no button]
```

#### 3. Validation Errors
```
Icon: ℹ️ (info icon)
Title: Please complete the form
Message: Some required fields are missing. Check the highlighted fields and try again.
[Auto-dismisses after 6 seconds]
```

#### 4. Session Expired (ONLY case with a button)
```
Icon: 🔐 (key icon)
Title: Session expired
Message: For security, you've been logged out. Please log in again to continue.
[Log In Again] ← This button works and navigates to /auth
[Stays visible until action taken]
```

#### 5. Configuration/Setup Errors
```
Icon: ⚙️ (settings icon)  
Title: Setup needed
Message: This feature needs some configuration first. Go to Settings > Business to complete setup.
[Stays visible until dismissed - no button, just clear text instructions]
```

#### 6. Calculator/Pricing Errors
```
Icon: 📐 (ruler icon)
Title: Measurement outside range
Message: The entered dimensions are outside the available pricing range. Try smaller measurements, or contact your supplier for custom pricing.
[Stays visible until dismissed]
```

---

### Visual Design Changes

**Current (scary):**
- Bright red background
- Generic "Error" title
- Technical error message
- Auto-dismisses too fast for errors

**New (friendly):**
- Soft amber/warm background for errors
- Specific, helpful title
- Plain language with next steps built into the message
- Stays visible for important errors until user dismisses
- Friendly icons that match the error type

---

### Technical Implementation

#### File 1: `src/utils/friendlyErrors.ts` (NEW)

Central catalog mapping error patterns to friendly messages:

```typescript
export interface FriendlyError {
  title: string;
  message: string;  // Includes next steps as part of the message
  icon: 'network' | 'permission' | 'validation' | 'session' | 'config' | 'calculator' | 'general';
  persistent: boolean;  // true = stays until dismissed
  showLoginButton?: boolean;  // Only true for session errors
}

// Error pattern matching
const ERROR_PATTERNS = [
  {
    patterns: ['network', 'fetch', 'connection', 'timeout', 'failed to fetch'],
    error: {
      title: "Connection issue",
      message: "We couldn't reach the server. Check your internet connection and try again.",
      icon: 'network',
      persistent: false,
    }
  },
  {
    patterns: ['row-level security', 'permission denied', 'rls', 'not authorized'],
    error: {
      title: "Permission needed", 
      message: "You don't have access to this action. If you need access, ask your account administrator.",
      icon: 'permission',
      persistent: true,
    }
  },
  {
    patterns: ['session', 'expired', 'log in again', 'not authenticated'],
    error: {
      title: "Session expired",
      message: "For security, you've been logged out. Please log in again to continue.",
      icon: 'session',
      persistent: true,
      showLoginButton: true,  // ONLY case with a button
    }
  },
  // ... more patterns
];

export function getFriendlyError(error: unknown, context?: string): FriendlyError
```

#### File 2: `src/components/ui/friendly-toast.tsx` (NEW)

Enhanced toast variant with:
- Softer amber styling for errors (not scary red)
- Icon display based on error type
- Persistent mode support
- Login button ONLY for session expiry

#### File 3: `src/hooks/use-friendly-toast.ts` (NEW)

Simple hook for showing friendly errors:

```typescript
import { useNavigate } from 'react-router-dom';

export function useFriendlyToast() {
  const navigate = useNavigate();
  
  const showError = (error: unknown, context?: string) => {
    const friendly = getFriendlyError(error, context);
    
    // Only session errors get a working navigation button
    const action = friendly.showLoginButton ? {
      label: "Log In Again",
      onClick: () => navigate('/auth')
    } : undefined;
    
    // Show the toast with friendly message
    toast({
      title: friendly.title,
      description: friendly.message,
      variant: friendly.persistent ? "warning" : "destructive",
      persistent: friendly.persistent,
      action,
    });
  };
  
  return { showError };
}
```

#### File 4: Update `src/components/ui/toast.tsx`

Add new "warning" variant with softer amber styling:

```typescript
variants: {
  variant: {
    default: "...",
    destructive: "...",  // Keep for backwards compatibility
    success: "...",
    warning: "border-amber-400/50 bg-gradient-to-br from-amber-500/15 to-orange-500/10 text-amber-800 dark:text-amber-200",
  },
}
```

#### File 5: Update `src/hooks/use-toast.ts`

Add persistent mode support:
- When `persistent: true`, the toast does NOT auto-dismiss
- User must click X or take the action to dismiss

---

### Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/utils/friendlyErrors.ts` | Create | Error pattern matching catalog |
| `src/components/ui/friendly-toast.tsx` | Create | Enhanced toast with icons |
| `src/hooks/use-friendly-toast.ts` | Create | Simple hook for friendly errors |
| `src/components/ui/toast.tsx` | Modify | Add "warning" variant styling |
| `src/hooks/use-toast.ts` | Modify | Add persistent mode support |
| `src/components/ui/toaster.tsx` | Modify | Render icons and handle persistence |

---

### Button Philosophy

| Error Type | Has Button? | Reason |
|------------|-------------|--------|
| Connection issue | ❌ No | User knows to check wifi and retry |
| Permission denied | ❌ No | Text says "ask your administrator" |
| Validation error | ❌ No | Text says "check highlighted fields" |
| Configuration needed | ❌ No | Text gives path: "Go to Settings > Business" |
| Calculator error | ❌ No | Text explains the issue and alternatives |
| **Session expired** | ✅ Yes | **Critical - must navigate to login** |

---

### Expected Outcome

After implementation:
- Errors feel helpful, not scary
- Users understand what happened and what to do next
- Text-based guidance keeps UI clean (minimal buttons)
- Session expiry is the only navigation button - and it works
- Critical errors stay visible until acknowledged
- Consistent, professional error experience throughout the app

