

# Venetian Blinds Complete Setup - Implementation Plan

## Current Status ✅

| Component | Status | Details |
|-----------|--------|---------|
| Currency (EUR) | ✅ Complete | account_settings.currency = EUR |
| Vendor | ✅ Complete | Medinės Žaliuzės LT (id: f7e8d9c0-1234-5678-9abc-def012345678) |
| 6 Pricing Grids | ✅ Complete | BASSWOOD_25, BASSWOOD_50, BAMBOO_25, BAMBOO_50, ABACHI_50, PAULOWNIA_50 |
| Venetian Template | ❌ Not created | Needs insertion |
| Slat Materials | ❌ Not created | 58 items needed |
| Treatment Options | ❌ Not created | 5 options with ~30 values |
| Option Rules | ❌ Not created | 3 conditional rules |

## Implementation: 3 Database Migrations

### Migration 1: Create Venetian Template + Materials

**1. Insert Template** (`curtain_templates`)
```sql
INSERT INTO curtain_templates (
  id, user_id, name, description, treatment_category,
  pricing_type, manufacturing_type, system_type, active,
  fullness_ratio, fabric_width_type, fabric_direction,
  bottom_hem, side_hems, seam_hems
)
VALUES (
  gen_random_uuid(),
  '32a92783-f482-4e3d-8ebf-c292200674e5',
  'Medinės žaliuzės',
  'Medinės žaliuzės su pasirenkamais lamelių pločiais ir spalvomis',
  'venetian_blinds',
  'pricing_grid',
  'venetian',
  'venetian_standard',
  true,
  1.0, 'standard', 'horizontal',
  0, 0, 0
);
```

**2. Insert 58 Slat Materials** (`enhanced_inventory_items`)

Categories and colors:
- **25mm Basswood** (7): Stark, Natural, Light Oak, Golden Oak, Yarrin, Walnut, Mystic
- **25mm Bamboo** (9): Haze, Armour, Cinder, Zaya, Neo, Karri, Arcana, Danta, Mari
- **50mm Basswood** (14): Stark, Soft White, Alpine, Alabaster, Light Oak, Natural, Golden Oak, Clay, Storm, Yarrin, Sin, Walnut, Linen, Mystic
- **50mm Bamboo** (16): Innocent, Flax, Haze, Armour, Cinder, Cyber, Mari, Danta, Arcana, Karri, Neo, Zaya + 4 more
- **50mm Abachi** (4): Elkin, Kota, Hibano, Aro
- **50mm Paulownia** (8): Lavanco, Nubo, Helgriza, Tamno, Malummo, Skanda, Medus, Bruli

Each material will have:
- `category`: 'material'
- `subcategory`: 'venetian_slats'
- `price_group`: Links to pricing grid (e.g., BASSWOOD_25)
- `vendor_id`: Links to Medinės Žaliuzės LT

### Migration 2: Create Treatment Options + Values

**5 Treatment Options** (`treatment_options`)

| Key | Label | Input Type |
|-----|-------|------------|
| slat_width_gustin | Lamelių plotis | select |
| mechanism_type_gustin | Mechanizmo tipas | select |
| finish_type_gustin | Apdailos tipas | select |
| cord_type_gustin | Virvelių tipas | select |
| cord_tips_gustin | Varpelių tipas | select |

**Option Values** (`option_values`) with pricing in `extra_data`:

**Slat Width (3 values):**
- 25_iso → 25 mm ISO | €0
- 25_timberlux → 25 mm Timberlux | €0
- 50_timberlux → 50 mm Timberlux | €0

**Mechanism Type (9 values):**
- vartymo_rankinis → Vartymo mechanizmas | €0
- pakelimo_rankinis → Pakėlimo mechanizmas | €0
- valdymo_pusiu → Valdymo pusių (K/D) | €0
- somfy_rts → Automatinis Somfy RTS | €185
- somfy_wt → Automatinis Somfy WT | €165
- tilt_only → Tilt only | €45
- nukreipimo_trosai → Nukreipiamieji trosai | €25
- apatinio_fiksacija → Apatinio profilio fiksacija | €15
- saugus_vaikas → Saugus vaikas | €0

**Finish Type (4 values):**
- tiesi_at → Tiesi – AT | €0
- vienas_ak → Su užlenkimu – AK | €8
- vienas_ad → Su užlenkimu – AD | €8
- du_akd → Su dviem – AKD | €15

**Cord Type (4 values):**
- virvelines → Virvelinės | €0
- juostines_10 → Juostinės 10mm | €0
- juostines_25 → Juostinės 25mm | €0
- juostines_38 → Juostinės 38mm | €0

**Cord Tips (8 values):**
- mediniai → Mediniai | €0
- metaliniai_auksas → Auksas | €12
- metaliniai_varis → Varis | €12
- metaliniai_chromas → Chromas | €12
- metaliniai_antracitas → Antracitas | €12
- metaliniai_juoda → Juoda | €12
- metaliniai_aliuminis → Šlifuotas aliuminis | €12
- metaliniai_balta → Matinė balta | €12

### Migration 3: Create Option Categories + Rules + Template Links

**5 Option Categories** (`option_type_categories`)

| type_key | type_label | treatment_category |
|----------|------------|-------------------|
| slat_width_gustin | Lamelių plotis | venetian_blinds |
| mechanism_type_gustin | Mechanizmo tipas | venetian_blinds |
| finish_type_gustin | Apdailos tipas | venetian_blinds |
| cord_type_gustin | Virvelių tipas | venetian_blinds |
| cord_tips_gustin | Varpelių tipas | venetian_blinds |

**3 Option Rules** (`option_rules`)

**Rule 1: Filter mechanisms for 25mm slats**
When `slat_width_gustin` IN ['25_iso', '25_timberlux']:
→ Filter `mechanism_type_gustin` to only show: vartymo_rankinis, pakelimo_rankinis, valdymo_pusiu, nukreipimo_trosai, apatinio_fiksacija, saugus_vaikas
(Hides: somfy_rts, somfy_wt, tilt_only)

**Rule 2: Filter cord types for 25mm slats**
When `slat_width_gustin` IN ['25_iso', '25_timberlux']:
→ Filter `cord_type_gustin` to only show: virvelines, juostines_10, juostines_25
(Hides: juostines_38)

**Rule 3: Show all options for 50mm**
When `slat_width_gustin` = '50_timberlux':
→ Show all values for mechanism_type_gustin and cord_type_gustin

**5 Template Option Links** (`template_option_settings`)
Links each treatment_option to the Medinės žaliuzės template with `is_enabled: true`

## Database Schema Used

| Table | Key Columns |
|-------|-------------|
| `curtain_templates` | user_id, name, treatment_category, pricing_type, system_type |
| `enhanced_inventory_items` | user_id, name, category, subcategory, price_group, vendor_id |
| `treatment_options` | key, label, input_type, treatment_category, account_id |
| `option_values` | option_id, code, label, extra_data (contains price) |
| `option_type_categories` | type_key, type_label, treatment_category, account_id |
| `option_rules` | template_id, condition (JSON), effect (JSON) |
| `template_option_settings` | template_id, treatment_option_id, is_enabled |

## Gustin Decor Identifiers

| Entity | ID |
|--------|-----|
| User ID | 32a92783-f482-4e3d-8ebf-c292200674e5 |
| Account ID | 022e6be1-0871-4112-9b07-ff972c01e6fc |
| Vendor ID | f7e8d9c0-1234-5678-9abc-def012345678 |

## Post-Implementation Testing

1. **Settings → Products**: Verify "Medinės žaliuzės" template appears
2. **Library → Materials**: Verify 58 slat colors appear with correct vendor
3. **Settings → Products → Options**: Verify 5 option categories appear under venetian_blinds
4. **Create Quote → Venetian Blinds**:
   - Select 25mm → Somfy options hidden
   - Select 50mm → All mechanism options visible
   - Select metal tips → Price +€12
   - Enter dimensions → Grid price resolves

## What Will Be Created

| Item | Count |
|------|-------|
| Venetian Template | 1 |
| Slat Materials | 58 |
| Treatment Options | 5 |
| Option Values | 28 |
| Option Categories | 5 |
| Option Rules | 3 |
| Template Option Links | 5 |

