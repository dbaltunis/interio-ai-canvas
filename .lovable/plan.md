
# Enhanced Tutorial: Fix Logo, Improve Calendar Scene & Add Library Scene

## Overview

This plan addresses three improvements to the welcome video tutorial:

1. **Fix the logo** in the Calendar scene's public booking view - currently using InterioApp logo instead of showing a placeholder company logo
2. **Improve the Calendar/Booking demonstration** - show clearer workflow for creating multiple booking links (Design Consultation, Installation) and sharing them with clients
3. **Add new "Library" scene** - comprehensive demonstration of the fabric/product library, vendors, QR code generation, and mobile scanning workflow

---

## Current Issues Identified

| Issue | Location | Problem |
|-------|----------|---------|
| Bad logo | Scene7Calendar, line 1040 | Using InterioApp logo in the "client's view" booking panel - should show a generic business logo to represent the user's custom branding |
| Booking clarity | Scene7Calendar | Shows only one template type, doesn't clearly demonstrate multiple booking link types or the sharing workflow |
| Missing Library scene | N/A | No demonstration of the Library feature which is core to the app |

---

## Implementation

### Phase 1: Fix the Logo in Booking Panel

**Current (line 1040):**
```tsx
<img src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" alt="Logo" className="h-10 w-auto mb-4" />
```

**Solution:**
Replace with a stylized placeholder that represents "your brand" - using a simple icon-based logo that clearly shows this is the user's business, not InterioApp:

```tsx
<div className="flex items-center gap-2 mb-4">
  <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
    <Home className="h-5 w-5 text-white" />
  </div>
  <div>
    <div className="text-sm font-semibold text-white">Your Business</div>
    <div className="text-[9px] text-slate-300">Window Treatments</div>
  </div>
</div>
```

This clearly signals "this is your company's booking page" rather than showing InterioApp branding in the client-facing view.

---

### Phase 2: Enhance Calendar Booking Demonstration

**Improvements to Scene7Calendar:**

1. **Show multiple booking template types** in the template dropdown (with clearer visual distinction):
   - Design Consultation (30 min) - highlighted
   - Installation Appointment (60 min)
   - Measurement Session (45 min)

2. **Add a "Share Link" phase** after template creation showing:
   - Copy link button with animated clipboard feedback
   - Shareable URL: `yourstore.interioapp.com/book/design-consultation`
   - "Share with clients via email or SMS" message

3. **Better client booking flow** showing:
   - The booking page title changes based on template selected
   - Cleaner time slot grid matching the screenshot

**Updated phase breakdown:**
- 0.00-0.20: Calendar week view with Google sync
- 0.20-0.40: Template list showing multiple types → create new
- 0.40-0.55: Template form + Share link copied
- 0.55-0.80: Public booking page (improved layout)
- 0.80-1.00: Success confirmation

---

### Phase 3: New "Library" Scene (Scene8Library)

**Duration: 14 seconds**

A comprehensive demonstration of the Library/Inventory management system showing:

**Sub-phases:**

1. **Phase 0.00-0.20: Library Overview**
   - Library page with tabs: Collections, Fabrics, Materials, Hardware, Wallcoverings, Vendors
   - Shows collection grid with brand logos (TWC, ADARA, etc.)
   - Item count badge: "381 items"
   - Search bar + filters

2. **Phase 0.20-0.40: Add New Product**
   - Click "+ Add" button
   - Category dropdown opens: Fabrics, Blind Materials, Hardware, Headings, Wallcoverings, Services
   - Select "Fabrics"
   - Form fields appear: Name, SKU, Price, Vendor selector
   - Shows "Velvet Drapery" being typed
   - Vendor dropdown: Select "TWC"

3. **Phase 0.40-0.60: QR Code Generation**
   - Product card created with fabric image
   - QR Code icon pops up
   - QR Code dialog opens showing:
     - QR code graphic (stylized squares pattern)
     - "Velvet Drapery - VD-001"
     - Print / Download buttons
   - Text: "Every product gets a unique QR code"

4. **Phase 0.60-0.85: Mobile Scanning Demo**
   - Transition to mobile phone mockup
   - Camera viewfinder scanning QR code
   - Product details appear instantly on phone screen:
     - Fabric image
     - Name: "Velvet Drapery"
     - SKU: VD-001
     - Price: £45/m
     - Stock: 25m available
   - Text: "Find any fabric instantly with your phone or tablet"

5. **Phase 0.85-1.00: Success State**
   - Collection view with organized products
   - Badge: "160 collections • 381 products"
   - Checkmarks: "Import from CSV", "Sync with suppliers", "Mobile scanning"

**Visual elements to match screenshots:**
- Tab structure: Collections | Fabrics | Materials | Hardware | Wallcoverings | Vendors | Admin
- Left sidebar: Brands tree (TWC expanded showing AESOP, ALLUSION, etc.)
- Right content: Collection cards grid with item counts
- Add dialog: Category dropdown with full list

---

### Phase 4: Update Chapter/Step Definitions

**Modify: `src/components/showcase/ShowcaseLightbulb.tsx`**

Add new "library" chapter and Scene8Library step:

New chapters array:
```
welcome → intro → dashboard → theme → jobs → project → calendar → library → closing
```

New steps (9 total):
```
1. Scene0Welcome (4s, chapter: welcome)
2. Scene1IntroLogo (5s, chapter: intro)
3. Scene2Dashboard (8s, chapter: dashboard)
4. Scene3ThemeToggle (6s, chapter: theme)
5. Scene4JobsNotes (8s, chapter: jobs)
6. Scene5ProjectDeepDive (15s, chapter: project)
7. Scene7Calendar (12s, chapter: calendar) - IMPROVED
8. Scene8Library (14s, chapter: library) - NEW
9. Scene6Closing (5s, chapter: closing)
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/help/tutorial-steps/WelcomeVideoSteps.tsx` | Fix logo, improve Scene7Calendar, add Scene8Library (~250 new lines) |
| `src/components/showcase/ShowcaseLightbulb.tsx` | Add "library" chapter, add Scene8Library step, import new component |

---

## Scene8Library Implementation Details

```text
Visual structure:
1. Main container matching dashboard style
2. Header: Library icon + "Library" title + "381 items" badge + Search + "+ Add" button
3. Tabs row: Collections | Fabrics | Materials | Hardware | Wallcoverings | Vendors
4. Content area that transforms between:
   - Collections grid (brand cards)
   - Add product dialog (form)
   - QR code popup
   - Mobile phone mockup scanning
   - Final success view
```

**Animation sequence:**
```text
Phase     Content
0.00-0.05 Library header slides in, tabs animate
0.05-0.15 Collections grid populates (staggered)
0.15-0.20 Highlight "+ Add" button with focus ring
0.20-0.25 Click "+ Add", dialog slides up
0.25-0.30 Category dropdown expands, "Fabrics" highlighted
0.30-0.35 Form fields type: "Velvet Drapery"
0.35-0.40 Create button clicks, dialog closes
0.40-0.45 Product card appears in list
0.45-0.50 QR Code icon glows, clicks
0.50-0.60 QR dialog opens with animated QR code
0.60-0.65 Transition to mobile phone frame
0.65-0.75 Camera scanning animation, QR detected
0.75-0.85 Product details slide up on phone
0.85-0.92 Phone fades, summary badges appear
0.92-1.00 Final state with checkmarks
```

---

## Key Visual Elements from Screenshots

**Library Main View (Screenshot 2):**
- Header: Package icon + "Library" + help button + "381 items" badge
- Filters + Scan + "+ Add" buttons on right
- Tab bar with category icons
- Left sidebar: "Brands" with search, "All Collections" tree
- Main content: Collection cards with name, item count, brand badge

**Add Product Dialog (Screenshot 3):**
- Title: "Add New Inventory Item"
- Subtitle: "Add a new product or service to your inventory"
- Category dropdown showing: Fabrics, Blind Materials, Hardware, Headings, Wallcoverings, Services
- Cancel / Create buttons

---

## Total Changes Summary

| Component | Lines | Type |
|-----------|-------|------|
| Scene7Calendar improvements | ~40 lines changed | Modify |
| Logo fix in booking panel | ~15 lines | Modify |
| Scene8Library (new) | ~280 lines | Create |
| ShowcaseLightbulb updates | ~20 lines | Modify |
| **Total** | ~355 lines |  |

All new code follows the exact animation patterns, timing utilities (inPhase, phaseProgress, typingProgress), and visual styling already established in WelcomeVideoSteps.tsx.

---

## Testing After Implementation

- [ ] Logo no longer appears as InterioApp in booking panel
- [ ] Calendar scene shows multiple booking template types
- [ ] Share link animation appears after template creation
- [ ] Library scene demonstrates product creation flow
- [ ] QR code generation is clearly shown
- [ ] Mobile scanning demo is smooth and clear
- [ ] All 9 scenes play in correct order
- [ ] Tutorial auto-opens for new users
- [ ] Skip/navigation still works correctly
