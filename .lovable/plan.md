
# Fix Storage Bucket Security for Client Files

## Problem Summary

**CRITICAL SECURITY ISSUE**: The `client-files` bucket (17 files) and other sensitive buckets are currently set to `public: true`, meaning **anyone with the file URL can access client files without authentication**.

### Current State

| Bucket | Public? | Files | Risk Level |
|--------|---------|-------|------------|
| `client-files` | ✅ TRUE | 17 | 🔴 CRITICAL - Client documents exposed |
| `project-documents` | ✅ TRUE | 2 | 🔴 HIGH - Project files exposed |
| `project-images` | ✅ TRUE | 98 | 🟠 MEDIUM - Project photos exposed |
| `email-attachments` | ❌ FALSE | - | ✅ Secure |

### What "Public" Means
- Anyone who discovers or guesses a file URL can view/download the file
- URLs can be found via browser history, email forwarding, or network logs
- No authentication required to access the content

---

## Solution Overview

1. **Make buckets private** - Set `public: false` on sensitive buckets
2. **Use signed URLs** - Generate time-limited, authenticated URLs for file access
3. **Keep appropriate RLS policies** - Files remain owner-scoped

---

## Technical Implementation

### Part 1: Database Migration

Make the sensitive buckets private:

```sql
-- Make client-files bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'client-files';

-- Make project-documents bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'project-documents';

-- Update RLS policy to use authenticated access instead of public
DROP POLICY IF EXISTS "Public Access for client-files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read project public buckets" ON storage.objects;

-- New policy: Authenticated users can read their own client files
CREATE POLICY "Users can read their client files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-files' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- New policy: Team members can read owner's client files
CREATE POLICY "Team members can read owner client files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-files'
  AND (public.get_effective_account_owner(auth.uid()))::text = (storage.foldername(name))[1]
);

-- New policy: Authenticated users can read project documents
CREATE POLICY "Users can read project documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-documents'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
```

### Part 2: Code Changes

**File: `src/hooks/useClientFiles.ts`**

Replace `getPublicUrl` with `createSignedUrl` for secure, time-limited access:

```typescript
export const useGetClientFileUrl = () => {
  return useMutation({
    mutationFn: async ({ bucketName, filePath }: { bucketName: string; filePath: string }) => {
      // Use signed URL for private buckets (expires in 1 hour)
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Failed to create signed URL:', error);
        throw error;
      }

      return data.signedUrl;
    },
  });
};
```

**File: `src/hooks/useFileStorage.ts`**

Same change for the general file storage hook:

```typescript
export const useGetFileUrl = () => {
  return useMutation({
    mutationFn: async ({ bucketName, filePath }: { bucketName: string; filePath: string }) => {
      console.log('Creating signed URL for:', { bucketName, filePath });
      
      // Use signed URL for secure access (1 hour expiry)
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600);

      if (error) {
        console.error('Failed to create signed URL:', error);
        throw error;
      }

      console.log('Generated signed URL successfully');
      return data.signedUrl;
    },
  });
};
```

---

## Files to Modify

| File | Change |
|------|--------|
| Database Migration | Make buckets private, update RLS policies |
| `src/hooks/useClientFiles.ts` | Replace `getPublicUrl` with `createSignedUrl` |
| `src/hooks/useFileStorage.ts` | Replace `getPublicUrl` with `createSignedUrl` |

---

## Security Benefits

| Before | After |
|--------|-------|
| Anyone with URL can access files | Only authenticated users with permissions |
| URLs work forever | URLs expire after 1 hour |
| No audit trail | Access controlled by RLS |
| Data exposure risk | Data properly isolated by user |

---

## What Stays Public (Intentionally)

These buckets should remain public because their content is meant to be shared:
- `quote-images` - Images shown on client-facing quotes
- `product-images` - Product catalog images
- `bug-images` - Bug report screenshots (internal tool)
- `documentation-screenshots` - Help documentation

---

## Testing Checklist

1. **Upload Test**
   - Upload a new client file
   - Verify upload succeeds

2. **View Test**
   - Click "View" on an existing file
   - Verify file opens in viewer dialog
   - Verify signed URL works

3. **Security Test**
   - Copy the signed URL
   - Wait for 1+ hour
   - Try to access the URL → Should fail (expired)

4. **Multi-tenant Test**
   - Log in as different user
   - Verify you cannot access another user's client files
