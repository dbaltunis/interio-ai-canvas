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

    // Create invitation link
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:5173'
    const invitationLink = `${siteUrl}/auth?invitation=${invitationToken}`

    // Brand settings (customize via Function secrets)
    const brandName = Deno.env.get('BRAND_NAME') || 'InterioApp';
    const primaryColor = Deno.env.get('BRAND_PRIMARY_COLOR') || '#0ea5e9'; // sky-500
    const secondaryColor = Deno.env.get('BRAND_SECONDARY_COLOR') || '#22c55e'; // green-500
    const logoUrl = Deno.env.get('BRAND_LOGO_URL') || `${siteUrl}/favicon.ico`;
    const gradient = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;

    // Email content
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${brandName} – Team Invitation</title>
        <meta name="color-scheme" content="light only">
      </head>
      <body style="margin:0; padding:0; background:#f6f7f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; color:#111827;">
        <div style="display:none; max-height:0; overflow:hidden;">
          You're invited to join ${brandName}. Accept to get started.
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7f9; padding:24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.06); overflow:hidden;">
                <tr>
                  <td style="padding:28px 24px; background:${gradient};">
                    <table width="100%" role="presentation">
                      <tr>
                        <td align="left" style="vertical-align:middle;">
                          <img src="${logoUrl}" alt="${brandName} logo" style="height:40px; width:auto; display:block; border:0; outline:none; text-decoration:none;" />
                        </td>
                        <td align="right" style="vertical-align:middle;">
                          <span style="color:#ffffff; font-weight:600; font-size:14px; letter-spacing:0.4px; text-transform:uppercase;">Invitation</span>
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin:20px 0 0; color:#ffffff; font-size:28px; line-height:1.2;">You're invited to ${brandName}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 24px;">
                    <p style="margin:0 0 12px; font-size:16px; color:#374151;">Hi ${invitedName || invitedEmail},</p>
                    <p style="margin:0 0 12px; font-size:16px; color:#374151;">
                      <strong>${inviterName}</strong> (${inviterEmail}) has invited you to join their team as a <strong>${role}</strong>.
                    </p>
                    <div style="text-align:center; margin:28px 0;">
                      <a href="${invitationLink}"
                         style="background:${primaryColor}; color:#ffffff; padding:14px 22px; border-radius:10px; text-decoration:none; font-weight:600; display:inline-block; box-shadow:0 10px 20px rgba(14,165,233,0.24);">
                        Accept invitation
                      </a>
                    </div>
                    <p style="margin:0 0 8px; font-size:14px; color:#6b7280;">Or copy and paste this URL into your browser:</p>
                    <p style="margin:0; font-size:13px; color:#6b7280; background:#f3f4f6; padding:10px; border-radius:8px; word-break:break-all;">${invitationLink}</p>
                    <p style="margin:16px 0 0; font-size:12px; color:#9ca3af;">This invitation expires in 7 days. If you have questions, contact ${inviterEmail}.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb; padding:20px 24px; text-align:center; font-size:12px; color:#6b7280;">
                    © ${new Date().getFullYear()} ${brandName}. All rights reserved.
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
      return new Response(
        JSON.stringify({ success: true, message: 'Email preview only (SENDGRID_API_KEY not set)' }),
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