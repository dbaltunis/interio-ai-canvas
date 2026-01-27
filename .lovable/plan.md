
# Gustin Decor Online Store + InterioApp + Shopify Integration

## Overview

This plan outlines the integration architecture for connecting the **new Gustin Decor Lovable project** (online storefront) with:
1. **InterioApp** (this project) - Pricing engine, fabric catalog, lead management
2. **Shopify** - Checkout, payments, inventory sync

## Current State Analysis

| Component | Status | Data |
|-----------|--------|------|
| Gustin InterioApp Account | Active | 1,361 fabrics, 5 headings, 0 options configured |
| Account ID | `32a92783-f482-4e3d-8ebf-c292200674e5` | |
| Shopify Connection | Not Connected | No `shopify_integrations` record |
| InterioApp Online Store | Not Created | No `online_stores` record |
| Clients/Projects | 0 clients, 2 projects | Fresh account |

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTEGRATION ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   NEW LOVABLE PROJECT               INTERIOAPP                SHOPIFY       │
│   (Gustin Online Store)             (This Project)            (Checkout)    │
│                                                                             │
│   ┌───────────────────┐                                                     │
│   │   Product Pages   │                                                     │
│   │   - Uzuolaidos    │──── GET /storefront-catalog ────┐                  │
│   │   - Zaliuzes      │     (Fetch fabrics + prices)    │                  │
│   │   - Roletai       │                                  ▼                  │
│   └───────────────────┘                        ┌─────────────────┐         │
│                                                │  InterioApp     │         │
│   ┌───────────────────┐                        │  Database       │         │
│   │   Calculator UI   │                        │  - Fabrics      │         │
│   │   - Dimensions    │──── POST /storefront-estimate ─│  - Options      │         │
│   │   - Options       │     (Get price)         │  - Pricing      │         │
│   │   - Fabric Select │                        └─────────────────┘         │
│   └───────────────────┘                                  │                  │
│           │                                              │                  │
│           │                                              │                  │
│   ┌───────▼───────────┐                                  │                  │
│   │   Lead Capture    │                                  │                  │
│   │   - Contact Form  │──── POST /storefront-lead ──────►│                  │
│   │   - Quote Request │     (Create client in InterioApp)│                  │
│   └───────────────────┘                                  │                  │
│           │                                              │                  │
│           ▼                                              │                  │
│   ┌───────────────────┐      ┌────────────────────┐     │                  │
│   │   Add to Cart     │─────►│   Shopify Store    │◄────┘                  │
│   │   (Buy Now)       │      │   (Checkout)       │   Inventory Sync       │
│   └───────────────────┘      └─────────┬──────────┘                        │
│                                        │                                    │
│                              Webhook (orders/create)                       │
│                                        │                                    │
│                                        ▼                                    │
│                              ┌─────────────────┐                           │
│                              │ shopify-webhook │                           │
│                              │ -order          │                           │
│                              │ → Create Client │                           │
│                              │ → Create Project│                           │
│                              └─────────────────┘                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: API Infrastructure (InterioApp Changes)

#### 1.1 Database Migration - Add Storefront API Key

Add a `storefront_api_key` column to `account_settings` for per-account API authentication:

```sql
ALTER TABLE public.account_settings 
ADD COLUMN IF NOT EXISTS storefront_api_key TEXT DEFAULT encode(gen_random_bytes(32), 'hex');

-- Generate keys for existing accounts
UPDATE public.account_settings 
SET storefront_api_key = encode(gen_random_bytes(32), 'hex')
WHERE storefront_api_key IS NULL;
```

#### 1.2 Create Edge Function: `storefront-catalog`

**Purpose**: Fetch fabrics and products for storefront display
**Authentication**: Account ID + API Key (no user login required)

```text
Endpoint: GET /storefront-catalog

Query Parameters:
- account_id (required): UUID of the InterioApp account
- api_key (required): Storefront API key
- category: filter by category (fabric, heading, etc.)
- collection: filter by collection name
- limit: pagination (default 50)
- offset: pagination offset

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Fabric Name",
      "sku": "SKU-001",
      "collection": "Premium Collection",
      "color": "Ivory",
      "width_cm": 280,
      "image_url": "https://...",
      "price_per_meter": 45.00,
      "currency": "EUR"
    }
  ],
  "pagination": { "total": 1361, "limit": 50, "offset": 0, "has_more": true }
}
```

#### 1.3 Create Edge Function: `storefront-lead`

**Purpose**: Capture leads from external storefronts (replaces receive-external-lead with multi-tenant support)

```text
Endpoint: POST /storefront-lead

Request Body:
{
  "account_id": "32a92783-f482-4e3d-8ebf-c292200674e5",
  "api_key": "<storefront_api_key>",
  "name": "Jonas Jonaitis",
  "email": "jonas@example.lt",
  "phone": "+37061234567",
  "message": "Interested in blackout curtains",
  "product_interest": "Naktinė užuolaida",
  "source": "gustindecor.com"
}

Response:
{
  "success": true,
  "lead_id": "uuid",
  "message": "Lead created successfully"
}
```

#### 1.4 Create Edge Function: `storefront-options`

**Purpose**: Fetch product configuration options (lining, heading, etc.)

```text
Endpoint: GET /storefront-options

Query Parameters:
- account_id: UUID
- api_key: string
- treatment_type: curtains | blinds | shutters (optional)

Response:
{
  "success": true,
  "options": [
    {
      "key": "lining_type",
      "label": "Pamušalas",
      "values": [
        { "code": "unlined", "label": "Be pamušalo", "price_modifier": 0 },
        { "code": "blackout", "label": "Blackout", "price_modifier": 15 }
      ]
    }
  ]
}
```

#### 1.5 Create Edge Function: `storefront-estimate`

**Purpose**: Calculate price estimate for configurator display

```text
Endpoint: POST /storefront-estimate

Request Body:
{
  "account_id": "uuid",
  "api_key": "string",
  "fabric_id": "uuid",
  "width_mm": 2000,
  "drop_mm": 2400,
  "quantity": 1,
  "options": {
    "lining_type": "blackout",
    "heading_type": "wave"
  }
}

Response:
{
  "success": true,
  "estimate": {
    "fabric_meters": 12.5,
    "fabric_cost": 562.50,
    "making_cost": 85.00,
    "total": 647.50,
    "currency": "EUR",
    "note": "Estimate only. Final price confirmed after measurement."
  }
}
```

### Phase 2: Documentation Update

Add new section to `src/pages/Documentation.tsx`:

**New Section: "Storefront Integration API"**

Subsections:
1. **Getting Started** - Account ID and API key retrieval
2. **Authentication** - How to authenticate API requests
3. **Fabric Catalog API** - Fetching products with examples
4. **Lead Capture API** - Submitting leads with full spec
5. **Product Options API** - Configuration options
6. **Price Estimate API** - Calculator integration
7. **Shopify Integration** - How orders flow in
8. **Error Codes** - Standard error responses
9. **Code Examples** - JavaScript/React examples

### Phase 3: Shopify Connection

No code changes required - uses existing OAuth flow:

1. Gustin navigates to Settings → Integrations → Shopify
2. Enters their Shopify store domain
3. Completes OAuth authorization
4. Webhooks auto-register (`orders/create`, `customers/create`)
5. When order comes in → `shopify-webhook-order` creates Client + Project

### Phase 4: Inventory Sync (Bidirectional)

Enhance existing sync to support:

1. **Shopify → InterioApp**: When Shopify inventory changes, update `enhanced_inventory_items.quantity`
2. **InterioApp → Shopify**: When InterioApp stock decrements (project status change), update Shopify

This requires:
- New Edge Function: `shopify-sync-inventory` with bidirectional logic
- Add Shopify `inventory_levels/update` webhook handling

### Phase 5: Settings UI Enhancement

Add to Settings → Integrations:

1. **API Access Card** displaying:
   - Account ID (read-only, copy button)
   - Storefront API Key (masked, regenerate button)
   - Quick links to documentation

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/storefront-catalog/index.ts` | Public catalog API |
| `supabase/functions/storefront-lead/index.ts` | Multi-tenant lead capture |
| `supabase/functions/storefront-options/index.ts` | Product options API |
| `supabase/functions/storefront-estimate/index.ts` | Price calculator API |
| `supabase/functions/shopify-sync-inventory/index.ts` | Bidirectional inventory sync |
| New SQL migration | Add `storefront_api_key` to `account_settings` |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Documentation.tsx` | Add "Storefront Integration API" section (~200 lines) |
| `supabase/config.toml` | Register 5 new edge functions |
| `src/pages/Settings.tsx` or integration settings | Add API Access card |

---

## Gustin-Specific Setup Checklist

After implementation:

1. Generate Gustin's storefront API key (automatic via migration)
2. Provide credentials to new Lovable project:
   - `INTERIOAPP_ACCOUNT_ID`: `32a92783-f482-4e3d-8ebf-c292200674e5`
   - `INTERIOAPP_API_KEY`: (from account_settings.storefront_api_key)
   - API Base URL: `https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/`
3. Connect Gustin's Shopify store via OAuth
4. Test lead capture from storefront
5. Test order webhook flow

---

## Security Considerations

- API keys validated per-request
- Rate limiting: 100 requests/minute per account (implement in edge functions)
- No cost prices exposed in catalog API (only selling prices)
- CORS configured for Gustin domain
- Webhook signatures verified for Shopify

---

## Expected API Documentation Output

The Documentation page will include complete specs like:

```
## Storefront Fabric Catalog API

**Endpoint:** GET https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/storefront-catalog

**Authentication:** Include account_id and api_key as query parameters

**Example Request:**
```javascript
const response = await fetch(
  `${INTERIOAPP_API_URL}/storefront-catalog?account_id=${ACCOUNT_ID}&api_key=${API_KEY}&category=fabric&limit=20`
);
const { data, pagination } = await response.json();
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique fabric identifier |
| name | string | Display name |
| sku | string | Product code |
| collection | string | Collection name |
| color | string | Color name |
| width_cm | number | Fabric width in cm |
| image_url | string | Product image URL |
| price_per_meter | number | Selling price per meter |
| currency | string | Price currency (EUR, USD, etc.) |
```

This gives the new Gustin Decor Lovable project everything needed to integrate!
