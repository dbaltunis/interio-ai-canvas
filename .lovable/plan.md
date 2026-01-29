
# Client Search & Display Improvements for Job Page

## Issues Identified

### Issue 1: Missing Fields in Client Creation Form
The quick client creation form in the job page is missing many fields that exist in the full client form:
- Funnel Stage selector
- Country selector  
- Notes field
- Tags input
- Lead Intelligence section (Lead Source, Referral Source, Deal Value, Priority Level, Marketing Consent, Follow-up Date)

### Issue 2: Search Requires Typing First
Currently shows "Start typing to search for clients" with no client list visible until user types. Users want to browse available clients without typing.

### Issue 3: Search Filtering Not Alphabetical
The current filtering uses substring matching (`includes()`), so typing "e" returns any client with "e" anywhere in name/company/email. Results are not sorted alphabetically.

### Issue 4: Minimal Client Info After Selection
After selecting a client, only name and email are shown. Missing:
- Client type badge (B2B/B2C)
- Phone number
- Address
- Company name for B2B
- Funnel stage
- Tags

### Issue 5: Client Not Locked When Project is Locked
The "Change Client" button is not disabled when the project has a locked status.

---

## Implementation Plan

### File 1: `src/components/job-creation/steps/ClientSearchStep.tsx`

**Changes:**

1. **Add missing fields to newClientData and the create form:**
   - Add `notes`, `country`, `funnel_stage`, `lead_source`, `referral_source`, `deal_value`, `priority_level`, `marketing_consent`, `follow_up_date`, `tags` fields
   - Import and use `LeadSourceSelect` component
   - Import `FUNNEL_STAGES`, `COUNTRIES` constants
   - Add `useClientStages` hook for dynamic stages

2. **Show recent clients by default (no typing required):**
   - Show first 10 clients alphabetically when no search term entered
   - Add "Recent Clients" section header

3. **Fix alphabetical sorting:**
   - Sort `filteredClients` alphabetically by name
   - Use `startsWith` for primary matches, then `includes` for secondary
   - Show matches that start with the search term first

4. **Enhanced client card in search results:**
   - Show client type badge (B2B/B2C)
   - Show phone if available
   - Show funnel stage badge
   - Show address summary

5. **Enhanced selected client display:**
   - Show full address
   - Show funnel stage with color badge
   - Show phone and email with icons
   - Show tags
   - Show company info for B2B clients
   - Show lead source/priority if set

6. **Add isLocked prop support:**
   - Accept `isLocked` prop to disable editing when project is locked
   - Pass through to disable Edit and Change Client buttons

### File 2: `src/components/jobs/tabs/ProjectDetailsTab.tsx`

**Changes:**

1. **Import and use `useProjectStatus` context:**
   - Import `useProjectStatus` from `@/contexts/ProjectStatusContext`
   - Get `isLocked` from the context
   - Combine with existing `canEditJob` check

2. **Disable client actions when locked:**
   - Pass `isLocked` state to ClientSearchStep component
   - Disable "Change Client" button when project is locked

3. **Enhanced client info display:**
   - Show client type badge
   - Show full address (street, city, state, zip)
   - Show funnel stage with colored badge
   - Show tags as badges
   - Show phone with icon
   - Display B2B specific info (company name, contact person)

---

## Technical Details

### Search Algorithm Improvement

```typescript
// Sort by relevance: startsWith matches first, then alphabetical
const filteredClients = clients
  ?.filter(client => 
    client.name.toLowerCase().includes(term) ||
    client.company_name?.toLowerCase().includes(term) ||
    client.email?.toLowerCase().includes(term)
  )
  .sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aStarts = aName.startsWith(term);
    const bStarts = bName.startsWith(term);
    
    // Prioritize startsWith matches
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    
    // Then alphabetical
    return aName.localeCompare(bName);
  }) || [];
```

### Default Client List (No Search Term)

```typescript
// When no search term, show first 10 clients alphabetically
const displayClients = searchTerm 
  ? filteredClients 
  : clients?.slice().sort((a, b) => 
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    ).slice(0, 10) || [];
```

### Lock Status Integration

```typescript
// In ProjectDetailsTab.tsx
import { useProjectStatus } from "@/contexts/ProjectStatusContext";

const { isLocked, isLoading: statusLoading } = useProjectStatus();

// Combined read-only check
const isReadOnly = !canEditJob || editPermissionsLoading || isLocked || statusLoading;

// Pass to ClientSearchStep
<ClientSearchStep 
  formData={{ client_id: formData.client_id }}
  updateFormData={...}
  isLocked={isReadOnly}
/>
```

---

## New Fields for Client Creation Form

| Field | Component | Description |
|-------|-----------|-------------|
| Country | Select dropdown | Uses COUNTRIES constant |
| Funnel Stage | Select dropdown | Uses dynamic stages from useClientStages |
| Notes | Textarea | General notes about client |
| Tags | Tag input | Add/remove tags |
| Lead Source | LeadSourceSelect | Custom lead source selector |
| Referral Source | Input | Who referred this client |
| Deal Value | Number input | Estimated deal value |
| Priority Level | Select | low/medium/high/urgent |
| Marketing Consent | Checkbox | Marketing opt-in |
| Follow-up Date | Date input | Next follow-up date |

---

## Permissions & Security

- All changes respect existing permission system via `useCanEditJob` hook
- Project locking respects `useProjectStatus` context
- RLS policies remain unchanged - client data filtered by `effectiveOwnerId`
- Dealer restrictions via `useDealerOwnClients` hook still apply

---

## Files to Modify

1. `src/components/job-creation/steps/ClientSearchStep.tsx` - Main changes for all 5 issues
2. `src/components/jobs/tabs/ProjectDetailsTab.tsx` - Lock status + enhanced display
