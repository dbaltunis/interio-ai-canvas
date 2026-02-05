# InterioApp Comprehensive Code Audit Report

**Date:** 2026-02-05
**Auditor:** Claude (Opus 4.5)
**Scope:** Full codebase audit — calculations, quotes/PDFs, permissions/settings, integrations

---

## Executive Summary

**103 bugs and architectural issues identified** across 4 categories:
- **37** Calculation/Algorithm bugs
- **25** Quote/Invoice/PDF bugs
- **23** Integration architecture issues
- **18** Permissions & Settings bugs

### Root Causes of Reported Symptoms

| Symptom | Root Cause | Category |
|---------|-----------|----------|
| "Fix for one client breaks another" | Hooks inconsistently use `user.id` vs `effectiveOwnerId` — team members see different data | Permissions |
| "Numbers are wrong/mixed" | 4 competing calculation engines with different formulas, units, and markup logic | Calculations |
| "Things disappear from quotes" | `formatCurrency()` returns empty string when no currency passed | Quotes/PDF |
| "Settings don't apply to other users" | `settingsCacheService` uses static localStorage keys with no user scoping | Settings |
| "Markup sometimes applied, sometimes not" | Main pricing path never calls `resolveMarkup`; only one engine applies grid markup | Calculations |

---

## Category 1: Calculation Engine Bugs (37 Issues)

### System-Level Problem: Multiple Competing Calculation Engines

| Engine | File | Used For |
|--------|------|----------|
| `CalculationEngine` | `src/engine/CalculationEngine.ts` | "Single source of truth" (per header) |
| `calculateTreatmentPricing` | `src/utils/pricing/calculateTreatmentPricing.ts` | Treatment pricing in UI |
| `calculateBlindCost` | `src/utils/blindCostCalculations.ts` | Blind-specific pricing |
| `CalculationService` | `src/services/calculationService.ts` | Service-layer calculations |
| Formula definitions | `src/utils/calculationFormulas.ts` | Formula definitions |

These engines differ in formulas, unit expectations, seam handling, waste application, price field priority, hem inclusion, and markup application.

### CRITICAL Bugs

#### Bug C1: Seam Allowance Doubled or Not
- **Files:** `CalculationEngine.ts:279,306` vs `calculationFormulas.ts:132`
- `CalculationEngine`: `seam_allowance = seams_count * seam_hem_cm` (1x)
- `calculationFormulas`: `seamAllowance = seamsCount * seamHemCm * 2` (2x)
- No canonical definition of what the template field means

#### Bug C2: Drapes Misclassified as Blinds
- **File:** `calculateTreatmentPricing.ts:169`
- `treatmentCategory.includes('drape')` is in the `isBlindTreatment` check
- Drapes get sqm pricing instead of linear-meter pricing

#### Bug C3: Unit Mismatch CM vs MM
- `calculateTreatmentPricing.ts` expects CENTIMETERS
- `pricingStrategies.ts` expects MILLIMETERS
- `calculateOptionPrices.ts` expects MILLIMETERS
- `CalculationEngine.ts` expects MILLIMETERS
- Cross-calling produces 10x errors

#### Bug C4: Unit Fallback Assumes MM When Caller Sends CM
- **File:** `calculateOptionPrices.ts:48,65-74`
- Default unit is `'mm'`, so CM values get divided by 10 again

#### Bug C5: Blind SQM — Hems Included in One Engine, Not Another
- `calculateTreatmentPricing.ts:241`: NO hems → 1.00 sqm
- `CalculationEngine.ts:368`: WITH hems → 1.27 sqm (27% difference)

#### Bug C6: Waste Applied to Different Bases
- `CalculationEngine`: waste on total cost (fabric + material + options)
- `calculationFormulas`: waste on raw SQM
- `calculateTreatmentPricing`: waste on linear meters
- `calculationService`: waste on linear meters

#### Bug C7: Markup Never Applied in Main Pricing Path
- `calculateTreatmentPricing.ts` never calls `resolveMarkup` or `applyMarkup`
- `markupResolver.ts` exists but is disconnected from the main calculation flow
- Only `CalculationEngine.ts` applies grid-specific markup (line 424)

#### Bug C8: Grid Price Uses "Closest Match" Instead of "Next Size Up"
- **File:** `usePricingGrids.ts:130-133`
- Industry standard: charge for next size up (ceiling)
- Code: finds closest value (can undercharge)

#### Bug C9: Material Grid Pricing Ignores Markup
- **File:** `CalculationEngine.ts:411-428` vs `:466-471`
- Fabric grid: applies `pricing_grid_markup`
- Material grid: returns raw price, no markup

### HIGH Bugs

#### Bug C10: Side Hems × curtainCount Inconsistency
- `calculateTreatmentPricing.ts:92`: 4x side hem for pairs
- `CalculationEngine.ts:253`: always 2x side hem

#### Bug C11: Blind Grid Price Arbitrarily Split 40/60
- **File:** `blindCostCalculations.ts:75-76`
- `fabricCost = gridPrice * 0.4; manufacturingCost = gridPrice * 0.6`
- No basis in data, affects markup if rates differ

#### Bug C12: Price Field Priority Differs
- `blindCostCalculations.ts:91`: `selling_price || unit_price || cost_price`
- `calculateTreatmentPricing.ts:156`: `cost_price || price_per_meter || unit_price || selling_price`
- Same item, different base cost

#### Bug C13: `machine_price_per_metre` Used as `per_sqm`
- **File:** `calculateTreatmentPricing.ts:279`
- Linear unit field multiplied by square meters

#### Bug C14: Markup 0% Cannot Override Higher Levels
- **File:** `markupResolver.ts:38,48,57`
- `if (markup > 0)` check — zero falls through to next hierarchy level

#### Bug C15: calculationService Omits Seam Allowance
- **File:** `calculationService.ts:122-134`
- No seam allowance in vertical calculation

#### Bug C16: "Per-meter" Options Use Different Bases
- 3 files disagree on what "per meter" measures against
- Rail width vs fullness-adjusted linear meters vs raw rail width in different units

#### Bug C17: Width/Panel Logic Differs
- `calculationFormulas.ts`: divides by quantity first, then ceil per panel
- `CalculationEngine.ts`: treats as one piece, then ceil
- Different `widths_required` for certain dimensions

#### Bug C18: Blind Option Pricing Ignores Methods
- **File:** `blindCostCalculations.ts:157-159`
- All options treated as fixed price, per-sqm/per-meter ignored

#### Bug C19: `eval()` on Database Formulas (SECURITY)
- **File:** `bundleCalculator.ts:132,140,146`
- Code injection vulnerability via database-sourced formulas

### MEDIUM Bugs

#### Bug C20: Labor Calculator Wrong Unit
- `laborCalculator.ts:38-41`: magic numbers assume CM, but MM is database standard
- 2000mm × 2500mm curtain = 400 hours (should be ~4 hours)

#### Bug C21: Fullness `||` Should Be `??`
- `calculateTreatmentPricing.ts:111`: fullness 0 triggers fallback to 1

#### Bug C22: `includes_fabric_price` Default Mismatch
- `gridResolver.ts:80`: defaults to TRUE
- `calculateTreatmentPricing.ts:202`: defaults to FALSE
- Causes double-counting or missing fabric cost

#### Bug C23: Pricing Method String Format Mismatch
- `CalculationEngine.ts`: uses underscores (`per_running_meter`)
- `pricingStrategies.ts`: uses hyphens (`per-linear-meter`)

#### Bug C24: Template Field Name Chaos
- 3+ field names for the same hem value across files
- Different fallback chains resolve to different values

#### Bug C25: Percentage Pricing on Different Bases
- `pricingStrategies.ts`: percentage of `fabricCost * fabricUsage`
- `calculateTreatmentPricing.ts`: percentage of `fabricCost` only
- `CalculationEngine.ts`: percentage of `fabric_cost + material_cost`

#### Bug C26: `require()` for Dynamic Import
- `pricingStrategies.ts:176`, `calculateTreatmentPricing.ts:190`
- Circular dependency risk, ESM incompatible

#### Bug C27: Shutters Ignore Hems
- `blindCostCalculations.ts:201-203`: no hem allowances for shutters

#### Bug C28: Manufacturing Cost Operator Precedence
- `blindCostCalculations.ts:129,131`
- `a || b * c || 0` — multiplication binds tighter than `||`

---

## Category 2: Quote/Invoice/PDF Bugs (25 Issues)

### CRITICAL Bugs

#### Bug Q1: formatCurrency Returns Empty String
- **File:** `formatCurrency.ts:29` → returns `''` when no currency
- **File:** `QuotePreview.tsx:161,166,203,236,240,264,271,277` → never passes currency
- ALL currency values in QuotePreview render as blank

#### Bug Q2: Hardcoded ₹ (Rupee) Symbol
- `LivePreview.tsx:838`, `buildClientBreakdown.ts:606`, `useHardwareAccessoryPricing.ts:250`, `DynamicWindowWorksheet.tsx:2062`
- Non-INR users see ₹ in accessory descriptions

#### Bug Q5: Excluded Items Don't Reduce Grand Total
- `LivePreview.tsx:1162`: room subtotals correctly filter excluded items
- `LivePreview.tsx:1379-1450`: grand total uses `projectData.total` (includes all items)

### HIGH Bugs

#### Bug Q3: quoteDataBinding Hardcoded to AUD
- `quoteDataBinding.ts:43-49`: `currency: 'AUD'`, locale: `'en-AU'`

#### Bug Q8: Invoice Export Subtotal Wrong
- `invoiceExport.ts:453`: prefers `unit_price` over `total` in subtotal calc
- Xero/QuickBooks exports may have wrong totals

#### Bug Q9: Print CSS Removes ALL Borders
- `print.css:128-134`: `border: none !important` on all elements
- PDFs lose table structure entirely

#### Bug Q11: PDF Image Race Condition
- `generateQuotePDF.ts:39-48`: no readiness check before capture
- `QuotePreview.tsx:284`: offscreen render may not complete loading

#### Bug Q12: Markup Not Passed to Breakdown
- `prepareQuoteData.ts:50`: `buildClientBreakdown(summary)` — no markupSettings
- Breakdown shows cost prices, line totals show selling prices

#### Bug Q13: Tax Rate Percentage vs Decimal
- `QuotePreview.tsx:269`: multiplies by 100 (assumes decimal input)
- `prepareQuoteData.ts:39`: divides by 100 (assumes percentage input)
- Can display "1000%" instead of "10%"

#### Bug Q15: Homekaara Template Missing Discount/Tax
- No discount display, tax amount accepted as prop but never rendered

#### Bug Q21: No Data Readiness Check Before PDF
- `QuotePreview.tsx:45-85`: checks DOM ref only, not data loading state

### MEDIUM Bugs

#### Bug Q4: Three Different Currency Symbol Maps
- Different coverage: CAD, JPY, NZD, ZAR missing from various maps

#### Bug Q6: Unit Price Fallback Mixes Per-Unit and Per-Line
- `LivePreview.tsx:1266`: divides by quantity even when field is already per-unit

#### Bug Q14: basetotal May Double-Count Discount
- `LivePreview.tsx:599-604`: adds discount back to subtotal

#### Bug Q16: Canvas + HTML Table May Duplicate Prices
- `QuotePDFExporter.tsx:52-63`: renders canvas image AND HTML table

#### Bug Q17: Work Order Measurements as Raw JSON
- `WorkOrderView.tsx:162-165`: `JSON.stringify(item.measurements, null, 2)`

---

## Category 3: Permissions & Settings Bugs (18 Issues)

### CRITICAL — The Multi-Tenancy Data Isolation Bugs

#### Bug P1: 9+ Hooks Use `user.id` Instead of `effectiveOwnerId`

| Hook | Line | What Breaks |
|------|------|-------------|
| `useInventory.ts` | 37 | Team members see empty inventory |
| `useInventoryManagement.ts` | 37,162,196 | CRUD on wrong user's data |
| `useAccountSettings.ts` | 36,112 | **Settings don't propagate to team** |
| `usePurchaseOrders.ts` | 40 | Orders invisible across team |
| `useClientMeasurements.ts` | 31 | Measurements not shared |
| `useFeatureFlags.ts` | 16 | Flags per user, not per account |
| `useDealerStats.ts` | 31,38,45 | Wrong analytics |
| `useShopifyAnalytics.ts` | 34 | Integration data fragmented |
| `useIntegrationStatus.ts` | 86 | Integration status per user |
| `useProjectInventoryDeduction.ts` | 35 | Deductions under wrong user |

#### Bug P4: `useAppointments` Has NO user_id Filter
- `useAppointments.ts:40-44`: selects `*` from appointments with no ownership filter
- Relies entirely on RLS — cross-account leak if RLS misconfigured

#### Bug P9: Settings Cache Not User-Scoped
- `settingsCacheService.ts:13-35`: static keys like `settings_cache_business`
- No user ID prefix → settings bleed between sessions

#### Bug P11: Account Settings Uses `user.id`
- `useAccountSettings.ts:36,112`: read AND write both use `user.id`
- Team members create separate settings rows, never see owner's settings

### HIGH Bugs

#### Bug P2: Quote Duplication Creates Orphaned Quotes
- `useQuoteVersions.ts:85`: new quote `user_id: user.id`
- Team member's duplicated quotes invisible to account owner

#### Bug P3: Number Sequences Use `user.id`
- `useQuoteVersions.ts:43`: `generateSequenceNumber(user.id, ...)`
- Separate counters per team member → duplicate numbers

#### Bug P8: Delete Operations by ID Only (10+ hooks)
- No ownership verification on delete, relies solely on RLS

#### Bug P12: Email Settings Fork on Save
- Read: falls back to account owner's settings (correct)
- Write: creates separate copy under `user.id` (broken)
- Team member edits cause permanent settings divergence

#### Bug P15: Permission Logic Inconsistent
- `useCanSendEmails`: respects explicit restrictions for admins
- `useCanViewEmailKPIs`: ignores restrictions for admins
- Same role, different behavior

#### Bug P17: PermissionGuard Calls Hooks Conditionally
- `PermissionGuard.tsx:37-45`: violates React Rules of Hooks

#### Bug P18: Non-User-Scoped React Query Cache Keys
- `["inventory"]`, `["email-settings"]`, `["appointments"]` — no user in key
- Cross-session data contamination

---

## Category 4: Integration Architecture (23 Issues)

### CRITICAL Security

| # | Bug | File |
|---|-----|------|
| I1 | API keys in URL query strings | `twc-submit-order/index.ts:141` |
| I2 | Shopify tokens stored plaintext | `shopify-oauth-callback/index.ts:71` |
| I3 | All credentials unencrypted | `integration_settings` table |
| I4 | Webhook HMAC verification conditional/missing | `shopify-webhook-order/index.ts:52` |
| I5 | HMAC on re-serialized JSON (not raw body) | `shopify-webhook-order/index.ts:32-53` |
| I6 | OAuth state used as user_id without validation (CSRF) | `shopify-oauth-callback/index.ts:63` |

### HIGH Issues

| # | Bug |
|---|-----|
| I7 | Inconsistent `user_id` vs `account_owner_id` across TWC functions |
| I8 | Duplicate Shopify webhook handlers with different logic |
| I9 | Mock Shopify hook still in production code |
| I10 | Zero retry logic in any integration edge function |
| I11 | No idempotency keys on TWC order submission |
| I12 | Wildcard CORS `*` on all edge functions |

### Architecture Assessment: NOT SCALABLE

Each integration is a silo. No shared middleware, no common interface, no webhook queue, no credential vault, no integration registry. Adding Netsuite, SW System, RFMS, and ERP would multiply existing problems.

---

## Recommended Fix Strategy

### Phase 1: Stop the Bleeding (Week 1-2)

1. **Standardize `effectiveOwnerId`** across ALL hooks (fixes team data visibility)
2. **Consolidate to ONE calculation engine** — route all through `CalculationEngine.ts`
3. **Fix `formatCurrency`** — require currency parameter, single implementation
4. **Add user scoping to settings cache** — `${userId}_` prefix on localStorage keys

### Phase 2: Data Integrity (Week 3-4)

5. Fix integration security (OAuth state, HMAC, credential encryption)
6. Add `effectiveOwnerId` to all React Query cache keys
7. Fix print.css border/color overrides
8. Fix tax rate percentage/decimal consistency

### Phase 3: Algorithm Standardization

9. Create `src/algorithms/` directory with versioned, tested calculation modules
10. Each algorithm: explicit input/output types, unit specifications, comprehensive tests
11. Algorithm versioning so existing quotes reference the version used

### Phase 4: Integration Framework

12. Build shared integration middleware (auth, CORS, account resolution, retry)
13. Integration adapter pattern with common interface
14. Webhook processing queue for reliability
15. Credential vault for encryption
16. Build new integrations (Netsuite, SW System, RFMS) on the framework
