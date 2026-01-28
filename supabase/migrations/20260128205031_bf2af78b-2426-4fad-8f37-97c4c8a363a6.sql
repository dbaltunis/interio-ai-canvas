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