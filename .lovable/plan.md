

## Modern Booking Page with Company Branding

### Problem Summary
The booking confirmation page currently:
1. Does not display the company logo
2. Has a basic design that doesn't follow modern UX standards
3. Uses a simple gradient background without visual hierarchy
4. Missing important trust signals and branding elements

---

### Solution Overview

Create a modern, Calendly/Cal.com inspired booking experience with:
1. **Company branding** - Logo, company name, and professional styling
2. **Modern visual hierarchy** - Split-panel layout on desktop, stacked on mobile
3. **Trust signals** - Company info, security badges, professional design
4. **Smooth animations** - Subtle transitions and micro-interactions
5. **Better UX patterns** - Step indicators, visual feedback, clear CTAs

---

### Technical Implementation

#### Step 1: Update the RPC Function to Include Business Settings

Create a new migration to update `get_public_scheduler` to also return company branding:

```sql
CREATE OR REPLACE FUNCTION public.get_public_scheduler(slug_param text)
RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  description text,
  duration integer,
  buffer_time integer,
  max_advance_booking integer,
  min_advance_notice integer,
  image_url text,
  availability jsonb,
  locations jsonb,
  -- New: Business branding fields
  company_name text,
  company_logo_url text,
  company_phone text,
  company_address text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id, s.slug, s.name, s.description, s.duration, s.buffer_time,
    s.max_advance_booking, s.min_advance_notice, s.image_url, 
    s.availability, s.locations,
    bs.company_name,
    bs.company_logo_url,
    bs.business_phone AS company_phone,
    bs.address AS company_address
  FROM public.appointment_schedulers s
  LEFT JOIN public.business_settings bs ON bs.user_id = s.user_id
  WHERE s.slug = slug_param AND s.active = true
  LIMIT 1;
END;
$$;
```

#### Step 2: Update PublicScheduler Interface

**File**: `src/hooks/useAppointmentSchedulers.ts`

Add new fields to the interface:

```typescript
export interface PublicScheduler {
  // Existing fields...
  id: string;
  slug: string;
  name: string;
  description?: string;
  duration: number;
  buffer_time: number;
  max_advance_booking: number;
  min_advance_notice: number;
  image_url?: string;
  availability: any;
  locations: any;
  // NEW: Business branding
  company_name?: string;
  company_logo_url?: string;
  company_phone?: string;
  company_address?: string;
}
```

#### Step 3: Redesign BookingConfirmation with Modern UI

**File**: `src/components/calendar/BookingConfirmation.tsx`

Transform into a modern split-panel design:

```text
Layout Structure:
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────┐  ┌───────────────────────────────┐ │
│  │                     │  │                               │ │
│  │   BRANDING PANEL    │  │      BOOKING PANEL           │ │
│  │   • Company Logo    │  │      • Date Selection         │ │
│  │   • Appointment     │  │      • Time Slots             │ │
│  │     Details         │  │      • Contact Form           │ │
│  │   • Duration        │  │      • Submit Button          │ │
│  │   • Trust Signals   │  │                               │ │
│  │                     │  │                               │ │
│  └─────────────────────┘  └───────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
     Fixed/Sticky               Scrollable
```

Key design elements:
- **Left panel (40%)**: Gradient background, company logo, appointment info, stays fixed
- **Right panel (60%)**: White background, calendar/form, scrollable
- **Mobile**: Stack vertically with collapsible header

#### Step 4: Create Modern Component Structure

New/Updated components:

| Component | Purpose |
|-----------|---------|
| `BookingBrandingPanel.tsx` | Left side with logo, company info, trust signals |
| `BookingHeader.tsx` (update) | Simplified header with just scheduler image |
| `DateTimeSelector.tsx` (update) | Inline calendar with improved time grid |
| `ClientInfoForm.tsx` (update) | Modern form with floating labels |
| `BookingSuccessScreen.tsx` (update) | Confetti animation, add to calendar button |

#### Step 5: Visual Design Specifications

**Color Scheme**:
```css
/* Branding Panel */
background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);

/* Or use company's brand color if available */
/* Fallback to professional blue/purple gradient */
```

**Typography**:
- Headings: Inter/System font, bold
- Body: Inter/System font, regular
- Time slots: Monospace for alignment

**Micro-interactions**:
- Time slot hover: Scale 1.02, shadow lift
- Date selection: Smooth background color transition
- Form inputs: Focus ring animation
- Submit button: Loading state with subtle pulse

**Trust signals to add**:
- "🔒 Secure booking" indicator
- Company contact info
- "Powered by InterioApp" subtle footer

---

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/xxx_update_public_scheduler.sql` | Create | Add business settings to RPC |
| `src/hooks/useAppointmentSchedulers.ts` | Update | Add new interface fields |
| `src/components/booking/BookingBrandingPanel.tsx` | Create | New left panel component |
| `src/components/calendar/BookingConfirmation.tsx` | Update | New split-panel layout |
| `src/components/booking/DateTimeSelector.tsx` | Update | Inline calendar, improved UX |
| `src/components/booking/ClientInfoForm.tsx` | Update | Modern styling |
| `src/components/booking/BookingSuccessScreen.tsx` | Update | Confetti, calendar add |

---

### Visual Mockup (Mobile)

```text
┌──────────────────────────┐
│ ┌──────────────────────┐ │
│ │     Company Logo     │ │
│ │    Company Name      │ │
│ │   ─────────────────  │ │
│ │   📅 Consultation    │ │
│ │   ⏱  60 minutes      │ │
│ │   📍 Video Call      │ │
│ └──────────────────────┘ │
│                          │
│   Select Date & Time     │
│ ┌──────────────────────┐ │
│ │    February 2026     │ │
│ │  Su Mo Tu We Th Fr Sa│ │
│ │       1  2  3  4  5  │ │
│ │  6  7  8  9 10 11 12 │ │
│ └──────────────────────┘ │
│                          │
│   Available Times        │
│ ┌──────┐ ┌──────┐ ┌────┐ │
│ │ 9:00 │ │10:00 │ │11:0│ │
│ └──────┘ └──────┘ └────┘ │
│                          │
│   Your Details           │
│ ┌──────────────────────┐ │
│ │ Full Name            │ │
│ │ Email                │ │
│ │ Phone                │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │   Confirm Booking    │ │
│ └──────────────────────┘ │
│                          │
│  🔒 Secure • InterioApp  │
└──────────────────────────┘
```

---

### Expected Outcome

After implementation:
- ✅ Company logo prominently displayed
- ✅ Professional, modern design matching Calendly/Cal.com standards
- ✅ Mobile-first responsive layout
- ✅ Trust signals for user confidence
- ✅ Smooth animations and micro-interactions
- ✅ Clear visual hierarchy and booking flow
- ✅ Better conversion rates through improved UX

