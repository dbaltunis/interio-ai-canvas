

# Enhance Edit Client Dialog & Client Display in Job Page

## Summary

The Edit Client dialog is missing many fields that exist in the Create New Client form. Additionally, the Client Assignment section in the job details shows minimal client information. This plan will add all the missing fields to the Edit dialog and enhance the client display.

---

## Issue 1: Edit Client Dialog Missing Fields

**Current State (Screenshot 2)**
The Edit Client Details dialog only shows:
- Client Name
- Client Type
- Email / Phone
- Address / City / State / ZIP

**Missing Fields (compared to Create form - Screenshot 1)**
| Field | Type |
|-------|------|
| Country | Select dropdown |
| Funnel Stage | Select dropdown (dynamic from useClientStages) |
| Lead Source | LeadSourceSelect component |
| Priority Level | Select dropdown |
| Deal Value | Number input |
| Referral Source | Text input |
| Follow-up Date | Date picker |
| Notes | Textarea |
| Tags | Tag input with add/remove |
| Marketing Consent | Checkbox |

---

## Issue 2: Client Assignment Card Shows Minimal Info

**Current State (Screenshot 3)**
The Client Assignment card only displays:
- Client name
- Email with icon
- Phone with emoji

**Should Display (like the selected client card in ClientSearchStep)**
- Client name with type badge (B2B/B2C)
- Company name for B2B clients
- Funnel stage badge (colored)
- Email and phone with icons
- Full address with MapPin icon
- Tags as badges
- Deal value and priority level

---

## Implementation Plan

### File 1: `src/components/job-creation/steps/ClientSearchStep.tsx`

**Changes to `editClientData` state (line 59-72)**

Add the missing fields to the state object:

```typescript
const [editClientData, setEditClientData] = useState({
  // Existing fields
  name: "",
  email: "",
  phone: "",
  company_name: "",
  client_type: "B2C" as "B2B" | "B2C",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  abn: "",
  business_email: "",
  business_phone: "",
  // New fields to add
  country: "",
  notes: "",
  funnel_stage: "",
  lead_source: "",
  referral_source: "",
  deal_value: "",
  priority_level: "",
  marketing_consent: false,
  follow_up_date: null as Date | null,
  tags: [] as string[],
});
```

**Changes to `openEditDialog` function (line 213-231)**

Update to populate all the new fields from the selected client:

```typescript
setEditClientData({
  // ... existing fields
  country: selectedClient.country || "",
  notes: selectedClient.notes || "",
  funnel_stage: selectedClient.funnel_stage || "",
  lead_source: selectedClient.lead_source || "",
  referral_source: selectedClient.referral_source || "",
  deal_value: selectedClient.deal_value ? String(selectedClient.deal_value) : "",
  priority_level: selectedClient.priority_level || "",
  marketing_consent: selectedClient.marketing_consent || false,
  follow_up_date: selectedClient.follow_up_date ? new Date(selectedClient.follow_up_date) : null,
  tags: selectedClient.tags || [],
});
```

**Changes to `handleEditClient` function (line 199-211)**

Update to send all new fields to the API:

```typescript
await updateClient.mutateAsync({
  id: selectedClient.id,
  ...editClientData,
  deal_value: editClientData.deal_value ? parseFloat(editClientData.deal_value) : undefined,
  follow_up_date: editClientData.follow_up_date ? format(editClientData.follow_up_date, 'yyyy-MM-dd') : undefined,
  tags: editClientData.tags.length > 0 ? editClientData.tags : undefined,
});
```

**Add tag management for edit dialog**

Add new state and helper functions:

```typescript
const [editTagInput, setEditTagInput] = useState("");

const handleAddEditTag = () => {
  const trimmed = editTagInput.trim();
  if (trimmed && !editClientData.tags.includes(trimmed)) {
    setEditClientData(prev => ({
      ...prev,
      tags: [...prev.tags, trimmed]
    }));
    setEditTagInput("");
  }
};

const handleRemoveEditTag = (tag: string) => {
  setEditClientData(prev => ({
    ...prev,
    tags: prev.tags.filter(t => t !== tag)
  }));
};
```

**Update Edit Client Dialog UI (lines 863-1022)**

Add all the missing form fields matching the Create form layout:
- Funnel Stage & Lead Source (grid of 2)
- Priority Level & Deal Value (grid of 2)
- Referral Source & Follow-up Date (grid of 2)
- Country selector (add to address section)
- Notes textarea
- Tags input with add/remove
- Marketing Consent checkbox

---

### File 2: `src/components/jobs/tabs/ProjectDetailsTab.tsx`

**Enhance Client Assignment Card (lines 634-660)**

Replace the minimal display with comprehensive client info:

```tsx
{selectedClient ? (
  <div className="space-y-3">
    {/* Name with Type Badge */}
    <div className="flex items-center gap-2 flex-wrap">
      <p className="text-lg font-semibold text-foreground">
        {getClientDisplayName(selectedClient)}
      </p>
      <Badge variant="outline" className="text-xs">
        {selectedClient.client_type === "B2B" ? "Business" : "Individual"}
      </Badge>
    </div>

    {/* Company name for B2B */}
    {selectedClient.client_type === 'B2B' && selectedClient.name && (
      <p className="text-sm text-muted-foreground">
        Contact: {selectedClient.name}
      </p>
    )}

    {/* Funnel Stage Badge */}
    {selectedClient.funnel_stage && (
      <Badge variant="secondary" className="text-xs">
        {selectedClient.funnel_stage}
      </Badge>
    )}

    {/* Contact Info - Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
      {selectedClient.email && (
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="truncate">{selectedClient.email}</span>
        </div>
      )}
      {selectedClient.phone && (
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{selectedClient.phone}</span>
        </div>
      )}
    </div>

    {/* Address */}
    {(selectedClient.address || selectedClient.city) && (
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 mt-0.5" />
        <span>
          {[selectedClient.address, selectedClient.city, selectedClient.state, selectedClient.zip_code]
            .filter(Boolean).join(", ")}
        </span>
      </div>
    )}

    {/* Tags */}
    {selectedClient.tags?.length > 0 && (
      <div className="flex items-center gap-1 flex-wrap">
        {selectedClient.tags.map(tag => (
          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
        ))}
      </div>
    )}

    {/* Deal Value & Priority */}
    {(selectedClient.deal_value || selectedClient.priority_level) && (
      <div className="flex items-center gap-3 text-sm">
        {selectedClient.deal_value > 0 && (
          <span className="text-green-600 font-medium">
            ${selectedClient.deal_value.toLocaleString()}
          </span>
        )}
        {selectedClient.priority_level && (
          <Badge variant="outline" className="text-xs capitalize">
            {selectedClient.priority_level} priority
          </Badge>
        )}
      </div>
    )}
  </div>
) : (
  // ... empty state unchanged
)}
```

**Add missing imports**

Add `Phone` and `MapPin` to the lucide-react import statement.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/job-creation/steps/ClientSearchStep.tsx` | Add fields to editClientData state, update openEditDialog, update handleEditClient, add tag helpers, expand Edit Dialog UI |
| `src/components/jobs/tabs/ProjectDetailsTab.tsx` | Enhance Client Assignment card display, add missing icon imports |

---

## Technical Notes

- All changes respect existing permission checks (`isLocked`, `isReadOnly`)
- Uses existing `useClientStages` hook for dynamic funnel stages
- Uses existing `LeadSourceSelect` component for lead source
- Follows the same UI patterns as the Create form
- Tags use the same add/remove pattern as newClientData

