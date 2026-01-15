# InterioApp Architecture Overview

> **Golden Rule: "If it doesn't work for ALL accounts, it's not fixed."**

This document is the single source of truth for understanding how the application works. Every developer (human or AI) must read this before making changes.

---

## Table of Contents

1. [Multi-Tenant Isolation](#1-multi-tenant-isolation)
2. [Template System Architecture](#2-template-system-architecture)
3. [Option Filtering Rules](#3-option-filtering-rules)
4. [Pricing Calculation Flow](#4-pricing-calculation-flow)
5. [Data Sources (TWC, CSV, Manual)](#5-data-sources)
6. [Permission System](#6-permission-system)
7. [Common Pitfalls & Solutions](#7-common-pitfalls--solutions)
8. [UI Component Patterns](#8-ui-component-patterns)
9. [Universal Testing Checklist](#9-universal-testing-checklist)
10. [Key Files Reference](#10-key-files-reference)

---

## 1. Multi-Tenant Isolation

### The Foundation Pattern: `effectiveOwnerId`

Every data query in the application MUST be scoped to the correct account owner.

```typescript
// Pattern used in ALL data hooks
const effectiveOwnerId = userProfile?.parent_account_id || user?.id;
```

**How it works:**
- **Account Owners**: `parent_account_id` is NULL → use their own `user.id`
- **Team Members**: `parent_account_id` is set → use parent's ID (see owner's data)

### Three-Layer Isolation

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: React Query Cache                              │
│ queryKey: ['templates', effectiveOwnerId]               │
│ - Prevents stale data when switching accounts           │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Supabase Query Filter                          │
│ .eq('user_id', effectiveOwnerId)                        │
│ - Application-level filtering                           │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 3: RLS Policy (Database)                          │
│ get_effective_account_owner(user_id) =                  │
│ get_effective_account_owner(auth.uid())                 │
│ - Last line of defense, always enforced                 │
└─────────────────────────────────────────────────────────┘
```

### Critical Rules

| Rule | Correct | Wrong |
|------|---------|-------|
| QueryKey | `['templates', effectiveOwnerId]` | `['templates']` |
| Filter | `.eq('user_id', effectiveOwnerId)` | No filter |
| RLS | `get_effective_account_owner()` | `user_id = auth.uid()` |

### Example Hook Implementation

```typescript
export const useTemplates = () => {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile();
  
  // CRITICAL: Calculate effective owner
  const effectiveOwnerId = userProfile?.parent_account_id || user?.id;
  
  return useQuery({
    // CRITICAL: Include in queryKey for cache isolation
    queryKey: ['templates', effectiveOwnerId],
    queryFn: async () => {
      const { data } = await supabase
        .from('curtain_templates')
        // CRITICAL: Filter by effective owner
        .eq('user_id', effectiveOwnerId)
        .eq('active', true);
      return data;
    },
    enabled: !!effectiveOwnerId,
  });
};
```

---

## 2. Template System Architecture

### Core Tables Relationship

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TEMPLATE LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│  curtain_templates / product_templates                                  │
│  ├── id (UUID)                                                          │
│  ├── user_id → effectiveOwnerId                                         │
│  ├── name, treatment_category                                           │
│  ├── selected_heading_ids[] ─────────────┐                              │
│  ├── heading_prices{} ───────────────────┤                              │
│  └── pricing_method, labor_rate, etc.    │                              │
└──────────────────────────────────────────│──────────────────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                              ▼
┌───────────────────────────────────┐    ┌────────────────────────────────┐
│  enhanced_inventory_items         │    │  template_option_settings      │
│  (category='heading')             │    │  ├── template_id → template    │
│  ├── id (must match array)        │    │  ├── treatment_option_id ──────┤
│  ├── name                         │    │  ├── is_enabled (WHITELIST!)   │
│  └── price per meter, etc.        │    │  ├── order_index               │
└───────────────────────────────────┘    │  └── hidden_value_ids[]        │
                                         └────────────────────────────────┘
                                                        │
                                                        ▼
                                         ┌────────────────────────────────┐
                                         │  treatment_options             │
                                         │  ├── id                        │
                                         │  ├── name, option_type         │
                                         │  ├── pricing_method            │
                                         │  └── treatment_category        │
                                         └────────────────────────────────┘
                                                        │
                                                        ▼
                                         ┌────────────────────────────────┐
                                         │  option_values                 │
                                         │  ├── id                        │
                                         │  ├── treatment_option_id       │
                                         │  ├── name, price               │
                                         │  └── metadata (twc_product_id) │
                                         └────────────────────────────────┘
```

### Template Types

| Table | Purpose | Treatment Types |
|-------|---------|-----------------|
| `curtain_templates` | Curtains, Romans, Sheers | All fabric-based soft furnishings |
| `product_templates` | Blinds, Shutters, Hardware | All product-based treatments |

### Key Fields in Templates

```typescript
interface CurtainTemplate {
  id: string;
  user_id: string;                    // effectiveOwnerId
  name: string;
  treatment_category: string;         // 'curtains', 'romans', etc.
  
  // HEADING CONFIGURATION
  selected_heading_ids: string[];     // Array of inventory item IDs
  heading_prices: {                   // Per-heading price overrides
    [headingId: string]: {
      price_per_meter: number;
      machine_available: boolean;
      hand_available: boolean;
    }
  };
  
  // PRICING
  pricing_method: string;             // 'per_running_meter', 'per_sqm', etc.
  labor_rate: number;
  
  // FLAGS
  active: boolean;
}
```

---

## 3. Option Filtering Rules

### CRITICAL: WHITELIST Approach

> **Options are HIDDEN by default. Only explicitly enabled options appear.**

```typescript
// CORRECT: Whitelist filter
.eq('template_id', templateId)
.eq('is_enabled', true)  // Only enabled options

// WRONG: Shows everything
.eq('template_id', templateId)
// Missing is_enabled filter!
```

### Filtering Hierarchy

```
Template Selected
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ 1. TEMPLATE-LEVEL FILTER                                 │
│    template_option_settings.is_enabled = true            │
│    Result: Only explicitly enabled options               │
└──────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ 2. VALUE-LEVEL FILTER                                    │
│    NOT IN template_option_settings.hidden_value_ids[]    │
│    Result: Specific values hidden per template           │
└──────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ 3. CONDITIONAL RULES (option_rules table)                │
│    show_if / filter_values based on other selections     │
│    Result: Dynamic visibility based on user choices      │
└──────────────────────────────────────────────────────────┘
       │
       ▼
  Final Visible Options
```

### Heading Dropdown Filtering

```typescript
// Template configuration
selected_heading_ids: ['uuid-1', 'uuid-2', 'uuid-3']

// Inventory query (in useTreatmentInventory or similar)
const headings = inventory.filter(item => 
  item.category === 'heading' && 
  template.selected_heading_ids?.includes(item.id)
);

// If selected_heading_ids is empty/undefined = NO headings shown
// This is correct behavior - explicit selection required
```

### TWC vs Manual Options Identification

```typescript
// CORRECT: Use metadata field
const isTWCOption = option.metadata?.twc_product_id != null;

// WRONG: Do not use 'source' column (unreliable migration)
const isTWCOption = option.source === 'twc'; // DON'T DO THIS
```

---

## 4. Pricing Calculation Flow

### Single Source of Truth: orientationCalculator.ts

```
User Input (Measurements)
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ orientationCalculator.ts                                 │
│ ├── Calculates linearMeters (includes ALL allowances)    │
│ ├── Includes: rail width × fullness                      │
│ ├── Includes: side hems, returns, SEAM ALLOWANCES        │
│ ├── Includes: header/bottom hems (vertical)              │
│ └── Includes: pattern repeat adjustments                 │
└──────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ useFabricCalculator Hook                                 │
│ Returns: fabricCalculation object                        │
│ ├── linearMeters (per piece)                             │
│ ├── horizontalPiecesNeeded                               │
│ ├── seamsRequired, widthsRequired                        │
│ └── fabricOrientation                                    │
└──────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ DynamicWindowWorksheet.tsx (SINGLE CALCULATION POINT)    │
│ ├── totalMeters = linearMeters × horizontalPiecesNeeded  │
│ ├── fabricCost = totalMeters × pricePerMeter             │
│ ├── manufacturingCost = from headingPriceLookup          │
│ ├── optionsCost = sum of option costs                    │
│ └── Save to calculatedCosts state                        │
└──────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ Display Components (READ ONLY - NO RECALCULATION!)       │
│ ├── AdaptiveFabricPricingDisplay                         │
│ └── CostCalculationSummary                               │
└──────────────────────────────────────────────────────────┘
```

### Manufacturing Cost Resolution

```typescript
// Priority order in headingPriceLookup.ts
1. heading_prices[headingId].price_per_meter  // Template-level override
2. inventory_item.price_per_meter             // Inventory default
3. template.labor_rate                        // Template fallback
4. 0                                          // Last resort
```

### Option Cost Calculation

```typescript
// optionCostCalculator.ts
const calculateOptionCost = (option, measurements, quantity) => {
  switch (option.pricing_method) {
    case 'per_item':
      return option.price * quantity;
    case 'per_running_meter':
      return option.price * railWidthMeters * quantity;
    case 'per_sqm':
      return option.price * sqm * quantity;
    case 'pricing_grid':
      return lookupGridPrice(option.pricing_grid_data, width, drop);
    case 'included':
      return 0;
  }
};
```

---

## 5. Data Sources

### Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA SOURCES                                    │
├──────────────────────┬──────────────────────┬───────────────────────────┤
│   TWC Integration    │    CSV Import        │    Manual Creation        │
├──────────────────────┼──────────────────────┼───────────────────────────┤
│ Edge: twc-sync-      │ Inventory Import     │ Settings UI               │
│ products             │ Modal                │                           │
│                      │                      │                           │
│ Creates:             │ Creates:             │ Creates:                  │
│ - treatment_options  │ - inventory_items    │ - templates               │
│ - option_values      │ - pricing_grids      │ - options                 │
│ - materials          │                      │ - values                  │
│                      │                      │                           │
│ Identifier:          │ Identifier:          │ Identifier:               │
│ metadata.twc_        │ source='csv_import'  │ No special marker         │
│ product_id           │                      │                           │
└──────────────────────┴──────────────────────┴───────────────────────────┘
```

### TWC Sync Process

```
1. User triggers sync in Settings → Integrations
2. Edge function fetches from TWC API
3. Products mapped to treatment_options
4. Options mapped to option_values with metadata.twc_product_id
5. Pricing grids imported separately
6. User enables desired options per template
```

### Key Principle: Source Agnostic

> **The UI should work identically regardless of data source.**
> 
> A manually created option and a TWC-synced option must:
> - Be filtered the same way
> - Be priced the same way
> - Be displayed the same way

---

## 6. Permission System

### Role Hierarchy

```
Owner (Full Access)
   │
   ├── Manager (view_all_* permissions)
   │      │
   │      ├── Dealer (view_assigned_* + sales focus)
   │      │
   │      └── Staff (view_assigned_* + operational focus)
   │
   └── Installer (minimal - assigned jobs only)
```

### Permission Structure

```typescript
// Centralized in src/constants/permissions.ts
const PERMISSIONS = {
  // Job Access
  view_all_jobs: 'view_all_jobs',
  view_assigned_jobs: 'view_assigned_jobs',
  
  // Client Access  
  view_all_clients: 'view_all_clients',
  view_assigned_clients: 'view_assigned_clients',
  
  // Financial (Sensitive)
  view_markups: 'view_markups',           // See cost/profit
  view_team_performance: 'view_team_performance',
  
  // Calendar
  view_all_calendar: 'view_all_calendar',
  view_own_calendar: 'view_own_calendar',
};

// Backward-compatible aliases
const PERMISSION_ALIASES = {
  view_jobs: ['view_all_jobs', 'view_assigned_jobs'],
  view_clients: ['view_all_clients', 'view_assigned_clients'],
};
```

### Permission Merging (Critical!)

```typescript
// CORRECT: Merge custom with role-based
const finalPermissions = new Set([
  ...roleBasedPermissions,    // Base permissions from role
  ...customPermissions,       // Additional custom grants
]);

// WRONG: Replace role-based with custom
const finalPermissions = customPermissions; // Loses all role permissions!
```

---

## 7. Common Pitfalls & Solutions

| # | Problem | Cause | Solution | File to Check |
|---|---------|-------|----------|---------------|
| 1 | All options showing (not filtered) | Missing `is_enabled=true` filter | Add `.eq('is_enabled', true)` | `useTreatmentOptions.ts` |
| 2 | Empty heading dropdown | `selected_heading_ids` not set or IDs don't match | Verify template save + inventory match | `DynamicCurtainOptions.tsx` |
| 3 | Wrong manufacturing price | Heading override not found in `heading_prices` | Check JSON key matches heading ID | `headingPriceLookup.ts` |
| 4 | Cross-account data visible | Missing `effectiveOwnerId` in queryKey | Add to queryKey AND filter | All hooks |
| 5 | Team members see empty app | Custom permissions replacing role permissions | Merge, don't replace | `usePermissions.ts` |
| 6 | Fabric cost mismatch | Display recalculating instead of using source | Remove calculations from display | `CostCalculationSummary.tsx` |
| 7 | Options from wrong account | RLS policy too permissive | Use `get_effective_account_owner()` | Database policies |
| 8 | TWC badge on manual options | Using `source` column instead of metadata | Check `metadata.twc_product_id` | Option components |
| 9 | Price inflation (50×2=150) | Fallback recalculation in display | Use `calculatedPrice` directly | `optionCostCalculator.ts` |
| 10 | Stale data after account switch | `effectiveOwnerId` not in queryKey | Include in all queryKeys | All hooks |
| 11 | "Something went wrong" crash | `SelectItem value=""` in dropdown | Use `value="__none__"` sentinel | All Select components |

---

## 8. UI Component Patterns

### Select Component (CRITICAL!)

Radix UI Select does NOT allow empty string values. Use sentinel values instead.

| Use Case | Sentinel Value | Display Text |
|----------|----------------|--------------|
| Optional selection | `__none__` | "None" / "Not selected" |
| "All" filter | `__all__` | "All [items]" |
| Clear selection | `__clear__` | "Clear" |

**Correct Pattern:**
```typescript
<Select value={selectedId || "__none__"}>
  <SelectContent>
    <SelectItem value="__none__">None</SelectItem>
    {items.map(item => (
      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Handler Pattern:**
```typescript
onValueChange={(value) => {
  const actualValue = value === '__none__' || value === '__all__' ? null : value;
  handleChange(actualValue);
}}
```

**NEVER use:**
- `value=""`
- `value={x || ''}`
- Any empty string as SelectItem value

---

## 9. Universal Testing Checklist

### Before ANY Fix is Considered Complete

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    UNIVERSAL VALIDATION MATRIX                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Account Type:                                                          │
│  □ New account (fresh signup, no data)                                  │
│  □ Existing account (with templates, jobs, data)                        │
│  □ Account with TWC integration enabled                                 │
│  □ Account WITHOUT TWC (manual only)                                    │
│                                                                         │
│  User Type:                                                             │
│  □ Account Owner (parent_account_id = NULL)                             │
│  □ Team Member - Manager role                                           │
│  □ Team Member - Dealer role                                            │
│  □ Team Member - Staff role                                             │
│  □ Team Member - Installer role                                         │
│                                                                         │
│  Data Source:                                                           │
│  □ TWC-synced options                                                   │
│  □ Manually created options                                             │
│  □ CSV-imported inventory                                               │
│  □ Manually created inventory                                           │
│                                                                         │
│  Template Type:                                                         │
│  □ Curtain template (curtain_templates table)                           │
│  □ Product template (product_templates table)                           │
│  □ Template with heading overrides                                      │
│  □ Template with conditional rules                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Automated Checks (Future Implementation)

```typescript
// Run on template save
const validateTemplate = async (template) => {
  const errors = [];
  
  // 1. Heading IDs exist in inventory
  for (const headingId of template.selected_heading_ids || []) {
    const exists = await checkInventoryItem(headingId);
    if (!exists) {
      errors.push(`Heading ${headingId} not found in inventory`);
    }
  }
  
  // 2. Enabled options have valid treatment_option_id
  const settings = await getTemplateOptionSettings(template.id);
  for (const setting of settings.filter(s => s.is_enabled)) {
    const exists = await checkTreatmentOption(setting.treatment_option_id);
    if (!exists) {
      errors.push(`Option ${setting.treatment_option_id} not found`);
    }
  }
  
  // 3. Pricing configuration complete
  if (!template.pricing_method) {
    errors.push('Pricing method not set');
  }
  
  return errors;
};
```

---

## 9. Key Files Reference

### Data Hooks (Multi-Tenant Isolated)

| Hook | Purpose | Key Pattern |
|------|---------|-------------|
| `useTreatmentOptions.ts` | Fetch options for template | `is_enabled=true` filter |
| `useCurtainTemplates.ts` | Fetch curtain templates | `effectiveOwnerId` |
| `useProductTemplates.ts` | Fetch product templates | `effectiveOwnerId` |
| `useTreatmentInventory.ts` | Fetch headings, fabrics | Category filter |
| `usePermissions.ts` | Check user permissions | Role + custom merge |

### Calculation Files

| File | Purpose | Single Source Of |
|------|---------|------------------|
| `orientationCalculator.ts` | Fabric calculations | Linear meters, seams |
| `useFabricCalculator.ts` | Hook wrapper | fabricCalculation object |
| `headingPriceLookup.ts` | Manufacturing costs | Price resolution |
| `optionCostCalculator.ts` | Option costs | Per-item/meter/sqm |
| `calculationFormulas.ts` | Centralized formulas | All calculation logic |

### UI Components

| Component | Purpose | Rule |
|-----------|---------|------|
| `DynamicWindowWorksheet.tsx` | Main worksheet | ONLY calculation point |
| `DynamicCurtainOptions.tsx` | Curtain options UI | Display only |
| `CostCalculationSummary.tsx` | Cost summary | Display only - NO recalc |
| `AdaptiveFabricPricingDisplay.tsx` | Fabric display | Display only |

### Configuration

| File | Purpose |
|------|---------|
| `src/constants/permissions.ts` | All permission definitions |
| `src/constants/roles.ts` | Role definitions and defaults |
| `tailwind.config.ts` | Design tokens |
| `src/index.css` | CSS variables |

---

## Summary: The Three Golden Rules

### 1. Isolation
> Every query uses `effectiveOwnerId` in BOTH queryKey AND filter

### 2. Whitelist
> Options are hidden by default. Only `is_enabled=true` appear.

### 3. Single Source
> Calculations happen ONCE. Display components NEVER recalculate.

---

## 11. Template Health & Diagnostics

### Template Configuration Requirements

For a template to function correctly in the worksheet, it must have:

| Requirement | Table | Check |
|-------------|-------|-------|
| At least 1 heading | `curtain_templates.headings` (JSON) | `Array.length > 0` |
| At least 1 enabled option | `template_option_settings` | `is_enabled = true` |
| Valid pricing | `curtain_templates.manufacturing_prices` | Non-empty array |

### Health Check Component

Use `<TemplateHealthWarning templateId={id} />` in worksheet components to alert users of misconfigured templates.

### Diagnostic SQL Query

Run this to find all templates with missing configuration:

```sql
-- Find templates with no enabled options
SELECT 
  ct.id,
  ct.name,
  ct.user_id,
  COUNT(tos.id) as enabled_options,
  jsonb_array_length(COALESCE(ct.headings, '[]'::jsonb)) as headings_count
FROM curtain_templates ct
LEFT JOIN template_option_settings tos 
  ON tos.template_id = ct.id AND tos.is_enabled = true
WHERE ct.active = true
GROUP BY ct.id
HAVING COUNT(tos.id) = 0 OR jsonb_array_length(COALESCE(ct.headings, '[]'::jsonb)) = 0
ORDER BY ct.user_id;
```

### Common "Empty Worksheet" Causes

| Symptom | Cause | Solution |
|---------|-------|----------|
| No options appear | No `is_enabled=true` settings | Configure template options in Settings |
| No headings dropdown | Empty `headings` array | Add headings in template editor |
| "Template not found" | Invalid template ID in URL | Verify template exists for account |
| Prices show 0 | No pricing rules configured | Configure manufacturing prices |

---

## 12. URL Parameter Validation (CRITICAL!)

### Required Validations

ALWAYS validate URL parameters before using them in queries or passing to components.

| Parameter | Table | Action if Invalid |
|-----------|-------|-------------------|
| `jobId` | `measurement_jobs` | Show `JobNotFound`, clear URL params |
| `templateId` | `curtain_templates` | Clear from URL, show toast notification |
| `windowId` | `job_windows` | Clear from URL |

### Validation Pattern

```typescript
// 1. Query to validate ID exists
const { data: jobExists, isLoading: validatingJob } = useQuery({
  queryKey: ['validate-job-exists', selectedJobId],
  queryFn: async () => {
    if (!selectedJobId) return null;
    const { data } = await supabase
      .from('measurement_jobs')
      .select('id')
      .eq('id', selectedJobId)
      .maybeSingle();
    return !!data;
  },
  enabled: !!selectedJobId,
  staleTime: 30000,
});

// 2. While validating: show skeleton/loading
if (validatingJob) {
  return <LoadingState />;
}

// 3. If invalid: clear from URL + show error
if (jobExists === false) {
  return <JobNotFound onBack={clearInvalidParams} />;
}

// 4. If valid: proceed with rendering
return <JobDetailPage jobId={selectedJobId} />;
```

### Key Files

- `JobsPage.tsx`: Validates `jobId` before rendering `JobDetailPage`
- `QuotationTab.tsx`: Validates `templateId` and clears if invalid
- `JobNotFound.tsx`: Friendly error component for invalid job IDs

---

*Last Updated: January 2025*
*Maintainers: Development Team*
