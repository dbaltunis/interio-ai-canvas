import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateAccountRequest {
  email: string;
  displayName: string;
  accountType: 'production' | 'test' | 'partner' | 'reseller' | 'internal';
  subscriptionPlanId?: string;
  temporaryPassword: string;
  adminNotes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client to verify user
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the JWT token and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    // Check if user is System Owner
    const { data: userRole, error: roleCheckError } = await supabaseAdmin
      .rpc('get_user_role', { _user_id: user.id });

    if (roleCheckError || userRole !== 'System Owner') {
      console.error('Not authorized - not a System Owner. Role:', userRole, 'Error:', roleCheckError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - System Owner role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData: CreateAccountRequest = await req.json();
    const { email, displayName, accountType, subscriptionPlanId, temporaryPassword, adminNotes } = requestData;

    console.log('Creating account for:', email, 'by admin:', user.id);

    // Step 1: Create auth user
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirm email for admin-created accounts
      user_metadata: {
        display_name: displayName,
        account_type: accountType,
        created_by_admin: true,
        created_by_admin_id: user.id,
      },
    });

    if (createUserError || !newUser.user) {
      console.error('Error creating user:', createUserError);
      throw new Error(`Failed to create user: ${createUserError?.message}`);
    }

    console.log('User created:', newUser.user.id);

    // Step 2: Create user profile
    const { error: profileInsertError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: newUser.user.id,
        display_name: displayName,
        email: email,
        role: 'Owner', // New accounts are owners of their account
        account_type: accountType,
        parent_account_id: null, // This is a parent account
        onboarding_completed: false,
      });

    if (profileInsertError) {
      console.error('Error creating profile:', profileInsertError);
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      throw new Error(`Failed to create profile: ${profileInsertError.message}`);
    }

    console.log('Profile created for user:', newUser.user.id);

    // Step 3: Create user role
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'Owner',
      });

    if (roleInsertError) {
      console.error('Error creating role:', roleInsertError);
      // Note: We continue even if role creation fails, as it might be auto-created by triggers
    }

    // Step 4: Create trial subscription
    let planId = subscriptionPlanId;
    
    // If no plan specified, get the default trial/free plan
    if (!planId) {
      const { data: defaultPlan } = await supabaseAdmin
        .from('subscription_plans')
        .select('id')
        .eq('name', 'Free')
        .single();
      
      planId = defaultPlan?.id;
    }

    if (planId) {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 day trial

      const { error: subscriptionError } = await supabaseAdmin
        .from('user_subscriptions')
        .insert({
          user_id: newUser.user.id,
          plan_id: planId,
          status: accountType === 'test' ? 'active' : 'trial',
          current_period_start: new Date().toISOString(),
          current_period_end: trialEndDate.toISOString(),
          trial_ends_at: accountType === 'test' ? null : trialEndDate.toISOString(),
          subscription_type: accountType === 'test' ? 'test' : 'standard',
          admin_notes: adminNotes || null,
        });

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        // Don't rollback for subscription errors
      } else {
        console.log('Subscription created for user:', newUser.user.id);
      }
    }

    // Step 5: Log audit trail
    await supabaseAdmin
      .from('audit_log')
      .insert({
        user_id: user.id,
        action: 'CREATE',
        table_name: 'user_profiles',
        record_id: newUser.user.id,
        new_data: {
          email,
          displayName,
          accountType,
          created_by_admin: true,
        },
      });

    console.log('Account created successfully:', newUser.user.id);

    // Step 6: Send welcome email (optional - implement later)
    // TODO: Call email service to send welcome email with temporary password

    return new Response(
      JSON.stringify({
        success: true,
        userId: newUser.user.id,
        email: email,
        message: 'Account created successfully',
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in create-admin-account:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
