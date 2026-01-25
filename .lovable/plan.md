

# Fix Duplicate Client Prevention

## Problem
Clients with the same email and/or phone number are being saved as separate entries. The screenshot shows "Anumugam 0" appearing twice with the same email.

## Root Cause
1. **No database constraint** - The `clients` table allows duplicate email/phone values
2. **No code validation** - Client creation logic doesn't check for existing records

---

## Solution: Two-Layer Protection

### Layer 1: Database Unique Constraint (per user)

Add a unique constraint on `(user_id, email)` and `(user_id, phone)` so each user cannot have duplicate clients with the same contact info.

```sql
-- Create partial unique indexes (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS clients_user_email_unique 
ON public.clients (user_id, LOWER(email)) 
WHERE email IS NOT NULL AND email != '';

CREATE UNIQUE INDEX IF NOT EXISTS clients_user_phone_unique 
ON public.clients (user_id, phone) 
WHERE phone IS NOT NULL AND phone != '';
```

### Layer 2: Application-Level Validation

Update `useCreateClient` hook to check for existing clients BEFORE inserting:

```typescript
// src/hooks/useClients.ts - useCreateClient mutation
mutationFn: async (client: Omit<ClientInsert, "user_id">) => {
  // ... existing auth checks ...

  // NEW: Check for duplicate email
  if (client.email) {
    const { data: existingByEmail } = await supabase
      .from("clients")
      .select("id, name")
      .eq("user_id", effectiveOwnerId)
      .ilike("email", client.email.trim())
      .maybeSingle();
    
    if (existingByEmail) {
      throw new Error(`A client with this email already exists: ${existingByEmail.name}`);
    }
  }

  // NEW: Check for duplicate phone
  if (client.phone) {
    const { data: existingByPhone } = await supabase
      .from("clients")
      .select("id, name")
      .eq("user_id", effectiveOwnerId)
      .eq("phone", client.phone.trim())
      .maybeSingle();
    
    if (existingByPhone) {
      throw new Error(`A client with this phone number already exists: ${existingByPhone.name}`);
    }
  }

  // Proceed with insert if no duplicates...
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| **Database Migration** | Add unique indexes on `(user_id, email)` and `(user_id, phone)` |
| `src/hooks/useClients.ts` | Add duplicate check before insert in `useCreateClient` |

---

## Behavior After Fix

| Action | Before | After |
|--------|--------|-------|
| Create client with existing email | Creates duplicate | Shows error: "A client with this email already exists: John Smith" |
| Create client with existing phone | Creates duplicate | Shows error: "A client with this phone number already exists: John Smith" |
| CSV Import with duplicates | Imports all as new | Skips duplicates, shows count of skipped |

---

## Technical Details

### Why partial unique index?
- Uses `WHERE email IS NOT NULL AND email != ''` so multiple clients can have empty/null email
- Uses `LOWER(email)` to make email matching case-insensitive
- Scoped to `user_id` so different users can have clients with same email

### Why application-level check too?
- Provides user-friendly error messages ("client already exists: Name")
- Faster feedback than waiting for database constraint error
- Can show specific duplicate client name to help user find it

