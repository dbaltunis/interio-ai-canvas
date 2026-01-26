
# Complete Documentation Overhaul for InterioApp v2.3.16

## Overview

This is a major documentation rewrite to bring InterioApp from "Version 1.0" (dated 2025-01-09) to a professional, launch-ready "Version 2.4" that reflects all current features, integrations, and capabilities.

---

## Phase 1: Documentation Structure & Version Update

### 1.1 Update Version Constants
**File:** `src/pages/Documentation.tsx` (line 329)
- Change version badge from `v1.0` to `v2.4`
- Update header subtitle to "Complete Business Management Platform"

### 1.2 Add New Documentation Sections
Current sections:
- Getting Started
- Jobs & Projects
- Client Management
- Inventory Library
- Calendar & Scheduling
- Team & Permissions
- Settings & Config
- Integrations (exists but needs expansion)

**New sections to add:**
- **API & Developer Access** (new)
- **Supplier Integrations** (new - dedicated section)
- **Communication Channels** (new - Email, SMS, WhatsApp)
- **Analytics & Reporting** (new)
- **Calculation Algorithms** (new - high-level explanation)

---

## Phase 2: Content Rewrite - Core Sections

### 2.1 Getting Started Section
Update "What is InterioApp?" to reflect v2.4 capabilities:
- SaaS multi-tenant architecture
- 600+ accounts supported
- Industry-specific features for window treatments
- Supplier integration ecosystem
- Real-time pricing calculations

### 2.2 Jobs & Projects Section
Update with current workflow:
- Add "Supplier Ordering" subsection
- Document TWC order submission
- Document status workflow with "locked" states
- Add work order sharing documentation (already partially done)

### 2.3 Inventory Library Section
Rename and update:
- Rename from "Inventory Management" to "Product Library"
- Add Collections & Tagging documentation
- Add Vendor linking vs orphan supplier text
- Document price group workflows
- Add TWC material import process

---

## Phase 3: New Integration Documentation

### 3.1 Supplier Integrations Section (New)

**Subsection: TWC (The Window Company)**
```text
Content to document:
- Integration setup via Settings → Integrations
- Product import workflow (fabrics, headings, options)
- Order submission from Job Header
- Order tracking in supplier_orders JSONB
- Confirmation emails and notifications
- Production/Testing mode distinction
```

**Subsection: Shopify Integration**
```text
Content to document:
- Store connection (new or existing)
- Bidirectional product sync
- Customer import
- Order management
- Inventory synchronization
- Webhook handling
```

### 3.2 Communication Channels Section (New)

**Subsection: SendGrid Email**
```text
- API key configuration
- Webhook setup for tracking
- Email deliverability checking
- Template management
- Open/click tracking
```

**Subsection: WhatsApp (Twilio)**
```text
- Twilio account setup
- Template configuration
- Account-owner inheritance pattern
- Message types supported
```

**Subsection: SMS Messaging**
```text
- Twilio SMS integration
- Bulk SMS capabilities
- Appointment reminders
```

### 3.3 Calendar Integrations Section

**Subsection: Google Calendar**
```text
- OAuth connection flow
- "Unverified app" warning explanation
- Bidirectional sync
- Google Meet link generation
- Privacy (hiding personal calendar IDs)
```

### 3.4 Payment Processing Section

**Subsection: Stripe Connect**
```text
- OAuth setup
- Quote payments
- Store checkout
- Application fees
- Subscription management
```

---

## Phase 4: API & Developer Access (New Section)

### 4.1 API Overview Subsection
```text
Content to create:
- Edge Function architecture
- Authentication via Supabase
- API key generation (to be implemented)
- Rate limiting and quotas
- Available endpoints overview
```

### 4.2 Available Endpoints Subsection
Document key edge functions:
- `/receive-external-lead` - Accept leads from external sources
- `/create-booking` - Public booking creation
- `/shopify-webhook-order` - Order webhook handler
- `/sendgrid-webhook` - Email event tracking
- Custom integration endpoints

### 4.3 Webhook Configuration Subsection
```text
- Incoming webhooks (Shopify, SendGrid, Stripe)
- Outgoing notifications
- Signature verification
- Error handling
```

---

## Phase 5: Calculation Algorithms Section (New)

### 5.1 Fabric Calculation Overview
High-level explanation without revealing exact formulas:
```text
"InterioApp uses industry-standard algorithms for fabric calculations,
taking into account:
- Window dimensions and fullness ratios
- Fabric orientation (vertical/horizontal)
- Seam allowances and hem requirements
- Pattern repeat matching
- Waste minimization

All calculations originate from a centralized calculation engine
to ensure 100% consistency across quotes, work orders, and invoices."
```

### 5.2 Pricing Engine Overview
```text
"The pricing system follows a clear hierarchy:
1. Grid-specific pricing (if configured)
2. Category/subcategory markups
3. Global default markups
4. Minimum markup floors

This ensures transparent, predictable pricing across all products."
```

---

## Phase 6: Screenshot Integration

### 6.1 Screenshot Upload Strategy
The system already has `ScreenshotUploader` and `ScreenshotDisplay` components that:
- Upload to `documentation-screenshots` Supabase bucket
- Support PNG, JPG, WebP
- Use sectionId/subsectionId naming

### 6.2 Screenshots to Create/Upload
Priority screenshots needed:

| Section | Subsection | Screenshot Description |
|---------|------------|----------------------|
| getting-started | dashboard | Main dashboard with KPI cards |
| getting-started | first-steps | Business settings page |
| jobs | job-creation | Quote builder interface |
| jobs | measurements | Measurement worksheet |
| jobs | sharing-work-orders | Share dialog with item selection |
| inventory | fabrics | Fabric library grid view |
| inventory | vendors | Vendor management page |
| calendar | scheduling | Calendar view with appointments |
| team | roles | Team permissions settings |
| integrations | twc | TWC order submission dialog |
| integrations | shopify | Shopify connection page |
| integrations | sendgrid | Email setup interface |
| integrations | google-calendar | Calendar sync settings |

### 6.3 Screenshot Generation Process
For each screenshot:
1. Navigate to the relevant page in the app
2. Use browser screenshot or the app's screenshot capability
3. Upload via admin mode in Documentation page
4. Screenshots automatically display in their sections

---

## Phase 7: Files to Modify

### Primary Files

| File | Changes |
|------|---------|
| `src/pages/Documentation.tsx` | Add new sections, update version, expand content |
| `docs/README.md` | Update version, last updated date, section links |
| `docs/CHANGELOG.md` | Add v2.4 release notes |
| `src/constants/version.ts` | Update to v2.4.0 |

### New Documentation Files (Optional Markdown)

| File | Purpose |
|------|---------|
| `docs/API_REFERENCE.md` | Full API documentation |
| `docs/INTEGRATIONS.md` | Integration setup guides |
| `docs/SUPPLIER_ORDERING.md` | Supplier order workflow |

---

## Phase 8: API Key System (New Feature)

### 8.1 Database Schema Addition
Create new table for API keys:
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- bcrypt hash of the key
  key_prefix TEXT NOT NULL, -- First 8 chars for identification (e.g., "iak_live_")
  permissions JSONB DEFAULT '[]',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);
```

### 8.2 API Key Management UI
Add to Settings → Integrations:
- Generate API Key button
- List existing keys (masked)
- Revoke keys
- Set permissions per key
- View usage statistics

### 8.3 Edge Function Authentication
Update edge functions to accept:
- `Authorization: Bearer <api_key>`
- Validate against `api_keys` table
- Log usage for rate limiting

---

## Phase 9: Implementation Order

### Immediate (Documentation Rewrite)
1. Update `Documentation.tsx` with new sections and content
2. Update version badges and dates
3. Update `docs/README.md` to match in-app documentation

### Short-term (Screenshots)
4. Capture and upload screenshots for key sections
5. Test screenshot display in all sections

### Medium-term (API Keys)
6. Create API keys database table
7. Build API key management UI
8. Update edge functions for API key auth
9. Document API usage

---

## Technical Notes

### Existing Infrastructure Utilized
- `ScreenshotUploader.tsx` - Already handles image uploads to Supabase Storage
- `ScreenshotDisplay.tsx` - Already loads and displays screenshots by section/subsection
- `documentation-screenshots` bucket - Storage bucket exists
- Admin mode toggle - Already implemented for screenshot management

### Content Structure
The `sections` array in `Documentation.tsx` (lines 29-300) contains all documentation content as inline strings. Each section has:
- `id`: Section identifier
- `title`: Display name
- `icon`: Lucide icon component
- `subsections[]`: Array of content items with id, title, content

### Version System
- `APP_VERSION` in `src/constants/version.ts` should be updated
- Documentation page badge should match
- `app_versions` table should have release notes entry

---

## Expected Outcome

- Professional documentation matching app version 2.4
- Complete integration guides for TWC, Shopify, Google Calendar, SendGrid, Stripe
- API access documentation for developers
- Screenshots for visual guidance
- Clear algorithm explanations (without revealing proprietary formulas)
- Consistent terminology ("Product Library" not "Inventory")
- Updated version badges and timestamps throughout
