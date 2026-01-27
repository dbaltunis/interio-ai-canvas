
# Continue: Venetian Blinds Setup for Gustin Decor

## Current Status ✅

| Component | Status |
|-----------|--------|
| Currency fix (NZD → EUR) | ✅ Complete |
| Vendor (Medinės Žaliuzės LT) | ✅ Created |
| 6 Pricing Grids imported | ✅ Complete |
| Venetian Template | ❌ Not created |
| Slat Materials (~60 items) | ❌ Not created |
| Treatment Options | ❌ Not created |
| Option Rules | ❌ Not created |

## Next Steps to Implement

### Step 1: Create Venetian Blind Template

Insert into `curtain_templates`:

| Field | Value |
|-------|-------|
| name | Medinės žaliuzės |
| treatment_category | venetian_blinds |
| pricing_type | pricing_grid |
| system_type | venetian_standard |
| description | Medinės žaliuzės su pasirenkamais lamelių pločiais ir spalvomis |
| active | true |

### Step 2: Create Slat Materials (58 items total)

Insert into `enhanced_inventory_items` with `category: 'material'`, `subcategory: 'venetian_slats'`:

**25mm Basswood (7 colors):**
- Basswood 25mm - Stark (balta) | price_group: BASSWOOD_25
- Basswood 25mm - Natural | price_group: BASSWOOD_25
- Basswood 25mm - Light Oak | price_group: BASSWOOD_25
- Basswood 25mm - Golden Oak | price_group: BASSWOOD_25
- Basswood 25mm - Yarrin | price_group: BASSWOOD_25
- Basswood 25mm - Walnut | price_group: BASSWOOD_25
- Basswood 25mm - Mystic (antracitas) | price_group: BASSWOOD_25

**25mm Bamboo (9 colors):**
- Bamboo 25mm - Haze | price_group: BAMBOO_25
- Bamboo 25mm - Armour | price_group: BAMBOO_25
- Bamboo 25mm - Cinder | price_group: BAMBOO_25
- Bamboo 25mm - Zaya | price_group: BAMBOO_25
- Bamboo 25mm - Neo | price_group: BAMBOO_25
- Bamboo 25mm - Karri | price_group: BAMBOO_25
- Bamboo 25mm - Arcana | price_group: BAMBOO_25
- Bamboo 25mm - Danta | price_group: BAMBOO_25
- Bamboo 25mm - Mari | price_group: BAMBOO_25

**50mm Basswood (14 colors):**
- Basswood 50mm - Stark | price_group: BASSWOOD_50
- Basswood 50mm - Soft White | price_group: BASSWOOD_50
- Basswood 50mm - Alpine | price_group: BASSWOOD_50
- Basswood 50mm - Alabaster | price_group: BASSWOOD_50
- Basswood 50mm - Light Oak | price_group: BASSWOOD_50
- Basswood 50mm - Natural | price_group: BASSWOOD_50
- Basswood 50mm - Golden Oak | price_group: BASSWOOD_50
- Basswood 50mm - Clay | price_group: BASSWOOD_50
- Basswood 50mm - Storm | price_group: BASSWOOD_50
- Basswood 50mm - Yarrin | price_group: BASSWOOD_50
- Basswood 50mm - Sin | price_group: BASSWOOD_50
- Basswood 50mm - Walnut | price_group: BASSWOOD_50
- Basswood 50mm - Linen | price_group: BASSWOOD_50
- Basswood 50mm - Mystic | price_group: BASSWOOD_50

**50mm Bamboo (16 colors):**
- Bamboo 50mm - Innocent | price_group: BAMBOO_50
- Bamboo 50mm - Flax | price_group: BAMBOO_50
- Bamboo 50mm - Haze | price_group: BAMBOO_50
- Bamboo 50mm - Armour | price_group: BAMBOO_50
- Bamboo 50mm - Cinder | price_group: BAMBOO_50
- Bamboo 50mm - Cyber | price_group: BAMBOO_50
- Bamboo 50mm - Mari | price_group: BAMBOO_50
- Bamboo 50mm - Danta | price_group: BAMBOO_50
- Bamboo 50mm - Arcana | price_group: BAMBOO_50
- Bamboo 50mm - Karri | price_group: BAMBOO_50
- Bamboo 50mm - Neo | price_group: BAMBOO_50
- Bamboo 50mm - Zaya | price_group: BAMBOO_50
- (plus 4 more)

**50mm Abachi (4 colors):**
- Abachi 50mm - Elkin | price_group: ABACHI_50
- Abachi 50mm - Kota | price_group: ABACHI_50
- Abachi 50mm - Hibano | price_group: ABACHI_50
- Abachi 50mm - Aro | price_group: ABACHI_50

**50mm Paulownia (8 colors):**
- Paulownia 50mm - Lavanco | price_group: PAULOWNIA_50
- Paulownia 50mm - Nubo | price_group: PAULOWNIA_50
- Paulownia 50mm - Helgriza | price_group: PAULOWNIA_50
- Paulownia 50mm - Tamno | price_group: PAULOWNIA_50
- Paulownia 50mm - Malummo | price_group: PAULOWNIA_50
- Paulownia 50mm - Skanda | price_group: PAULOWNIA_50
- Paulownia 50mm - Medus | price_group: PAULOWNIA_50
- Paulownia 50mm - Bruli | price_group: PAULOWNIA_50

### Step 3: Create Treatment Options

Insert into `treatment_options` with `treatment_category: 'venetian_blinds'` and `account_id: '32a92783-f482-4e3d-8ebf-c292200674e5'`:

**Option 1: Lamelių plotis (Slat Width)**
| Key | Label | Input Type |
|-----|-------|------------|
| slat_width_gustin | Lamelių plotis | select |

Values in `option_values`:
- 25_iso → 25 mm ISO
- 25_timberlux → 25 mm Timberlux
- 50_timberlux → 50 mm Timberlux

**Option 2: Mechanizmo tipas (Mechanism Type)**
| Key | Label | Input Type |
|-----|-------|------------|
| mechanism_type_gustin | Mechanizmo tipas | select |

Values with pricing in `extra_data`:
- vartymo_rankinis → Vartymo mechanizmas (rankinis) | €0
- pakelimo_rankinis → Pakėlimo mechanizmas (rankinis) | €0
- valdymo_pusiu → Valdymo pusių pasirinkimas (K/D) | €0
- somfy_rts → Automatinis - Somfy RTS | €185
- somfy_wt → Automatinis - Somfy WT (laidinis) | €165
- tilt_only → Tilt only mechanizmas | €45
- nukreipimo_trosai → Nukreipiamieji trosai | €25
- apatinio_fiksacija → Apatinio profilio fiksacija | €15
- saugus_vaikas → Saugus vaikas sistema | €0

**Option 3: Apdailos tipas (Finish Type)**
| Key | Label | Input Type |
|-----|-------|------------|
| finish_type_gustin | Apdailos tipas | select |

Values:
- tiesi_at → Tiesi – AT (be užlenkimų) | €0
- vienas_ak → Su užlenkimu – AK (kairėje) | €8
- vienas_ad → Su užlenkimu – AD (dešinėje) | €8
- du_akd → Su dviem – AKD (abu šonai) | €15

**Option 4: Virvelių tipas (Cord Type)**
| Key | Label | Input Type |
|-----|-------|------------|
| cord_type_gustin | Virvelių tipas | select |

Values:
- virvelines → Virvelinės (standartinės) | €0
- juostines_10 → Juostinės 10mm | €0
- juostines_25 → Juostinės 25mm | €0
- juostines_38 → Juostinės 38mm (tik 50mm) | €0

**Option 5: Varpelių tipas (Cord Tips)**
| Key | Label | Input Type |
|-----|-------|------------|
| cord_tips_gustin | Varpelių tipas | select |

Values:
- mediniai → Mediniai (standartiniai) | €0
- metaliniai_auksas → Metaliniai - Auksas | €12
- metaliniai_varis → Metaliniai - Varis | €12
- metaliniai_chromas → Metaliniai - Chromas | €12
- metaliniai_antracitas → Metaliniai - Antracitas | €12
- metaliniai_juoda → Metaliniai - Juoda | €12
- metaliniai_aliuminis → Metaliniai - Šlifuotas aliuminis | €12
- metaliniai_balta → Metaliniai - Matinė balta | €12

### Step 4: Create Option Categories (for UI)

Insert into `option_type_categories` to make options visible in Settings:

| type_key | type_label | treatment_category |
|----------|------------|-------------------|
| slat_width_gustin | Lamelių plotis | venetian_blinds |
| mechanism_type_gustin | Mechanizmo tipas | venetian_blinds |
| finish_type_gustin | Apdailos tipas | venetian_blinds |
| cord_type_gustin | Virvelių tipas | venetian_blinds |
| cord_tips_gustin | Varpelių tipas | venetian_blinds |

### Step 5: Create Option Rules

Insert into `option_rules` to implement conditional logic:

**Rule 1: Hide Somfy motors for 25mm slats**
```json
{
  "condition": {
    "option_key": "slat_width_gustin",
    "operator": "in_list",
    "value": ["25_iso", "25_timberlux"]
  },
  "effect": {
    "action": "filter_values",
    "target_option_key": "mechanism_type_gustin",
    "target_value": ["vartymo_rankinis", "pakelimo_rankinis", "valdymo_pusiu", "nukreipimo_trosai", "apatinio_fiksacija", "saugus_vaikas"]
  }
}
```

**Rule 2: Hide 38mm cord tape for 25mm slats**
```json
{
  "condition": {
    "option_key": "slat_width_gustin",
    "operator": "in_list",
    "value": ["25_iso", "25_timberlux"]
  },
  "effect": {
    "action": "filter_values",
    "target_option_key": "cord_type_gustin",
    "target_value": ["virvelines", "juostines_10", "juostines_25"]
  }
}
```

**Rule 3: Show all mechanism options for 50mm slats**
```json
{
  "condition": {
    "option_key": "slat_width_gustin",
    "operator": "equals",
    "value": "50_timberlux"
  },
  "effect": {
    "action": "show_option",
    "target_option_key": "mechanism_type_gustin"
  }
}
```

### Step 6: Link Template to Options

Insert into `template_option_settings` to enable options for the venetian template.

## Database Migrations Required

1. **Insert curtain_template** for Medinės žaliuzės
2. **Bulk insert 58 enhanced_inventory_items** for slat materials
3. **Insert 5 treatment_options** with account-specific keys
4. **Insert ~30 option_values** for all option choices
5. **Insert 5 option_type_categories** for UI visibility
6. **Insert 3+ option_rules** for conditional logic
7. **Insert 5 template_option_settings** to link options to template

## Testing After Implementation

1. Go to **Settings → Products** → Verify "Medinės žaliuzės" template appears
2. Go to **Library → Materials** → Verify 58 slat colors appear
3. Create a new quote → Select Venetian Blinds → Verify:
   - Slat width selection works
   - Selecting 25mm hides Somfy options
   - Selecting 50mm shows all mechanism options
   - Prices update correctly from grid
