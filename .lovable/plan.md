
# Critical Issues Inventory - Organized Fix Plan

## Issue Summary

Based on your client feedback and screenshots, I've identified **6 distinct issues** across different parts of the app. Let me organize them by priority and complexity.

---

## ISSUE 1: Fabric Pricing Calculation Bug (CRITICAL - Client Sadath)

**Problem**: The math is wrong. Client entered:
- Fabric Cost: ₹440/m, Selling: ₹924/m (110% markup)
- Fabric Required: 24.08m
- Expected: Cost = ₹10,560, Selling = ₹22,176
- Actual (from screenshot): Cost = ₹24,009.92, Sell = ₹49,012.83 (WRONG!)

**Root Cause Found**: The Quote Summary shows `₹31,149.89` for fabric when it should be `₹22,249.92` (24.08m × ₹924). The discrepancy suggests an ADDITIONAL markup is being applied on top of the already-marked-up selling price.

**The Fix Needed**:
- When fabric has BOTH `cost_price` AND `selling_price` defined, the system should:
  1. Use `cost_price` (₹440) as the base for COST calculations
  2. Use `selling_price` (₹924) directly for QUOTE/SELLING calculations - NO additional markup
  3. The implied markup (110%) is already "baked in" to the library price

**Files to Modify**:
- `src/utils/pricing/calculateTreatmentPricing.ts` - Line 156 incorrectly uses cost_price for quote calculations
- `src/components/measurements/DynamicWindowWorksheet.tsx` - Markup resolver is applying additional markup

---

## ISSUE 2: Signup Rate Limit Error (Security Error)

**Problem**: Screenshot shows "For security purposes, you can only request this after 18 seconds" when creating account.

**Root Cause**: This is Supabase's built-in rate limiting on the `signUp` endpoint. It triggers when:
- User clicks "Create Account" multiple times
- Previous signup attempt is still processing
- Network latency causes duplicate submissions

**The Fix Needed**:
- Add debounce/throttle to signup button
- Disable button immediately on click
- Show clearer loading state
- Add friendly error message explaining the 60-second cooldown

**Files to Modify**:
- `src/components/auth/AuthPage.tsx` - Add rate limit handling and user-friendly messaging

---

## ISSUE 3: Vertical Blinds Pricing Inconsistency (Australasia Team)

**Problem**: "Qube (Budget) fabric works, but not others" - some vertical blind fabrics price correctly, others don't.

**Root Cause**: The subcategory confusion between "Vertical Slats" and "Vertical Fabrics" means some materials aren't being recognized correctly by the pricing engine.

**The Fix Needed**:
- Normalize subcategory handling for vertical blinds
- Ensure both "Vertical Slats" and "Vertical Fabrics" map to the same pricing logic
- Fix the disappearing material issue when subcategory is changed

**Files to Investigate**:
- Inventory subcategory mapping logic
- Vertical blinds template pricing lookup

---

## ISSUE 4: Material Vendor Not Updating

**Problem**: Setting Vendor to "Norman" and clicking Update leaves Supplier showing "-"

**Root Cause**: The UI saves `vendor_id` (relationship) but displays `supplier` (legacy text field). These are not synced.

**The Fix Needed**:
- When `vendor_id` is set, also update the legacy `supplier` field with vendor name
- OR update display logic to prioritize `vendor.name` over `supplier`

**Files to Modify**:
- Inventory update mutation to sync both fields

---

## ISSUE 5: Product Rules Dropdown Shows ALL Options

**Problem**: When setting up a rule to hide roller blind control length when motor is selected, ALL product control lengths are listed instead of just the ones for that specific template.

**Root Cause**: The rules editor fetches ALL treatment options from the database without filtering by template.

**The Fix Needed**:
- Filter the options dropdown in rules editor to only show options that are enabled/linked to the current template
- Use `template_option_settings` to filter the list

**Files to Modify**:
- `src/components/settings/tabs/products/TemplateOptionsManager.tsx` - Rules dropdown needs template-specific filtering

---

## ISSUE 6: Shared Work Order Doesn't Work When Logged In

**Problem**: "Link does not work when opened in a window where I have an active InterioApp session, but does work in incognito window"

**Root Cause**: When logged in, the RLS policies check the authenticated user's permissions instead of allowing anonymous access via the share token. The public route is conflicting with authenticated session.

**The Fix Needed**:
- PublicWorkOrder page should explicitly query as anonymous/bypass auth context
- OR use a service role edge function to fetch shared data
- Clear auth context when accessing public share URLs

**Files to Modify**:
- `src/pages/PublicWorkOrder.tsx` - Handle auth session conflict
- `src/hooks/useWorkOrderSharing.ts` - Fetch functions need to work with or without auth

---

## Recommended Priority Order

| Priority | Issue | Severity | Client Impact |
|----------|-------|----------|---------------|
| 1 | Fabric Pricing Math | CRITICAL | Quotes are wrong by 40%+ |
| 2 | Shared Work Order Auth | HIGH | Feature unusable for logged-in users |
| 3 | Signup Rate Limit | MEDIUM | Poor UX for new signups |
| 4 | Vertical Blinds Pricing | MEDIUM | Some products won't price |
| 5 | Product Rules Dropdown | LOW | Setup inconvenience |
| 6 | Vendor Display | LOW | Cosmetic data sync issue |

---

## Technical Notes

### Issue 1 Math Trace (for verification)

Client's fabric library:
- Cost Price: ₹440/meter
- Selling Price: ₹924/meter
- Implied Markup: (924-440)/440 = **110%**

Expected for 24.08m:
- Cost: 24.08 × 440 = **₹10,595.20**
- Selling: 24.08 × 924 = **₹22,249.92**

Screenshot shows:
- Cost: ₹24,009.92 (includes manufacturing ₹2,288)
- Selling: ₹49,012.83

The fabric portion alone shows ₹31,149.89 selling - this is approximately 24.08 × 924 × 1.40 = ₹31,149.89

**Confirmed**: An extra 40% material markup is being applied on top of the already-marked-up selling price!

---

## Next Steps

I recommend we tackle **Issue 1 (Fabric Pricing)** first as it's causing incorrect quotes for clients. Once approved, I will:

1. Fix the pricing logic to use `selling_price` directly when it exists (no additional markup)
2. Ensure `cost_price` is used for cost calculations only
3. Add validation to prevent double-markup scenarios
4. Test with the exact values from Sadath's example to verify correct output

Should I proceed with Issue 1 first?
