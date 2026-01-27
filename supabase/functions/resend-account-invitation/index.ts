import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResendInvitationRequest {
  userId: string;
  newPassword?: string; // Optional new password, if not provided will generate one
}

function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the requesting user is System Owner
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: adminUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !adminUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: userRole } = await supabaseAdmin.rpc('get_user_role', { _user_id: adminUser.id });
    if (userRole !== 'System Owner') {
      return new Response(
        JSON.stringify({ error: 'System Owner role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, newPassword }: ResendInvitationRequest = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Resending invitation for user:', userId);

    // Get user details
    const { data: { user: targetUser }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (getUserError || !targetUser) {
      console.error('Error getting user:', getUserError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile for display name
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('display_name, account_type')
      .eq('user_id', userId)
      .single();

    const displayName = profile?.display_name || targetUser.email?.split('@')[0] || 'User';
    const email = targetUser.email!;

    // Generate or use provided password
    const temporaryPassword = newPassword || generatePassword();

    // Update user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: temporaryPassword
    });

    if (updateError) {
      console.error('Error updating password:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to reset password' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email
    const siteUrl = Deno.env.get('SITE_URL') || 'https://appinterio.app';
    const brandName = Deno.env.get('BRAND_NAME') || 'InterioApp';
    
    const emailSubject = `Your ${brandName} Account - New Login Credentials`;
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
                    <h2 style="margin:0 0 20px; color:#333;">Your Account Credentials</h2>
                    <p style="margin:0 0 20px; font-size:16px;">Hello ${displayName},</p>
                    <p style="margin:0 0 24px; font-size:16px;">Here are your updated login credentials for ${brandName}:</p>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin:0 0 12px;"><strong>Email:</strong> ${email}</p>
                      <p style="margin:0;"><strong>Password:</strong> <code style="background:#fff; padding:4px 8px; border-radius:4px;">${temporaryPassword}</code></p>
                    </div>
                    <p style="margin:0 0 24px; font-size:16px;"><strong>Important:</strong> Please change your password after logging in.</p>
                    <table width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 32px;">
                      <tr>
                        <td align="center">
                          <a href="${siteUrl}/auth" style="display:inline-block; padding:16px 32px; background:#415e6b; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:16px;">Login Now</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0; font-size:14px; color:#666;">If you didn't request this, please contact support immediately.</p>
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

    let emailSent = false;
    let emailError: string | null = null;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      emailError = 'RESEND_API_KEY not configured';
      console.error(emailError);
    } else {
      try {
        const resend = new Resend(resendApiKey);
        const { error: resendError } = await resend.emails.send({
          from: `${brandName} <noreply@interioapp.com>`,
          to: [email],
          subject: emailSubject,
          html: emailHtml,
        });

        if (resendError) {
          emailError = resendError.message;
          console.error('Resend error:', resendError);
        } else {
          emailSent = true;
          console.log('Invitation email resent to:', email);
        }
      } catch (err) {
        emailError = err instanceof Error ? err.message : 'Unknown email error';
        console.error('Email sending error:', err);
      }
    }

    // Log email to database
    try {
      await supabaseAdmin.from('emails').insert({
        user_id: userId,
        recipient_email: email,
        subject: emailSubject,
        content: emailHtml,
        status: emailSent ? 'sent' : 'failed',
        bounce_reason: emailError,
        sent_at: emailSent ? new Date().toISOString() : null,
      });
    } catch (logError) {
      console.error('Failed to log email:', logError);
    }

    // Log audit trail
    await supabaseAdmin.from('audit_log').insert({
      user_id: adminUser.id,
      action: 'RESEND_INVITATION',
      table_name: 'user_profiles',
      record_id: userId,
      new_data: {
        email,
        displayName,
        email_sent: emailSent,
        email_error: emailError,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        email_sent: emailSent,
        email_error: emailError,
        message: emailSent 
          ? 'Invitation resent successfully' 
          : 'Password reset but email failed to send',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in resend-account-invitation:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
