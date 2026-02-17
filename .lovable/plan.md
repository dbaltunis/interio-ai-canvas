

## Fix: Chunked Upload for Large DATEKS Files

### Problem
The two large DATEKS CSV files (~1,799 and ~2,359 rows) exceed the Edge Function request size limit, causing "Failed to send request" errors. The small CNV file (14 rows) imported fine.

### Solution
Update `LaelLibraryImport.tsx` to split large CSVs into chunks of 200 rows each, upload them to Supabase Storage via the edge function's existing `action: "upload"` mode, then trigger the import from storage.

### What Changes

**File: `src/components/admin/LaelLibraryImport.tsx`**

Update the `runImport` function:
1. Fetch the CSV locally from `/import-data/`
2. Split the CSV into chunks of 200 rows (keeping the header row on the first chunk only)
3. Upload chunk 1 with `action: "upload"` (creates file in storage)
4. Upload chunks 2-N with `action: "upload", append: true` (appends to file)
5. After all chunks uploaded, call the edge function with just `{ format }` (no `csv_data`) so it reads from storage
6. Show upload progress ("Uploading chunk 3 of 12...")

**Database migration: Create `imports` storage bucket**

The edge function uses `supabase.storage.from("imports")` but the bucket may not exist yet. Create it with a simple migration.

### After This Fix
1. Navigate to `/admin/import-laela`
2. Click "Re-run Import"
3. All 3 files will process successfully:
   - CNV Trimmings: sent directly (small file)
   - DATEKS Pricelist 2023: uploaded in ~9 chunks, then imported
   - DATEKS Expo 2024: uploaded in ~12 chunks, then imported
