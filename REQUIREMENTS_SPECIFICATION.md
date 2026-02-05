# InterioApp Requirements Specification

**Purpose:** This document defines what InterioApp MUST do. It serves as the single source of truth for development, testing, and client communication.

**Status:** DRAFT — Needs client input in sections marked with ❓

---

## 1. Core Business Model

### 1.1 User Types & Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERIOAPP ECOSYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │  SUPPLIERS/  │ ──────► │  RETAILERS   │                      │
│  │  WHOLESALERS │ library │              │                      │
│  └──────────────┘ connect └──────────────┘                      │
│        │                         │                               │
│        │ own library             │ invite                        │
│        ▼                         ▼                               │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │   PRODUCTS   │         │    TEAM      │                      │
│  │   PRICING    │         │   MEMBERS    │                      │
│  │   TEMPLATES  │         │              │                      │
│  └──────────────┘         └──────────────┘                      │
│                                  │                               │
│                                  │ serve                         │
│                                  ▼                               │
│                           ┌──────────────┐                      │
│                           │    CLIENTS   │                      │
│                           │  (End Users) │                      │
│                           └──────────────┘                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Account Types

| Account Type | Description | Can Create Library? | Can Connect to Library? | Can Invite Team? |
|-------------|-------------|---------------------|------------------------|------------------|
| Supplier/Wholesaler | Manufactures or distributes products | ✅ Yes | ❌ No | ✅ Yes |
| Retailer | Sells to end consumers | ❌ No (uses supplier's) | ✅ Yes | ✅ Yes |
| Dealer | ❓ Define relationship | ❓ | ❓ | ❓ |

❓ **QUESTION:** What's the difference between a Retailer and a Dealer in your model?

### 1.3 Library Sharing Model

❓ **QUESTIONS:**
- When a retailer connects to a supplier's library, do they see supplier's COST prices or a different price tier?
- Can retailers add their own markup on top of library prices?
- Can retailers add their own products that aren't in the supplier's library?
- If the supplier updates a product price, does it auto-update for connected retailers?

---

## 2. User Roles & Permissions

### 2.1 Role Definitions

| Role | Intended Use Case | Key Capabilities |
|------|------------------|------------------|
| System Owner | InterioApp administrators | Full system access, can see all accounts |
| Owner | Account owner (the business owner) | Full access to THEIR account |
| Admin | Trusted manager | ❓ What can they NOT do that Owner can? |
| Manager | Team lead | ❓ Define scope |
| Staff | Employee | ❓ Define scope |
| User | Basic access | ❓ Define scope |
| Dealer | External reseller | ❓ Define scope |

### 2.2 Permission Scoping

❓ **CRITICAL QUESTION:** For each of these, what's the intended behavior?

| Feature | Owner | Admin | Manager | Staff | Dealer |
|---------|-------|-------|---------|-------|--------|
| View all projects | ✅ | ❓ | ❓ | ❓ Assigned only? | ❓ |
| View all clients | ✅ | ❓ | ❓ | ❓ | ❓ |
| See cost prices | ✅ | ❓ | ❓ | ❓ Usually NO | ❓ |
| See profit margins | ✅ | ❓ | ❓ | ❓ | ❓ |
| Modify pricing/markup | ✅ | ❓ | ❓ | ❓ | ❓ |
| Access inventory | ✅ | ❓ | ❓ | ❓ | ❓ |
| Create quotes | ✅ | ❓ | ❓ | ❓ | ❓ |
| Approve quotes | ✅ | ❓ | ❓ | ❓ | ❓ |
| Access settings | ✅ | ❓ | ❓ | ❓ | ❓ |
| Manage team | ✅ | ❓ | ❌ | ❌ | ❌ |

### 2.3 Data Visibility Rules

❓ **QUESTION:** When Staff creates a project, who can see it?
- [ ] Only the Staff member who created it
- [ ] Staff member + their Manager
- [ ] Everyone on the team
- [ ] Configurable per account

❓ **QUESTION:** When Staff creates a quote, who can see/edit it?
- [ ] Only creator (until approved)
- [ ] Creator + Managers + Admins + Owner
- [ ] Everyone

---

## 3. Product Types & Calculations

### 3.1 Supported Product Categories

| Category | Subcategories | Calculation Method | Status |
|----------|---------------|-------------------|--------|
| Curtains | Pencil pleat, Pinch pleat, Wave, Eyelet, etc. | Linear meter + fullness + hems | ✅ Exists |
| Blinds | Roller, Venetian, Vertical, Roman, etc. | SQM or Grid pricing | ✅ Exists |
| Shutters | Plantation, Cafe, Tier-on-tier | SQM or Grid pricing | ✅ Exists |
| Awnings | Folding arm, Straight drop, etc. | SQM | ✅ Exists |
| Wallcoverings | ❓ | ❓ | ❓ Does this exist? |
| Soft Furnishings | Cushions, upholstery, etc. | ❓ | ❓ Does this exist? |

### 3.2 Calculation Variables (The Algorithm Inputs)

For **CURTAINS**, the standard calculation needs:

| Variable | Unit | Source | Required? |
|----------|------|--------|-----------|
| Rail/track width | MM | Measurement | ✅ |
| Drop/height | MM | Measurement | ✅ |
| Fullness ratio | Decimal (e.g., 2.5) | Template | ✅ |
| Fabric width | CM | Fabric spec | ✅ |
| Pattern repeat (vertical) | CM | Fabric spec | If patterned |
| Pattern repeat (horizontal) | CM | Fabric spec | If patterned |
| Side hems | CM | Template | ✅ |
| Bottom hem | CM | Template | ✅ |
| Header hem | CM | Template | ✅ |
| Returns | CM | Template | If applicable |
| Seam allowance | CM | Template | If multi-width |
| Orientation | Railroaded/Vertical | Fabric spec | ✅ |
| Number of panels | Integer | Configuration | ✅ |

❓ **MISSING FEATURES YOU MENTIONED:**

| Feature | Description | Current Status |
|---------|-------------|----------------|
| Rotation calculation | ❓ Explain what this means | ❌ Missing |
| Leftover calculation | Track fabric remnants for reuse | ❌ Missing |
| Cross-treatment reuse | Use leftover from Treatment A in Treatment B within same project | ❌ Missing |

### 3.3 Calculation Outputs

For each treatment, the algorithm should produce:

| Output | Description | Used For |
|--------|-------------|----------|
| Fabric meters required | Total linear meters of main fabric | Ordering, costing |
| Widths required | Number of fabric widths to cut | Work order |
| Cuts required | Number of cut pieces | Work order |
| SQM (for blinds/shutters) | Square meters | Pricing |
| Fabric cost | At cost price | Internal tracking |
| Selling price | With markup | Quote to client |
| Manufacturing cost | Labor + machine time | Internal tracking |
| Total cost | All components | Quote total |
| Leftover/waste | Unusable fabric after cutting | ❓ Track for reuse? |

### 3.4 Pricing Methods

| Method | Used For | How It Works |
|--------|----------|--------------|
| Per linear meter | Fabrics, tracks, trims | Price × meters |
| Per SQM | Blinds, shutters, glass | Price × (W × H / 10000) |
| Per unit (each) | Hardware, accessories | Price × quantity |
| Per width | Some fabrics | Price × number of widths |
| Pricing grid | Complex products | Lookup by W×H brackets |
| Fixed | Installation fees, etc. | Flat amount |
| Percentage | Markup, discounts | % of base |

### 3.5 Markup System

❓ **QUESTIONS:**

Current hierarchy: Product > Grid > Subcategory > Category > Global

- Is this correct?
- Should different USER ROLES see different markup? (e.g., Staff sees selling price only, Owner sees cost + margin)
- Should different CLIENTS get different markup? (e.g., trade discount for bulk buyers)
- Should markup be customizable per account?

---

## 4. Quoting & Invoicing

### 4.1 Quote Workflow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  DRAFT   │───►│  SENT    │───►│ ACCEPTED │───►│  ORDER   │───►│ INVOICED │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │                │
                     ▼                ▼
               ┌──────────┐    ┌──────────┐
               │ EXPIRED  │    │ REJECTED │
               └──────────┘    └──────────┘
```

### 4.2 Quote Display Requirements

| Element | Where Shown | Format | Customizable? |
|---------|-------------|--------|---------------|
| Line items | Quote body | Room-grouped or flat | ❓ Per template? |
| Unit price | Each line | Currency formatted | ✅ |
| Quantity | Each line | Integer or decimal | ✅ |
| Line total | Each line | Currency formatted | ✅ |
| Subtotal | Before tax | Currency formatted | ✅ |
| Discount | After subtotal | Amount or % | ❓ |
| Tax | After discount | % of subtotal | ✅ |
| Grand total | Final | Currency formatted | ✅ |
| Cost breakdown | Optional detail | ❓ | ❓ When to show? |

❓ **QUESTION:** Should clients EVER see:
- Cost prices? (Usually NO)
- Fabric quantities? (Sometimes yes for transparency)
- Manufacturing breakdown? (Usually NO)

### 4.3 Quote Templates

Current templates found in code:
- LivePreview (main canvas-based)
- QuoteTemplateHomekaara
- PrintableQuote

❓ **QUESTION:** You mentioned you uploaded a new quote template. Can you tell me:
- What file/where is it?
- What should it look like?
- What did Lovable break?

### 4.4 PDF Generation Requirements

| Requirement | Current Status | Expected Behavior |
|-------------|---------------|-------------------|
| Company logo | ❓ | Header of every page? |
| Client details | ✅ | Name, address, contact |
| Quote number | ✅ | Unique, sequential |
| Date & validity | ✅ | Created date + valid until |
| Line items with prices | ⚠️ Bug: currency missing | All values formatted |
| Terms & conditions | ❓ | Footer? Separate page? |
| Payment terms | ❓ | Include? |
| Signature line | ❓ | For client approval? |

---

## 5. Work Orders & Installation Sheets

### 5.1 Work Order Purpose

Work orders are for: ❓ (check all that apply)
- [ ] Internal manufacturing team
- [ ] External workroom/factory
- [ ] Installation team
- [ ] Client reference

### 5.2 Work Order Content

| Field | Show to Workroom? | Show to Installer? | Show to Client? |
|-------|-------------------|-------------------|-----------------|
| Fabric name & code | ✅ | ✅ | ❓ |
| Cut dimensions | ✅ | ❌ | ❌ |
| Finished dimensions | ✅ | ✅ | ✅ |
| Fabric meters | ✅ | ❌ | ❓ |
| Pattern repeat notes | ✅ | ❌ | ❌ |
| Installation notes | ❌ | ✅ | ❓ |
| Room/location | ✅ | ✅ | ✅ |
| Prices | ❌ | ❌ | ❓ |

❓ **QUESTION:** You mentioned "installation sheet sharing gives different results from project." What SHOULD match that currently doesn't?

---

## 6. Calendar & Appointments

### 6.1 Appointment Types

❓ What types of appointments does the app need?
- [ ] Measurement appointments (at client site)
- [ ] Consultation appointments (showroom or site)
- [ ] Installation appointments
- [ ] Follow-up appointments
- [ ] Other: _____________

### 6.2 Calendar Requirements

| Feature | Required? | Current Status |
|---------|-----------|----------------|
| View team availability | ❓ | ❓ |
| Book appointment for self | ❓ | ❓ |
| Book appointment for team member | ❓ | ❓ |
| Client self-booking (public page) | ❓ | ✅ Exists |
| Google Calendar sync | ❓ | ✅ Exists but issues |
| Send appointment reminders | ❓ | ❓ |
| Recurring appointments | ❓ | ❓ |

❓ **QUESTION:** What specifically is "breaking" with the calendar?

---

## 7. Client Management (CRM)

### 7.1 Client Data Model

| Field | Required? | Notes |
|-------|-----------|-------|
| Name | ✅ | |
| Email | ❓ | Primary contact method? |
| Phone | ❓ | |
| Address | ❓ | For appointments/delivery |
| Company | ❓ | B2B clients |
| Source | ❓ | How they found you |
| Notes | ❓ | |
| Tags | ❓ | For segmentation |

❓ **QUESTION:** You said "Client section isn't functioning 100%." What specifically:
- Doesn't save correctly?
- Doesn't display correctly?
- Is missing entirely?

### 7.2 Client Relationships

❓ Should the app track:
- [ ] Multiple contacts per client/company
- [ ] Client history (all quotes, orders, communications)
- [ ] Client preferences (fabric preferences, budget ranges)
- [ ] Client credit/payment terms

---

## 8. Library & Inventory

### 8.1 Library Structure

```
Library (owned by Supplier/Wholesaler)
├── Categories (e.g., "Curtain Fabrics", "Blind Systems")
│   ├── Subcategories (e.g., "Sheer", "Blockout", "Dimout")
│   │   ├── Products/Items
│   │   │   ├── Name, SKU, Description
│   │   │   ├── Pricing (cost, sell, grid)
│   │   │   ├── Specifications (width, weight, composition)
│   │   │   ├── Images
│   │   │   └── Options (colors, variations)
```

❓ **QUESTION:** You said "library is a bit of a mess." What's messy?
- Categories not organized well?
- Products missing data?
- Search doesn't work?
- UI is confusing?

### 8.2 Import/Export Requirements

| Format | Import | Export | Current Status |
|--------|--------|--------|----------------|
| CSV - Products | ❓ | ❓ | ⚠️ Not standardized |
| CSV - Pricing Grids | ❓ | ❓ | ⚠️ Not standardized |
| CSV - Clients | ❓ | ❓ | ❓ |
| TWC Integration | ✅ | ❓ | ✅ Exists |

❓ **QUESTION:** What should the STANDARD CSV format be?

Example for products:
```csv
sku,name,category,subcategory,cost_price,sell_price,unit,fabric_width_cm,pattern_repeat_v,pattern_repeat_h
FAB001,Luxe Velvet,Curtain Fabrics,Blockout,45.00,89.00,per_meter,140,0,0
FAB002,Sheer Elegance,Curtain Fabrics,Sheer,25.00,55.00,per_meter,300,30,0
```

Do you want me to define the standard schema?

---

## 9. Communications

### 9.1 Email

| Feature | Required? | Current Status |
|---------|-----------|----------------|
| Send quotes via email | ✅ | ⚠️ Issues |
| Send invoices via email | ❓ | ❓ |
| Email templates | ✅ | ✅ Exists |
| Email tracking (opens/clicks) | ❓ | ✅ Exists |
| Receive email replies in app | ❓ | ❓ |
| Email campaigns (bulk) | ❓ | ⚠️ Not working well |

❓ **QUESTION:** What specifically doesn't work with email?

### 9.2 WhatsApp

❓ **QUESTIONS:**
- What should WhatsApp integration do?
- Send quotes via WhatsApp?
- Two-way messaging?
- What's not working?

### 9.3 SMS

❓ Is SMS needed? For what?

---

## 10. Integrations

### 10.1 Current Integrations

| Integration | Purpose | Status |
|-------------|---------|--------|
| TWC (The Window Covering Co) | Order submission, product import | ✅ Exists |
| Shopify | E-commerce sync | ✅ Exists |
| Google Calendar | Appointment sync | ⚠️ Issues |
| SendGrid | Email delivery | ✅ Exists |
| Twilio | SMS/WhatsApp | ⚠️ Issues |
| MYOB | Accounting | ❓ Started? |
| Xero | Accounting export | ✅ Export only |
| QuickBooks | Accounting export | ✅ Export only |

### 10.2 Planned Integrations

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Netsuite | ERP for large clients | ❓ |
| SW System | Australian supplier | ❓ |
| RFMS | Flooring industry | ❓ |
| ERP (generic) | Enterprise resource planning | ❓ |

❓ **QUESTION:** For each integration:
- What data flows IN to InterioApp?
- What data flows OUT from InterioApp?
- Real-time sync or batch?

---

## 11. Per-Account Customization

❓ **CRITICAL QUESTION:** What should be customizable per account?

| Feature | Global (same for all) | Per-Account Customizable |
|---------|----------------------|--------------------------|
| Calculation formulas | ❓ | ❓ |
| Quote templates | ❓ | ❓ |
| Email templates | ❓ | ❓ |
| Branding (logo, colors) | ❓ | ✅ |
| Tax rate | ❓ | ✅ |
| Currency | ❓ | ✅ |
| Measurement units (mm/cm/inch) | ❓ | ✅ |
| Workflow stages | ❓ | ❓ |
| Custom fields | ❓ | ❓ |
| Integrations enabled | ❓ | ✅ |

---

## 12. API & Algorithm Licensing

### 12.1 Vision

You want to sell calculation algorithms via API so anyone selling bespoke products online can use InterioApp's calculation engine.

### 12.2 API Requirements

| Endpoint | Input | Output | Authentication |
|----------|-------|--------|----------------|
| `/calculate/curtain` | Measurements, fabric spec, template | Meters required, cuts, pricing | API key |
| `/calculate/blind` | Measurements, product type | SQM, pricing | API key |
| `/calculate/shutter` | Measurements, style | SQM, pricing | API key |
| `/validate/measurements` | Raw measurements | Validated + warnings | API key |

❓ **QUESTIONS:**
- Should API customers use YOUR pricing or input their own?
- Should API include markup or just quantities?
- Rate limits? Pricing tiers?

### 12.3 Algorithm Versioning

Each algorithm should be versioned so:
- Existing quotes reference the version used
- API customers can pin to a version
- Breaking changes don't affect live systems

```
src/algorithms/
├── curtain/
│   ├── v1.0.0/
│   │   ├── vertical.ts
│   │   ├── railroaded.ts
│   │   └── index.ts
│   └── v1.1.0/
│       └── ...
├── blind/
│   └── ...
└── index.ts (version registry)
```

---

## 13. Documentation Requirements

### 13.1 Types of Documentation Needed

| Type | Audience | Status |
|------|----------|--------|
| User Guide | End users (retailers, staff) | ❓ |
| Admin Guide | Account owners, admins | ❓ |
| API Documentation | Developers, integrators | ❌ Missing |
| Algorithm Specification | Internal, API customers | ❌ Missing |
| Integration Guides | Per integration | ❓ |

### 13.2 API Documentation Standard

Recommend: OpenAPI 3.0 specification with:
- All endpoints documented
- Request/response schemas
- Authentication explained
- Code examples
- Sandbox environment

---

## 14. Acceptance Criteria

For every bug fix and feature, we need clear acceptance criteria. Example:

**Feature:** Curtain fabric calculation
**Acceptance Criteria:**
- [ ] Given a rail width of 2000mm, drop of 2400mm, fullness 2.5, fabric width 140cm
- [ ] When I calculate fabric requirements
- [ ] Then I get exactly X linear meters (show calculation)
- [ ] And the result is the same regardless of which UI screen I use
- [ ] And team members with "view" permission see the same result
- [ ] And the quote shows the correct selling price (cost × markup)

❓ **REQUEST:** For each broken feature, can you provide:
1. What happens now (the bug)
2. What SHOULD happen (expected behavior)
3. How to test that it's fixed

---

## Next Steps

1. **You review this document** and fill in all ❓ sections
2. **I review your answers** and ask follow-up questions
3. **We create a prioritized backlog** based on business impact
4. **I fix systematically** with clear acceptance criteria for each item
5. **We document as we go** — no more undocumented features

---

## Appendix A: Questions Summary

### Permissions & Access
1. What's the difference between Retailer and Dealer?
2. What can Admin NOT do that Owner can?
3. Should Staff see only assigned projects or all projects?
4. Who sees cost prices vs. selling prices?

### Calculations
5. What is "rotation calculation"?
6. How should leftover/remnant tracking work?
7. Should fabric be reusable across treatments in one project?
8. Do wallcoverings and soft furnishings exist or are they planned?

### Quotes & Documents
9. Where is the new quote template you uploaded?
10. What did Lovable break in it?
11. What should installation sheets show vs. quotes?

### Features
12. What specifically is broken in the calendar?
13. What specifically is broken in the client section?
14. What specifically doesn't work with email?
15. What should WhatsApp integration do?

### Integrations
16. For Netsuite/SW System/RFMS — what data flows in/out?

### Customization
17. What features should be customizable per account?
18. What should API customers be able to do?
