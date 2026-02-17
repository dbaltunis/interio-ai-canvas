

## Import RAD-POL Fabrics + Haberdashery for Laela Account

### File Summary

| Dataset | Page | Items | Type | Pricing |
|---|---|---|---|---|
| RAD-POL Fabrics | Page 8 | ~483 | Decoration, upholstery, sheer, outdoor, blackout, dimout, FR, lining, voile, cafe curtain | Cut price + Roll price (EUR/m) |
| RAD-POL Haberdashery | Page 9 | ~90 | Cords, fringes, tassels, braids, curtain tapes, lace trims, Swarovski buttons | Coupon (cut) + Package (roll) price (EUR) |

### Data Structures

**Fabrics (Page 8):**
```text
Article | Purpose/Category | Width (cm) | Cut Price EUR/mt | Roll Price EUR/mt | Currency | Notes
```

**Haberdashery (Page 9):**
```text
Article Name | Article Type | Composition | Unit | Coupon Price EUR | Package Price EUR | Currency | Category
```

### Column Mapping - Fabrics

| Source Column | Maps To | Notes |
|---|---|---|
| Article | `name` | e.g., "ACAPULCO", "ADELE" |
| Article | `sku` | Prefixed: "RAD-ACAPULCO", "RAD-ADELE" |
| Purpose/Category | `description` + tags | e.g., "upholstery/decoration", "sheer", "outdoor" |
| Width (cm) | `fabric_width` | Parse first number from values like "295/300" |
| Roll Price | `cost_price` | Wholesale price |
| Cut Price | `selling_price` | Retail/cut price; fallback to roll if "Roll only" |
| Notes | tags | "DISCOUNT", "Fire retardant" extracted as tags |
| All items | `category: "fabric"` | |
| All items | `subcategory: "curtain_fabric"` | |
| All items | `pricing_method: "per_meter"` | |

### Column Mapping - Haberdashery

| Source Column | Maps To | Notes |
|---|---|---|
| Article Name | `name` | e.g., "7003-6 / 0006", "Koronka-1 (1.5cm) ecru" |
| Article Name | `sku` | Prefixed: "RAD-H-7003-6", "RAD-H-KORONKA-1-ECR" |
| Article Type | `description` | e.g., "cord", "fringe", "Swarovski button" |
| Composition | `composition` | e.g., "100% polyester" |
| Unit | `pricing_method` | "lm"/"mb" -> per_meter; "pc."/"pkg" -> per_unit |
| Package Price | `cost_price` | Wholesale/package price |
| Coupon Price | `selling_price` | Retail/coupon price; fallback to package price |
| Category | tags + collection | "Queen Collection", "Decorative", "Curtain Tapes", etc. |
| All items | `category: "hardware"` | Haberdashery goes under hardware |
| All items | `subcategory: "accessory"` | |

### What Changes

#### 1. Create two CSV files
- `public/import-data/CSV_RADPOL_Fabrics.csv` (~483 rows) from Page 8
  - Columns: `article`, `category`, `width_cm`, `cut_price_eur`, `roll_price_eur`, `notes`
- `public/import-data/CSV_RADPOL_Haberdashery.csv` (~90 rows) from Page 9
  - Columns: `article_name`, `article_type`, `composition`, `unit`, `coupon_price_eur`, `package_price_eur`, `category`

#### 2. Add two mappers to Edge Function

**`mapRadpolFabrics()`:**
- SKU: `RAD-{NORMALIZED_ARTICLE_NAME}` (e.g., "RAD-ACAPULCO", "RAD-ALASKA")
- `cost_price` = roll price, `selling_price` = cut price
- Special handling for "Roll only" items (no cut price) -- use roll price for both
- Parse width from "295/300" format (take first number)
- Extract tags: "DISCOUNT" flag, "Fire retardant" from Notes column
- Auto-detect subcategory from Purpose/Category: outdoor -> curtain_fabric, sheer -> sheer_fabric, lining -> lining_fabric, blackout/dimout -> curtain_fabric
- Collection: "RAD-POL" (single collection for all fabrics)

**`mapRadpolHaberdashery()`:**
- SKU: `RAD-H-{NORMALIZED_ARTICLE_NAME}` (e.g., "RAD-H-7003-6", "RAD-H-10232")
- `cost_price` = package price, `selling_price` = coupon price
- `pricing_method`: "lm"/"mb" -> per_meter, "pc." -> per_unit, "pkg" -> per_unit
- `composition` from Composition column
- Collection based on Category: "RAD-POL QUEEN COLLECTION", "RAD-POL DECORATIVE", "RAD-POL CURTAIN TAPES", etc.
- `category: "hardware"`, `subcategory: "accessory"`

#### 3. Register in `LaelLibraryImport.tsx`
Add two entries to `IMPORT_FILES` array:
```text
{ format: "radpol_fabrics", file: "/import-data/CSV_RADPOL_Fabrics.csv", label: "RAD-POL Fabrics (483 items)" }
{ format: "radpol_haberdashery", file: "/import-data/CSV_RADPOL_Haberdashery.csv", label: "RAD-POL Haberdashery (90 items)" }
```

#### 4. Add vendor routing in Edge Function
Both formats skip single-vendor lookup and auto-create vendor "RAD-POL" via the mapper (same pattern as maslina/mydeco).

### Technical Details

**SKU generation:**
```text
Fabrics:       RAD-{ARTICLE_NAME_NORMALIZED}     e.g., "RAD-ACAPULCO", "RAD-EKO-300-FOLDED"
Haberdashery:  RAD-H-{ARTICLE_NAME_NORMALIZED}   e.g., "RAD-H-7003-6", "RAD-H-KORONKA-1-ECR"
```

**Special cases:**
- Items with "Roll only" as cut price: use roll price for both cost and selling price
- Items with "(DISCOUNT)" in name: add "discount" tag, strip "(DISCOUNT)" from display name
- Items with "FR" in notes: add "fire-retardant" tag
- Width values like "295/300" or "305/310": parse first number
- Haberdashery curtain tapes priced per package (pkg 50m/100m): stored as per_unit with note about package contents
- Duplicate article numbers in haberdashery (e.g., shared ceiling brackets): SKU deduplication via article name normalization

### After Implementation
1. Navigate to `/admin/import-laela`
2. Click "Start Import" for "RAD-POL Fabrics" entry (~483 items)
3. Click "Start Import" for "RAD-POL Haberdashery" entry (~90 items)
4. All items will import with proper vendor, pricing, and metadata

