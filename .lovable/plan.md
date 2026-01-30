

# Fix Lead Management System - Inquiry Tracking & Display

## Problem Summary

The current lead management system has critical flaws causing missed business opportunities:

1. **Lost Messages**: When a lead submits a follow-up inquiry with the same email, the edge function returns `duplicate: true` and **discards the new message entirely**
2. **Single Notes Field**: The `clients.notes` column only stores the first message - all subsequent inquiries are invisible
3. **No Inquiry Badges**: Leads appear generic with no indication of inquiry type (Demo Request, General Inquiry, Partnership, etc.)
4. **No Repeat Inquiry Alerts**: You receive no notification when an existing lead follows up
5. **Empty Client Profile**: The Client Profile page feels empty because inquiry details are hidden and there's no actionable information

---

## Solution Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BEFORE (Current Flow)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [Website Form]                                                            │
│        │                                                                    │
│        ▼                                                                    │
│   receive-external-lead                                                     │
│        │                                                                    │
│        ├─── New Email? ───▶ Create client + store message in notes          │
│        │                                                                    │
│        └─── Exists? ───────▶ Return "duplicate: true" ⚠️ MESSAGE LOST       │
│                                                                             │
│   Client Profile: Only shows first message in notes field                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          AFTER (Fixed Flow)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [Website Form]                                                            │
│        │                                                                    │
│        ▼                                                                    │
│   receive-external-lead                                                     │
│        │                                                                    │
│        ├─── New Email? ───▶ Create client + Insert inquiry                  │
│        │                                                                    │
│        └─── Exists? ──────▶ Insert inquiry + Create notification ✓          │
│                                  │                                          │
│                                  └──▶ "New follow-up from [Name]!"          │
│                                                                             │
│   Client Profile:                                                           │
│   ┌────────────────────────────────────────────┐                            │
│   │  ★ INQUIRIES                          [3]  │                            │
│   │  ─────────────────────────────────────────  │                            │
│   │  🟢 Demo Request • 2 days ago              │                            │
│   │  "Looking to schedule a demo for our..."   │                            │
│   │  ─────────────────────────────────────────  │                            │
│   │  🟡 General Inquiry • 1 week ago           │                            │
│   │  "Hi, I'm interested in your product..."   │                            │
│   │  ─────────────────────────────────────────  │                            │
│   │  🔵 Partnership • 2 weeks ago              │                            │
│   │  "We represent a chain of hotels..."       │                            │
│   └────────────────────────────────────────────┘                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### 1. New Database Table: `client_inquiries`

Create a dedicated table to store every form submission with full message history:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `client_id` | UUID (FK) | Links to `clients.id` |
| `user_id` | UUID | Owner account |
| `inquiry_type` | TEXT | Demo Request, General, Partnership, Quote, Support |
| `message` | TEXT | Full message content |
| `source` | TEXT | interioapp.com, shopify, manual |
| `metadata` | JSONB | Order volume, product type, etc. |
| `is_read` | BOOLEAN | Track read/unread status |
| `created_at` | TIMESTAMPTZ | Submission timestamp |

**RLS Policy**: Users can only view inquiries for their own clients.

---

### 2. Update Edge Function: `receive-external-lead`

Modify the logic to:
1. **Always log inquiries** - even for existing clients
2. **Create notifications** for repeat inquiries
3. **Classify inquiry type** based on form data or message keywords

```text
Current (lines 124-136):
if (existingLead) {
  return { duplicate: true, message: 'Lead already exists' }
  // ⚠️ NEW MESSAGE IS LOST
}

New logic:
if (existingLead) {
  // 1. Insert into client_inquiries
  await insertInquiry(existingLead.id, message, inquiryType)
  
  // 2. Update client.last_activity_date
  await updateClient(existingLead.id, { last_activity_date: now() })
  
  // 3. Create notification
  await insertNotification({
    user_id: DEFAULT_LEADS_USER_ID,
    title: 'New Follow-up Inquiry',
    message: `${name} submitted a new ${inquiryType}`,
    type: 'lead_followup',
    source_type: 'client',
    source_id: existingLead.id
  })
  
  return { success: true, followUp: true }
}
```

---

### 3. Inquiry Type Classification

Automatically detect inquiry type based on:
- Form field `productType` → "Quote Request"
- Message contains "demo" → "Demo Request"
- Message contains "partner" → "Partnership"
- Default → "General Inquiry"

Display as colorful badges:

| Type | Badge Color |
|------|-------------|
| Demo Request | 🟢 Green |
| Quote Request | 🔵 Blue |
| Partnership | 🟣 Purple |
| Support | 🟠 Orange |
| General Inquiry | ⚪ Gray |

---

### 4. New UI Component: `ClientInquiriesPanel`

Add a dedicated section to the Client Profile page that displays:
- Inquiry count badge in header
- Chronological list of all inquiries
- Inquiry type badge (Demo Request, General, etc.)
- Full message preview
- Timestamp
- Mark as read/unread toggle

Location in `ClientProfilePage.tsx`:
- Add as a new tab alongside Notes, Activity, Measurements
- OR embed in the left column below "Details"

---

### 5. Client List Enhancement

Add inquiry badges to the client list view showing:
- Unread inquiry count (red dot)
- Latest inquiry type badge

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/[new].sql` | Create | New `client_inquiries` table with RLS |
| `supabase/functions/receive-external-lead/index.ts` | Modify | Log all inquiries, create notifications |
| `src/hooks/useClientInquiries.ts` | Create | Fetch/manage inquiry data |
| `src/components/clients/ClientInquiriesPanel.tsx` | Create | Display inquiry history |
| `src/components/clients/ClientProfilePage.tsx` | Modify | Add Inquiries tab/section |
| `src/components/clients/ClientListView.tsx` | Modify | Add inquiry badges to list |

---

## Migration SQL

```sql
-- Create client_inquiries table
CREATE TABLE IF NOT EXISTS public.client_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  inquiry_type TEXT DEFAULT 'general',
  message TEXT NOT NULL,
  source TEXT DEFAULT 'website',
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users see their own inquiries
CREATE POLICY "Users can view own client inquiries"
  ON public.client_inquiries
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can insert (for edge function)
CREATE POLICY "Service role can insert inquiries"
  ON public.client_inquiries
  FOR INSERT
  WITH CHECK (true);

-- Index for performance
CREATE INDEX idx_client_inquiries_client_id ON public.client_inquiries(client_id);
CREATE INDEX idx_client_inquiries_user_id ON public.client_inquiries(user_id);
```

---

## Expected Outcome

After implementation:
1. **No lost messages** - Every form submission is recorded
2. **Full inquiry history** - See all messages from a lead, not just the first
3. **Actionable notifications** - Get alerted when leads follow up
4. **Informative badges** - See inquiry type at a glance
5. **Better lead management** - Mark inquiries as read, prioritize hot leads

