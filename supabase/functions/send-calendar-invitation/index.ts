import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalendarInvitationRequest {
  appointmentId: string;
  recipientEmail: string;
  recipientName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointmentId, recipientEmail, recipientName }: CalendarInvitationRequest = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      throw new Error('Appointment not found');
    }

    // Get account owner for settings
    const { data: accountOwner } = await supabase.rpc('get_account_owner', { 
      user_id_param: user.id 
    });
    const ownerId = accountOwner || user.id;

    // Get email settings and SendGrid integration
    const { data: emailSettings } = await supabase
      .from('email_settings')
      .select('*')
      .eq('account_owner_id', ownerId)
      .single();

    const { data: integrationSettings } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('account_owner_id', ownerId)
      .eq('integration_type', 'sendgrid')
      .eq('active', true)
      .single();

    const sendgridApiKey = integrationSettings?.configuration?.sendgrid_api_key || Deno.env.get('SENDGRID_API_KEY');
    if (!sendgridApiKey) {
      throw new Error('SendGrid not configured');
    }

    const fromEmail = emailSettings?.sender_email || 'noreply@interioapp.com';
    const fromName = emailSettings?.sender_name || 'InterioApp';

    // Format dates
    const startDate = new Date(appointment.start_time);
    const endDate = new Date(appointment.end_time);
    const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const startTimeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const endTimeStr = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    // Generate ICS calendar file content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//InterioApp//Calendar//EN
BEGIN:VEVENT
UID:${appointmentId}@interioapp.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${appointment.title}
DESCRIPTION:${appointment.description || 'No description provided'}
LOCATION:${appointment.location || 'No location specified'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const icsBase64 = btoa(icsContent);

    // Send email via SendGrid
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: recipientEmail, name: recipientName || recipientEmail }],
          subject: `Calendar Invitation: ${appointment.title}`,
        }],
        from: { email: fromEmail, name: fromName },
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
                📅 You're Invited to an Event
              </h2>
              
              <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #555;">${appointment.title}</h3>
                
                <p style="margin: 10px 0; color: #666;">
                  <strong>📆 Date:</strong> ${dateStr}<br/>
                  <strong>🕐 Time:</strong> ${startTimeStr} - ${endTimeStr}<br/>
                  ${appointment.location ? `<strong>📍 Location:</strong> ${appointment.location}<br/>` : ''}
                  ${appointment.video_meeting_link ? `<strong>🎥 Video Meeting:</strong> <a href="${appointment.video_meeting_link}" style="color: #2754C5;">${appointment.video_meeting_link}</a><br/>` : ''}
                </p>
                
                ${appointment.description ? `
                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                    <strong>Details:</strong>
                    <p style="color: #666; margin: 5px 0 0 0;">${appointment.description.replace(/\n/g, '<br>')}</p>
                  </div>
                ` : ''}
              </div>
              
              <p style="color: #666; font-size: 14px;">
                A calendar file is attached to this email. You can add this event to your calendar by opening the attachment.
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px;">
                <p>This invitation was sent from ${fromName}</p>
              </div>
            </div>
          `,
        }],
        attachments: [{
          content: icsBase64,
          filename: 'event.ics',
          type: 'text/calendar',
          disposition: 'attachment',
        }],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('SendGrid error:', errorText);
      throw new Error(`SendGrid error: ${emailResponse.status}`);
    }

    console.log('Calendar invitation sent successfully');

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.headers.get('X-Message-Id') }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending calendar invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
