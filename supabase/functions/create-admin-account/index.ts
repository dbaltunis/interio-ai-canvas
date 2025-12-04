import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from 'npm:resend@2.0.0';

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
      const siteUrl = Deno.env.get('SITE_URL') || 'https://ldgrcodffsalkevafbkb.supabase.co';
      const brandName = Deno.env.get('BRAND_NAME') || 'InterioApp';
      
      // Get admin's account owner to fetch integration settings (optional custom SendGrid)
      const { data: adminAccountOwnerId } = await supabaseAdmin.rpc('get_account_owner', {
        user_id_param: user.id
      });

      // Check for optional custom SendGrid
      const { data: sendGridIntegration } = await supabaseAdmin
        .from('integration_settings')
        .select('api_credentials')
        .eq('account_owner_id', adminAccountOwnerId || user.id)
        .eq('integration_type', 'sendgrid')
        .eq('active', true)
        .maybeSingle();

      const useCustomSendGrid = !!sendGridIntegration?.api_credentials?.api_key;
      console.log('Email provider:', useCustomSendGrid ? 'Custom SendGrid' : 'Shared Resend');

      // Prepare email content
      const emailSubject = `Welcome to ${brandName}!`;
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0; padding:0; background:#f8f9fa; font-family: Arial, sans-serif;">
          <table width="100%" cellspacing="0" cellpadding="0" style="background:#f8f9fa; padding:20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellspacing="0" cellpadding="0" style="max-width:600px; background:#ffffff; border-radius:8px;">
                  <tr>
                    <td style="padding:40px 28px;">
                      <h2 style="margin:0 0 20px; color:#333;">Welcome to ${brandName}!</h2>
                      <p style="margin:0 0 20px; font-size:16px;">Hello ${displayName},</p>
                      <p style="margin:0 0 24px; font-size:16px;">Your account has been created successfully. Here are your login credentials:</p>
                      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin:0 0 12px;"><strong>Email:</strong> ${email}</p>
                        <p style="margin:0;"><strong>Temporary Password:</strong> <code style="background:#fff; padding:4px 8px; border-radius:4px;">${temporaryPassword}</code></p>
                      </div>
                      <p style="margin:0 0 24px; font-size:16px;"><strong>Important:</strong> Please change your password after your first login.</p>
                      <table width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 32px;">
                        <tr>
                          <td align="center">
                            <a href="${siteUrl}" style="display:inline-block; padding:16px 32px; background:#415e6b; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:16px;">Login Now</a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0; font-size:14px; color:#666;">If you have any questions, please don't hesitate to contact us.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 28px; background:#f8f9fa; border-top:1px solid #e8ecef; border-radius:0 0 8px 8px;">
                      <p style="margin:0; font-size:12px; color:#95a5a6; text-align:center;">© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      if (useCustomSendGrid) {
        // Use custom SendGrid for branding
        const apiKey = sendGridIntegration.api_credentials.api_key;
        
        // Get email settings for custom from address
        const { data: emailSettings } = await supabaseAdmin
          .from('email_settings')
          .select('*')
          .eq('account_owner_id', adminAccountOwnerId || user.id)
          .maybeSingle();

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
              email: emailSettings?.from_email || 'noreply@example.com',
              name: emailSettings?.from_name || brandName,
            },
            subject: emailSubject,
            content: [{
              type: 'text/html',
              value: emailHtml,
            }],
          }),
        });

        if (!sendGridResponse.ok) {
          const errorText = await sendGridResponse.text();
          console.error('SendGrid error:', errorText);
          throw new Error(`SendGrid error: ${sendGridResponse.status}`);
        }
        console.log('Welcome email sent via custom SendGrid to:', email);
      } else {
        // Use shared Resend (default - works for all accounts)
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
          throw new Error('RESEND_API_KEY not configured');
        }

        const resend = new Resend(resendApiKey);
        const { error: resendError } = await resend.emails.send({
          from: `${brandName} <noreply@interioapp.com>`,
          to: [email],
          subject: emailSubject,
          html: emailHtml,
        });

        if (resendError) {
          console.error('Resend error:', resendError);
          // Log failed email to database
          await supabaseAdmin.from('emails').insert({
            user_id: newUser.user.id,
            recipient_email: email,
            subject: emailSubject,
            content: emailHtml,
            status: 'failed',
            bounce_reason: resendError.message,
          });
          throw new Error(`Failed to send welcome email: ${resendError.message}`);
        }
        
        // Log successful email to database
        await supabaseAdmin.from('emails').insert({
          user_id: newUser.user.id,
          recipient_email: email,
          subject: emailSubject,
          content: emailHtml,
          status: 'sent',
          sent_at: new Date().toISOString(),
        });
        console.log('Welcome email sent via shared Resend to:', email);
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Log error email to database if we have user id
      try {
        await supabaseAdmin.from('emails').insert({
          user_id: newUser.user.id,
          recipient_email: email,
          subject: emailSubject,
          content: emailHtml,
          status: 'failed',
          bounce_reason: emailError instanceof Error ? emailError.message : 'Unknown error',
        });
      } catch (logErr) {
        console.error('Failed to log email error:', logErr);
      }
      console.warn('Account created but welcome email not sent for:', email);
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
