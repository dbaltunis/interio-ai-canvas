
# Complete Venetian Blinds Setup for Gustin Decor

## Executive Summary

This plan creates a complete venetian blind product line in InterioApp for Gustin Decor, including pricing grids, slat materials, configurable options with conditional rules, and all the mechanism/finish choices you've specified. This is **Gustin Decor account-specific** and will not affect other accounts.

## Current State (Gustin Decor)

| Component | Status |
|-----------|--------|
| Curtain Templates | 2 (Užuolaida, Naktinė užuolaida) |
| Curtain Fabrics | 1,356 items |
| Venetian Blind Templates | **0 - needs setup** |
| Venetian Slat Materials | **0 - needs setup** |
| Pricing Grids | **0 - needs import** |
| Treatment Options | **0 - needs creation** |

## Scope Clarification

**This setup is ONLY for Gustin Decor account** - all templates, options, pricing grids, and rules will be created with the Gustin Decor user_id/account_id. Other InterioApp accounts are completely isolated.

## Recommended Workflow Order

```text
┌────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Create Vendor (Supplier)                                         │
│  "Medinės Žaliuzės LT" or similar local supplier                         │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Upload Pricing Grids (6 grids from your CSV files)              │
│  ABACHI 50mm, BAMBOO 25mm, BAMBOO 50mm, BASSWOOD 25mm,                   │
│  BASSWOOD 50mm, PAULOWNIA 50mm                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Add Slat Materials to Library (Inventory)                        │
│  Each color + slat width = 1 inventory item                              │
│  Link to corresponding pricing grid via price_group                       │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Create Venetian Blind Template                                   │
│  treatment_category: venetian_blinds                                      │
│  pricing_type: grid (uses width x drop lookup)                           │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: Create Treatment Options                                         │
│  Mechanizmo tipas, Apdailos tipas, Virvelės tipas,                       │
│  Juostinės pločiai, Varpelių tipas                                       │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STEP 6: Create Option Rules (Conditional Logic)                          │
│  e.g., "When slat_width = 50mm, show 38mm juostinės"                     │
│  e.g., "When slat_width = 25mm, hide Tilt Only mechanism"                │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STEP 7: Test in Quote Builder                                            │
│  Verify pricing, options, and rules work correctly                       │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STEP 8: Connect Shopify (AFTER pricing verified)                         │
│  Sync products to online store                                           │
└────────────────────────────────────────────────────────────────────────────┘
```

## Technical Implementation Details

### Step 1: Create Supplier/Vendor

Navigate to: **Settings → Suppliers**

| Field | Value |
|-------|-------|
| Name | Medinės Žaliuzės LT (or your supplier name) |
| Type | Supplier |
| Contact | (your contact details) |

### Step 2: Upload Pricing Grids

Navigate to: **Settings → Pricing → Pricing Grids → Bulk Upload**

Use the CSV files you provided:

| File | Grid Name | Price Group | Product Type |
|------|-----------|-------------|--------------|
| ABACHI_50mm.csv | Venetian - Abachi 50mm | ABACHI_50 | venetian_blinds |
| BAMBOO_25mm.csv | Venetian - Bamboo 25mm | BAMBOO_25 | venetian_blinds |
| BAMBOO_50mm.csv | Venetian - Bamboo 50mm | BAMBOO_50 | venetian_blinds |
| BASWOOD_25mm.csv | Venetian - Basswood 25mm | BASSWOOD_25 | venetian_blinds |
| BASWOOD_50mm.csv | Venetian - Basswood 50mm | BASSWOOD_50 | venetian_blinds |
| PAULOWNIA_50mm.csv | Venetian - Paulownia 50mm | PAULOWNIA_50 | venetian_blinds |

**Grid Structure**: Width columns (500-3600mm) × Height rows (500-3200mm) → Price in EUR

### Step 3: Add Slat Materials to Library

Navigate to: **Library → Materials → Add New**

Create inventory items for each color. Example entries:

**25mm ISO & Timberlux Basswood (price_group: BASSWOOD_25):**
| Name | Color/Finish | Price Group | Category |
|------|--------------|-------------|----------|
| Basswood 25mm - Stark (balta) | Stark | BASSWOOD_25 | venetian_slats |
| Basswood 25mm - Natural | Natural | BASSWOOD_25 | venetian_slats |
| Basswood 25mm - Light Oak | Light Oak | BASSWOOD_25 | venetian_slats |
| Basswood 25mm - Golden Oak | Golden Oak | BASSWOOD_25 | venetian_slats |
| Basswood 25mm - Yarrin | Yarrin | BASSWOOD_25 | venetian_slats |
| Basswood 25mm - Walnut | Walnut | BASSWOOD_25 | venetian_slats |
| Basswood 25mm - Mystic | Mystic | BASSWOOD_25 | venetian_slats |

**25mm Bamboo (price_group: BAMBOO_25):**
| Name | Color/Finish | Price Group |
|------|--------------|-------------|
| Bamboo 25mm - Haze | Haze | BAMBOO_25 |
| Bamboo 25mm - Armour | Armour | BAMBOO_25 |
| Bamboo 25mm - Cinder | Cinder | BAMBOO_25 |
| ... (9 colors total) | ... | ... |

**50mm Timberlux Basswood (price_group: BASSWOOD_50):**
| Name | Color/Finish | Price Group |
|------|--------------|-------------|
| Basswood 50mm - Stark | Stark | BASSWOOD_50 |
| Basswood 50mm - Soft White | Soft White | BASSWOOD_50 |
| ... (14 colors total) | ... | ... |

**50mm Bamboo (price_group: BAMBOO_50):**
| Name | Color/Finish | Price Group |
|------|--------------|-------------|
| Bamboo 50mm - Innocent | Innocent | BAMBOO_50 |
| Bamboo 50mm - Flax | Flax | BAMBOO_50 |
| ... (16 colors total) | ... | ... |

**50mm Abachi (price_group: ABACHI_50):**
| Name | Color/Finish | Price Group |
|------|--------------|-------------|
| Abachi 50mm - Elkin | Elkin | ABACHI_50 |
| Abachi 50mm - Kota | Kota | ABACHI_50 |
| ... (4 colors total) | ... | ... |

**50mm Paulownia (price_group: PAULOWNIA_50):**
| Name | Color/Finish | Price Group |
|------|--------------|-------------|
| Paulownia 50mm - Lavanco | Lavanco | PAULOWNIA_50 |
| Paulownia 50mm - Nubo | Nubo | PAULOWNIA_50 |
| ... (8 colors total) | ... | ... |

### Step 4: Create Venetian Blind Template

Navigate to: **Settings → Products → New Template**

| Field | Value |
|-------|-------|
| Name | Medinės žaliuzės (Venetian Blinds) |
| Treatment Category | venetian_blinds |
| Pricing Type | Grid |
| Description | Medinės žaliuzės su pasirenkamais lamelių pločiais ir spalvomis |

### Step 5: Create Treatment Options

Navigate to: **Settings → Products → Options** or configure in Template editor

**Option 1: Lamelių plotis (Slat Width)**
| Value Code | Label | Notes |
|------------|-------|-------|
| 25_iso | 25 mm ISO | Standard |
| 25_timberlux | 25 mm Timberlux | Premium |
| 50_timberlux | 50 mm Timberlux | Wide slat |

**Option 2: Mechanizmo tipas (Mechanism Type)**
Based on your image:
| Value Code | Label | Applies To | Price Impact |
|------------|-------|------------|--------------|
| vartymo_rankinis | Vartymo mechanizmas (rankinis) | 25mm, 50mm | +€0 |
| pakelimo_rankinis | Pakėlimo mechanizmas (rankinis) | 25mm, 50mm | +€0 |
| valdymo_pusiu | Valdymo pusių pasirinkimas (K/D) | 25mm, 50mm | +€0 |
| somfy_rts | Automatinis - Somfy RTS | 50mm only | +€185 |
| somfy_wt | Automatinis - Somfy WT (laidinis) | 50mm only | +€165 |
| tilt_only | Tilt only mechanizmas | 50mm only | +€45 |
| nukreipimo_trosai | Nukreipiamieji trosai | 25mm, 50mm | +€25 |
| apatinio_fiksacija | Apatinio profilio fiksacija | 25mm, 50mm | +€15 |
| saugus_vaikas | Saugus vaikas sistema | All | +€0 (included) |

**Option 3: Apdailos tipas (Finish Type)**
| Value Code | Label | Description | Price Impact |
|------------|-------|-------------|--------------|
| tiesi_a | Tiesi – AT | Be užlenkimų | +€0 |
| vienas_uzlenkimas_ak | Su užlenkimu – AK | Kairėje | +€8 |
| vienas_uzlenkimas_ad | Su užlenkimu – AD | Dešinėje | +€8 |
| du_uzlenkimai_akd | Su dviem – AKD | Abu šonai | +€15 |

**Option 4: Virvelių tipas (Cord Type)**
| Value Code | Label | Description |
|------------|-------|-------------|
| virvelės | Virvelinės (standartinės) | Subtilios, mažiau matomos |
| juostines_10 | Juostinės 10mm | Plokščios arba eglutės |
| juostines_25 | Juostinės 25mm | Platesnės dekoratyvinės |
| juostines_38 | Juostinės 38mm | Tik 50mm lamelėms |

**Option 5: Varpelių tipas (Cord Tips/Tassels)**
| Value Code | Label | Price Impact |
|------------|-------|--------------|
| mediniai | Mediniai (standartiniai) | +€0 |
| metaliniai_auksas | Metaliniai - Auksas | +€12 |
| metaliniai_varis | Metaliniai - Varis | +€12 |
| metaliniai_chromas | Metaliniai - Chromas | +€12 |
| metaliniai_antracitas | Metaliniai - Antracitas | +€12 |
| metaliniai_juoda | Metaliniai - Juoda | +€12 |
| metaliniai_aliuminis | Metaliniai - Šlifuotas aliuminis | +€12 |
| metaliniai_balta | Metaliniai - Matinė balta | +€12 |

### Step 6: Create Option Rules (Conditional Logic)

Navigate to: **Settings → Products → [Venetian Template] → Product Rules**

**Rule 1: Hide Somfy motors for 25mm slats**
```
WHEN slat_width = 25_iso OR slat_width = 25_timberlux
THEN HIDE mechanism_type VALUE somfy_rts
AND HIDE mechanism_type VALUE somfy_wt
AND HIDE mechanism_type VALUE tilt_only
```

**Rule 2: Hide 38mm cord tape for 25mm slats**
```
WHEN slat_width = 25_iso OR slat_width = 25_timberlux
THEN HIDE cord_type VALUE juostines_38
```

**Rule 3: Show appropriate materials based on slat width**
```
WHEN slat_width = 25_iso
THEN FILTER material TO show only BASSWOOD_25 and BAMBOO_25
```

```
WHEN slat_width = 50_timberlux
THEN FILTER material TO show only BASSWOOD_50, BAMBOO_50, ABACHI_50, PAULOWNIA_50
```

### Step 7: Testing Checklist

- [ ] Select 25mm slat → Only 25mm materials appear
- [ ] Select 50mm slat → 50mm materials + Somfy options appear
- [ ] Change dimensions → Price updates from grid
- [ ] Select metal tips → Price increases by €12
- [ ] Select AKD finish → Price increases by €15

### Step 8: Shopify Integration (After Verification)

**Only after pricing is verified in InterioApp**, connect Shopify to sync:
- Venetian blinds as a product category
- Fabrics/materials as variants
- Calculator integration for pricing

## Database Changes Required

### Pricing Grids (6 new records)
```sql
INSERT INTO pricing_grids (user_id, name, grid_code, grid_data, product_type, price_group, active)
VALUES 
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Venetian - Abachi 50mm', 'VEN-ABACHI50', {...}, 'venetian_blinds', 'ABACHI_50', true),
  -- ... 5 more grids
```

### Inventory Items (~60 new records for all colors)
```sql
INSERT INTO enhanced_inventory_items (user_id, name, category, subcategory, price_group, active)
VALUES
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 25mm - Stark', 'material', 'venetian_slats', 'BASSWOOD_25', true),
  -- ... more slat colors
```

### Templates (1 new record)
```sql
INSERT INTO curtain_templates (user_id, name, treatment_category, pricing_type, active)
VALUES ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Medinės žaliuzės', 'venetian_blinds', 'grid', true)
```

### Treatment Options (5 option types with ~30 values total)
Created via the UI in Settings → Products → Options

### Option Rules (~5 rules)
Created via the UI in Template → Product Rules

## What You Can Do in InterioApp UI

| Task | Where in App |
|------|--------------|
| Upload pricing grids | Settings → Pricing → Pricing Grids → Bulk Upload |
| Add materials | Library → Materials → Add New |
| Create templates | Settings → Products → New Template |
| Create options | Settings → Products → Options |
| Set up rules | Settings → Products → [Template] → Product Rules |
| Toggle product visibility | Library → [item] → Active toggle |
| Test pricing | Projects → New Quote → Add Treatment |

## Files to Modify (Code Changes)

No code changes are strictly required - the app already supports:
- Venetian blinds as a treatment category
- Grid-based pricing
- Conditional option rules
- Library inventory management

However, I recommend these **optional enhancements**:

| Enhancement | File | Purpose |
|-------------|------|---------|
| Auto-import slat colors from CSV | New edge function | Bulk create inventory items |
| Storefront collections endpoint | Already created | Expose collections to online store |
| Currency fix NZD → EUR | Database update | Ensure correct currency display |

## Summary: What To Do First

1. **Fix Currency**: Update account_settings currency from NZD to EUR
2. **Create Supplier**: Add your venetian blind supplier in Settings
3. **Upload 6 Pricing Grids**: Use Bulk Upload with your CSV files
4. **Add Slat Materials**: Create ~60 inventory items (or I can help automate this)
5. **Create Template**: Medinės žaliuzės template
6. **Add Options & Rules**: Configure mechanism, finish, cord types
7. **Test in Quote Builder**: Verify pricing works
8. **Then Connect Shopify**: After pricing verified
