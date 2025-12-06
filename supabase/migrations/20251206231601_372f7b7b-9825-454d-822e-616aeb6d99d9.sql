-- Insert v2.3.1 release notes
INSERT INTO public.app_versions (
  version,
  version_number,
  version_type,
  is_current,
  is_published,
  release_date,
  release_notes
) VALUES (
  'v2.3.1',
  231,
  'minor',
  true,
  true,
  now(),
  '{
    "highlights": [
      "Custom document templates with drag-and-drop blocks",
      "Hardware inventory category",
      "Products & services in projects",
      "CSV import flexibility improvements"
    ],
    "features": [
      {
        "title": "Custom Document Templates",
        "description": "Create professional quotes and invoices with drag-and-drop block editor. Add headers, products, totals, and custom content blocks."
      },
      {
        "title": "Hardware Category",
        "description": "Full hardware inventory management - tracks, poles, brackets, and accessories with complete pricing."
      },
      {
        "title": "Products & Services",
        "description": "Add products and services directly to projects and quotes. Create custom items on-the-fly or select from inventory."
      },
      {
        "title": "CSV Import Improvements",
        "description": "Flexible column ordering and multiple name variations supported. Import 500+ items at once with intelligent field mapping."
      }
    ],
    "improvements": [
      "Invoice toggle buttons (Group by Room, Simple View, Hide Images) now work on all template types",
      "Number sequences automatically created for new accounts",
      "Tips moved to user profile slider for cleaner interface",
      "Performance and stability improvements across the app"
    ],
    "security": [
      "Multi-account isolation for SaaS deployment",
      "RLS security hardening with 60+ policy fixes",
      "Complete data separation between accounts"
    ]
  }'::jsonb
)
ON CONFLICT (version) DO UPDATE SET
  is_current = true,
  is_published = true,
  release_date = now(),
  release_notes = EXCLUDED.release_notes,
  updated_at = now();

-- Mark previous versions as not current
UPDATE public.app_versions 
SET is_current = false 
WHERE version != 'v2.3.1';