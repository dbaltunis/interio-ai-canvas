import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Verify caller is System Owner
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is System Owner
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || profile?.role !== 'System Owner') {
      throw new Error('Unauthorized: System Owner access required');
    }

    console.log('✅ System Owner verified:', user.email);

    // Get filters from request
    const { accountType, subscriptionStatus, search } = await req.json().catch(() => ({}));

    // Get all parent accounts (account owners)
    let query = supabaseAdmin
      .from('user_profiles')
      .select('user_id, display_name, account_type, parent_account_id, created_at')
      .is('parent_account_id', null)
      .order('created_at', { ascending: false });

    if (accountType) {
      query = query.eq('account_type', accountType);
    }

    const { data: profiles, error: profilesError } = await query;
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log(`📊 Found ${profiles.length} parent accounts`);

    // Get all data in parallel for each account
    const accounts = await Promise.all(
      profiles.map(async (profile) => {
        try {
          // Get email from auth.users using service role
          const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(
            profile.user_id
          );
          
          if (authError) {
            console.error(`Error fetching user ${profile.user_id}:`, authError);
          }

          const email = authUser?.user?.email || `user-${profile.user_id.slice(0, 8)}`;

          // Get subscription
          const { data: subscription } = await supabaseAdmin
            .from('user_subscriptions')
            .select('*, subscription_plans(*)')
            .eq('user_id', profile.user_id)
            .maybeSingle();

          // Get team members count
          const { count: teamMembersCount } = await supabaseAdmin
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('parent_account_id', profile.user_id);

          return {
            user_id: profile.user_id,
            display_name: profile.display_name,
            email,
            account_type: profile.account_type,
            parent_account_id: profile.parent_account_id,
            created_at: profile.created_at,
            subscription: subscription || null,
            team_members_count: teamMembersCount || 0,
          };
        } catch (error) {
          console.error(`Error processing account ${profile.user_id}:`, error);
          return null;
        }
      })
    );

    // Filter out any null results from errors
    let filteredAccounts = accounts.filter(acc => acc !== null);

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAccounts = filteredAccounts.filter(
        (acc) =>
          acc.display_name?.toLowerCase().includes(searchLower) ||
          acc.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply subscription status filter
    if (subscriptionStatus) {
      filteredAccounts = filteredAccounts.filter(
        (acc) => acc.subscription?.status === subscriptionStatus
      );
    }

    console.log(`✅ Returning ${filteredAccounts.length} accounts after filters`);

    return new Response(
      JSON.stringify({ accounts: filteredAccounts }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in get-admin-accounts:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        accounts: []
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 with empty array instead of error
      }
    );
  }
});
