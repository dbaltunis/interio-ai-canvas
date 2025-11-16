import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { invitedEmail, invitedName, inviterName, inviterEmail, role, invitationToken } = await req.json()

    console.log(`Sending invitation email to ${invitedEmail} (${invitedName})`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    // Get the account owner for shared settings
    const { data: accountOwner } = await supabase.rpc('get_account_owner', { 
      user_id_param: user.id 
    });
    
    const ownerId = accountOwner || user.id;

    // Get account owner's SendGrid integration
    const { data: integrationSettings } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('account_owner_id', ownerId)
      .eq('integration_type', 'sendgrid')
      .eq('active', true)
      .maybeSingle();

    console.log('Integration settings:', integrationSettings ? 'Found' : 'Not found');

    // Use SendGrid API key from integration settings
    const sendgridApiKey = integrationSettings?.api_credentials?.api_key;
    if (!sendgridApiKey) {
      console.error('SendGrid API key not found in integration_settings');
      throw new Error('SendGrid API key not configured. Please configure SendGrid in your integration settings.');
    }

    console.log('SendGrid API key found, preparing email...');

    const siteUrl = Deno.env.get('SITE_URL') || 'https://ldgrcodffsalkevafbkb.supabase.co'
    const invitationLink = `${siteUrl}/auth?invitation=${invitationToken}`

    const brandName = Deno.env.get('BRAND_NAME') || 'InterioApp';
    const primaryColor = '#415e6b';
    const secondaryColor = '#9bb6bc';
    const accentColor = '#733341';
    const logoUrl = `${siteUrl}/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png`;

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brandName} – Team Invitation</title>
</head>
<body style="margin:0; padding:0; background:#f8f9fa; font-family: Arial, sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background:#f8f9fa; padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="0" style="max-width:600px; background:#ffffff; border-radius:8px;">
          <tr>
            <td style="padding:32px 28px; background:linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); text-align:center; border-radius:8px 8px 0 0;">
              <img src="${logoUrl}" alt="${brandName}" style="height:48px; width:auto; margin:0 auto 16px;" />
              <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700;">You're Invited!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 28px;">
              <p style="margin:0 0 20px; font-size:16px;">Hi ${invitedName},</p>
              <p style="margin:0 0 24px; font-size:16px;"><strong>${inviterName}</strong> has invited you to join their team on <strong>${brandName}</strong> as a <strong>${role}</strong>.</p>
              <table width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 32px;">
                <tr>
                  <td align="center">
                    <a href="${invitationLink}" style="display:inline-block; padding:16px 32px; background:${accentColor}; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:16px;">Accept Invitation</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px; font-size:14px; color:#666;">Or copy this link:</p>
              <p style="margin:0 0 24px; font-size:13px; word-break:break-all;"><a href="${invitationLink}" style="color:${primaryColor};">${invitationLink}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px; background:#f8f9fa; border-top:1px solid #e8ecef; border-radius:0 0 8px 8px;">
              <p style="margin:0; font-size:12px; color:#95a5a6; text-align:center;">This invitation was sent by ${inviterName} (${inviterEmail})</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    console.log('Sending email via SendGrid...');

    // Send via SendGrid API
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: invitedEmail, name: invitedName }],
          subject: `You've been invited to join ${brandName}!`,
        }],
        from: {
          email: inviterEmail,
          name: brandName,
        },
        content: [{
          type: 'text/html',
          value: emailHtml,
        }],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('SendGrid API error:', emailResponse.status, errorText);
      throw new Error(`SendGrid error: ${emailResponse.status} - ${errorText}`);
    }

    console.log('Email sent successfully via SendGrid');

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation email sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in send-invitation:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to send invitation' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
