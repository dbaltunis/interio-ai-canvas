import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    console.log("Starting repair of broken invitation accounts...");

    // Find all users who were invited but have wrong role/parent
    const { data: brokenAccounts, error: queryError } = await supabaseAdmin.rpc('execute_sql', {
      query: `
        SELECT 
          up.user_id,
          up.display_name,
          up.role as current_role,
          up.parent_account_id as current_parent,
          ui.role as should_be_role,
          ui.invited_by_email,
          ui.invitation_token
        FROM user_profiles up
        JOIN user_invitations ui ON ui.invited_email = (
          SELECT email FROM auth.users WHERE id = up.user_id
        )
        WHERE ui.status = 'accepted'
          AND (
            (up.role = 'Owner' AND ui.role != 'Owner')
            OR (up.parent_account_id IS NULL AND ui.role IN ('Staff', 'Admin', 'Manager'))
          )
        ORDER BY up.created_at DESC
      `
    });

    if (queryError) {
      console.error("Error finding broken accounts:", queryError);
      
      // Fallback: manually query
      const { data: profiles } = await supabaseAdmin
        .from('user_profiles')
        .select('user_id, display_name, role, parent_account_id')
        .eq('role', 'Owner');
      
      const { data: invitations } = await supabaseAdmin
        .from('user_invitations')
        .select('invited_email, role, invited_by_email, invitation_token')
        .eq('status', 'accepted')
        .neq('role', 'Owner');

      // Manual matching
      const broken = [];
      for (const profile of profiles || []) {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
        if (authUser?.user) {
          const invitation = invitations?.find(inv => inv.invited_email === authUser.user.email);
          if (invitation) {
            broken.push({
              user_id: profile.user_id,
              display_name: profile.display_name,
              current_role: profile.role,
              current_parent: profile.parent_account_id,
              should_be_role: invitation.role,
              invited_by_email: invitation.invited_by_email,
              invitation_token: invitation.invitation_token
            });
          }
        }
      }
      
      return await repairAccounts(supabaseAdmin, broken);
    }

    return await repairAccounts(supabaseAdmin, brokenAccounts || []);

  } catch (error) {
    console.error("Error in repair-broken-invitations:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function repairAccounts(supabaseAdmin: any, brokenAccounts: any[]) {
  const results = {
    total: brokenAccounts.length,
    repaired: 0,
    failed: 0,
    details: [] as any[]
  };

  console.log(`Found ${brokenAccounts.length} broken accounts to repair`);

  for (const account of brokenAccounts) {
    console.log(`Repairing user ${account.display_name} (${account.user_id})`);
    console.log(`  Current: ${account.current_role}, Should be: ${account.should_be_role}`);
    
    try {
      // Use the accept_user_invitation function which now handles fixing broken accounts
      const { data: result, error } = await supabaseAdmin.rpc('accept_user_invitation', {
        invitation_token_param: account.invitation_token,
        user_id_param: account.user_id
      });

      if (error) {
        console.error(`Failed to repair ${account.display_name}:`, error);
        results.failed++;
        results.details.push({
          user_id: account.user_id,
          display_name: account.display_name,
          status: 'failed',
          error: error.message
        });
      } else {
        console.log(`Successfully repaired ${account.display_name}`);
        results.repaired++;
        results.details.push({
          user_id: account.user_id,
          display_name: account.display_name,
          status: 'repaired',
          from_role: account.current_role,
          to_role: account.should_be_role
        });
      }
    } catch (err: any) {
      console.error(`Exception repairing ${account.display_name}:`, err);
      results.failed++;
      results.details.push({
        user_id: account.user_id,
        display_name: account.display_name,
        status: 'failed',
        error: err.message
      });
    }
  }

  console.log(`Repair complete. Repaired: ${results.repaired}, Failed: ${results.failed}`);

  return new Response(
    JSON.stringify(results),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
