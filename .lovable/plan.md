
# Fix: Team Assignment Toggle Issue & Security Improvements

## Root Cause Analysis

### Issue 1: "Already Assigned" Error When Re-Enabling Team Members

**Problem**: When you toggle team member access off and then try to toggle it back on, you get the error "Already Assigned - This team member is already assigned to this project".

**Root Cause**: The database has a unique constraint `project_assignments_project_id_user_id_key` on `(project_id, user_id)` but the app uses soft-delete pattern (`is_active = false`). When the assignment is deactivated:

1. The row still exists in the database with `is_active = false`
2. When you try to re-assign, the code tries to INSERT a new row
3. The unique constraint rejects the duplicate `(project_id, user_id)` pair

**Database Evidence**:
```
project_id: 28ac028f-e9d8-4be6-b2de-8a6765e124c1
user_id: Mike (819d7abe...) - is_active: false
user_id: Ross (624a5ec1...) - is_active: false
```

Both records exist but are inactive, so the INSERT fails with error 23505 (unique constraint violation).

---

### Issue 2: Security Scan Findings (33 issues total)

| Category | Count | Severity |
|----------|-------|----------|
| Function Search Path Missing | 17 | WARN |
| RLS Policy Always True | 9 | WARN |
| Public Data Exposure | 4 | ERROR |
| Materialized View in API | 1 | WARN |
| Postgres Security Patches | 1 | WARN |

**Critical Security Findings**:
- `clients` table: Customer contact info publicly readable
- `projects` table: Business operations data publicly readable  
- `workshop_items` table: Manufacturing costs publicly readable
- `rooms` table: Customer project details publicly readable

---

## Fix Implementation Plan

### Fix 1: Team Assignment Toggle (CRITICAL)

**Solution**: Change the assignment logic to use **UPSERT** instead of INSERT, and UPDATE instead of soft-delete when re-assigning.

**Option A - Recommended**: Modify `useAssignUserToProject` to check for existing (inactive) assignments first:

```typescript
// In useAssignUserToProject.mutationFn:

// 1. Check if there's an existing (inactive) assignment
const { data: existingAssignment } = await supabase
  .from("project_assignments")
  .select("id, is_active")
  .eq("project_id", projectId)
  .eq("user_id", userId)
  .maybeSingle();

if (existingAssignment) {
  if (existingAssignment.is_active) {
    // Already active - skip silently or throw
    return existingAssignment;
  }
  
  // 2. Reactivate the existing assignment
  const { data, error } = await supabase
    .from("project_assignments")
    .update({ 
      is_active: true, 
      assigned_by: user.id,
      assigned_at: new Date().toISOString()
    })
    .eq("id", existingAssignment.id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// 3. No existing assignment - insert new
const { data, error } = await supabase
  .from("project_assignments")
  .insert({ ... })
  .select()
  .single();
```

**Files to Modify**:
- `src/hooks/useProjectAssignments.ts` - Update `useAssignUserToProject` mutation

---

### Fix 2: Security Definer Functions - Add search_path (HIGH)

**Problem**: 17 security definer functions are missing `SET search_path = public`. This is a potential security issue where attackers could create shadow functions to intercept calls.

**Affected Functions**:
1. `create_default_shopify_statuses`
2. `ensure_shopify_statuses`
3. `generate_batch_number`
4. `notify_owner_on_project_creation`
5. `seed_default_client_stages`
6. `seed_default_email_templates`
7. `seed_default_job_statuses`
8. `seed_default_quote_template`
9. And 9 others (trigger functions)

**Fix**: Create a migration to update all these functions with:
```sql
CREATE OR REPLACE FUNCTION public.function_name()
RETURNS ...
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- ADD THIS
AS $function$
  ...
$function$;
```

---

### Fix 3: Overly Permissive RLS Policies (MEDIUM)

**Problem**: 9 tables have `WITH CHECK (true)` or `USING (true)` policies that bypass security:

| Table | Policy | Issue |
|-------|--------|-------|
| `appointments_booked` | Public can create bookings | `WITH CHECK (true)` |
| `permission_audit_log` | System can insert audit logs | `WITH CHECK (true)` |
| `pipeline_analytics` | System can manage analytics | `USING (true)`, `WITH CHECK (true)` |
| `store_inquiries` | Anyone can create inquiries | `WITH CHECK (true)` |
| `store_orders` | Service role can insert/update | `WITH CHECK (true)` |

**Review Needed**: These might be intentional for public features, but should be verified.

---

### Fix 4: Public Data Exposure (ERROR - CRITICAL)

The security scan detected that these tables may be exposing data publicly. However, based on the recent RLS migration, these should now have proper policies. This might be a false positive or the scan ran before the migration was applied.

**Verify**: Run a test query as anonymous user to confirm data is protected.

---

## Implementation Summary

| Task | Priority | Files/Location |
|------|----------|----------------|
| Fix assignment toggle logic | CRITICAL | `src/hooks/useProjectAssignments.ts` |
| Add search_path to security definer functions | HIGH | Database migration |
| Review permissive RLS policies | MEDIUM | Database migration (if needed) |
| Verify public data exposure fix | LOW | Test queries |

---

## Technical Details

### File: `src/hooks/useProjectAssignments.ts`

**Change in `useAssignUserToProject`**:

```typescript
export const useAssignUserToProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      projectId,
      userId,
      role = "member",
      notes,
      projectName
    }: {
      projectId: string;
      userId: string;
      role?: string;
      notes?: string;
      projectName?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Check for existing assignment (active or inactive)
      const { data: existingAssignment, error: checkError } = await supabase
        .from("project_assignments")
        .select("id, is_active")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing assignment:", checkError);
        throw checkError;
      }

      let assignmentData;

      if (existingAssignment) {
        if (existingAssignment.is_active) {
          // Already actively assigned - just return it
          throw new Error("ALREADY_ASSIGNED");
        }
        
        // Reactivate existing inactive assignment
        const { data, error } = await supabase
          .from("project_assignments")
          .update({ 
            is_active: true, 
            assigned_by: user.id,
            assigned_at: new Date().toISOString(),
            role,
            notes: notes || null
          })
          .eq("id", existingAssignment.id)
          .select()
          .single();
          
        if (error) throw error;
        assignmentData = data;
      } else {
        // Insert new assignment
        const { data, error } = await supabase
          .from("project_assignments")
          .insert({
            project_id: projectId,
            user_id: userId,
            role,
            assigned_by: user.id,
            notes: notes || null,
            is_active: true
          })
          .select()
          .single();
          
        if (error) throw error;
        assignmentData = data;
      }

      // ... rest of the function (activity log, notifications, email)
      
      return assignmentData;
    },
    onError: (error: any) => {
      if (error.message === "ALREADY_ASSIGNED" || error.code === "23505") {
        toast({
          title: "Already Assigned",
          description: "This team member is already assigned to this project",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to assign team member",
          variant: "destructive",
        });
      }
    },
  });
};
```

### Database Migration: Fix Security Definer Functions

```sql
-- Fix all security definer functions to include SET search_path = public
-- This prevents search_path manipulation attacks

-- Example for one function (repeat for all 17):
CREATE OR REPLACE FUNCTION public.seed_default_client_stages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- ADD THIS LINE
AS $function$
BEGIN
  -- ... existing function body ...
END;
$function$;
```

---

## Why These RLS Issues Keep Happening

The recurring RLS issues in this app stem from a few patterns:

1. **Complex Multi-Tenant Model**: The app uses `get_effective_account_owner()` for team hierarchies, which requires careful policy design
2. **Soft-Delete Pattern**: Using `is_active` flags instead of actual DELETE creates unique constraint conflicts
3. **Permission-Based Access**: The `has_permission()` checks add complexity to policies
4. **Project Assignments Feature**: Adding a new access layer (project_assignments) without updating all related RLS policies

**Prevention**: 
- Always test RLS policies with different user roles before deploying
- When using soft-delete, consider using UPSERT patterns
- Document the permission model and keep it consistent

