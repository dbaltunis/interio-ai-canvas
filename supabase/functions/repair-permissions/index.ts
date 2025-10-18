import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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

    console.log('🔧 Starting permission repair job...');

    // Find users with roles but no permissions
    const { data: brokenUsers, error: queryError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, role, display_name')
      .not('role', 'is', null)
      .not('role', 'eq', 'User'); // User role may have minimal permissions

    if (queryError) {
      console.error('❌ Query error:', queryError);
      throw queryError;
    }

    console.log(`📊 Found ${brokenUsers?.length || 0} users with roles`);

    // Check which users are missing permissions
    const usersFixed = [];
    const usersFailed = [];

    for (const userProfile of brokenUsers || []) {
      try {
        // Check if user has any permissions
        const { data: existingPerms, error: permError } = await supabaseAdmin
          .from('user_permissions')
          .select('permission_name')
          .eq('user_id', userProfile.user_id);

        if (permError) {
          console.error(`❌ Error checking permissions for ${userProfile.user_id}:`, permError);
          usersFailed.push({ user_id: userProfile.user_id, error: permError.message });
          continue;
        }

        // If user has no permissions or very few, repair them
        if (!existingPerms || existingPerms.length === 0) {
          console.log(`🔧 Repairing permissions for ${userProfile.display_name} (${userProfile.role})`);

          const { data: repairResult, error: repairError } = await supabaseAdmin
            .rpc('fix_user_permissions_for_role', {
              target_user_id: userProfile.user_id
            });

          if (repairError) {
            console.error(`❌ Repair failed for ${userProfile.user_id}:`, repairError);
            usersFailed.push({ 
              user_id: userProfile.user_id, 
              display_name: userProfile.display_name,
              error: repairError.message 
            });
          } else {
            console.log(`✅ Repaired ${userProfile.display_name}:`, repairResult);
            usersFixed.push({
              user_id: userProfile.user_id,
              display_name: userProfile.display_name,
              role: userProfile.role,
              permissions_added: repairResult.permissions_added
            });

            // Send notification to user
            await supabaseAdmin
              .from('notifications')
              .insert({
                user_id: userProfile.user_id,
                title: 'Access Restored',
                message: `Your ${userProfile.role} permissions have been restored. Please refresh the page to see the changes.`,
                type: 'system',
                priority: 'high',
                created_at: new Date().toISOString()
              })
              .catch(notifErr => {
                console.warn('Failed to send notification:', notifErr);
              });
          }
        }
      } catch (userError) {
        console.error(`❌ Error processing user ${userProfile.user_id}:`, userError);
        usersFailed.push({ 
          user_id: userProfile.user_id, 
          error: userError.message 
        });
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      total_users_checked: brokenUsers?.length || 0,
      users_repaired: usersFixed.length,
      users_failed: usersFailed.length,
      repaired_users: usersFixed,
      failed_users: usersFailed
    };

    console.log('📋 Repair job complete:', summary);

    return new Response(
      JSON.stringify(summary),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('❌ Fatal error in repair job:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
