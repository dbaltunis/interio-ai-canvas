-- DROP ALL REMAINING OLD POLICIES WITH is_admin() BY EXACT NAME

-- appointments
DROP POLICY IF EXISTS "Account members can update appointments" ON appointments;
DROP POLICY IF EXISTS "Account members can view appointments" ON appointments;
DROP POLICY IF EXISTS "Account members can delete appointments" ON appointments;

-- bug_report_comments (keep admin-only for bug reports)

-- business_settings
DROP POLICY IF EXISTS "Account members can view business settings" ON business_settings;
DROP POLICY IF EXISTS "Account members can update business settings" ON business_settings;

-- client_measurements
DROP POLICY IF EXISTS "Users can create client measurements" ON client_measurements;
DROP POLICY IF EXISTS "Users can view client measurements" ON client_measurements;
DROP POLICY IF EXISTS "Users can update client measurements" ON client_measurements;
DROP POLICY IF EXISTS "Users can delete client measurements" ON client_measurements;

-- collections
DROP POLICY IF EXISTS "Account members can update collections" ON collections;
DROP POLICY IF EXISTS "Account members can view collections" ON collections;
DROP POLICY IF EXISTS "Account members can delete collections" ON collections;

-- email_campaigns
DROP POLICY IF EXISTS "Users can delete campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Users can update campaigns in their account" ON email_campaigns;
DROP POLICY IF EXISTS "Users can view account email campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Users can view campaigns in their account" ON email_campaigns;
DROP POLICY IF EXISTS "Users can view campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Users can update campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Users can delete campaigns in their account" ON email_campaigns;

-- email_templates
DROP POLICY IF EXISTS "Users can view email templates in their account" ON email_templates;
DROP POLICY IF EXISTS "Users can delete email templates in their account" ON email_templates;
DROP POLICY IF EXISTS "Users can delete templates" ON email_templates;
DROP POLICY IF EXISTS "Users can update email templates in their account" ON email_templates;
DROP POLICY IF EXISTS "Users can update templates" ON email_templates;
DROP POLICY IF EXISTS "Users can view account email templates" ON email_templates;

-- emails
DROP POLICY IF EXISTS "Users can view account emails" ON emails;
DROP POLICY IF EXISTS "Users can view emails in their account" ON emails;
DROP POLICY IF EXISTS "Users can create emails in their account" ON emails;
DROP POLICY IF EXISTS "Users can update emails in their account" ON emails;
DROP POLICY IF EXISTS "Users can delete emails in their account" ON emails;

-- enhanced_inventory_items
DROP POLICY IF EXISTS "Users can view inventory" ON enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can create inventory" ON enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can update inventory" ON enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can delete inventory" ON enhanced_inventory_items;

-- hardware_assemblies
DROP POLICY IF EXISTS "Users can view hardware assemblies" ON hardware_assemblies;
DROP POLICY IF EXISTS "Users can create hardware assemblies" ON hardware_assemblies;
DROP POLICY IF EXISTS "Users can update hardware assemblies" ON hardware_assemblies;
DROP POLICY IF EXISTS "Users can delete hardware assemblies" ON hardware_assemblies;

-- inventory_categories
DROP POLICY IF EXISTS "Users can view categories" ON inventory_categories;
DROP POLICY IF EXISTS "Users can create categories" ON inventory_categories;
DROP POLICY IF EXISTS "Users can update categories" ON inventory_categories;
DROP POLICY IF EXISTS "Users can delete categories" ON inventory_categories;

-- lead_scoring_rules
DROP POLICY IF EXISTS "Users can view own rules" ON lead_scoring_rules;
DROP POLICY IF EXISTS "Users can create own rules" ON lead_scoring_rules;
DROP POLICY IF EXISTS "Users can update own rules" ON lead_scoring_rules;
DROP POLICY IF EXISTS "Users can delete own rules" ON lead_scoring_rules;

-- option_rules
DROP POLICY IF EXISTS "Users can view option rules" ON option_rules;
DROP POLICY IF EXISTS "Users can create option rules" ON option_rules;
DROP POLICY IF EXISTS "Users can update option rules" ON option_rules;
DROP POLICY IF EXISTS "Users can delete option rules" ON option_rules;

-- option_values
DROP POLICY IF EXISTS "Users can view option values" ON option_values;
DROP POLICY IF EXISTS "Account members can view option values" ON option_values;
DROP POLICY IF EXISTS "Users can create option values" ON option_values;
DROP POLICY IF EXISTS "Users can update option values" ON option_values;
DROP POLICY IF EXISTS "Users can delete option values" ON option_values;

-- pricing_grids
DROP POLICY IF EXISTS "Users can view pricing grids" ON pricing_grids;
DROP POLICY IF EXISTS "Users can create pricing grids" ON pricing_grids;
DROP POLICY IF EXISTS "Users can update pricing grids" ON pricing_grids;
DROP POLICY IF EXISTS "Users can delete pricing grids" ON pricing_grids;

-- project_notes
DROP POLICY IF EXISTS "Users can view project notes" ON project_notes;
DROP POLICY IF EXISTS "Users can create project notes" ON project_notes;
DROP POLICY IF EXISTS "Users can update project notes" ON project_notes;
DROP POLICY IF EXISTS "Users can delete project notes" ON project_notes;

-- projects
DROP POLICY IF EXISTS "Account members can view projects" ON projects;
DROP POLICY IF EXISTS "Account members can update projects" ON projects;
DROP POLICY IF EXISTS "Account members can delete projects" ON projects;

-- rooms
DROP POLICY IF EXISTS "Users can view rooms" ON rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON rooms;
DROP POLICY IF EXISTS "Users can update rooms" ON rooms;
DROP POLICY IF EXISTS "Users can delete rooms" ON rooms;

-- treatment_options
DROP POLICY IF EXISTS "Users can view treatment options" ON treatment_options;
DROP POLICY IF EXISTS "Account members can view treatment options" ON treatment_options;
DROP POLICY IF EXISTS "Users can create treatment options" ON treatment_options;
DROP POLICY IF EXISTS "Users can update treatment options" ON treatment_options;
DROP POLICY IF EXISTS "Users can delete treatment options" ON treatment_options;

-- treatment_templates
DROP POLICY IF EXISTS "Users can view templates" ON treatment_templates;
DROP POLICY IF EXISTS "Users can create templates" ON treatment_templates;
DROP POLICY IF EXISTS "Users can update templates" ON treatment_templates;
DROP POLICY IF EXISTS "Users can delete templates" ON treatment_templates;

-- treatments
DROP POLICY IF EXISTS "Users can view treatments" ON treatments;
DROP POLICY IF EXISTS "Users can create treatments" ON treatments;
DROP POLICY IF EXISTS "Users can update treatments" ON treatments;
DROP POLICY IF EXISTS "Users can delete treatments" ON treatments;

-- user_invitations
DROP POLICY IF EXISTS "Users can view own invitations" ON user_invitations;
DROP POLICY IF EXISTS "Account owners can view invitations" ON user_invitations;
DROP POLICY IF EXISTS "Admins can view all invitations" ON user_invitations;

-- user_permissions
DROP POLICY IF EXISTS "Account owners can manage permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can view own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can view all permissions" ON user_permissions;

-- user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

-- vendors
DROP POLICY IF EXISTS "Users can view vendors" ON vendors;
DROP POLICY IF EXISTS "Users can create vendors" ON vendors;
DROP POLICY IF EXISTS "Users can update vendors" ON vendors;
DROP POLICY IF EXISTS "Users can delete vendors" ON vendors;