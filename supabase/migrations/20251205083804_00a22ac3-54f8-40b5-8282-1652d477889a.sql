-- CRITICAL SECURITY FIX: Remove broken RLS policies with 'OR is_admin()' bypass

-- CLIENTS
DROP POLICY IF EXISTS "Users can view clients in their account" ON clients;
DROP POLICY IF EXISTS "Users can update clients in their account" ON clients;
DROP POLICY IF EXISTS "Users can delete clients in their account" ON clients;
DROP POLICY IF EXISTS "Users can insert clients in their account" ON clients;

-- ENHANCED_INVENTORY_ITEMS
DROP POLICY IF EXISTS "Users can view inventory in their account" ON enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can update inventory in their account" ON enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can delete inventory in their account" ON enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can insert inventory in their account" ON enhanced_inventory_items;

-- QUOTES
DROP POLICY IF EXISTS "Users can view quotes in their account" ON quotes;
DROP POLICY IF EXISTS "Users can update quotes in their account" ON quotes;
DROP POLICY IF EXISTS "Users can delete quotes in their account" ON quotes;
DROP POLICY IF EXISTS "Users can insert quotes in their account" ON quotes;

-- PROJECTS
DROP POLICY IF EXISTS "Users can view projects in their account" ON projects;
DROP POLICY IF EXISTS "Users can update projects in their account" ON projects;
DROP POLICY IF EXISTS "Users can delete projects in their account" ON projects;
DROP POLICY IF EXISTS "Users can insert projects in their account" ON projects;

-- TREATMENT_OPTIONS
DROP POLICY IF EXISTS "Users can view treatment_options in their account" ON treatment_options;
DROP POLICY IF EXISTS "Users can update treatment_options in their account" ON treatment_options;
DROP POLICY IF EXISTS "Users can delete treatment_options in their account" ON treatment_options;
DROP POLICY IF EXISTS "Users can insert treatment_options in their account" ON treatment_options;

-- OPTION_VALUES
DROP POLICY IF EXISTS "Users can view option_values in their account" ON option_values;
DROP POLICY IF EXISTS "Users can update option_values in their account" ON option_values;
DROP POLICY IF EXISTS "Users can delete option_values in their account" ON option_values;
DROP POLICY IF EXISTS "Users can insert option_values in their account" ON option_values;

-- TEMPLATE_OPTION_SETTINGS
DROP POLICY IF EXISTS "Users can view template_option_settings in their account" ON template_option_settings;
DROP POLICY IF EXISTS "Users can update template_option_settings in their account" ON template_option_settings;
DROP POLICY IF EXISTS "Users can delete template_option_settings in their account" ON template_option_settings;
DROP POLICY IF EXISTS "Users can insert template_option_settings in their account" ON template_option_settings;

-- EMAILS
DROP POLICY IF EXISTS "Users can view emails in their account" ON emails;
DROP POLICY IF EXISTS "Users can update emails in their account" ON emails;
DROP POLICY IF EXISTS "Users can delete emails in their account" ON emails;
DROP POLICY IF EXISTS "Users can insert emails in their account" ON emails;

-- APPOINTMENTS
DROP POLICY IF EXISTS "Users can view appointments in their account" ON appointments;
DROP POLICY IF EXISTS "Users can update appointments in their account" ON appointments;
DROP POLICY IF EXISTS "Users can delete appointments in their account" ON appointments;
DROP POLICY IF EXISTS "Users can insert appointments in their account" ON appointments;

-- PRICING_GRIDS
DROP POLICY IF EXISTS "Users can view pricing_grids in their account" ON pricing_grids;
DROP POLICY IF EXISTS "Users can update pricing_grids in their account" ON pricing_grids;
DROP POLICY IF EXISTS "Users can delete pricing_grids in their account" ON pricing_grids;
DROP POLICY IF EXISTS "Users can insert pricing_grids in their account" ON pricing_grids;

-- PRODUCT_TEMPLATES
DROP POLICY IF EXISTS "Users can view product_templates in their account" ON product_templates;
DROP POLICY IF EXISTS "Users can update product_templates in their account" ON product_templates;
DROP POLICY IF EXISTS "Users can delete product_templates in their account" ON product_templates;
DROP POLICY IF EXISTS "Users can insert product_templates in their account" ON product_templates;

-- ROOMS
DROP POLICY IF EXISTS "Users can view rooms in their account" ON rooms;
DROP POLICY IF EXISTS "Users can update rooms in their account" ON rooms;
DROP POLICY IF EXISTS "Users can delete rooms in their account" ON rooms;
DROP POLICY IF EXISTS "Users can insert rooms in their account" ON rooms;

-- WINDOWS_SUMMARY
DROP POLICY IF EXISTS "Users can view windows_summary in their account" ON windows_summary;
DROP POLICY IF EXISTS "Users can update windows_summary in their account" ON windows_summary;
DROP POLICY IF EXISTS "Users can delete windows_summary in their account" ON windows_summary;
DROP POLICY IF EXISTS "Users can insert windows_summary in their account" ON windows_summary;

-- VENDORS
DROP POLICY IF EXISTS "Users can view vendors in their account" ON vendors;
DROP POLICY IF EXISTS "Users can update vendors in their account" ON vendors;
DROP POLICY IF EXISTS "Users can delete vendors in their account" ON vendors;
DROP POLICY IF EXISTS "Users can insert vendors in their account" ON vendors;

-- BUSINESS_SETTINGS
DROP POLICY IF EXISTS "Users can view business_settings in their account" ON business_settings;
DROP POLICY IF EXISTS "Users can update business_settings in their account" ON business_settings;
DROP POLICY IF EXISTS "Users can delete business_settings in their account" ON business_settings;
DROP POLICY IF EXISTS "Users can insert business_settings in their account" ON business_settings;

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view notifications in their account" ON notifications;
DROP POLICY IF EXISTS "Users can update notifications in their account" ON notifications;
DROP POLICY IF EXISTS "Users can delete notifications in their account" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications in their account" ON notifications;

-- DEALS
DROP POLICY IF EXISTS "Users can view deals in their account" ON deals;
DROP POLICY IF EXISTS "Users can update deals in their account" ON deals;
DROP POLICY IF EXISTS "Users can delete deals in their account" ON deals;
DROP POLICY IF EXISTS "Users can insert deals in their account" ON deals;

-- JOB_STATUSES
DROP POLICY IF EXISTS "Users can view job_statuses in their account" ON job_statuses;
DROP POLICY IF EXISTS "Users can update job_statuses in their account" ON job_statuses;
DROP POLICY IF EXISTS "Users can delete job_statuses in their account" ON job_statuses;
DROP POLICY IF EXISTS "Users can insert job_statuses in their account" ON job_statuses;

-- EMAIL_TEMPLATES
DROP POLICY IF EXISTS "Users can view email_templates in their account" ON email_templates;
DROP POLICY IF EXISTS "Users can update email_templates in their account" ON email_templates;
DROP POLICY IF EXISTS "Users can delete email_templates in their account" ON email_templates;
DROP POLICY IF EXISTS "Users can insert email_templates in their account" ON email_templates;

-- CLIENT_ACTIVITY_LOG
DROP POLICY IF EXISTS "Users can view client_activity_log in their account" ON client_activity_log;
DROP POLICY IF EXISTS "Users can update client_activity_log in their account" ON client_activity_log;
DROP POLICY IF EXISTS "Users can delete client_activity_log in their account" ON client_activity_log;
DROP POLICY IF EXISTS "Users can insert client_activity_log in their account" ON client_activity_log;

-- CLIENT_FILES
DROP POLICY IF EXISTS "Users can view client_files in their account" ON client_files;
DROP POLICY IF EXISTS "Users can update client_files in their account" ON client_files;
DROP POLICY IF EXISTS "Users can delete client_files in their account" ON client_files;
DROP POLICY IF EXISTS "Users can insert client_files in their account" ON client_files;