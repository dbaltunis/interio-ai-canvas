

## Fix Password Update Functionality

### Problem Identified

The password update fails with a **422 Unprocessable Entity** error from Supabase, but the UI only shows a generic "Failed to update password" message. The auth logs confirm this:

```
status: 422, method: PUT, path: /user (password update)
```

**Possible 422 causes:**
1. Password too similar to email address
2. Password was recently used (if password history is enabled)
3. Password doesn't meet Supabase project requirements (check Supabase dashboard > Auth > Providers > Email)

---

### Solution: Better Error Messages + Validation

Improve the error handling to show the **actual error message** from Supabase instead of a generic message, so users know exactly what's wrong.

---

### Technical Changes

**File:** `src/components/settings/tabs/PersonalSettingsTab.tsx`

**Before (lines 441-447):**
```typescript
} catch (error) {
  console.error("Error updating password:", error);
  toast({
    title: "Error",
    description: "Failed to update password. Please try again.",
    variant: "destructive"
  });
}
```

**After:**
```typescript
} catch (error: any) {
  console.error("Error updating password:", error);
  
  // Extract meaningful error message from Supabase
  let errorMessage = "Failed to update password. Please try again.";
  if (error?.message) {
    // Common Supabase password errors
    if (error.message.includes("password") || error.message.includes("Password")) {
      errorMessage = error.message;
    } else if (error.message.includes("session")) {
      errorMessage = "Your session has expired. Please log in again.";
    } else {
      errorMessage = error.message;
    }
  }
  
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive"
  });
}
```

---

### Additional Improvement: Verify Session Before Update

Add a session check before attempting to update the password to catch expired sessions early:

```typescript
// Before calling updateUser, verify session is valid
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  toast({
    title: "Session Expired",
    description: "Please log in again to change your password.",
    variant: "destructive"
  });
  return;
}
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/settings/tabs/PersonalSettingsTab.tsx` | Show actual Supabase error message, add session check |

---

### Expected Outcome

After implementation:
- Users will see the **actual reason** why password update failed (e.g., "Password is too weak", "Password has been used recently")
- Expired sessions are detected before the API call
- Better debugging for future password issues

---

### Immediate Workaround

If you need to update the password right now:
1. Go to **Settings > Account > Personal** (not Security tab)
2. Or use the **"Forgot Password"** flow from the login page
3. Or update directly in **Supabase Dashboard > Authentication > Users**

