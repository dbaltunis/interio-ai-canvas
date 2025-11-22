import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from 'npm:resend@2.0.0';

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ClientEmailRequest {
  to: string;
  clientName: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, clientName, subject, message }: ClientEmailRequest = await req.json();

    console.log(`Sending email to ${to} (${clientName})`);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    // Check usage limit (500 emails/month) - only for shared Resend, not custom SendGrid
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get account owner for shared settings
    const { data: accountOwner } = await supabase.rpc('get_account_owner', { 
      user_id_param: user.id 
    });
    const ownerId = accountOwner || user.id;

    // Check if user has custom SendGrid configured
    const { data: customSendGrid } = await supabase
      .from('integration_settings')
      .select('active')
      .eq('account_owner_id', ownerId)
      .eq('integration_type', 'sendgrid')
      .eq('active', true)
      .maybeSingle();

    // Only enforce limit if using shared Resend (not custom SendGrid)
    if (!customSendGrid) {
      const { data: usageData } = await supabase
        .from('notification_usage')
        .select('email_count')
        .eq('user_id', user.id)
        .gte('period_start', startOfMonth.toISOString())
        .single();

      const currentUsage = usageData?.email_count || 0;
      const EMAIL_LIMIT = 500;

      if (currentUsage >= EMAIL_LIMIT) {
        console.error(`Email limit reached for user ${user.id}: ${currentUsage}/${EMAIL_LIMIT}`);
        throw new Error(`Monthly email limit of ${EMAIL_LIMIT} reached. Upgrade to custom SendGrid for unlimited sending.`);
      }

      console.log(`Email usage for user ${user.id}: ${currentUsage}/${EMAIL_LIMIT}`);
    } else {
      console.log('User has custom SendGrid - no usage limit enforced');
    }


    // Get account owner's email settings
    const { data: emailSettings } = await supabase
      .from('email_settings')
      .select('*')
      .eq('account_owner_id', ownerId)
      .maybeSingle();

    // Check for optional custom SendGrid integration
    const { data: integrationSettings } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('account_owner_id', ownerId)
      .eq('integration_type', 'sendgrid')
      .eq('active', true)
      .maybeSingle();

    const sendgridApiKey = integrationSettings?.api_credentials?.api_key;
    const useCustomSendGrid = !!sendgridApiKey;

    // Get sender details from settings or use defaults
    const fromEmail = emailSettings?.from_email || 'noreply@interioapp.com';
    const fromName = emailSettings?.from_name || 'InterioApp';

    console.log('Email provider:', useCustomSendGrid ? 'Custom SendGrid' : 'Shared Resend');

    let emailResponse;

    if (useCustomSendGrid) {
      // Use custom SendGrid for premium users
      console.log('Sending via custom SendGrid');
      emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to, name: clientName }],
              subject: subject,
            },
          ],
          from: {
            email: fromEmail,
            name: fromName,
          },
          content: [
            {
              type: 'text/html',
              value: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
                    Message from ${fromName}
                  </h2>
                  <div style="margin: 20px 0; line-height: 1.6; color: #555;">
                    ${message.replace(/\n/g, '<br>')}
                  </div>
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px;">
                    <p>This email was sent from ${fromName}.</p>
                  </div>
                </div>
              `,
            },
          ],
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('SendGrid API error:', errorText);
        throw new Error(`SendGrid API error: ${emailResponse.status} ${errorText}`);
      }
    } else {
      // Use shared Resend for all users by default
      console.log('Sending via shared Resend');
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) {
        throw new Error('Resend API key not configured');
      }

      const resend = new Resend(resendApiKey);

      const { data: resendData, error: resendError } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: [to],
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
              Message from ${fromName}
            </h2>
            <div style="margin: 20px 0; line-height: 1.6; color: #555;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px;">
              <p>This email was sent from ${fromName}.</p>
            </div>
          </div>
        `,
      });

      if (resendError) {
        console.error('Resend API error:', resendError);
        throw new Error(`Resend API error: ${resendError.message}`);
      }

      emailResponse = { ok: true, headers: { get: () => resendData?.id } };
    }

    // Update email usage tracking
    const { data: usage } = await supabase
      .from('notification_usage')
      .select('email_count')
      .eq('user_id', user.id)
      .gte('period_start', startOfMonth.toISOString())
      .single();

    const currentUsage = usage?.email_count || 0;

    await supabase
      .from('notification_usage')
      .upsert({
        user_id: user.id,
        period_start: startOfMonth.toISOString(),
        period_end: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0).toISOString(),
        email_count: currentUsage + 1,
        sms_count: (usage as any)?.sms_count || 0,
      });

    console.log("Email sent successfully via", useCustomSendGrid ? 'SendGrid' : 'Resend');

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.headers.get('X-Message-Id') }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-client-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);