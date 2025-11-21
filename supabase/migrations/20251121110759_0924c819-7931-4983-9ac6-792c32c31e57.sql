-- Mark previous version as not current
UPDATE app_versions 
SET is_current = false 
WHERE is_current = true;

-- Insert Version 2.0.1 with comprehensive release notes
INSERT INTO app_versions (
  version,
  version_number,
  version_type,
  release_date,
  is_current,
  is_published,
  release_notes
) VALUES (
  'v2.0.1',
  2,
  'minor',
  '2025-11-21',
  true,
  true,
  '{
    "summary": "Major production-ready release with enhanced permissions, KPI controls, security improvements, and team collaboration features. InterioApp is now ready for new SaaS subscribers.",
    "newFeatures": [
      {
        "title": "Enhanced Custom Permissions System",
        "description": "Granular job visibility controls (view_own_jobs vs view_all_jobs), workroom and materials access permissions, quote template inheritance from account owners, and automatic owner notifications when team members create projects"
      },
      {
        "title": "KPI Visibility Controls",
        "description": "Dashboard metrics can now be hidden from staff with three permission levels: Primary KPIs, Revenue KPIs, and Email KPIs. Protect sensitive business data with customizable per-role or per-user controls"
      },
      {
        "title": "Collections & Tagging System",
        "description": "Organize inventory into collections with tag-based filtering and search for better product categorization and enhanced inventory management"
      },
      {
        "title": "System Owner Role",
        "description": "New super-admin role for multi-account management with enhanced account hierarchy support and system-wide configuration capabilities"
      },
      {
        "title": "Hierarchical Treatment Option Pricing",
        "description": "Category, subcategory, and item-level pricing with inventory linking, hardware options for curtains, and ordering/visibility controls"
      },
      {
        "title": "Navigation Permission Controls",
        "description": "Workroom, Email, and Calendar tabs now respect permissions with cleaner UI for users without access. Email section only shows when SendGrid is configured"
      },
      {
        "title": "Team Member Management Improvements",
        "description": "Better invitation flow with automatic parent account linking and enhanced team member access controls"
      }
    ],
    "improvements": [
      {
        "title": "Security Hardening",
        "description": "Comprehensive RLS policy overhaul with fixed account data isolation, enhanced team member access controls, and quote template access inheritance"
      },
      {
        "title": "Permission System Fixes",
        "description": "Fixed staff unable to see their own projects or create new jobs. Added backward compatibility with legacy permissions and automatic permission sync for existing users"
      },
      {
        "title": "Notification System",
        "description": "Fixed notification trigger errors by removing non-existent columns. Added owner notifications for team-created projects with better formatting"
      },
      {
        "title": "RLS Policy Updates",
        "description": "Permission-based access control for projects table, quote template inheritance from account owner, and better performance with optimized queries"
      },
      {
        "title": "Treatment Options Cleanup",
        "description": "Removed duplicate option categories, deactivated redundant fullness/heading options, and streamlined curtain configuration"
      },
      {
        "title": "Database Performance",
        "description": "Added indexes for faster queries, optimized permission checks, and better collection and tag lookups"
      },
      {
        "title": "User Experience",
        "description": "Conditional navigation based on integrations, role-appropriate default permissions, and better error handling for access denied"
      },
      {
        "title": "Account Management",
        "description": "Fixed team invitation acceptance flow with proper parent account assignment and System Owner permission handling"
      },
      {
        "title": "Function Updates",
        "description": "Updated get_default_permissions_for_role() with new permissions, get_user_role() now handles System Owner, and has_permission() optimized for performance"
      },
      {
        "title": "Migration Safety",
        "description": "All migrations include conflict handling (ON CONFLICT DO NOTHING), backward compatibility maintained, and existing data preserved"
      }
    ],
    "upcomingFeatures": [
      "Next-Gen Online Store Builder with drag-and-drop creation and multiple templates",
      "Full Shopify Integration with two-way sync, order management, and customer data",
      "Advanced Inventory Management with Shopify ↔ InterioApp sync and multi-location support",
      "Enhanced Proposal System with image uploads, rich text editing, and interactive approval",
      "Purchasing Module with vendor management, purchase orders, and supplier integration",
      "Mobile App for iOS and Android with offline mode and push notifications",
      "Advanced Analytics with custom report builder and forecasting tools",
      "Integration Expansions including QuickBooks, Xero, Zapier, and custom API"
    ]
  }'::jsonb
) ON CONFLICT (version) DO NOTHING;