import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

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

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    // Get user's email settings and SendGrid integration
    const { data: emailSettings } = await supabase
      .from('email_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: integrationSettings } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('integration_type', 'sendgrid')
      .eq('active', true)
      .single();

    // Use SendGrid API key from integration settings or fallback to env
    const sendgridApiKey = integrationSettings?.configuration?.sendgrid_api_key || Deno.env.get('SENDGRID_API_KEY');
    if (!sendgridApiKey) {
      throw new Error('SendGrid API key not found');
    }

    // Get sender email from settings or use default
    const fromEmail = emailSettings?.sender_email || 'noreply@interioapp.com';
    const fromName = emailSettings?.sender_name || 'InterioApp';

    // Send email via SendGrid API
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
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

    console.log("Email sent successfully via SendGrid");

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