

# Improve Filters: Tag Search Input + Supplier Source Investigation

## Issues Identified

### Issue 1: Tags Filter UX
The current tags filter shows a checkbox list which becomes unwieldy with many tags. The screenshot shows tags like "164 BLACK SATIN" which appear to be color/product names from imported data rather than proper functional tags.

**Solution**: Replace the checkbox list with a searchable input that:
- Shows autocomplete suggestions as you type
- Displays popular/common tags as quick-select buttons
- Supports multi-select (already works)
- Shows selected tags as removable badges

### Issue 2: Supplier Source
The suppliers are coming from **TWO sources**:

1. **Formal Vendors** (vendors table) - Proper vendor records you've created
2. **Orphan Supplier Text** (supplier field in products) - Legacy text values from imported products that don't have a matching vendor record

The ⚠ warning triangle indicates "orphan" suppliers - text-only entries not linked to a formal vendor.

**Database query shows orphan suppliers**:
| Supplier | Count |
|----------|-------|
| JMT | 354 |
| MASLINA | 326 |
| TWC | 245 |
| Nesterra | 182 |
| KEEP | 141 |
| ... and more |

These came from your import (likely Shopify/TWC data). They exist as text but don't have vendor records in the `vendors` table.

**Options to clean this up**:
- Create proper vendor records for these suppliers and link products
- Or keep as-is (functional but shows warnings)

---

## Implementation Plan

### Changes to FilterButton.tsx

Replace the Tags checkbox list (lines 326-346) with a search input + autocomplete:

1. **Add search input** with autocomplete dropdown
2. **Show popular tags** as quick-select buttons (most used: blockout, wide_width, light_filtering)
3. **Display selected tags** as removable badges above input
4. **Filter by search term** as user types

### UI Design

```text
TAGS
Selected: [blockout ×] [wide_width ×]

[🔍 Search tags...                    ]

Popular:
[blockout] [wide_width] [sheer] [textured]
```

### Technical Details

**File to modify**: `src/components/library/FilterButton.tsx`

**Changes**:
1. Add state for tag search input: `const [tagSearch, setTagSearch] = useState("")`
2. Add popular tags constant (most used functional tags)
3. Replace checkbox list with:
   - Selected tags displayed as Badges with X to remove
   - Input field with autocomplete suggestions
   - Quick-select buttons for popular tags
4. Filter `availableTags` based on search input

### Supplier Cleanup (Optional Follow-up)

To reduce the number of "orphan" suppliers:
1. Go to Settings > Vendors
2. Create vendor records for common suppliers (TWC, Dekoma, etc.)
3. Use bulk actions to link products to vendors

This would convert ⚠ orphan text entries into proper vendor relationships.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/library/FilterButton.tsx` | Replace tags checkbox with searchable input + quick filters |

## Expected Outcome

- Tags filter becomes a searchable input with autocomplete
- Popular tags shown as quick-select buttons
- Multi-select still works (products matching ANY selected tag are shown)
- Cleaner, more usable filter experience

