-- DROP ALL REMAINING is_admin() POLICIES (exact names from query)

-- email_templates
DROP POLICY IF EXISTS "Users can view templates" ON email_templates;

-- hardware_assemblies
DROP POLICY IF EXISTS "Users can update assemblies" ON hardware_assemblies;
DROP POLICY IF EXISTS "Users can create assemblies" ON hardware_assemblies;
DROP POLICY IF EXISTS "Users can delete assemblies" ON hardware_assemblies;
DROP POLICY IF EXISTS "Users can view assemblies" ON hardware_assemblies;

-- lead_scoring_rules
DROP POLICY IF EXISTS "Users can update lead scoring rules" ON lead_scoring_rules;
DROP POLICY IF EXISTS "Users can create lead scoring rules" ON lead_scoring_rules;
DROP POLICY IF EXISTS "Users can delete lead scoring rules" ON lead_scoring_rules;

-- option_rules
DROP POLICY IF EXISTS "Admins can manage option rules" ON option_rules;

-- option_values
DROP POLICY IF EXISTS "Account members can delete option values" ON option_values;
DROP POLICY IF EXISTS "Account members can update option values" ON option_values;

-- pricing_grids
DROP POLICY IF EXISTS "Account members can delete pricing grids" ON pricing_grids;
DROP POLICY IF EXISTS "Account members can view pricing grids" ON pricing_grids;
DROP POLICY IF EXISTS "Account members can update pricing grids" ON pricing_grids;

-- project_note_mentions
DROP POLICY IF EXISTS "Authors or admins can update mentions" ON project_note_mentions;
DROP POLICY IF EXISTS "Authors or admins can delete mentions" ON project_note_mentions;

-- project_notes
DROP POLICY IF EXISTS "Authors or admins can delete notes" ON project_notes;
DROP POLICY IF EXISTS "Authors or admins can update notes" ON project_notes;

-- projects
DROP POLICY IF EXISTS "Permission-based project access" ON projects;
DROP POLICY IF EXISTS "Permission-based project creation" ON projects;

-- rooms
DROP POLICY IF EXISTS "Account members can update rooms" ON rooms;
DROP POLICY IF EXISTS "Account members can view rooms" ON rooms;
DROP POLICY IF EXISTS "Account members can delete rooms" ON rooms;

-- treatment_options
DROP POLICY IF EXISTS "Account members can delete treatment options" ON treatment_options;
DROP POLICY IF EXISTS "Account members can update treatment options" ON treatment_options;

-- treatment_templates
DROP POLICY IF EXISTS "Admins can manage treatment templates" ON treatment_templates;

-- treatments
DROP POLICY IF EXISTS "Users can view all account treatments" ON treatments;

-- user_invitations
DROP POLICY IF EXISTS "Admins can view account invitations" ON user_invitations;
DROP POLICY IF EXISTS "Admins can send invitations" ON user_invitations;
DROP POLICY IF EXISTS "Admins can delete account invitations" ON user_invitations;

-- user_permissions  
DROP POLICY IF EXISTS "Admins can manage all permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can view their permissions" ON user_permissions;

-- user_presence
DROP POLICY IF EXISTS "Users manage own presence" ON user_presence;

-- user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;

-- user_subscriptions
DROP POLICY IF EXISTS "Admins can delete subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Admins can insert subscriptions" ON user_subscriptions;

-- vendors
DROP POLICY IF EXISTS "Account members can delete vendors" ON vendors;
DROP POLICY IF EXISTS "Account members can update vendors" ON vendors;
DROP POLICY IF EXISTS "Account members can view vendors" ON vendors;