
## Fix Treatment Photo Persistence and Add "Main Image" Selection

### Problem
1. **Photos disappear on save** -- The code saves photos to `windows_summary.photos`, but that column doesn't exist on the `windows_summary` table. Photos are only stored on the `treatments.photos` column, but the current code never writes there. Loading also reads from `windows_summary` (which returns nothing), so photos vanish.
2. **No way to mark a photo as the "main" treatment image** for use in quotes.

### Plan

#### 1. Database Migration
- Add `primary_photo_index` (integer, default null) column to the `treatments` table to track which photo (0, 1, or 2) is the main image for quotes.
- Add `photos` and `primary_photo_url` columns to `windows_summary` so the photo data is visible in project overviews and quotes.

#### 2. Fix Photo Save/Load in `TreatmentPhotoUploader.tsx`
- Add a **"Save Photos"** button at the bottom of the popover that persists photos to the `treatments.photos` column (and syncs to `windows_summary`).
- Track local (unsaved) state vs. saved state internally so the user has explicit control.

#### 3. Add "Set as Main" UI in `TreatmentPhotoUploader.tsx`
- Each photo thumbnail gets a small star/check overlay button.
- Clicking it marks that photo index as the primary. The selected photo gets a visible border/highlight.
- The primary photo index is saved alongside photos when the user clicks "Save Photos".

#### 4. Update `WindowManagementDialog.tsx`
- Change `onPhotosChange` callback to save to `treatments.photos` instead of `windows_summary.photos`.
- Load photos from `currentTreatment?.photos` (the treatments table) instead of `windowSummary?.photos`.
- Sync `primary_photo_url` to `windows_summary` so quotes can reference it.

---

### Technical Details

**Migration SQL:**
```sql
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS primary_photo_index integer DEFAULT NULL;
ALTER TABLE windows_summary ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';
ALTER TABLE windows_summary ADD COLUMN IF NOT EXISTS primary_photo_url text DEFAULT NULL;
```

**TreatmentPhotoUploader changes:**
- New props: `primaryIndex`, `onPrimaryIndexChange`
- Internal `localPhotos` and `localPrimaryIndex` state, synced on open
- Star icon overlay on each thumbnail; highlighted state for the selected primary
- "Save Photos" button that calls `onSave(localPhotos, localPrimaryIndex)`

**WindowManagementDialog changes:**
- Load photos from `currentTreatment?.photos` (treatment row)
- On save: write to `treatments` table (`photos`, `primary_photo_index`), then sync `photos` and `primary_photo_url` to `windows_summary`
- Pass primary index state down to uploader

**Quote integration:**
- `buildClientBreakdown.ts` already reads `treatment_image_url` from summary -- we'll populate `primary_photo_url` in `windows_summary` so quotes can use it via the existing image pipeline.
