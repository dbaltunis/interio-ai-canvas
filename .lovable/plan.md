
# Update "What's New" Popup and Documentation

## Overview
The "What's New" popup is stuck at v2.3.1 (December 2025) while the app is now at v2.3.16. This plan updates both the version tracking system and adds missing documentation for new features.

## Part 1: Fix Version Badge

### Issue
The `VersionBadge.tsx` has a hardcoded version string "v2.3.1" instead of using the centralized version constant.

### Solution
Update `VersionBadge.tsx` to import and use `APP_VERSION` from `src/constants/version.ts`:

| File | Change |
|------|--------|
| `src/components/version/VersionBadge.tsx` | Import `APP_VERSION` and use `v${APP_VERSION}` instead of hardcoded string |

---

## Part 2: Update Database Version Record

### Issue
The `app_versions` table has outdated content for v2.3.1 and needs a new v2.3.16 record.

### Solution
Create a database migration to insert the new version with comprehensive release notes:

| File | Purpose |
|------|---------|
| `supabase/migrations/[timestamp]_add_version_2_3_16.sql` | Insert new version record |

### New Version Content (v2.3.16)

**Highlights:**
- Secure Work Order Sharing with public links
- Item-level selection for share links
- Improved user authentication experience
- Enhanced security with RLS policy fixes

**New Features:**

| Feature | Description |
|---------|-------------|
| Secure Work Order Sharing | Share work orders with workrooms via secure public links. Control exactly which items are visible and track who views your documents. |
| Item-Level Share Selection | Choose specific rooms and windows to include in shared links instead of sharing everything. Perfect for sending partial orders to different suppliers. |
| Orientation Selection | Choose between Portrait or Landscape layout when creating share links to match your preferred viewing format. |
| Real-Time Status Updates | Shared work order viewers see live status changes as items move through production (Pending → Ready → Installed). |
| Friendly Rate Limit Messages | Instead of cryptic errors, signup/login now shows a helpful countdown timer when rate limited. |

**Improvements:**

| Improvement | Description |
|-------------|-------------|
| Fabric Pricing Accuracy | Cost prices with implied markup now calculate correctly throughout the entire pricing chain. |
| Authenticated Share Access | Logged-in users can now view shared work orders without authentication conflicts. |
| Session Persistence | Removed 30-minute session timeout - users stay logged in via automatic token refresh. |
| Multi-Account Isolation | Enhanced cache keys ensure data never leaks between accounts on shared devices. |

**Security:**

- Fixed infinite recursion in RLS policies using SECURITY DEFINER functions
- Enhanced work order share link policies for both anonymous and authenticated access
- Comprehensive data isolation between tenant accounts

---

## Part 3: Update Documentation Page

### Issue
The Documentation page (`src/pages/Documentation.tsx`) is missing sections for:
- Work Order Sharing feature
- Real-time collaboration updates
- Share link management

### Solution
Add new subsections to the "Jobs & Projects" section covering work order sharing:

| Section | New Subsection | Content |
|---------|----------------|---------|
| Jobs & Projects | "Sharing Work Orders" | Complete guide to creating, managing, and using share links |

### New Documentation Content

**"Sharing Work Orders" Subsection:**

```text
Share work orders securely with your workroom, installers, or suppliers via unique 
public links.

Creating a Share Link:
1. Open any project and navigate to the Workshop tab
2. Click the 'Share' button in the header
3. Configure your share link:
   - Name (optional): Label like "For Curtain Maker"
   - Document Type: Work Order, Installation Sheet, or Fitting Sheet
   - Orientation: Portrait (tall) or Landscape (wide)
   - Items: Select specific rooms/windows or share all

4. Click 'Create Link' to generate the secure URL
5. Copy and send to your workroom via email or message

Item-Level Selection:
• Expand room groups to see individual windows
• Check/uncheck specific items to include
• Perfect for sending partial orders to different suppliers

Sharing Features:
• Secure token-based URLs (no login required for viewers)
• Real-time status updates visible to viewers
• Portrait or Landscape page layouts
• Optional PIN protection (coming soon)
• Track viewer activity

Managing Share Links:
• View all active links in the Share panel
• Deactivate links when no longer needed
• Expired links automatically stop working
• Re-sync data before sharing to ensure accuracy

Best Practices:
• Use descriptive names for each link
• Re-sync project data before creating links
• Deactivate links once the job is complete
• Use item filters to send only relevant information
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/version/VersionBadge.tsx` | Import and use `APP_VERSION` constant |
| `supabase/migrations/[timestamp]_add_version_2_3_16.sql` | Insert new version record with release notes |
| `src/pages/Documentation.tsx` | Add "Sharing Work Orders" subsection to Jobs section |

---

## Technical Details

### Version Badge Fix
```typescript
// Before
const version = "v2.3.1";

// After  
import { APP_VERSION } from "@/constants/version";
const version = `v${APP_VERSION}`;
```

### Database Migration Structure
```sql
-- Set current version to false
UPDATE app_versions SET is_current = false WHERE is_current = true;

-- Insert new version
INSERT INTO app_versions (
  version, version_type, release_date, is_current, is_published, release_notes
) VALUES (
  'v2.3.16', 'minor', now(), true, true,
  '{
    "summary": "Major update with secure work order sharing...",
    "highlights": [...],
    "features": [...],
    "improvements": [...],
    "security": [...]
  }'::jsonb
);
```

---

## Expected Results

After implementation:
1. Version badge shows **v2.3.16** (synced with constants)
2. "What's New" popup displays all recent features with January 2026 date
3. Documentation page includes complete Work Order Sharing guide
4. Users can discover new features through the improved changelog
