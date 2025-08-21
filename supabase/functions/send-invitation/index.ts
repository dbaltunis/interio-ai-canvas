import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import sgMail from "npm:@sendgrid/mail@8.1.2"
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { invitedEmail, invitedName, inviterName, inviterEmail, role, invitationToken } = await req.json()

    // Create a Supabase client with the Auth context of the user that called the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the current user
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    // Create invitation link with secure domain
    const siteUrl = Deno.env.get('SITE_URL') || 'https://ldgrcodffsalkevafbkb.supabase.co'
    const invitationLink = `${siteUrl}/auth?invitation=${invitationToken}`

    // Brand settings (customize via Function secrets)
    const brandName = Deno.env.get('BRAND_NAME') || 'InterioApp';
    const primaryColor = Deno.env.get('BRAND_PRIMARY_COLOR') || '#415e6b'; // InterioApp primary
    const secondaryColor = Deno.env.get('BRAND_SECONDARY_COLOR') || '#9bb6bc'; // InterioApp secondary
    const accentColor = Deno.env.get('BRAND_ACCENT_COLOR') || '#733341'; // InterioApp accent
    const logoUrl = Deno.env.get('BRAND_LOGO_URL') || `${siteUrl}/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png`;

    // Email content with InterioApp branding
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${brandName} – Team Invitation</title>
        <meta name="color-scheme" content="light only">
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; margin: 0 !important; }
            .header-padding { padding: 20px 16px !important; }
            .content-padding { padding: 24px 16px !important; }
            .logo { height: 32px !important; }
            .title { font-size: 24px !important; }
            .button { padding: 12px 18px !important; font-size: 14px !important; }
          }
        </style>
      </head>
      <body style="margin:0; padding:0; background:#f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#2c3e50; line-height:1.6;">
        <div style="display:none; max-height:0; overflow:hidden;">
          You're invited to join ${brandName} – The future of window décor is online and bespoke
        </div>
        
        <!-- Email Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f9fa; padding:20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; box-shadow:0 8px 32px rgba(65,94,107,0.12); overflow:hidden; margin:0 auto;">
                
                <!-- Header with Logo and Slogan -->
                <tr>
                  <td class="header-padding" style="padding:32px 28px; background:linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); text-align:center;">
                    <img src="${logoUrl}" alt="${brandName}" class="logo" style="height:48px; width:auto; display:block; margin:0 auto 16px; border:0; outline:none;" />
                    <p style="margin:0 0 8px; color:#ffffff; font-size:14px; font-weight:500; letter-spacing:0.5px; opacity:0.95;">The future of window décor is online and bespoke</p>
                    <h1 class="title" style="margin:16px 0 0; color:#ffffff; font-size:28px; font-weight:700; line-height:1.3;">You're Invited!</h1>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td class="content-padding" style="padding:32px 28px;">
                    <div style="text-align:center; margin-bottom:24px;">
                      <h2 style="margin:0 0 8px; color:${primaryColor}; font-size:20px; font-weight:600;">Join ${brandName}</h2>
                      <p style="margin:0; color:#6c757d; font-size:14px;">Professional window treatment solutions</p>
                    </div>
                    
                    <p style="margin:0 0 16px; font-size:16px; color:#495057;">Hi ${invitedName || invitedEmail},</p>
                    <p style="margin:0 0 24px; font-size:16px; color:#495057;">
                      <strong style="color:${primaryColor};">${inviterName}</strong> has invited you to join their ${brandName} team as a <strong style="color:${accentColor};">${role}</strong>. 
                      Start collaborating on beautiful window décor projects today!
                    </p>
                    
                    <!-- Call to Action Button -->
                    <div style="text-align:center; margin:32px 0;">
                      <a href="${invitationLink}" class="button"
                         style="background:${accentColor}; color:#ffffff; padding:16px 32px; border-radius:12px; text-decoration:none; font-weight:600; font-size:16px; display:inline-block; box-shadow:0 4px 16px rgba(115,51,65,0.3); transition:all 0.3s ease;">
                        Accept Invitation
                      </a>
                    </div>
                    
                    <!-- Alternative Link -->
                    <div style="background:#f8f9fa; border-radius:8px; padding:16px; margin:24px 0;">
                      <p style="margin:0 0 8px; font-size:13px; color:#6c757d; text-align:center;">Can't click the button? Copy this link:</p>
                      <p style="margin:0; font-size:12px; color:#6c757d; word-break:break-all; text-align:center; font-family:monospace;">${invitationLink}</p>
                    </div>
                    
                    <!-- Contact Info -->
                    <div style="border-top:1px solid #e9ecef; padding-top:20px; margin-top:24px;">
                      <p style="margin:0; font-size:13px; color:#6c757d; text-align:center;">
                        Questions? Contact <a href="mailto:${inviterEmail}" style="color:${primaryColor}; text-decoration:none;">${inviterEmail}</a>
                      </p>
                      <p style="margin:8px 0 0; font-size:12px; color:#adb5bd; text-align:center;">
                        This invitation expires in 7 days
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background:#f8f9fa; padding:20px 28px; text-align:center; border-top:1px solid #e9ecef;">
                    <p style="margin:0; font-size:12px; color:#6c757d;">
                      © ${new Date().getFullYear()} ${brandName}. All rights reserved.
                    </p>
                    <p style="margin:4px 0 0; font-size:11px; color:#adb5bd;">
                      Professional window treatments and décor solutions
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    // Send with SendGrid if API key is configured
    const sgApiKey = Deno.env.get('SENDGRID_API_KEY');
    const fromAddress = Deno.env.get('EMAIL_FROM') || 'InterioApp <noreply@appinterio.app>';

    if (!sgApiKey) {
      console.log('SENDGRID_API_KEY not set. Email preview only.');
      console.log('Invitation email content:', { to: invitedEmail, subject: `Invitation to join ${inviterName}'s team`, html: emailContent });
      
      // Return a more informative message about email configuration
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Invitation created successfully! Email sending is not configured - please set up SendGrid API key to send emails automatically.',
          preview_only: true,
          invitation_link: invitationLink
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    sgMail.setApiKey(sgApiKey);
    const msg = { to: invitedEmail, from: fromAddress, subject: `Invitation to join ${inviterName}'s team`, html: emailContent };
    const [sendResult] = await sgMail.send(msg);
    console.log('SendGrid send result:', sendResult?.statusCode, sendResult?.headers);

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation email sent via SendGrid' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in send-invitation function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})