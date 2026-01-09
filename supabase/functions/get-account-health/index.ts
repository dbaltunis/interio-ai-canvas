import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AccountHealth {
  user_id: string;
  display_name: string;
  email: string;
  role: string;
  created_at: string;
  health_status: 'healthy' | 'warning' | 'critical';
  health_score: number;
  metrics: {
    permission_count: number;
    expected_permissions: number;
    has_business_settings: boolean;
    has_account_settings: boolean;
    sequence_count: number;
    expected_sequences: number;
    job_status_count: number;
    subscription_status: string | null;
    stripe_subscription_id: string | null;
    trial_ends_at: string | null;
  };
  issues: string[];
}

interface HealthSummary {
  total_accounts: number;
  healthy_accounts: number;
  warning_accounts: number;
  critical_accounts: number;
  accounts: AccountHealth[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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

    // Verify the user is a System Owner
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
      .select('is_system_owner')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile?.is_system_owner) {
      return new Response(
        JSON.stringify({ error: 'Access denied. System Owner required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[get-account-health] Fetching health data for all Owner accounts...');

    // Fetch all Owner accounts
    const { data: ownerAccounts, error: accountsError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, display_name, role, created_at')
      .eq('role', 'Owner')
      .order('created_at', { ascending: false });

    if (accountsError) {
      console.error('[get-account-health] Error fetching accounts:', accountsError);
      throw accountsError;
    }

    console.log(`[get-account-health] Found ${ownerAccounts?.length || 0} Owner accounts`);

    const accounts: AccountHealth[] = [];
    const expectedPermissions = 77;
    const expectedSequences = 5;

    for (const account of ownerAccounts || []) {
      // Fetch email from auth.users
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(account.user_id);
      const email = authUser?.user?.email || 'Unknown';

      // Fetch permission count
      const { count: permissionCount } = await supabaseAdmin
        .from('user_permissions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', account.user_id);

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
      const { count: sequenceCount } = await supabaseAdmin
        .from('number_sequences')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', account.user_id);

      // Check job statuses
      const { count: jobStatusCount } = await supabaseAdmin
        .from('job_statuses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', account.user_id);

      // Check subscription
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('status, stripe_subscription_id, trial_end')
        .eq('user_id', account.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Calculate issues and health status
      const issues: string[] = [];
      const actualPermissions = permissionCount || 0;
      const actualSequences = sequenceCount || 0;
      const actualJobStatuses = jobStatusCount || 0;

      if (actualPermissions < expectedPermissions) {
        issues.push(`Missing permissions: ${actualPermissions}/${expectedPermissions}`);
      }
      if (!businessSettings) {
        issues.push('Missing business settings');
      }
      if (!accountSettings) {
        issues.push('Missing account settings');
      }
      if (actualSequences < expectedSequences) {
        issues.push(`Missing sequences: ${actualSequences}/${expectedSequences}`);
      }
      if (actualJobStatuses === 0) {
        issues.push('No job statuses configured');
      }
      if (!subscription) {
        issues.push('No subscription record');
      }

      // Calculate health score (0-100)
      const permissionScore = (actualPermissions / expectedPermissions) * 40;
      const settingsScore = (businessSettings ? 15 : 0) + (accountSettings ? 10 : 0);
      const sequenceScore = Math.min(actualSequences / expectedSequences, 1) * 20;
      const jobStatusScore = actualJobStatuses > 0 ? 15 : 0;
      const healthScore = Math.round(permissionScore + settingsScore + sequenceScore + jobStatusScore);

      // Determine health status
      let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (actualPermissions < expectedPermissions || !businessSettings) {
        healthStatus = 'critical';
      } else if (!accountSettings || actualSequences < expectedSequences || actualJobStatuses === 0 || !subscription) {
        healthStatus = 'warning';
      }

      accounts.push({
        user_id: account.user_id,
        display_name: account.display_name || 'Unknown',
        email,
        role: account.role,
        created_at: account.created_at,
        health_status: healthStatus,
        health_score: healthScore,
        metrics: {
          permission_count: actualPermissions,
          expected_permissions: expectedPermissions,
          has_business_settings: !!businessSettings,
          has_account_settings: !!accountSettings,
          sequence_count: actualSequences,
          expected_sequences: expectedSequences,
          job_status_count: actualJobStatuses,
          subscription_status: subscription?.status || null,
          stripe_subscription_id: subscription?.stripe_subscription_id || null,
          trial_ends_at: subscription?.trial_end || null,
        },
        issues,
      });
    }

    // Calculate summary
    const summary: HealthSummary = {
      total_accounts: accounts.length,
      healthy_accounts: accounts.filter(a => a.health_status === 'healthy').length,
      warning_accounts: accounts.filter(a => a.health_status === 'warning').length,
      critical_accounts: accounts.filter(a => a.health_status === 'critical').length,
      accounts,
    };

    console.log(`[get-account-health] Health summary: ${summary.healthy_accounts} healthy, ${summary.warning_accounts} warning, ${summary.critical_accounts} critical`);

    return new Response(
      JSON.stringify(summary),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[get-account-health] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
