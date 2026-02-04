
## UI/UX Improvements for Room Button, Supplier Indicator & Library Cards

Three focused improvements to enhance visual polish and reduce clutter in the material selection experience.

---

### Changes Overview

| File | Action | Description |
|------|--------|-------------|
| `src/components/job-creation/RoomsGrid.tsx` | Modify | Pass room index to each RoomCard |
| `src/components/job-creation/RoomCard.tsx` | Modify | Only show blinking on first room with no worksheets |
| `src/components/inventory/InventorySelectionPanel.tsx` | Modify | Compact TWC indicator + smaller grid cards |
| `src/components/inventory/RecentSelectionsRow.tsx` | Modify | More compact recently used section |

---

### 1. Blinking Only on First Room (When Empty)

**RoomsGrid.tsx** - Pass index to RoomCard:
```tsx
rooms.map((room, index) => (
  <RoomCard 
    key={room.id}
    room={room}
    isFirstRoom={index === 0}  // NEW prop
    // ... other props
  />
))
```

**RoomCard.tsx** - Accept prop and conditionally animate:
```tsx
interface RoomCardProps {
  // ... existing props
  isFirstRoom?: boolean;  // NEW
}

// In the button:
<Button
  className={cn(
    "flex-1",
    isFirstRoom && roomSurfaces.length === 0 && "animate-attention-ring"
  )}
>
```

Logic: Animation only appears when:
- It's the first room (`isFirstRoom === true`)
- Room has no measurement worksheets yet (`roomSurfaces.length === 0`)

---

### 2. Compact TWC Linked Materials Indicator

**Current** (Lines 943-952):
```tsx
<div className="flex items-center gap-2 py-1.5 px-3 border border-primary/30 bg-primary/10 rounded-md">
  <Building2 className="h-3.5 w-3.5 text-primary" />
  <span className="text-xs font-medium text-primary">TWC Linked Materials</span>
  <Badge variant="secondary" className="ml-auto text-[10px]">
    {treatmentFabrics.length} items
  </Badge>
</div>
```

**Improved** - More subtle, better spacing:
```tsx
<div className="flex items-center gap-1.5 mt-2 py-1 px-2 bg-muted/50 rounded text-muted-foreground">
  <Building2 className="h-3 w-3" />
  <span className="text-[10px] font-medium">TWC Linked</span>
  <Badge variant="outline" className="ml-auto text-[9px] h-4 px-1">
    {treatmentFabrics.length}
  </Badge>
</div>
```

Changes:
- Smaller icon (h-3 → was h-3.5)
- Reduced padding (py-1 px-2 → was py-1.5 px-3)
- Shorter text ("TWC Linked" → was "TWC Linked Materials")
- Subtle background (bg-muted/50 → was bg-primary/10)
- Added top margin for spacing from search

---

### 3. Smaller Library Cards (More Columns)

**Current grid** (Line 1194):
```tsx
grid-cols-2 md:grid-cols-3 lg:grid-cols-4
```

**Improved** - More compact, matches recently used size:
```tsx
grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6
```

This increases density by ~50%, making cards closer to the `w-24` (96px) size used in Recently Used.

---

### 4. More Compact Recently Used Section

**Current** (RecentSelectionsRow.tsx):
- Padding: `py-2`
- Header margin: `mb-2`
- Cards: `w-24` (keep as-is - user likes this size)

**Improved**:
```tsx
<div className={cn("py-1.5", className)}>  // Reduced from py-2
  <div className="flex items-center justify-between mb-1">  // Reduced from mb-2
    <div className="flex items-center gap-1">  // Reduced from gap-1.5
      <Clock className="h-3 w-3 text-muted-foreground" />  // Reduced from h-3.5
      <span className="text-[10px] font-medium text-muted-foreground">Recent</span>  // Shortened + smaller
      {/* Remove badge to save space - count is visible from items */}
    </div>
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-5 px-1.5 text-[9px] text-muted-foreground hover:text-destructive"  // Smaller
    >
      <X className="h-2.5 w-2.5 mr-0.5" />
      Clear
    </Button>
  </div>
  
  <ScrollArea className="w-full">
    <div className="flex gap-1.5 pb-1">  // Reduced from gap-2 pb-2
      {/* Cards stay same size (w-24) */}
    </div>
  </ScrollArea>
</div>
```

Changes:
- Reduced vertical padding throughout
- Shorter label text ("Recent" → was "Recently Used")
- Smaller icon and button
- Removed count badge (visible from items themselves)
- Tighter gaps between cards

---

### Visual Summary

```text
BEFORE:                              AFTER:
┌─────────────────────┐             ┌─────────────────────┐
│ [Search...]    [+]  │             │ [Search...]    [+]  │
│                     │             │                     │
│ ┌─────────────────┐ │             │ TWC Linked      4   │ (smaller, muted)
│ │ TWC Linked      │ │             │                     │
│ │ Materials   4   │ │             │ 🕐 Recent    Clear  │ (compact header)
│ └─────────────────┘ │             │ [▪][▪][▪]           │ (less padding)
│                     │             │─────────────────────│
│ 🕐 Recently Used  2 │             │ [▪][▪][▪][▪][▪][▪]  │ (6 cols)
│    [Clear]          │             │ [▪][▪][▪][▪][▪][▪]  │
│ [▪▪][▪▪]            │             │ [▪][▪][▪][▪][▪][▪]  │
│                     │             └─────────────────────┘
│ [  ▪  ][  ▪  ]      │
│ [  ▪  ][  ▪  ]      │ (4 cols max)
│ [  ▪  ][  ▪  ]      │
└─────────────────────┘
```

---

### Expected Results

1. **Room button**: Blinking ring only on first room until a worksheet is added
2. **TWC indicator**: Takes less vertical space, doesn't crowd the search bar
3. **Library cards**: Smaller and denser, matching the recently used feel
4. **Recently used**: More compact header, saves ~15-20px vertical space
