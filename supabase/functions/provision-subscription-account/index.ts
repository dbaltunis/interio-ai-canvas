import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROVISION-SUBSCRIPTION-ACCOUNT] ${step}${detailsStr}`);
};

// Default Starter plan ID - used for paid subscriptions
const STARTER_PLAN_ID = "bbebd0c6-88a5-4c37-8a10-ab51b5d9b94c";

// Generate a secure temporary password
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { sessionId, subscriptionId, email: manualEmail, clientName: manualClientName } = await req.json();
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let customerEmail: string | null = null;
    let subscriptionData: Stripe.Subscription | null = null;
    let customerId: string | null = null;
    let seats = 1;
    let clientName = "";

    // Mode 1: Provision via checkout session ID (normal flow)
    if (sessionId) {
      logStep("Verifying checkout session", { sessionId });

      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'customer'],
      });

      if (session.payment_status !== 'paid') {
        throw new Error("Payment not completed");
      }

      logStep("Payment verified", { 
        customerEmail: session.customer_email,
        paymentStatus: session.payment_status 
      });

      customerEmail = session.customer_email;
      subscriptionData = session.subscription as Stripe.Subscription;
      customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;
      clientName = session.metadata?.client_name || customerEmail?.split('@')[0] || "User";
      seats = parseInt(session.metadata?.seats || '1', 10);
    }
    // Mode 2: Provision via subscription ID (manual recovery)
    else if (subscriptionId) {
      logStep("Manual recovery via subscription ID", { subscriptionId });

      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['customer'],
      });

      if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        throw new Error(`Subscription is not active (status: ${subscription.status})`);
      }

      subscriptionData = subscription;
      const customer = subscription.customer as Stripe.Customer;
      customerEmail = customer.email;
      customerId = customer.id;
      clientName = customer.name || customer.email?.split('@')[0] || "User";
      seats = subscription.items.data[0]?.quantity || 1;

      logStep("Subscription verified", { customerEmail, status: subscription.status });
    }
    // Mode 3: Manual provision with email (admin override)
    else if (manualEmail) {
      logStep("Manual admin provision", { email: manualEmail });
      customerEmail = manualEmail;
      clientName = manualClientName || manualEmail.split('@')[0];
    }
    else {
      throw new Error("Session ID, Subscription ID, or email is required");
    }

    if (!customerEmail) {
      throw new Error("Customer email not found");
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === customerEmail);

    if (existingUser) {
      logStep("User already exists", { userId: existingUser.id });
      
      // Check if they already have a subscription record
      const { data: existingSub } = await supabaseAdmin
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', existingUser.id)
        .single();

      if (!existingSub && subscriptionData) {
        // Create subscription record for existing user
        const { error: subError } = await supabaseAdmin.from('user_subscriptions').insert({
          user_id: existingUser.id,
          plan_id: STARTER_PLAN_ID,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionData?.id,
          status: 'active',
          current_period_start: subscriptionData?.current_period_start 
            ? new Date(subscriptionData.current_period_start * 1000).toISOString()
            : new Date().toISOString(),
          current_period_end: subscriptionData?.current_period_end
            ? new Date(subscriptionData.current_period_end * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

        if (subError) {
          logStep("ERROR creating subscription for existing user", { error: subError.message });
          throw new Error(`Failed to create subscription: ${subError.message}`);
        }

        logStep("Subscription record created for existing user");
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Account already exists - please login",
        existingUser: true,
        email: customerEmail
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create new user account
    const temporaryPassword = generateSecurePassword();

    logStep("Creating new user account", { email: customerEmail, clientName, seats });

    // Step 1: Create auth user
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: customerEmail,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        display_name: clientName,
        account_type: 'production',
        subscription_seats: seats,
      },
    });

    if (createUserError || !newUser.user) {
      throw new Error(`Failed to create user: ${createUserError?.message}`);
    }

    logStep("User created", { userId: newUser.user.id });

    // Step 2: Create user profile with retry logic
    let profileCreated = false;
    let retries = 0;
    const maxRetries = 3;

    while (!profileCreated && retries < maxRetries) {
      retries++;
      await new Promise(resolve => setTimeout(resolve, retries * 500));

      const { data: existingProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('user_id', newUser.user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabaseAdmin
          .from('user_profiles')
          .update({
            display_name: clientName,
            role: 'Owner',
            account_status: 'active',
          })
          .eq('user_id', newUser.user.id);

        if (!updateError) {
          profileCreated = true;
          logStep("Profile updated", { userId: newUser.user.id });
        }
      } else {
        // Create new profile
        const { error: insertError } = await supabaseAdmin
          .from('user_profiles')
          .insert({
            user_id: newUser.user.id,
            display_name: clientName,
            role: 'Owner',
            account_status: 'active',
          });

        if (!insertError) {
          profileCreated = true;
          logStep("Profile created", { userId: newUser.user.id });
        }
      }
    }

    // Step 3: Create subscription record (if we have subscription data)
    if (subscriptionData || customerId) {
      await supabaseAdmin.from('user_subscriptions').insert({
        user_id: newUser.user.id,
        plan_id: STARTER_PLAN_ID,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionData?.id,
        status: 'active',
        current_period_start: subscriptionData?.current_period_start 
          ? new Date(subscriptionData.current_period_start * 1000).toISOString()
          : new Date().toISOString(),
        current_period_end: subscriptionData?.current_period_end
          ? new Date(subscriptionData.current_period_end * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      logStep("Subscription record created");
    }

    // Step 4: Create business_settings
    await supabaseAdmin.from('business_settings').insert({
      user_id: newUser.user.id,
      company_name: clientName,
      measurement_units: 'MM',
      tax_type: 'gst',
      tax_rate: 15,
    });

    logStep("Business settings created");

    // Step 5: Create account_settings
    await supabaseAdmin.from('account_settings').insert({
      account_owner_id: newUser.user.id,
      measurement_units: { default_unit: 'mm', display_precision: 2 },
      currency: 'GBP',
      language: 'en',
    });

    logStep("Account settings created");

    // Step 6: Create user_permissions with ALL Owner permissions (77 total)
    const ownerPermissions = [
      'create_appointments', 'create_clients', 'create_jobs', 'create_projects',
      'delete_appointments', 'delete_clients', 'delete_jobs', 'delete_projects', 'delete_users',
      'edit_all_clients', 'edit_all_jobs', 'edit_all_projects', 'edit_assigned_clients', 'edit_assigned_jobs',
      'edit_clients', 'edit_jobs', 'edit_projects',
      'export_clients', 'export_data', 'export_inventory', 'export_jobs',
      'import_clients', 'import_inventory', 'import_jobs',
      'manage_business_settings', 'manage_calendar', 'manage_integrations', 'manage_inventory',
      'manage_inventory_admin', 'manage_pricing', 'manage_purchasing', 'manage_quotes', 'manage_settings',
      'manage_shopify', 'manage_team', 'manage_templates', 'manage_users',
      'manage_vendors', 'manage_window_treatments',
      'send_emails', 'send_team_messages',
      'view_all_calendar', 'view_all_clients', 'view_all_jobs', 'view_all_projects', 'view_analytics',
      'view_assigned_clients', 'view_assigned_jobs', 'view_billing', 'view_calendar', 'view_clients',
      'view_cost_prices', 'view_documents', 'view_email_kpis', 'view_emails',
      'view_inventory', 'view_jobs', 'view_materials', 'view_own_calendar', 'view_own_jobs',
      'view_primary_kpis', 'view_profile', 'view_profit_margins', 'view_projects',
      'view_purchasing', 'view_quotes', 'view_revenue_kpis', 'view_selling_prices',
      'view_settings', 'view_shopify', 'view_team', 'view_team_members',
      'view_team_performance', 'view_templates', 'view_vendors',
      'view_window_treatments', 'view_workroom'
    ];

    const permissionInserts = ownerPermissions.map(permission => ({
      user_id: newUser.user.id,
      permission_name: permission,
    }));

    const { error: permError, data: permData } = await supabaseAdmin
      .from('user_permissions')
      .insert(permissionInserts)
      .select('id');

    if (permError) {
      logStep("ERROR creating permissions", { error: permError.message });
      // Don't throw - continue with account creation but log the issue
    } else {
      logStep("User permissions created", { count: permData?.length || 0 });
    }

    // Verify permissions were actually created
    const { data: verifyPerms, error: verifyError } = await supabaseAdmin
      .from('user_permissions')
      .select('id')
      .eq('user_id', newUser.user.id);

    if (verifyError || !verifyPerms || verifyPerms.length < 50) {
      logStep("WARNING: Permissions verification failed", { 
        expected: 77, 
        actual: verifyPerms?.length || 0,
        error: verifyError?.message 
      });
    } else {
      logStep("Permissions verified", { count: verifyPerms.length });
    }

    // Step 7: Create default number sequences
    const sequences = [
      { user_id: newUser.user.id, sequence_type: 'job', prefix: 'JOB-', current_number: 1000 },
      { user_id: newUser.user.id, sequence_type: 'quote', prefix: 'QT-', current_number: 1000 },
      { user_id: newUser.user.id, sequence_type: 'invoice', prefix: 'INV-', current_number: 1000 },
      { user_id: newUser.user.id, sequence_type: 'order', prefix: 'PO-', current_number: 1000 },
    ];

    await supabaseAdmin.from('number_sequences').insert(sequences);

    logStep("Number sequences created");

    // Step 8: Create default job statuses
    const defaultStatuses = [
      { user_id: newUser.user.id, name: 'New', color: '#3B82F6', sort_order: 1, is_default: true },
      { user_id: newUser.user.id, name: 'In Progress', color: '#F59E0B', sort_order: 2, is_default: false },
      { user_id: newUser.user.id, name: 'Completed', color: '#10B981', sort_order: 3, is_default: false },
      { user_id: newUser.user.id, name: 'On Hold', color: '#6B7280', sort_order: 4, is_default: false },
    ];

    await supabaseAdmin.from('job_statuses').insert(defaultStatuses);

    logStep("Default job statuses created");

    // Step 9: Send welcome email with login credentials via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const origin = "https://appinterio.app";
      
      const { error: emailError } = await resend.emails.send({
        from: "InterioApp <noreply@interioapp.com>",
        to: [customerEmail],
        subject: "Welcome to InterioApp - Your account is ready!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #415e6b, #9bb6bc); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">Welcome to InterioApp!</h1>
            </div>
            <div style="padding: 30px; background: #fff;">
              <p style="font-size: 16px;">Hi ${clientName},</p>
              <p>Your subscription is now active and your account is ready to use.</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <h3 style="margin-top: 0; color: #415e6b;">Your Login Credentials:</h3>
                <p style="margin: 8px 0;"><strong>Email:</strong> ${customerEmail}</p>
                <p style="margin: 8px 0;"><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${temporaryPassword}</code></p>
              </div>
              
              <p style="color: #dc3545; font-weight: 600;">⚠️ Important: Please change your password after your first login.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${origin}/auth" style="display:inline-block;padding:16px 32px;background-color:#733341;color:white;text-decoration:none;border-radius:8px;font-weight:600;">
                  Login to InterioApp
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">If you have any questions, our support team is here to help.</p>
            </div>
            <div style="padding: 20px; background: #f8f9fa; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #666; font-size: 12px;">© InterioApp - Business Management for Interior Designers</p>
            </div>
          </div>
        `,
      });

      if (emailError) {
        logStep("Welcome email failed via Resend", { error: emailError.message });
      } else {
        logStep("Welcome email sent with credentials via Resend");
      }
    } else {
      logStep("Resend not configured, credentials shown on success page only");
    }

    logStep("Account provisioning complete", { userId: newUser.user.id, email: customerEmail });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Account created successfully",
      existingUser: false,
      email: customerEmail,
      temporaryPassword: temporaryPassword, // Return password so it can be shown on success page
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
