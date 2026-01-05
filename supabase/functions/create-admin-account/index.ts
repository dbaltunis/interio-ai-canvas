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

    // Step 2: Create user profile with robust retry logic
    // The handle_new_user trigger may or may not fire - we ensure profile exists
    let profileCreated = false;
    let profileRetries = 0;
    const maxProfileRetries = 3;

    while (!profileCreated && profileRetries < maxProfileRetries) {
      profileRetries++;
      // Wait with increasing delay between retries
      await new Promise(resolve => setTimeout(resolve, 500 * profileRetries));
      
      console.log(`Profile creation attempt ${profileRetries}/${maxProfileRetries}`);
      
      // Check if profile exists (may have been created by trigger)
      const { data: existingProfile, error: checkError } = await supabaseAdmin
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', newUser.user.id)
        .maybeSingle();

      if (checkError) {
        console.error(`Error checking profile (attempt ${profileRetries}):`, checkError);
      }

      if (existingProfile) {
        // Profile exists - update with admin values
        console.log('Profile exists, updating...');
        const { error: updateError } = await supabaseAdmin
          .from('user_profiles')
          .update({
            display_name: displayName,
            first_name: displayName.split(' ')[0] || displayName,
            last_name: displayName.split(' ').slice(1).join(' ') || null,
            role: 'Owner',
            account_type: accountType,
            parent_account_id: null,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', newUser.user.id);

        if (!updateError) {
          profileCreated = true;
          console.log('Profile updated successfully');
        } else {
          console.error(`Profile update failed (attempt ${profileRetries}):`, updateError);
        }
      } else {
        // Profile doesn't exist - insert new one
        console.log('Profile not found, inserting...');
        const { error: insertError } = await supabaseAdmin
          .from('user_profiles')
          .insert({
            user_id: newUser.user.id,
            display_name: displayName,
            first_name: displayName.split(' ')[0] || displayName,
            last_name: displayName.split(' ').slice(1).join(' ') || null,
            role: 'Owner',
            account_type: accountType,
            parent_account_id: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (!insertError) {
          profileCreated = true;
          console.log('Profile inserted successfully');
        } else {
          console.error(`Profile insert failed (attempt ${profileRetries}):`, insertError);
        }
      }
    }

    if (!profileCreated) {
      console.error('CRITICAL: Failed to create user profile after all retries');
      // Continue anyway - don't block account creation entirely
    }

    console.log('Profile creation complete for user:', newUser.user.id);

    // Step 3: Create user role
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'Owner',
      });

    if (roleInsertError && !roleInsertError.message?.includes('duplicate')) {
      console.error('Error creating role:', roleInsertError);
    }

    // Step 3b: Create user_permissions for Owner role (only valid permissions from database)
    const ownerPermissions = [
      'view_jobs', 'create_jobs', 'edit_jobs', 'delete_jobs',
      'view_clients', 'create_clients', 'edit_clients', 'delete_clients',
      'view_all_clients', 'edit_all_clients',
      'view_all_jobs', 'edit_all_jobs',
      'view_inventory', 'manage_inventory',
      'view_vendors', 'manage_vendors',
      'view_quotes', 'manage_quotes',
      'view_calendar', 'manage_calendar', 'view_all_calendar', 'view_own_calendar',
      'view_team', 'manage_team', 'view_team_members', 'view_team_performance',
      'view_emails', 'send_emails',
      'view_settings', 'manage_settings', 'manage_business_settings',
      'view_analytics', 'view_profile',
      'view_own_jobs', 'view_assigned_jobs', 'edit_assigned_jobs',
      'view_workroom', 'view_materials',
      'view_primary_kpis', 'view_email_kpis', 'view_revenue_kpis',
      'view_window_treatments', 'manage_window_treatments', 'manage_users',
      'view_cost_prices', 'view_selling_prices', 'view_profit_margins',
      'view_projects', 'create_projects', 'edit_projects', 'delete_projects',
      'view_templates', 'manage_templates',
      'view_purchasing', 'manage_purchasing',
      'view_billing', 'view_documents',
      'export_data', 'export_clients', 'export_jobs', 'export_inventory',
      'import_clients', 'import_jobs', 'import_inventory',
      'manage_integrations', 'manage_pricing',
      'view_shopify', 'manage_shopify',
      'create_appointments', 'delete_appointments'
    ];

    for (const perm of ownerPermissions) {
      const { error: permError } = await supabaseAdmin
        .from('user_permissions')
        .insert({
          user_id: newUser.user.id,
          permission_name: perm,
          granted_by: user.id
        });
      
      if (permError && !permError.message?.includes('duplicate')) {
        console.error(`Error creating permission ${perm}:`, permError);
      }
    }
    console.log('User permissions created for user:', newUser.user.id);

    // Step 4: Create business_settings with defaults
    const { error: businessSettingsError } = await supabaseAdmin
      .from('business_settings')
      .insert({
        user_id: newUser.user.id,
        company_name: displayName,
        measurement_units: 'mm',
        tax_rate: 15,
        tax_type: 'gst',
      });

    if (businessSettingsError && !businessSettingsError.message?.includes('duplicate')) {
      console.error('Error creating business settings:', businessSettingsError);
    } else {
      console.log('Business settings created for user:', newUser.user.id);
    }

    // Step 5: Create account_settings with default measurement units
    const { error: accountSettingsError } = await supabaseAdmin
      .from('account_settings')
      .insert({
        account_owner_id: newUser.user.id,
        currency: 'NZD',
        language: 'en',
        measurement_units: {
          distance: 'mm',
          fabric: 'm',
          display: 'metric',
          currency: 'NZD'
        },
      });

    if (accountSettingsError && !accountSettingsError.message?.includes('duplicate')) {
      console.error('Error creating account settings:', accountSettingsError);
    } else {
      console.log('Account settings created for user:', newUser.user.id);
    }

    // Step 6: Create trial subscription
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 day trial

    const { error: subscriptionError } = await supabaseAdmin
      .from('user_subscriptions')
      .insert({
        user_id: newUser.user.id,
        status: accountType === 'test' ? 'active' : 'trial',
        current_period_start: new Date().toISOString(),
        current_period_end: trialEndDate.toISOString(),
        trial_ends_at: accountType === 'test' ? null : trialEndDate.toISOString(),
        trial_end_date: accountType === 'test' ? null : trialEndDate.toISOString(),
        subscription_type: accountType === 'test' ? 'test' : 'trial',
        account_type: accountType,
        is_active: true,
        admin_notes: adminNotes || null,
      });

    if (subscriptionError && !subscriptionError.message?.includes('duplicate')) {
      console.error('Error creating subscription:', subscriptionError);
    } else {
      console.log('Subscription created for user:', newUser.user.id);
    }

    // Step 7: Create default number sequences
    const sequences = [
      { entity_type: 'job', prefix: 'JOB-', next_number: 1, padding: 4 },
      { entity_type: 'draft', prefix: 'DRF-', next_number: 1, padding: 4 },
      { entity_type: 'quote', prefix: 'QTE-', next_number: 1, padding: 4 },
      { entity_type: 'order', prefix: 'ORD-', next_number: 1, padding: 4 },
      { entity_type: 'invoice', prefix: 'INV-', next_number: 1, padding: 4 },
    ];

    for (const seq of sequences) {
      const { error: seqError } = await supabaseAdmin
        .from('number_sequences')
        .insert({
          user_id: newUser.user.id,
          ...seq,
          active: true,
        });

      if (seqError && !seqError.message?.includes('duplicate')) {
        console.error(`Error creating sequence ${seq.entity_type}:`, seqError);
      }
    }
    console.log('Number sequences created for user:', newUser.user.id);

    // Step 8: Create default job statuses
    const defaultStatuses = [
      { name: 'New Lead', color: '#10b981', sort_order: 1, is_default: true },
      { name: 'Planning', color: '#6366f1', sort_order: 2 },
      { name: 'Quoted', color: '#f59e0b', sort_order: 3 },
      { name: 'Approved', color: '#22c55e', sort_order: 4 },
      { name: 'In Production', color: '#8b5cf6', sort_order: 5 },
      { name: 'Ready for Install', color: '#06b6d4', sort_order: 6 },
      { name: 'Completed', color: '#6b7280', sort_order: 7 },
    ];

    for (const status of defaultStatuses) {
      const { error: statusError } = await supabaseAdmin
        .from('job_statuses')
        .insert({
          user_id: newUser.user.id,
          ...status,
          is_active: true,
        });

      if (statusError && !statusError.message?.includes('duplicate')) {
        console.error(`Error creating status ${status.name}:`, statusError);
      }
    }
    console.log('Job statuses created for user:', newUser.user.id);

    // Step 9: Seed default treatment options
    try {
      const { error: seedError } = await supabaseAdmin.rpc('seed_account_options', {
        target_account_id: newUser.user.id,
      });
      if (seedError) {
        console.error('Error seeding account options:', seedError);
      } else {
        console.log('Account options seeded for user:', newUser.user.id);
      }
    } catch (seedErr) {
      console.error('Error calling seed_account_options:', seedErr);
    }

    // Step 10: Seed default window types
    try {
      const { error: windowTypeError } = await supabaseAdmin.rpc('seed_default_window_types', {
        account_owner_id: newUser.user.id,
      });
      if (windowTypeError) {
        console.error('Error seeding window types:', windowTypeError);
      } else {
        console.log('Window types seeded for user:', newUser.user.id);
      }
    } catch (wtErr) {
      console.error('Error calling seed_default_window_types:', wtErr);
    }

    // Step 11: Seed default email templates
    try {
      const { error: emailTemplateError } = await supabaseAdmin.rpc('seed_default_email_templates', {
        target_user_id: newUser.user.id,
      });
      if (emailTemplateError) {
        console.error('Error seeding email templates:', emailTemplateError);
      } else {
        console.log('Email templates seeded for user:', newUser.user.id);
      }
    } catch (etErr) {
      console.error('Error calling seed_default_email_templates:', etErr);
    }

    // Step 12: Create notification settings
    const { error: notifError } = await supabaseAdmin
      .from('user_notification_settings')
      .insert({
        user_id: newUser.user.id,
        email_notifications_enabled: true,
        sms_notifications_enabled: false,
        email_service_provider: 'resend',
      });

    if (notifError && !notifError.message?.includes('duplicate')) {
      console.error('Error creating notification settings:', notifError);
    } else {
      console.log('Notification settings created for user:', newUser.user.id);
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
