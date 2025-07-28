import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestEmailRequest {
  to_email: string;
  subject?: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to_email, subject = 'Test Email', message = 'This is a test email.' }: TestEmailRequest = await req.json();

    console.log('Test email request:', { to_email, subject });

    if (!to_email) {
      throw new Error('Recipient email address is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the current user's authentication
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
      }
    }

    // Get email settings (either for the user or use default)
    let emailSettings = null;
    if (userId) {
      const { data: settings } = await supabase
        .from('email_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .maybeSingle();
      
      emailSettings = settings;
    }

    // Get SendGrid integration settings
    let sendgridApiKey = null;
    if (userId) {
      const { data: integration } = await supabase
        .from('integration_settings')
        .select('configuration')
        .eq('user_id', userId)
        .eq('integration_type', 'sendgrid')
        .eq('active', true)
        .maybeSingle();

      if (integration?.configuration && typeof integration.configuration === 'object') {
        const config = integration.configuration as Record<string, any>;
        sendgridApiKey = config.api_key;
      }
    }

    // Fall back to environment variable if no user-specific API key
    if (!sendgridApiKey) {
      sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
    }

    if (!sendgridApiKey) {
      throw new Error('SendGrid API key not configured. Please set up SendGrid integration first.');
    }

    // Set up email details
    const fromEmail = emailSettings?.from_email || 'test@yourdomain.com';
    const fromName = emailSettings?.from_name || 'Test Email System';
    const replyToEmail = emailSettings?.reply_to_email || fromEmail;

    // Enhanced test email content
    const enhancedMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { padding: 20px 0; }
          .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; font-size: 12px; color: #666; }
          .status-badge { display: inline-block; background-color: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin: 2px; }
          ul { padding-left: 20px; }
          li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; color: #2c3e50;">📧 Test Email Configuration</h1>
          <p style="margin: 10px 0 0 0; color: #666;">Sent at ${new Date().toISOString()}</p>
        </div>
        
        <div class="content">
          ${message}
          
          <h3>Configuration Details:</h3>
          <ul>
            <li><strong>From:</strong> ${fromName} &lt;${fromEmail}&gt;</li>
            <li><strong>Reply-To:</strong> ${replyToEmail}</li>
            <li><strong>SendGrid API:</strong> <span class="status-badge">✅ Connected</span></li>
            <li><strong>Email Settings:</strong> <span class="status-badge">✅ Configured</span></li>
          </ul>
          
          ${emailSettings?.signature ? `
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <h4>Email Signature:</h4>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; white-space: pre-line;">${emailSettings.signature}</div>
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>This is an automated test email sent to verify your email configuration.</p>
          <p>If you received this email, your setup is working correctly! 🎉</p>
        </div>
      </body>
      </html>
    `;

    // Send email via SendGrid
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to_email }],
            subject: `[TEST] ${subject}`,
          }
        ],
        from: {
          email: fromEmail,
          name: fromName,
        },
        reply_to: {
          email: replyToEmail,
        },
        content: [
          {
            type: 'text/html',
            value: enhancedMessage,
          }
        ],
        tracking_settings: {
          click_tracking: { enable: true },
          open_tracking: { enable: true },
        },
        categories: ['test-email'],
      }),
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error('SendGrid API error:', errorText);
      
      // Parse SendGrid error for better user feedback
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors && errorData.errors.length > 0) {
          const firstError = errorData.errors[0];
          if (firstError.message.includes('sender identity')) {
            throw new Error(`Sender email verification required: ${fromEmail} must be verified in SendGrid. Go to SendGrid > Settings > Sender Authentication to verify your email.`);
          }
          throw new Error(`SendGrid error: ${firstError.message}`);
        }
      } catch (parseError) {
        // If we can't parse the error, use the raw response
        throw new Error(`SendGrid API error (${sendGridResponse.status}): ${errorText}`);
      }
    }

    console.log('Test email sent successfully to:', to_email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Test email sent successfully to ${to_email}`,
        from: `${fromName} <${fromEmail}>`,
        subject: `[TEST] ${subject}`,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in send-test-email function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);