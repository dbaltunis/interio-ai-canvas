-- Update app_versions with accurate BETA v0.1.0 release notes
UPDATE app_versions
SET 
  release_notes = '{
    "summary": "Initial BETA release focusing on core navigation, permissions, and quality-of-life improvements",
    "highlights": [
      "Fixed critical navigation permission issues affecting all users",
      "Introduced bug reporting system for better issue tracking",
      "Added version management with release notes"
    ],
    "newFeatures": [
      {
        "title": "Bug Reporting System",
        "description": "Users can now report bugs directly from the app with a floating red button. All reports include automatic browser information capture to help developers diagnose issues faster."
      },
      {
        "title": "Version Management",
        "description": "Track application updates with What''s New dialogs that appear automatically when new versions are released. Click the version badge in the header to review release notes anytime."
      },
      {
        "title": "Admin Bug Dashboard",
        "description": "Administrators can now view, filter, and manage bug reports at /admin/bugs with status tracking and detailed technical information."
      }
    ],
    "improvements": [
      {
        "title": "Navigation Permissions Fixed",
        "description": "Resolved issues where users with missing permissions couldn''t access the navigation menu. All existing users have been backfilled with appropriate permissions based on their roles."
      },
      {
        "title": "Permission Initialization",
        "description": "New users now automatically receive role-appropriate permissions upon registration, preventing access issues."
      },
      {
        "title": "Browser Metadata Capture",
        "description": "Bug reports now include comprehensive technical details including viewport size, screen resolution, platform, and user agent to accelerate troubleshooting."
      }
    ],
    "knownIssues": [
      "Some features may require additional testing across different devices and browsers",
      "Documentation portal is under development",
      "Additional ERP integrations planned for future releases"
    ]
  }'::jsonb,
  updated_at = now()
WHERE version_number = 1 AND is_current = true;