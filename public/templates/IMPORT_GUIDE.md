# CSV Import Guide

## Valid Categories & Subcategories

### Fabrics (category: `fabric`)
| Subcategory | Description |
|-------------|-------------|
| `curtain_fabric` | Curtain and roman blind fabrics |
| `roller_fabric` | Roller blind fabrics |
| `cellular` | Cellular/Honeycomb blind fabrics |
| `vertical_fabric` | Vertical blind fabrics |
| `awning_fabric` | Awning fabrics |
| `lining_fabric` | Lining materials |
| `sheer_fabric` | Sheer/voile fabrics |
| `furniture_fabric` | Upholstery fabrics |
| `roman_fabric` | Roman blind specific fabrics |
| `panel_glide_fabric` | Panel glide fabrics |

### Blind Materials (category: `material`)
| Subcategory | Description |
|-------------|-------------|
| `venetian` | Venetian blind slats (wood, aluminum, etc.) |
| `vertical` | Vertical blind vanes |

### Hardware (category: `hardware`)
| Subcategory | Description |
|-------------|-------------|
| `rod` | Curtain rods and poles |
| `track` | Curtain and blind tracks |
| `motor` | Motorization systems |
| `bracket` | Mounting brackets |
| `accessory` | Other hardware accessories |

### Wallcoverings (category: `wallcovering`)
| Subcategory | Description |
|-------------|-------------|
| `wallpaper` | Standard wallpaper rolls |
| `vinyl` | Vinyl wallcoverings |
| `mural` | Wall murals |
| `other_wallcovering` | Grasscloth, fabric walls, etc. |

### Services (category: `service`)
| Subcategory | Description |
|-------------|-------------|
| `installation` | Installation services |
| `fitting` | Fitting services |
| `other_service` | Consultation, measurement, etc. |

---

## Valid Product Categories (for fabrics)
Used to specify what treatment type the fabric is designed for:

- `roller_blinds`
- `venetian_blinds`
- `vertical_blinds`
- `roman_blinds`
- `cellular_blinds`
- `curtains`
- `shutters`
- `plantation_shutters`
- `panel_glide`
- `panel_blinds`
- `awning`
- `wallpaper`
- `other`

---

## Template Files

| Category | Template File |
|----------|---------------|
| Fabrics | `fabrics_import_template.csv` |
| Hardware | `hardware_import_template.csv` |
| Wallcoverings | `wallpaper_import_template.csv` |
| Blind Materials | `materials_import_template.csv` |
| Services | `services_import_template.csv` |
| Trimmings | `trimmings_import_template.csv` |

---

## Common Import Errors

### "Invalid subcategory"
**Cause:** The subcategory value doesn't match any valid option.
**Fix:** Use exactly one of the subcategory values listed above (lowercase).

### "Invalid product_category"  
**Cause:** The product_category value doesn't match any valid option.
**Fix:** Use exactly one of the product_category values listed above, or leave blank.

### "Name is required"
**Cause:** The name field is empty.
**Fix:** Ensure every row has a product name.

---

## Tips

1. **Case Sensitivity:** Subcategories are case-insensitive but we recommend lowercase
2. **Colors Column:** Comma-separated color names (e.g., `white,cream,grey`)
3. **Track Inventory:** Use `yes` or `no` to enable/disable stock tracking
4. **Export First:** Export existing items to see the correct format, then modify
