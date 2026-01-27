

# New `storefront-project` Edge Function

## Overview

This plan adds a new public API endpoint that allows the Gustin Decor online store (or any external storefront) to create **projects with quotes and treatments** in InterioApp when a customer completes the calculator flow.

## Safety Assurance

**This will NOT break any existing code because:**
- We're creating a **brand new edge function** (`storefront-project`)
- No existing functions are modified
- The new function follows the exact same patterns as:
  - `shopify-webhook-order` (creates clients and projects)
  - `storefront-lead` (validates account_id + api_key)
  - `storefront-estimate` (calculation logic)
- Uses service role key for database operations (same as other storefront functions)
- All existing API endpoints remain unchanged

## Data Flow

```text
External Storefront                      InterioApp Database
┌────────────────────┐                  ┌─────────────────────┐
│                    │                  │                     │
│  Customer fills    │                  │                     │
│  calculator form   │                  │                     │
│  with:             │                  │                     │
│  - Dimensions      │                  │                     │
│  - Fabric choice   │  POST /storefront-project  ┌──────────┐│
│  - Options         │ ────────────────────────► │ clients  ││
│  - Contact info    │                  │        └──────────┘│
│                    │                  │              │      │
│                    │                  │        ┌─────▼────┐ │
│                    │                  │        │ projects │ │
│                    │                  │        └──────────┘ │
│                    │                  │              │      │
│                    │                  │        ┌─────▼────┐ │
│                    │                  │        │  quotes  │ │
│                    │                  │        └──────────┘ │
│                    │                  │              │      │
│                    │                  │        ┌─────▼────┐ │
│ ◄──────────────────┼──────────────────┤        │treatments│ │
│  Returns:          │                  │        └──────────┘ │
│  - project_id      │                  │                     │
│  - quote_id        │                  └─────────────────────┘
│  - treatment_id    │
│  - pricing         │
└────────────────────┘
```

## New Edge Function: `storefront-project`

### Endpoint Specification

**URL:** `POST https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/storefront-project`

**Authentication:** Account ID + API Key (same as other storefront endpoints)

### Request Schema

```json
{
  "account_id": "32a92783-f482-4e3d-8ebf-c292200674e5",
  "api_key": "efc64ac7...",
  "customer": {
    "name": "Jonas Jonaitis",
    "email": "jonas@example.lt",
    "phone": "+37061234567"
  },
  "items": [
    {
      "fabric_id": "uuid",
      "template_id": "uuid (optional)",
      "width_mm": 2000,
      "drop_mm": 2400,
      "quantity": 2,
      "room_name": "Living Room",
      "options": {
        "lining_type": "blackout",
        "heading_type": "wave"
      },
      "notes": "Custom note"
    }
  ],
  "source": "gustindecor.com",
  "message": "Optional customer message"
}
```

### Response Schema

```json
{
  "success": true,
  "project": {
    "id": "project-uuid",
    "title": "Online Quote - Jonas Jonaitis",
    "quote_number": "Q-2026-0042"
  },
  "quote": {
    "id": "quote-uuid",
    "subtotal": 562.50,
    "tax_amount": 118.13,
    "total": 680.63,
    "currency": "EUR"
  },
  "treatments": [
    {
      "id": "treatment-uuid",
      "room_name": "Living Room",
      "fabric_name": "Premium Velvet",
      "unit_price": 280.32,
      "total_price": 560.64
    }
  ],
  "client_id": "client-uuid",
  "is_new_client": true
}
```

### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `account_id is required` | Missing account_id |
| 400 | `api_key is required` | Missing api_key |
| 400 | `customer.name and customer.email are required` | Missing customer info |
| 400 | `items array is required and cannot be empty` | No items provided |
| 401 | `Invalid API key` | API key doesn't match |
| 404 | `Account not found` | Invalid account_id |
| 404 | `Fabric not found: {id}` | Invalid fabric_id |
| 500 | `Internal server error` | Server error |

## Technical Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/storefront-project/index.ts` | New edge function |

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/config.toml` | Add `[functions.storefront-project]` with `verify_jwt = false` |
| `src/pages/Documentation.tsx` | Add new endpoint documentation |

### Implementation Steps

1. **Create the edge function** with:
   - Account ID + API key validation (same pattern as `storefront-lead`)
   - Find or create client (same logic as `shopify-webhook-order`)
   - Create project with appropriate source
   - Create quote linked to project
   - Create room(s) for each unique room_name
   - Create treatment(s) with full pricing calculation (using `storefront-estimate` logic)
   - Calculate quote totals
   - Return all created IDs and pricing

2. **Register in config.toml**:
   ```toml
   [functions.storefront-project]
   verify_jwt = false
   ```

3. **Update Documentation** with complete endpoint specification

### Database Tables Used

| Table | Operation | Purpose |
|-------|-----------|---------|
| `account_settings` | SELECT | Validate API key |
| `business_settings` | SELECT | Get tax rate, margins |
| `clients` | SELECT, INSERT, UPDATE | Find or create customer |
| `projects` | INSERT | Create new project |
| `quotes` | INSERT, UPDATE | Create quote with totals |
| `rooms` | INSERT | Create room records |
| `treatments` | INSERT | Create treatment records |
| `enhanced_inventory_items` | SELECT | Get fabric details |
| `curtain_templates` | SELECT | Get template settings |
| `client_activity_log` | INSERT | Log activity |
| `user_notifications` | INSERT | Notify account owner |

### Pricing Calculation

The function will reuse the calculation logic from `storefront-estimate`:
- Fetch fabric selling_price and width
- Apply template fullness_ratio
- Calculate fabric meters needed
- Apply option costs
- Add making/labor costs
- Apply tax rate
- Sum to get totals

### Security Measures

- API key validation required
- Service role used (bypasses RLS for multi-tenant access)
- Input validation for all fields
- Email format validation
- No sensitive data exposed in responses
- Logging for audit trail

## Gustin Decor Integration

After this endpoint is deployed, the Gustin Decor online store can:

1. **Customer fills calculator** → dimensions, fabric, options
2. **Customer submits form** → contact info
3. **POST to `/storefront-project`** → creates everything in InterioApp
4. **Redirect to Shopify checkout** (if immediate purchase) or **show confirmation** (if quote request)
5. **Gustin team sees new project** in InterioApp with all details

## Testing Plan

After implementation, test with:

```bash
curl -X POST https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/storefront-project \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": "32a92783-f482-4e3d-8ebf-c292200674e5",
    "api_key": "efc64ac7cb8d1759cdb7c2192f5dbe7f91be266c1b3e14a68c6539fd22913f3a",
    "customer": {
      "name": "Test Customer",
      "email": "test@example.com",
      "phone": "+37061234567"
    },
    "items": [
      {
        "width_mm": 2000,
        "drop_mm": 2400,
        "quantity": 1,
        "room_name": "Living Room"
      }
    ],
    "source": "api-test"
  }'
```

