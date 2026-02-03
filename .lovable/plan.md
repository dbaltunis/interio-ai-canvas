
## Make Client Tab More Compact & User-Friendly

### Current Issues (From Screenshots)

| Issue | Impact |
|-------|--------|
| Client info shown **3 times**: header, summary bar, AND large Client Assignment card | Redundant, wastes space |
| "No client assigned" empty state is ~200px tall | Pushes content below the fold |
| Single-column layout with `space-y-6` gaps | Lots of vertical scrolling needed |
| Client details displayed vertically when assigned | Takes more height than necessary |

---

### Solution: Consolidated, Compact Layout

#### Key Changes

1. **Remove the Large "Client Assignment" Card** - The summary bar already shows client info. Merge the "Assign Client" / "Change Client" action into the summary bar.

2. **Compact Empty State** - Replace the tall centered empty state with a slim inline prompt inside the summary bar.

3. **Optimize Summary Bar** - Make it the single source of truth for client display with a small action button.

4. **Two-Column Layout for Project Notes & Activity** - On larger screens, display notes and activity side-by-side to reduce height.

---

### Visual Comparison

**Before (Current):**
```text
┌─────────────────────────────────────────────────────────┐
│ [Summary Bar: Client, Rooms, Quote]                     │
├─────────────────────────────────────────────────────────┤
│ [Timeline Row]                                          │
├─────────────────────────────────────────────────────────┤
│ [Draft Number Card - Full Width]                        │
├─────────────────────────────────────────────────────────┤
│ ╔═══════════════════════════════════════════════════╗   │
│ ║ CLIENT ASSIGNMENT (HUGE CARD)                     ║   │
│ ║                                                   ║   │
│ ║           [Big Pixel Icon]                        ║   │
│ ║         No client assigned                        ║   │
│ ║     Connect a client to track this project        ║   │
│ ║           [Assign Client Button]                  ║   │
│ ║                                                   ║   │
│ ╚═══════════════════════════════════════════════════╝   │
├─────────────────────────────────────────────────────────┤
│ [Project Notes - Collapsed]                             │
├─────────────────────────────────────────────────────────┤
│ [Project Activity]                                      │
└─────────────────────────────────────────────────────────┘
```

**After (Proposed):**
```text
┌─────────────────────────────────────────────────────────┐
│ [Summary Bar with inline client action]                 │
│  Client: No client | [+ Assign]   Rooms: 2   Quote: £X  │
├─────────────────────────────────────────────────────────┤
│ [Timeline Row]                                          │
├─────────────────────────────────────────────────────────┤
│ [Draft Number Card - Compact]                           │
├─────────────────────────────────────────────────────────┤
│ [Client Details - ONLY if client assigned, compact]     │
├──────────────────────────┬──────────────────────────────┤
│ [Project Notes]          │ [Project Activity]           │
│                          │                              │
└──────────────────────────┴──────────────────────────────┘
```

---

### Technical Implementation

#### File: `src/components/jobs/tabs/ProjectDetailsTab.tsx`

**Change 1: Enhanced Summary Bar with Inline Actions**

The client cell in the summary bar will include:
- If no client: "No client" + **small "Assign" button**
- If client assigned: Client name + **small "Change" button**

```tsx
{/* Client Status - With Inline Action */}
<div className="sm:col-span-2 bg-primary/5 p-4 rounded-lg border border-primary/20">
  <div className="flex items-center justify-between gap-2">
    <div className="min-w-0 flex-1">
      <p className="text-xs text-muted-foreground mb-1">Client</p>
      {selectedClient ? (
        <span className="text-lg font-semibold truncate block">
          {getClientDisplayName(selectedClient)}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">No client</span>
      )}
    </div>
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => setShowClientSearch(true)}
      disabled={isReadOnly}
      className="shrink-0"
    >
      {selectedClient ? <Edit className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
    </Button>
  </div>
</div>
```

**Change 2: Remove or Condense the Large Client Assignment Card**

- **Option A (Recommended)**: Remove the card entirely - summary bar handles it
- **Option B**: Keep a minimal collapsible details section when client IS assigned

For this plan, I'll go with **Option A** for no-client state (summary bar handles it), and a **compact inline section** for showing client details when assigned (no tall card).

**Change 3: Compact Client Details (Only When Assigned)**

Replace the large card with a slim, horizontal details row:

```tsx
{selectedClient && (
  <div className="bg-card/50 border rounded-lg p-4">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        {/* Type Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {selectedClient.client_type === "B2B" ? "Business" : "Individual"}
          </Badge>
          {selectedClient.funnel_stage && (
            <Badge variant="secondary" className="text-xs">
              {selectedClient.funnel_stage}
            </Badge>
          )}
        </div>
        
        {/* Email */}
        {selectedClient.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs truncate">{selectedClient.email}</span>
          </div>
        )}
        
        {/* Phone */}
        {selectedClient.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs">{selectedClient.phone}</span>
          </div>
        )}
        
        {/* Address */}
        {(selectedClient.address || selectedClient.city) && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs truncate">
              {[selectedClient.city, selectedClient.state].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
)}
```

**Change 4: Two-Column Layout for Notes & Activity**

```tsx
{/* Project Notes & Activity - Side by Side on Desktop */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <ProjectNotesCard projectId={project.id} />
  <ProjectActivityCard projectId={project.id} maxItems={5} />
</div>
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/jobs/tabs/ProjectDetailsTab.tsx` | Add inline action to summary bar, remove/condense Client Assignment card, two-column layout for notes/activity |

---

### Space Savings

| Section | Before | After | Savings |
|---------|--------|-------|---------|
| Client empty state | ~200px | ~0px (handled in summary bar) | **~200px** |
| Client assigned state | ~180px (card) | ~60px (compact row) | **~120px** |
| Notes + Activity | Stacked (space-y-6) | Side-by-side on desktop | **~50% height reduction** |

**Total estimated reduction: 200-300px less vertical scrolling**

---

### Expected Outcome

- **Less scrolling** - More content visible above the fold
- **No redundancy** - Client shown once in a meaningful way
- **Clean empty state** - Small inline "Assign" button, not a huge empty card
- **Efficient details** - When client is assigned, info is compact and scannable
- **Better desktop usage** - Notes and activity side-by-side
