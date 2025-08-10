import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0"
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

    // Email content
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Team Invitation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #495057; margin-top: 0;">Join our team</h2>
          
          <p style="font-size: 16px; margin: 20px 0;">
            Hi ${invitedName || invitedEmail},
          </p>
          
          <p style="font-size: 16px; margin: 20px 0;">
            <strong>${inviterName}</strong> (${inviterEmail}) has invited you to join their team as a <strong>${role}</strong>.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationLink}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-weight: bold; 
                      display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6c757d; margin: 20px 0;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 14px; color: #6c757d; word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 3px;">
            ${invitationLink}
          </p>
          
          <p style="font-size: 14px; color: #6c757d; margin: 30px 0 0 0;">
            This invitation will expire in 7 days. If you have any questions, please contact ${inviterEmail}.
          </p>
        </div>
      </body>
      </html>
    `

    // Try sending with Resend if API key is configured
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromAddress = Deno.env.get('EMAIL_FROM') || 'InterioApp <onboarding@resend.dev>';

    if (!resendApiKey) {
      console.log('RESEND_API_KEY not set. Email preview only.');
      console.log('Invitation email content:', {
        to: invitedEmail,
        subject: `Invitation to join ${inviterName}'s team`,
        html: emailContent
      });
      return new Response(
        JSON.stringify({ success: true, message: 'Email preview only (RESEND_API_KEY not set)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const resend = new Resend(resendApiKey);
    const sendResult = await resend.emails.send({
      from: fromAddress,
      to: [invitedEmail],
      subject: `Invitation to join ${inviterName}'s team`,
      html: emailContent,
    });

    console.log('Resend send result:', sendResult);

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation email sent', result: sendResult }),
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