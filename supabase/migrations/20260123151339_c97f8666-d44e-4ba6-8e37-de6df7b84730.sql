-- Set any existing current version to false
UPDATE app_versions SET is_current = false WHERE is_current = true;

-- Insert new version v2.3.16 with comprehensive release notes
INSERT INTO app_versions (
  version, 
  version_type, 
  version_number,
  release_date, 
  is_current, 
  is_published, 
  release_notes
) VALUES (
  'v2.3.16', 
  'minor', 
  23016,
  '2026-01-23', 
  true, 
  true,
  '{
    "summary": "Major update introducing secure work order sharing with your workroom and suppliers. Share exactly what you need with item-level selection, plus improved authentication and security fixes.",
    "highlights": [
      "Secure Work Order Sharing with public links",
      "Item-level selection for share links",
      "Improved user authentication experience",
      "Enhanced security with RLS policy fixes"
    ],
    "features": [
      {
        "title": "Secure Work Order Sharing",
        "description": "Share work orders with workrooms via secure public links. Control exactly which items are visible and track who views your documents.",
        "icon": "share"
      },
      {
        "title": "Item-Level Share Selection",
        "description": "Choose specific rooms and windows to include in shared links instead of sharing everything. Perfect for sending partial orders to different suppliers.",
        "icon": "list-checks"
      },
      {
        "title": "Orientation Selection",
        "description": "Choose between Portrait or Landscape layout when creating share links to match your preferred viewing format.",
        "icon": "layout"
      },
      {
        "title": "Real-Time Status Updates",
        "description": "Shared work order viewers see live status changes as items move through production (Pending → Ready → Installed).",
        "icon": "refresh-cw"
      },
      {
        "title": "Friendly Rate Limit Messages",
        "description": "Instead of cryptic errors, signup and login now shows a helpful countdown timer when rate limited.",
        "icon": "clock"
      }
    ],
    "improvements": [
      {
        "title": "Fabric Pricing Accuracy",
        "description": "Cost prices with implied markup now calculate correctly throughout the entire pricing chain."
      },
      {
        "title": "Authenticated Share Access",
        "description": "Logged-in users can now view shared work orders without authentication conflicts."
      },
      {
        "title": "Session Persistence",
        "description": "Removed 30-minute session timeout - users stay logged in via automatic token refresh."
      },
      {
        "title": "Multi-Account Isolation",
        "description": "Enhanced cache keys ensure data never leaks between accounts on shared devices."
      }
    ],
    "security": [
      "Fixed infinite recursion in RLS policies using SECURITY DEFINER functions",
      "Enhanced work order share link policies for both anonymous and authenticated access",
      "Comprehensive data isolation between tenant accounts"
    ]
  }'::jsonb
);