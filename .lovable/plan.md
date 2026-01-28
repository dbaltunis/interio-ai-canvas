
# Fix TWC Import Issues: Fabric Details, Grid Linking, Validation UX & Pre-Selection

## Issues Identified

### Issue 1: Curtain Fabric Details Missing (Width Shows "Not set - check inventory", Price $0.00)
**Current State:** TWC sync sets `fabric_width: 300` and `cost_price: 0` for curtain fabrics
**Problem:** While `fabric_width` IS being set (300cm), the `cost_price` and `selling_price` remain at $0.00 because TWC doesn't provide pricing data in their API response

**Database Check Confirms:**
| name | fabric_width | cost_price | price_group |
|------|-------------|------------|-------------|
| Curtains - AMANDA | 300 | 0 | 2 |
| Curtains - AESOP | 300 | 0 | 6 |

The fabrics DO have `fabric_width` (300cm), `price_group`, and `vendor_id` set - the sync is working. However, the UI shows "Not set - check inventory" because the component may be checking a different field or the data isn't flowing through correctly.

### Issue 2: Grids Not Attached to Fabrics ("No pricing grid for Group X")
**Current State:** Grids exist in DB with matching `price_group` values (1, 2, 6, etc.)
**Problem:** The grid resolution logic may not be matching correctly because:
1. Case sensitivity: Fabric has `price_group: "2"` but grid might have `"GROUP2"` or `"BUDGET"`
2. Product type mismatch: `product_type: "curtains"` vs template's `treatment_category`
3. Vendor ID not matching (different TWC vendor IDs per account)

### Issue 3: Red "Required" List with Configure Template Button
**Current State:** Shows red alert with "X is required" for many options
**Problem:** 
- TWC templates create options with `required: false` but validation still shows red styling
- The `Configure Template` button navigates to settings but may not work for TWC templates
- isTWCTemplate detection suppresses alerts but might not be working for all cases

### Issue 4: Configure Template Button Goes Nowhere
**Current State:** Button calls `navigate('/settings?tab=products&subtab=templates&editTemplate=${templateId}')`
**Problem:** If templateId is undefined or the route doesn't handle it properly, it navigates to an empty page

### Issue 5: No Option Pre-Selection (User Request)
**Current State:** Auto-select only works when there's exactly 1 option
**Desired State:** Pre-select first option in ALL dropdowns, with a setting to toggle this behavior

---

## Solution Implementation

### Part 1: Fix Fabric Width Display in UI

The fabric data IS correct in DB (`fabric_width: 300`), but the UI component may be looking at the wrong field.

**File:** `src/components/job-creation/treatment-pricing/fabric-details/FabricBasicDetails.tsx` (or similar)

- Ensure it reads `fabric_width` directly from fabric item
- Add fallback: `fabricWidth = fabric.fabric_width || fabric.fabric_width_cm || 300`

### Part 2: Fix Grid Resolution for TWC Fabrics

**Files to Update:**
- `src/utils/pricing/gridAutoMatcher.ts` - Case-insensitive price_group matching
- `src/hooks/pricing/useFabricEnrichment.ts` - Ensure vendor_id is passed

**Changes:**
```typescript
// gridAutoMatcher.ts - Make price_group matching case-insensitive
.ilike('price_group', priceGroup) // Instead of .eq()
// OR normalize both sides:
const normalizedPriceGroup = priceGroup?.toString().toUpperCase();
```

### Part 3: Suppress Red Validation for TWC + Remove Configure Template Button

**File:** `src/components/shared/ValidationAlert.tsx`

**Changes:**
1. Add prop `hideConfigure?: boolean` to suppress the button
2. Add prop `isTWCTemplate?: boolean` to change styling/behavior

**File:** `src/components/measurements/dynamic-options/DynamicCurtainOptions.tsx`

**Changes:**
1. Pass `hideConfigure={isTWCTemplate}` to ValidationAlert
2. Ensure isTWCTemplate detection works for all TWC template patterns

### Part 4: Remove Configure Template Button from TWC Templates

**File:** `src/components/shared/ValidationAlert.tsx`

```typescript
// Hide button if no templateId OR if explicitly hidden
{hasActions && templateId && !hideConfigure && (
  <Button ... />
)}
```

### Part 5: Add Pre-Select First Option Toggle

**A. Add Setting to Account Settings**

**File:** `src/hooks/useAccountSettings.ts` - Add to interface:
```typescript
interface AccountSettings {
  // ... existing fields
  workflow_settings?: {
    auto_select_first_option?: boolean; // New setting
    // ... other workflow settings
  };
}
```

**B. Update Auto-Selection Logic**

**File:** `src/components/job-creation/treatment-pricing/window-covering-options/CascadingTraditionalOptions.tsx`

```typescript
// Current: Only auto-select if single option
if (filteredOptions.length === 1 && !currentSelection) { ... }

// New: Auto-select first if enabled in settings
const { data: settings } = useAccountSettings();
const autoSelectFirst = settings?.workflow_settings?.auto_select_first_option ?? true;

if (!currentSelection && filteredOptions.length > 0) {
  if (filteredOptions.length === 1 || autoSelectFirst) {
    // Auto-select first option
  }
}
```

**File:** `src/components/shared/CascadingOptionSelect.tsx`

```typescript
// Update auto-select to work for all cases when enabled
useEffect(() => {
  if (autoSelectFirst && options.length > 0 && !selectedId) {
    stableOnSelect(options[0].id, null);
  }
}, [options, selectedId, autoSelectFirst]);
```

**C. Add Toggle in Settings UI**

**File:** `src/components/settings/tabs/products/WorkflowSettingsSection.tsx` (new or existing)

```tsx
<div className="flex items-center justify-between">
  <div>
    <Label>Auto-select first option</Label>
    <p className="text-sm text-muted-foreground">
      Automatically pre-select the first option in dropdowns
    </p>
  </div>
  <Switch
    checked={settings?.workflow_settings?.auto_select_first_option ?? true}
    onCheckedChange={(checked) => updateSettings({
      workflow_settings: { ...settings?.workflow_settings, auto_select_first_option: checked }
    })}
  />
</div>
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/utils/pricing/gridAutoMatcher.ts` | Case-insensitive price_group matching |
| `src/hooks/pricing/useFabricEnrichment.ts` | Ensure vendor_id flows through |
| `src/components/shared/ValidationAlert.tsx` | Add `hideConfigure` prop, conditionally hide button |
| `src/components/measurements/dynamic-options/DynamicCurtainOptions.tsx` | Pass hideConfigure for TWC templates |
| `src/components/shared/CascadingOptionSelect.tsx` | Add autoSelectFirst prop with setting integration |
| `src/components/job-creation/treatment-pricing/window-covering-options/CascadingTraditionalOptions.tsx` | Integrate auto-select first setting |
| `src/components/job-creation/treatment-pricing/window-covering-options/useHierarchicalSelections.ts` | Integrate auto-select first setting |
| `src/hooks/useAccountSettings.ts` | Add workflow_settings interface |
| `src/components/settings/tabs/WorkflowTab.tsx` or similar | Add toggle for pre-selection setting |

---

## Technical Details

### Grid Matching Fix
```typescript
// src/utils/pricing/gridAutoMatcher.ts
export const autoMatchPricingGrid = async (params: AutoMatchParams) => {
  const { supplierId, productType, priceGroup, userId } = params;
  
  // Normalize price group for case-insensitive matching
  const normalizedPriceGroup = priceGroup?.toString().trim();
  
  // Try exact match first, then case-insensitive
  let { data: grids, error } = await supabase
    .from('pricing_grids')
    .select('*')
    .eq('user_id', userId)
    .eq('product_type', productType)
    .eq('active', true);
  
  if (grids && grids.length > 0) {
    // Case-insensitive price_group match
    const matchingGrid = grids.find(g => 
      g.price_group?.toString().toUpperCase() === normalizedPriceGroup?.toUpperCase()
    );
    // Also try without "GROUP" prefix: "2" matches "GROUP2" or "2"
    if (!matchingGrid) {
      const numericMatch = grids.find(g => 
        g.price_group?.toString().replace(/GROUP/i, '').trim() === normalizedPriceGroup
      );
      if (numericMatch) return numericMatch;
    }
  }
};
```

### Validation Alert Prop Update
```typescript
// src/components/shared/ValidationAlert.tsx
interface ValidationAlertProps {
  errors?: ValidationError[];
  warnings?: ValidationError[];
  className?: string;
  templateId?: string;
  onConfigureTemplate?: () => void;
  hideConfigure?: boolean; // NEW: Hide the Configure Template button
}

// In render:
{hasActions && templateId && !hideConfigure && (
  <Button ...>Configure Template</Button>
)}
```

### Auto-Select First Option Flow
```typescript
// src/components/shared/CascadingOptionSelect.tsx
interface CascadingOptionSelectProps {
  // ... existing props
  autoSelectFirst?: boolean; // NEW: Default to first option if multiple
}

// Update auto-select effect:
useEffect(() => {
  if (options.length > 0 && !selectedId && hasAutoSelected.current !== options[0].id) {
    // Only auto-select if single option OR autoSelectFirst is enabled
    if (options.length === 1 || autoSelectFirst) {
      hasAutoSelected.current = options[0].id;
      setTimeout(() => stableOnSelect(options[0].id, null), 0);
    }
  }
}, [options, selectedId, autoSelectFirst]);
```

---

## Expected Behavior After Implementation

### Grid Matching
- Fabrics with `price_group: "2"` will match grids with `"2"`, `"GROUP2"`, `"group2"`, etc.
- No more "No pricing grid for Group X" warnings when grids exist

### Validation Alert
- TWC templates: No red "required" list, no Configure Template button
- Non-TWC templates: Continue showing validation as before

### Pre-Selection
- Default behavior: First option in every dropdown is pre-selected
- Setting toggle in Settings: Users can disable this if they prefer manual selection
- Single option: Always auto-selected (existing behavior)

### UX Improvement
- Users see populated dropdowns immediately
- Can still change options if needed
- Less friction when creating quotes with TWC products
