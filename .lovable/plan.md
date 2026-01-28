

# Add v2.4.1 Release Notes to What's New Dialog

## Overview

Update the `app_versions` table with the new v2.4.1 release notes so users can see what was fixed/improved in this update.

---

## Database Update Required

Run a SQL migration to:
1. Mark v2.4.0 as `is_current = false`
2. Insert new v2.4.1 record with `is_current = true` and complete release notes

---

## v2.4.1 Release Notes Content

### Highlights
- Account-isolated Recent Fabrics (no more cross-account data)
- Auto-select first option for TWC templates
- Clearer pricing labels (Making/Labor vs Fabric)
- Update notification banner for new deployments

### New Features
- **Update Notification Banner**: Friendly banner appears when a new version is deployed, recommending users to save work and refresh
- **Template Auto-Selection Setting**: TWC templates now auto-populate required dropdowns to reduce manual input

### Improvements
- Recent Materials now isolated per account (localStorage keyed by user ID)
- "Manufacturing Cost" renamed to "Making/Labor" for clarity
- TWC Library collections properly linked (1,011 of 1,025 items)
- Duplicate collections cleaned up with unique constraint added

### Security
- Multi-tenant isolation enhanced for localStorage data

---

## SQL Migration

```sql
-- Mark current version as not current
UPDATE app_versions SET is_current = false WHERE is_current = true;

-- Insert v2.4.1
INSERT INTO app_versions (
  version,
  version_number,
  version_type,
  release_date,
  is_current,
  is_published,
  release_notes
) VALUES (
  'v2.4.1',
  241,
  'patch',
  CURRENT_DATE,
  true,
  true,
  '{
    "summary": "Bug fixes and usability improvements for template options, library organization, and multi-account data isolation.",
    "highlights": [
      "Account-isolated Recent Fabrics - no more cross-account data leakage",
      "Auto-select first option for TWC templates reduces manual input",
      "Clearer pricing labels: Making/Labor vs Fabric Cost",
      "Update notification banner for new deployments"
    ],
    "newFeatures": [
      {
        "title": "Update Notification Banner",
        "description": "A friendly banner now appears when a new version is deployed, recommending users to save work and refresh their browser."
      },
      {
        "title": "Template Auto-Selection",
        "description": "TWC templates now auto-populate required option dropdowns, reducing manual selection and validation errors."
      }
    ],
    "improvements": [
      "Recent Materials list now isolated per account (no longer shared across logins on same browser)",
      "Manufacturing Cost renamed to Making/Labor for clearer pricing breakdown",
      "TWC Library collections properly linked (1,011 of 1,025 items organized)",
      "Duplicate collection records cleaned up with database constraint added"
    ],
    "security": [
      "Enhanced multi-tenant isolation for localStorage data"
    ]
  }'::jsonb
);
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/migrations/xxx.sql` | Insert v2.4.1 release notes |

---

## Result

After this migration, clicking the version badge (v2.4.1) will show the "What's New" dialog with all the fixes and improvements from this release.

