-- Update previous version to not current
UPDATE app_versions SET is_current = false WHERE is_current = true;

-- Insert new v2.4.0 release
INSERT INTO app_versions (version, version_number, version_type, release_date, is_current, is_published, release_notes)
VALUES (
  'v2.4.0',
  240,
  'major',
  '2026-01-26',
  true,
  true,
  '{
    "highlights": [
      "Complete Documentation Overhaul - 13 comprehensive sections",
      "New API & Developer Access documentation",
      "Supplier Integrations guide (TWC, Shopify)",
      "Communication Channels documentation",
      "Product Library terminology update"
    ],
    "new_features": [
      {
        "title": "Professional Documentation v2.4",
        "description": "Complete rewrite with 13 sections covering all features, integrations, and APIs"
      },
      {
        "title": "API & Developer Access",
        "description": "New documentation for edge functions, webhooks, and authentication"
      },
      {
        "title": "Calculation Algorithms Guide",
        "description": "High-level explanation of fabric and pricing calculation engines"
      },
      {
        "title": "Tag Search Filter",
        "description": "Searchable input with autocomplete and popular tag quick-select"
      }
    ],
    "improvements": [
      "Renamed Inventory to Product Library across all interfaces",
      "Dynamic version badge pulls from APP_VERSION constant",
      "Screenshot integration ready for visual documentation",
      "Comprehensive Supplier Ordering documentation",
      "Google Calendar OAuth setup guide with privacy notes"
    ],
    "bug_fixes": []
  }'::jsonb
);