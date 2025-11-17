import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      throw new Error('userId is required');
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the requesting user is a System Owner
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      throw new Error('Invalid authentication');
    }

    // Check if requesting user is System Owner
    const { data: userRole, error: roleCheckError } = await supabaseAdmin
      .rpc('get_user_role', { _user_id: requestingUser.id });

    if (roleCheckError || userRole !== 'System Owner') {
      console.error('Not authorized - not a System Owner. Role:', userRole, 'Error:', roleCheckError);
      throw new Error('Only System Owners can delete accounts');
    }

    console.log(`System Owner ${requestingUser.email} deleting account ${userId}`);

    // Delete all user-related data from public schema tables
    // Order matters: delete child records first to avoid foreign key violations
    
    const tablesToClean = [
      // Child tables first (tables that reference other user tables)
      'appointment_notifications', 'project_notes', 'window_coverings', 'rooms',
      'tasks', 'todos', 'reminders', 'client_measurements', 'client_activity_log',
      'client_interactions', 'treatments', 'surfaces', 'quote_templates',
      'manual_quote_items', 'material_order_queue', 'batch_orders', 'purchase_orders',
      'product_orders', 'shopify_orders', 'deals', 'follow_up_reminders',
      'email_campaigns', 'email_sequences', 'sms_campaigns',
      
      // Parent tables
      'appointments', 'quotes', 'projects', 'clients', 'emails', 'notification_usage',
      'notifications', 'user_feedback', 'bug_report_comments', 'bug_reports',
      'broadcast_notifications', 'automation_workflows',
      
      // Settings and preferences
      'user_preferences', 'user_notification_settings', 'user_security_settings',
      'calendar_preferences', 'business_settings', 'email_settings',
      'integration_settings', 'payment_provider_connections',
      
      // Inventory and products
      'enhanced_inventory_items', 'inventory_transactions', 'inventory_movements',
      'inventory', 'collections', 'product_variants', 'eyelet_rings',
      'hardware_assemblies', 'making_costs', 'suppliers', 'vendors',
      'supplier_lead_times',
      
      // Templates and pricing
      'curtain_templates', 'pricing_grids', 'pricing_grid_rules',
      'notification_templates', 'email_templates', 'sms_templates',
      'option_type_categories', 'inventory_categories',
      
      // User management
      'user_invitations', 'user_permissions', 'user_roles', 'user_subscriptions',
      'user_subscription_add_ons', 'user_usage_tracking', 'user_presence',
      'user_sessions', 'user_version_views', 'permission_audit_log',
      
      // Configuration
      'job_statuses', 'lead_sources', 'lead_scoring_rules', 'number_sequences',
      'order_schedule_settings', 'scheduled_tasks',
      
      // Analytics and tracking
      'pipeline_analytics', 'sales_forecasts', 'shopify_analytics',
      'shopify_sync_log', 'export_requests', 'export_audit_log',
      
      // Other
      'appointment_schedulers', 'online_stores', 'shopify_integrations',
      'sms_contacts', 'audit_log', 'app_user_flags', 'onboarding_progress',
      'permission_seed_log', '_legacy_option_categories',
      
      // User profile last (has dependencies)
      'user_profiles'
    ];

    let deletedRecords = 0;
    for (const table of tablesToClean) {
      try {
        const { error: deleteError, count } = await supabaseAdmin
          .from(table)
          .delete({ count: 'exact' })
          .eq('user_id', userId);
        
        if (deleteError) {
          console.warn(`Warning: Failed to delete from ${table}:`, deleteError.message);
        } else if (count && count > 0) {
          console.log(`Deleted ${count} records from ${table}`);
          deletedRecords += count;
        }
      } catch (err) {
        console.warn(`Error cleaning ${table}:`, err);
      }
    }

    console.log(`Cleaned up ${deletedRecords} total records from public schema`);

    // Now delete the auth user (this should work now that related data is cleaned up)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      throw new Error(`Failed to delete auth user: ${deleteError.message}`);
    }

    console.log(`Successfully deleted account ${userId} and all related data`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account deleted successfully',
        recordsDeleted: deletedRecords
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in delete-account function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to delete account' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
