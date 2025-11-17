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

    // Step 2: Update user profile (it may have been auto-created by trigger)
    const { error: profileUpsertError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id: newUser.user.id,
        display_name: displayName,
        role: 'Owner', // New accounts are owners of their account
        account_type: accountType,
        parent_account_id: null, // This is a parent account
      }, {
        onConflict: 'user_id'
      });

    if (profileUpsertError) {
      console.error('Error updating profile:', profileUpsertError);
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      throw new Error(`Failed to update profile: ${profileUpsertError.message}`);
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

    // Step 6: Send welcome email with temporary password
    try {
      // Get admin's account owner to fetch integration settings
      const { data: adminAccountOwnerId } = await supabaseAdmin.rpc('get_account_owner', {
        user_id_param: user.id
      });

      // Get SendGrid integration settings
      const { data: sendGridIntegration, error: integrationError } = await supabaseAdmin
        .from('integration_settings')
        .select('configuration')
        .eq('account_owner_id', adminAccountOwnerId || user.id)
        .eq('integration_type', 'sendgrid')
        .eq('active', true)
        .maybeSingle();

      if (integrationError) {
        console.error('Error fetching SendGrid integration:', integrationError);
        throw new Error('SendGrid integration not found');
      }

      // Check both configuration and api_credentials for backward compatibility
      const apiKey = (sendGridIntegration.configuration as any)?.api_key || 
                     (sendGridIntegration.api_credentials as any)?.api_key;
      
      if (!apiKey) {
        throw new Error('SendGrid API key not configured');
      }

      // Get email settings
      const { data: emailSettings } = await supabaseAdmin
        .from('email_settings')
        .select('*')
        .eq('account_owner_id', adminAccountOwnerId || user.id)
        .maybeSingle();

      if (!emailSettings?.from_email) {
        throw new Error('Email settings not configured');
      }

      // Prepare email content
      const emailSubject = 'Welcome to Your New Account';
      const emailHtml = `
        <h2>Welcome to Your New Account!</h2>
        <p>Hello ${displayName},</p>
        <p>Your account has been created successfully. Here are your login credentials:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
        </div>
        <p><strong>Important:</strong> Please change your password after your first login.</p>
        <p>You can log in at: <a href="${Deno.env.get('SITE_URL') || 'https://ldgrcodffsalkevafbkb.supabase.co'}">${Deno.env.get('SITE_URL') || 'https://ldgrcodffsalkevafbkb.supabase.co'}</a></p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>Your Team</p>
      `;

      // Send email via SendGrid using the apiKey we found earlier
      const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: email, name: displayName }],
          }],
          from: {
            email: emailSettings.from_email,
            name: emailSettings.from_name || 'Your Team',
          },
          subject: emailSubject,
          content: [{
            type: 'text/html',
            value: emailHtml,
          }],
          tracking_settings: {
            click_tracking: {
              enable: false,
            },
          },
        }),
      });

      if (!sendGridResponse.ok) {
        const errorText = await sendGridResponse.text();
        console.error('SendGrid error:', errorText);
        throw new Error(`Failed to send welcome email: ${errorText}`);
      }

      console.log('Welcome email sent successfully to:', email);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the account creation if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId: newUser.user.id,
        email: email,
        message: 'Account created successfully and welcome email sent',
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
