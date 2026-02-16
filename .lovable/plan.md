

## Treatment Photos Integration: Summary Card, Quotes, and Work Orders

### Overview
This plan connects the treatment photo system (camera button + Supabase storage) to three surfaces:
1. A camera button on each **WindowSummaryCard** (room view) that shares state with the one inside the measurement dialog
2. The **"main" photo replaces the treatment/template image in quotes**
3. **All 3 photos appear in work orders** (portrait and landscape) in a dedicated photos column, clickable to view full-size

---

### 1. Add Camera Button to WindowSummaryCard

**File:** `src/components/job-creation/WindowSummaryCard.tsx`

- Import `TreatmentPhotoUploader` component
- Derive `treatmentPhotos` and `primaryPhotoIndex` from the `summary` data (which now has `photos` and `primary_photo_url` columns on `windows_summary`)
- Look up the treatment ID for the surface using existing treatment query data or a small query
- Place the camera icon button between the Edit and Delete buttons in the card header
- Wire `onSavePhotos` with the same dual-write pattern: update `treatments` table, then sync to `windows_summary`
- When the main photo is set, it should also visually replace the `TreatmentPreviewEngine` thumbnail on the card (show the user's photo instead of the generic treatment preview)

---

### 2. Use Main Photo in Quotes

**File:** `src/utils/quotes/buildClientBreakdown.ts`

- In the image resolution logic (around line 356-358), add `summary.primary_photo_url` as the **highest priority** image source for template/treatment rows
- Change: `itemImageUrl = summary.primary_photo_url || summary.template_details?.image_url || summary.treatment_image_url || null`
- This means if the user sets a main photo, it overrides the catalog/template image in the quote

---

### 3. Show All Treatment Photos in Work Orders

Both portrait (`RoomSection.tsx`) and landscape (`WorkshopInformationLandscape.tsx`) work order templates need a photos column.

**Data flow -- File:** `src/hooks/useWorkshopData.ts`
- Include `photos` from `windows_summary` in the workshop item data so work order templates can access it
- Add `treatmentPhotos: summary?.photos || []` to the `WorkshopRoomItem`

**Portrait Work Order -- File:** `src/components/workroom/sections/RoomSection.tsx`
- Replace or augment the existing `WorkItemPhotoGallery` (which uses localStorage) with the Supabase-stored treatment photos
- Display all treatment photos (up to 3) in a thumbnail grid
- Each photo is clickable to open a full-size lightbox/dialog view
- The existing `WorkItemPhotoGallery` local-storage gallery can remain as an additional "work-in-progress" photo area, or be replaced entirely by the Supabase photos

**Landscape Work Order -- File:** `src/components/workroom/templates/WorkshopInformationLandscape.tsx`
- Add a "Photos" column to the table (adjust column widths to accommodate)
- Render up to 3 small thumbnails in the new column
- Each thumbnail is clickable to open full-size view using a simple Dialog overlay

**Lightbox component -- New file:** `src/components/workroom/components/PhotoLightbox.tsx`
- A simple Dialog-based full-screen image viewer
- Shows the clicked photo at full resolution
- Optional left/right navigation if multiple photos exist

---

### Technical Details

**WindowSummaryCard camera integration:**
```text
Header buttons: [Edit] [Camera] [Delete]

Camera reads from:
  summary.photos (text[]) and summary.primary_photo_url (text)

Camera saves to:
  treatments.photos + treatments.primary_photo_index
  windows_summary.photos + windows_summary.primary_photo_url
```

**Quote image priority change in buildClientBreakdown.ts:**
```text
For template/treatment category rows:
  1. summary.primary_photo_url  (user's main treatment photo - NEW)
  2. summary.template_details?.image_url  (catalog template image)
  3. summary.treatment_image_url  (legacy fallback)
```

**Work order data flow:**
```text
windows_summary.photos[] --> useWorkshopData --> item.treatmentPhotos[]
  --> RoomSection (portrait): thumbnail grid + click-to-view
  --> WorkshopInformationLandscape: photos column + click-to-view
```

**Landscape table column adjustment:**
```text
Current:  Item(10%) | Fabric(32%) | Measurements(22%) | Sewing(36%)
Updated:  Item(8%)  | Photos(12%) | Fabric(28%) | Measurements(20%) | Sewing(32%)
```

**Portrait layout (RoomSection):**
- Treatment photos from Supabase shown in the existing visual/left column area
- If treatment photos exist, they take priority over the fabric image placeholder
- Thumbnails arranged in a row of up to 3, clickable for lightbox

**Files to create:**
- `src/components/workroom/components/PhotoLightbox.tsx`

**Files to modify:**
- `src/components/job-creation/WindowSummaryCard.tsx` -- add camera button + show main photo
- `src/utils/quotes/buildClientBreakdown.ts` -- prioritize primary_photo_url
- `src/hooks/useWorkshopData.ts` -- pass photos array to work order items
- `src/components/workroom/sections/RoomSection.tsx` -- display treatment photos
- `src/components/workroom/templates/WorkshopInformationLandscape.tsx` -- add photos column

**No database changes needed** -- the `photos` and `primary_photo_url` columns on `windows_summary` and `photos`/`primary_photo_index` on `treatments` were already added in the previous migration.

