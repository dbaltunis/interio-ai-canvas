
# Comprehensive SaaS Consistency Audit System

## Overview

This system will provide a complete audit and auto-repair capability for all InterioApp accounts, identifying configuration gaps, orphaned data, and divergent settings while respecting intentional custom configurations (like Homekaara).

## Current State Analysis

Based on database investigation:

| Metric | Finding |
|--------|---------|
| Total Owner Accounts | 13 |
| Accounts with Full Permissions (77) | 12 |
| Accounts Missing Permissions | 1 (InterioApp DEMO - missing 13) |
| Accounts Missing Account Settings | 5 (InterioApp Free Trial, CCCO Admin, 1 client, Angely-Paris, Holly's dad, InterioApp_Australasia) |
| Orphaned Projects | 5 |
| Orphaned Quotes | 3 |
| Orphaned Clients | 1 |
| Orphaned Inventory Items | 100 |
| TWC Data (deleted user account) | 157 options for non-existent account |

## Technical Implementation

### Part 1: New Edge Function - `saas-consistency-audit`

**Location**: `supabase/functions/saas-consistency-audit/index.ts`

**Capabilities**:
- Scan all Owner/System Owner accounts
- Check 8 configuration categories per account
- Identify orphaned data across 6 tables
- Detect divergent TWC settings
- Generate auto-fix SQL script
- Return detailed JSON report

**Audit Categories**:
1. Permissions (77 expected for Owner)
2. Business Settings (1 required)
3. Account Settings (1 required)
4. Number Sequences (5 types: job, quote, invoice, order, draft)
5. Job Statuses (minimum 4)
6. Client Stages (10 default)
7. Subscription Status
8. TWC Options (heading_type should be required=false)

**Endpoint Design**:
```text
POST /saas-consistency-audit
Authorization: Bearer <System Owner token>

Response Schema:
{
  timestamp: string,
  summary: {
    total_accounts: number,
    healthy_accounts: number,
    needs_attention: number,
    orphaned_records: number
  },
  accounts: [{
    user_id: string,
    display_name: string,
    email: string,
    health_score: number,
    health_status: "healthy" | "warning" | "critical",
    is_custom_account: boolean,  // Mark accounts like Homekaara
    missing_configs: {
      permissions: { expected: 77, actual: number, missing: string[] },
      business_settings: boolean,
      account_settings: boolean,
      number_sequences: { expected: 5, actual: number, missing: string[] },
      job_statuses: number,
      client_stages: { expected: 10, actual: number },
      subscription: boolean
    },
    twc_issues: {
      heading_type_required: boolean,
      orphaned_options: number
    }
  }],
  orphaned_data: {
    projects: [{ id, user_id }],
    quotes: [{ id, user_id }],
    clients: [{ id, user_id }],
    inventory_items: [{ id, user_id }],
    treatment_options: [{ id, account_id }]
  },
  auto_fix_script: string  // Generated SQL to fix all issues
}
```

### Part 2: Database Functions for Auto-Repair

**New SQL Migration** with these functions:

```sql
-- 1. repair_account_full(user_id) - Comprehensive account repair
CREATE OR REPLACE FUNCTION public.repair_account_full(target_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb := '{"fixes_applied": []}';
  fixes text[] := '{}';
BEGIN
  -- Fix permissions using existing function
  PERFORM public.fix_user_permissions_for_role(target_user_id);
  fixes := array_append(fixes, 'permissions');
  
  -- Create business_settings if missing
  INSERT INTO business_settings (user_id, measurement_units, tax_type, tax_rate)
  VALUES (target_user_id, 'mm', 'GST', 15)
  ON CONFLICT (user_id) DO NOTHING;
  IF FOUND THEN fixes := array_append(fixes, 'business_settings'); END IF;
  
  -- Create account_settings if missing
  INSERT INTO account_settings (account_owner_id, currency, language)
  VALUES (target_user_id, 'USD', 'en')
  ON CONFLICT (account_owner_id) DO NOTHING;
  IF FOUND THEN fixes := array_append(fixes, 'account_settings'); END IF;
  
  -- Create number_sequences if missing
  INSERT INTO number_sequences (user_id, entity_type, prefix, next_number, padding)
  VALUES 
    (target_user_id, 'job', 'JOB', 1000, 4),
    (target_user_id, 'quote', 'QTE', 1000, 4),
    (target_user_id, 'invoice', 'INV', 1000, 4),
    (target_user_id, 'order', 'ORD', 1000, 4),
    (target_user_id, 'draft', 'DFT', 1000, 4)
  ON CONFLICT (user_id, entity_type) DO NOTHING;
  
  -- Create job_statuses if missing
  IF NOT EXISTS (SELECT 1 FROM job_statuses WHERE user_id = target_user_id) THEN
    INSERT INTO job_statuses (user_id, name, color, is_default, sort_order, status_type)
    VALUES 
      (target_user_id, 'New', '#3B82F6', true, 1, 'active'),
      (target_user_id, 'In Progress', '#F59E0B', false, 2, 'active'),
      (target_user_id, 'Pending', '#8B5CF6', false, 3, 'active'),
      (target_user_id, 'On Hold', '#6B7280', false, 4, 'active'),
      (target_user_id, 'Completed', '#10B981', false, 5, 'completed'),
      (target_user_id, 'Cancelled', '#EF4444', false, 6, 'cancelled');
    fixes := array_append(fixes, 'job_statuses');
  END IF;
  
  -- Client stages already have auto-seeding trigger
  
  result := jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'fixes_applied', to_jsonb(fixes)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. cleanup_orphaned_data() - Remove orphaned records
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
RETURNS jsonb AS $$
DECLARE
  deleted_counts jsonb := '{}';
  del_count integer;
BEGIN
  -- Delete orphaned projects
  DELETE FROM projects WHERE user_id NOT IN (SELECT user_id FROM user_profiles);
  GET DIAGNOSTICS del_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('projects', del_count);
  
  -- Delete orphaned quotes
  DELETE FROM quotes WHERE user_id NOT IN (SELECT user_id FROM user_profiles);
  GET DIAGNOSTICS del_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('quotes', del_count);
  
  -- Delete orphaned clients
  DELETE FROM clients WHERE user_id NOT IN (SELECT user_id FROM user_profiles);
  GET DIAGNOSTICS del_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('clients', del_count);
  
  -- Delete orphaned inventory items
  DELETE FROM enhanced_inventory_items WHERE user_id NOT IN (SELECT user_id FROM user_profiles);
  GET DIAGNOSTICS del_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('inventory_items', del_count);
  
  -- Delete orphaned treatment options (account_id based)
  DELETE FROM treatment_options WHERE account_id NOT IN (SELECT user_id FROM user_profiles);
  GET DIAGNOSTICS del_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('treatment_options', del_count);
  
  RETURN jsonb_build_object(
    'success', true,
    'timestamp', now(),
    'deleted', deleted_counts
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. fix_twc_required_options() - Fix TWC heading_type options
CREATE OR REPLACE FUNCTION public.fix_twc_required_options()
RETURNS jsonb AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE treatment_options
  SET required = false
  WHERE source = 'twc'
    AND key LIKE 'heading_type%'
    AND required = true;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'twc_options_fixed', updated_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

### Part 3: Frontend Hook - `useSaaSAudit`

**Location**: `src/hooks/useSaaSAudit.ts`

```typescript
// Hook capabilities:
- useRunAudit() - Trigger full audit
- useRepairAccount(userId) - Fix single account
- useRepairAllAccounts() - Fix all flagged accounts
- useCleanupOrphans() - Remove orphaned data
- useDownloadReport() - Export JSON report
```

### Part 4: Admin UI Enhancement

**Modify**: `src/pages/AdminAccountHealth.tsx`

**New Components**:

1. **`AuditActionsBar.tsx`** - Header with audit controls
   - "Run Full Audit" button
   - "Fix All Issues" button (with confirmation)
   - "Download Report" button
   - "Cleanup Orphaned Data" button

2. **`AuditReportDialog.tsx`** - Modal with detailed results
   - Summary cards (Total/Healthy/Warning/Critical)
   - Account-by-account breakdown
   - Missing permissions list
   - Generated SQL script viewer
   - Export options

3. **`OrphanedDataCard.tsx`** - Shows orphaned record counts
   - Projects, Quotes, Clients, Inventory counts
   - "Preview" button to see orphaned IDs
   - "Cleanup" button with confirmation

4. **`BulkRepairButton.tsx`** - Repairs all accounts
   - Shows progress during repair
   - Lists what was fixed per account
   - Refreshes health data after completion

### Part 5: Custom Account Detection

To respect accounts with intentional custom configurations (like Homekaara), the audit will:

1. **Mark known custom accounts** via a new column or lookup:
   - Check `account_feature_flags` for special flags
   - Check if account has Homekaara-specific edge function called
   
2. **Show but don't auto-fix** custom accounts:
   - Display in audit with "Custom Configuration" badge
   - Skip in "Fix All" operations
   - Allow manual fix with confirmation

### Part 6: Standard Permissions List

Store the 77 expected Owner permissions in a database table for consistency:

```sql
CREATE TABLE IF NOT EXISTS public.standard_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  permission_name text NOT NULL,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role, permission_name)
);

-- Seed the 77 Owner permissions
INSERT INTO standard_role_permissions (role, permission_name)
VALUES 
  ('Owner', 'create_appointments'),
  ('Owner', 'create_clients'),
  -- ... all 77 permissions
ON CONFLICT (role, permission_name) DO NOTHING;
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/saas-consistency-audit/index.ts` | Main audit edge function |
| `src/hooks/useSaaSAudit.ts` | React Query hooks for audit operations |
| `src/components/admin/health/AuditActionsBar.tsx` | Audit control buttons |
| `src/components/admin/health/AuditReportDialog.tsx` | Full audit results modal |
| `src/components/admin/health/OrphanedDataCard.tsx` | Orphan cleanup UI |
| `src/components/admin/health/BulkRepairButton.tsx` | Fix-all functionality |
| New SQL migration | Database functions + standard permissions table |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/AdminAccountHealth.tsx` | Add audit actions bar, orphaned data card |
| `src/hooks/useAccountHealth.ts` | Add audit types to existing interfaces |
| `supabase/config.toml` | Add `saas-consistency-audit` function config |

---

## Expected Outcomes

1. **One-Click Audit**: System Owner can scan all 13+ accounts with a single click
2. **Actionable Report**: Clear breakdown of what's missing per account
3. **Auto-Repair**: Fix all issues with one button (skipping custom accounts)
4. **Orphan Cleanup**: Safely remove the 109 orphaned records identified
5. **Custom Account Respect**: Homekaara and other custom accounts are flagged but not auto-modified
6. **Standard Definition**: Central source of truth for what every account should have
7. **Audit History**: Optionally store audit results for trend analysis

## Testing Checklist

1. Run audit on production - verify it identifies:
   - InterioApp DEMO missing 13 permissions
   - 5 accounts missing account_settings
   - 109 orphaned records
   
2. Fix single account (InterioApp DEMO) - verify permissions added

3. Re-run audit - verify account now shows healthy

4. Test "Cleanup Orphaned Data" - verify 109 records removed without affecting valid data

5. Test "Fix All" - verify it skips Homekaara (if marked as custom)

6. Download report - verify JSON structure matches expected schema
