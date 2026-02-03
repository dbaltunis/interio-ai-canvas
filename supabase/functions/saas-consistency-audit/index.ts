import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrphanedRecord {
  id: string;
  user_id: string;
  table_name?: string;
}

interface MissingConfig {
  expected: number;
  actual: number;
  missing: string[];
}

interface AccountAudit {
  user_id: string;
  display_name: string;
  email: string;
  role: string;
  created_at: string;
  health_score: number;
  health_status: 'healthy' | 'warning' | 'critical';
  is_custom_account: boolean;
  missing_configs: {
    permissions: MissingConfig;
    business_settings: boolean;
    account_settings: boolean;
    number_sequences: MissingConfig;
    job_statuses: number;
    client_stages: MissingConfig;
    subscription: boolean;
  };
  twc_issues: {
    heading_type_required: number;
    orphaned_options: number;
  };
}

interface AuditSummary {
  timestamp: string;
  summary: {
    total_accounts: number;
    healthy_accounts: number;
    needs_attention: number;
    orphaned_records: number;
  };
  accounts: AccountAudit[];
  orphaned_data: {
    projects: OrphanedRecord[];
    quotes: OrphanedRecord[];
    clients: OrphanedRecord[];
    inventory_items: OrphanedRecord[];
    treatment_options: OrphanedRecord[];
  };
  auto_fix_script: string;
}

// Standard permissions every Owner should have (77 total)
const STANDARD_OWNER_PERMISSIONS = [
  'create_appointments', 'view_appointments', 'edit_appointments', 'delete_appointments',
  'create_clients', 'view_clients', 'edit_clients', 'delete_clients',
  'create_projects', 'view_projects', 'edit_projects', 'delete_projects',
  'create_quotes', 'view_quotes', 'edit_quotes', 'delete_quotes', 'approve_quotes', 'send_quotes',
  'create_invoices', 'view_invoices', 'edit_invoices', 'delete_invoices', 'send_invoices',
  'view_inventory', 'create_inventory', 'edit_inventory', 'delete_inventory',
  'view_reports', 'export_reports',
  'manage_team', 'view_team', 'invite_users', 'remove_users',
  'manage_settings', 'view_settings', 'edit_business_settings',
  'manage_integrations', 'view_integrations',
  'view_dashboard', 'view_analytics',
  'manage_templates', 'view_templates', 'create_templates', 'edit_templates', 'delete_templates',
  'manage_products', 'view_products', 'create_products', 'edit_products', 'delete_products',
  'manage_pricing', 'view_pricing', 'edit_pricing',
  'view_calendar', 'manage_calendar',
  'view_notifications', 'manage_notifications',
  'view_workroom', 'manage_workroom',
  'view_suppliers', 'manage_suppliers', 'create_suppliers', 'edit_suppliers', 'delete_suppliers',
  'view_orders', 'create_orders', 'edit_orders', 'delete_orders', 'send_orders',
  'view_payments', 'manage_payments', 'record_payments',
  'view_expenses', 'create_expenses', 'edit_expenses', 'delete_expenses',
  'manage_automations', 'view_automations',
  'manage_campaigns', 'view_campaigns',
  'manage_files', 'view_files', 'upload_files', 'delete_files',
];

const STANDARD_SEQUENCES = ['job', 'quote', 'invoice', 'order', 'draft'];
const EXPECTED_CLIENT_STAGES = 10;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is System Owner
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || userProfile?.role !== 'System Owner') {
      return new Response(
        JSON.stringify({ error: 'Access denied. System Owner required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[saas-consistency-audit] Starting comprehensive audit...');

    // Get request body for options
    let options = { includeOrphanCleanup: false, repairAccounts: false, accountId: null as string | null };
    try {
      const body = await req.json();
      options = { ...options, ...body };
    } catch {
      // No body, use defaults
    }

    // Fetch all Owner/System Owner accounts
    const { data: ownerAccounts, error: accountsError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, display_name, role, created_at')
      .in('role', ['Owner', 'System Owner'])
      .order('created_at', { ascending: false });

    if (accountsError) throw accountsError;

    console.log(`[saas-consistency-audit] Found ${ownerAccounts?.length || 0} accounts to audit`);

    // Get all valid user IDs for orphan detection
    const { data: allProfiles } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id');
    const validUserIds = new Set((allProfiles || []).map(p => p.user_id));

    // Check for custom account flags
    const { data: customFlags } = await supabaseAdmin
      .from('account_feature_flags')
      .select('user_id, feature_key')
      .in('feature_key', ['custom_integration', 'homekaara', 'custom_setup']);
    const customAccountIds = new Set((customFlags || []).map(f => f.user_id));

    const accounts: AccountAudit[] = [];
    const autoFixStatements: string[] = [];

    for (const account of ownerAccounts || []) {
      // Skip if filtering by specific account
      if (options.accountId && account.user_id !== options.accountId) continue;

      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(account.user_id);
      const email = authUser?.user?.email || 'Unknown';

      // Check permissions
      const { data: permissions } = await supabaseAdmin
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', account.user_id);
      const existingPermissions = new Set((permissions || []).map(p => p.permission_name));
      const missingPermissions = STANDARD_OWNER_PERMISSIONS.filter(p => !existingPermissions.has(p));

      // Check business settings
      const { data: businessSettings } = await supabaseAdmin
        .from('business_settings')
        .select('id')
        .eq('user_id', account.user_id)
        .maybeSingle();

      // Check account settings
      const { data: accountSettings } = await supabaseAdmin
        .from('account_settings')
        .select('id')
        .eq('account_owner_id', account.user_id)
        .maybeSingle();

      // Check number sequences
      const { data: sequences } = await supabaseAdmin
        .from('number_sequences')
        .select('entity_type')
        .eq('user_id', account.user_id);
      const existingSequences = new Set((sequences || []).map(s => s.entity_type));
      const missingSequences = STANDARD_SEQUENCES.filter(s => !existingSequences.has(s));

      // Check job statuses
      const { count: jobStatusCount } = await supabaseAdmin
        .from('job_statuses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', account.user_id);

      // Check client stages
      const { count: clientStageCount } = await supabaseAdmin
        .from('client_stages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', account.user_id);

      // Check subscription
      const { data: subscription } = await supabaseAdmin
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', account.user_id)
        .maybeSingle();

      // Check TWC issues - heading_type options that are incorrectly required
      const { count: twcRequiredCount } = await supabaseAdmin
        .from('treatment_options')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', account.user_id)
        .eq('source', 'twc')
        .like('key', 'heading_type%')
        .eq('required', true);

      // Count orphaned TWC options (from deleted accounts)
      const { count: orphanedTwcCount } = await supabaseAdmin
        .from('treatment_options')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', account.user_id)
        .not('account_id', 'in', `(${Array.from(validUserIds).join(',')})`);

      // Calculate health score
      const permissionScore = ((permissions?.length || 0) / STANDARD_OWNER_PERMISSIONS.length) * 35;
      const settingsScore = (businessSettings ? 15 : 0) + (accountSettings ? 10 : 0);
      const sequenceScore = Math.min((sequences?.length || 0) / STANDARD_SEQUENCES.length, 1) * 15;
      const jobStatusScore = (jobStatusCount || 0) > 0 ? 10 : 0;
      const clientStageScore = Math.min((clientStageCount || 0) / EXPECTED_CLIENT_STAGES, 1) * 10;
      const subscriptionScore = subscription ? 5 : 0;
      const healthScore = Math.round(permissionScore + settingsScore + sequenceScore + jobStatusScore + clientStageScore + subscriptionScore);

      // Determine health status
      let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (missingPermissions.length > 10 || !businessSettings) {
        healthStatus = 'critical';
      } else if (missingPermissions.length > 0 || !accountSettings || missingSequences.length > 0 || (jobStatusCount || 0) === 0) {
        healthStatus = 'warning';
      }

      const isCustomAccount = customAccountIds.has(account.user_id);

      accounts.push({
        user_id: account.user_id,
        display_name: account.display_name || 'Unknown',
        email,
        role: account.role,
        created_at: account.created_at,
        health_score: healthScore,
        health_status: healthStatus,
        is_custom_account: isCustomAccount,
        missing_configs: {
          permissions: {
            expected: STANDARD_OWNER_PERMISSIONS.length,
            actual: permissions?.length || 0,
            missing: missingPermissions,
          },
          business_settings: !businessSettings,
          account_settings: !accountSettings,
          number_sequences: {
            expected: STANDARD_SEQUENCES.length,
            actual: sequences?.length || 0,
            missing: missingSequences,
          },
          job_statuses: jobStatusCount || 0,
          client_stages: {
            expected: EXPECTED_CLIENT_STAGES,
            actual: clientStageCount || 0,
            missing: [],
          },
          subscription: !subscription,
        },
        twc_issues: {
          heading_type_required: twcRequiredCount || 0,
          orphaned_options: orphanedTwcCount || 0,
        },
      });

      // Generate fix statements for this account
      if (!isCustomAccount && healthStatus !== 'healthy') {
        if (missingPermissions.length > 0) {
          const permissionValues = missingPermissions
            .map(p => `('${account.user_id}', '${p}')`)
            .join(',\n  ');
          autoFixStatements.push(
            `-- Fix permissions for ${account.display_name}\nINSERT INTO user_permissions (user_id, permission_name) VALUES\n  ${permissionValues}\nON CONFLICT (user_id, permission_name) DO NOTHING;`
          );
        }

        if (!businessSettings) {
          autoFixStatements.push(
            `-- Create business settings for ${account.display_name}\nINSERT INTO business_settings (user_id, measurement_units, tax_type, tax_rate) VALUES ('${account.user_id}', 'mm', 'GST', 15) ON CONFLICT (user_id) DO NOTHING;`
          );
        }

        if (!accountSettings) {
          autoFixStatements.push(
            `-- Create account settings for ${account.display_name}\nINSERT INTO account_settings (account_owner_id, currency, language) VALUES ('${account.user_id}', 'USD', 'en') ON CONFLICT (account_owner_id) DO NOTHING;`
          );
        }

        if (missingSequences.length > 0) {
          const prefixes: Record<string, string> = { job: 'JOB', quote: 'QTE', invoice: 'INV', order: 'ORD', draft: 'DFT' };
          const sequenceValues = missingSequences
            .map(s => `('${account.user_id}', '${s}', '${prefixes[s] || s.toUpperCase()}', 1000, 4)`)
            .join(',\n  ');
          autoFixStatements.push(
            `-- Create number sequences for ${account.display_name}\nINSERT INTO number_sequences (user_id, entity_type, prefix, next_number, padding) VALUES\n  ${sequenceValues}\nON CONFLICT (user_id, entity_type) DO NOTHING;`
          );
        }

        if ((jobStatusCount || 0) === 0) {
          autoFixStatements.push(
            `-- Create job statuses for ${account.display_name}\nINSERT INTO job_statuses (user_id, name, color, is_default, sort_order, status_type) VALUES\n  ('${account.user_id}', 'New', '#3B82F6', true, 1, 'active'),\n  ('${account.user_id}', 'In Progress', '#F59E0B', false, 2, 'active'),\n  ('${account.user_id}', 'Pending', '#8B5CF6', false, 3, 'active'),\n  ('${account.user_id}', 'On Hold', '#6B7280', false, 4, 'active'),\n  ('${account.user_id}', 'Completed', '#10B981', false, 5, 'completed'),\n  ('${account.user_id}', 'Cancelled', '#EF4444', false, 6, 'cancelled');`
          );
        }
      }
    }

    // Find orphaned data
    console.log('[saas-consistency-audit] Checking for orphaned data...');
    
    const { data: orphanedProjects } = await supabaseAdmin
      .from('projects')
      .select('id, user_id')
      .not('user_id', 'in', `(${Array.from(validUserIds).join(',')})`)
      .limit(100);

    const { data: orphanedQuotes } = await supabaseAdmin
      .from('quotes')
      .select('id, user_id')
      .not('user_id', 'in', `(${Array.from(validUserIds).join(',')})`)
      .limit(100);

    const { data: orphanedClients } = await supabaseAdmin
      .from('clients')
      .select('id, user_id')
      .not('user_id', 'in', `(${Array.from(validUserIds).join(',')})`)
      .limit(100);

    const { data: orphanedInventory } = await supabaseAdmin
      .from('enhanced_inventory_items')
      .select('id, user_id')
      .not('user_id', 'in', `(${Array.from(validUserIds).join(',')})`)
      .limit(100);

    const { data: orphanedOptions } = await supabaseAdmin
      .from('treatment_options')
      .select('id, account_id')
      .not('account_id', 'in', `(${Array.from(validUserIds).join(',')})`)
      .limit(200);

    const orphanedData = {
      projects: (orphanedProjects || []).map(p => ({ id: p.id, user_id: p.user_id })),
      quotes: (orphanedQuotes || []).map(q => ({ id: q.id, user_id: q.user_id })),
      clients: (orphanedClients || []).map(c => ({ id: c.id, user_id: c.user_id })),
      inventory_items: (orphanedInventory || []).map(i => ({ id: i.id, user_id: i.user_id })),
      treatment_options: (orphanedOptions || []).map(o => ({ id: o.id, user_id: o.account_id })),
    };

    const totalOrphans = 
      orphanedData.projects.length + 
      orphanedData.quotes.length + 
      orphanedData.clients.length + 
      orphanedData.inventory_items.length +
      orphanedData.treatment_options.length;

    // Add orphan cleanup statements
    if (totalOrphans > 0) {
      autoFixStatements.push(
        `-- Cleanup orphaned data (${totalOrphans} records)\n-- WARNING: This will permanently delete orphaned records\n-- DELETE FROM projects WHERE user_id NOT IN (SELECT user_id FROM user_profiles);\n-- DELETE FROM quotes WHERE user_id NOT IN (SELECT user_id FROM user_profiles);\n-- DELETE FROM clients WHERE user_id NOT IN (SELECT user_id FROM user_profiles);\n-- DELETE FROM enhanced_inventory_items WHERE user_id NOT IN (SELECT user_id FROM user_profiles);\n-- DELETE FROM treatment_options WHERE account_id NOT IN (SELECT user_id FROM user_profiles);`
      );
    }

    const result: AuditSummary = {
      timestamp: new Date().toISOString(),
      summary: {
        total_accounts: accounts.length,
        healthy_accounts: accounts.filter(a => a.health_status === 'healthy').length,
        needs_attention: accounts.filter(a => a.health_status !== 'healthy').length,
        orphaned_records: totalOrphans,
      },
      accounts,
      orphaned_data: orphanedData,
      auto_fix_script: autoFixStatements.join('\n\n'),
    };

    console.log(`[saas-consistency-audit] Audit complete: ${result.summary.healthy_accounts} healthy, ${result.summary.needs_attention} need attention, ${totalOrphans} orphaned records`);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[saas-consistency-audit] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
