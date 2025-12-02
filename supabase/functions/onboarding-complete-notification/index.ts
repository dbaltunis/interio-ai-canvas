import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAIL = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'baltunis@curtainscalculator.com';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_name, contact_email, contact_person, user_id } = await req.json();

    console.log('Onboarding completion notification requested:', {
      company_name,
      contact_email,
      user_id,
    });

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notification email to admin
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Interioapp <noreply@interioapp.com>',
        to: [ADMIN_EMAIL],
        subject: `🎉 New Client Onboarding Completed: ${company_name || 'Unknown Company'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Client Onboarding Completed</h2>
            <p>A new client has completed the onboarding wizard and is ready for setup.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #666;">Client Details</h3>
              <p><strong>Company:</strong> ${company_name || 'Not provided'}</p>
              <p><strong>Contact:</strong> ${contact_person || 'Not provided'}</p>
              <p><strong>Email:</strong> ${contact_email || 'Not provided'}</p>
              <p><strong>User ID:</strong> ${user_id}</p>
            </div>
            
            <p style="margin-top: 20px;">
              <a href="https://interioapp.com/admin/onboarding-submissions" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View All Submissions
              </a>
            </p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated notification from Interioapp.
            </p>
          </div>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log('Email send result:', emailResult);

    if (!emailResponse.ok) {
      console.error('Failed to send email:', emailResult);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send notification email', details: emailResult }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in onboarding-complete-notification:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
