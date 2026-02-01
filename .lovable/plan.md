

# Plan: Add Room Subtotal in Header Row

## Summary

Add the room subtotal on the right side of the room header row, making it more compact and showing the total upfront.

---

## Visual Design

**Current:**
```
kitchen
  Roller Blind ................... £450
  Installation ................... £85
```

**After fix:**
```
kitchen                             £535
  Roller Blind ................... £450
  Installation ................... £85
```

---

## Technical Implementation

### File: `src/components/settings/templates/visual-editor/LivePreview.tsx`

**Location**: Lines 1161-1177 (room header section)

### Step 1: Calculate Room Subtotal

Before rendering the room header, calculate the subtotal for visible items in that room:

```typescript
const roomSubtotal = visibleItems.reduce((sum, item) => {
  return sum + (item.total_cost || item.total || item.unit_price || 0);
}, 0);
```

### Step 2: Modify Room Header Row

Change the room header from a single cell spanning all columns to a row with room name on the left and subtotal on the right:

**Current (line 1173-1177):**
```typescript
<tr style={{ backgroundColor: '#ffffff' }}>
  <td colSpan={isExclusionEditMode ? 6 : 5} style={{ ... }}>
    {roomName}
  </td>
</tr>
```

**Updated:**
```typescript
<tr style={{ backgroundColor: '#ffffff' }}>
  <td 
    colSpan={isExclusionEditMode ? 5 : 4} 
    style={{ 
      padding: '8px 6px 4px 6px', 
      fontSize: '14px', 
      fontWeight: '500', 
      color: '#000', 
      borderTop: '1px solid rgba(0,0,0,0.15)', 
      backgroundColor: '#fff' 
    }}
  >
    {roomName}
  </td>
  <td 
    style={{ 
      padding: '8px 6px 4px 6px', 
      fontSize: '14px', 
      fontWeight: '600', 
      color: '#000', 
      borderTop: '1px solid rgba(0,0,0,0.15)', 
      backgroundColor: '#fff',
      textAlign: 'right',
      whiteSpace: 'nowrap'
    }}
  >
    {formatCurrency(roomSubtotal, projectData?.currency || getDefaultCurrency())}
  </td>
</tr>
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/settings/templates/visual-editor/LivePreview.tsx` | Add room subtotal calculation and display in header row (lines 1161-1177) |

---

## Expected Result

```text
┌────────────────────────────────────────────────────────────┐
│ kitchen                                              £535  │
│   Roller Blind - Room Darkening        1    £450    £450   │
│   Installation - Roller                1    £85     £85    │
├────────────────────────────────────────────────────────────┤
│ living room                                        £1,600  │
│   Roman Blind - Thermal                2    £680    £1,360 │
│   Lining - Blackout                    2    £120    £240   │
├────────────────────────────────────────────────────────────┤
│                          Subtotal (excl. GST): £2,135.00   │
│                                       GST (10%): £213.50   │
│                                         TOTAL: £2,348.50   │
└────────────────────────────────────────────────────────────┘
```

