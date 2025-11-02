import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get appointments happening in the next 15, 30, 60 minutes, or 1 day
    const now = new Date();
    const reminderWindows = [
      { minutes: 15, checked: new Date(now.getTime() + 15 * 60000) },
      { minutes: 30, checked: new Date(now.getTime() + 30 * 60000) },
      { minutes: 60, checked: new Date(now.getTime() + 60 * 60000) },
      { minutes: 1440, checked: new Date(now.getTime() + 1440 * 60000) }, // 1 day
    ];

    let remindersSent = 0;

    for (const window of reminderWindows) {
      // Find appointments that need reminders
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*, user_profiles!appointments_user_id_fkey(user_id, display_name)')
        .gte('start_time', now.toISOString())
        .lte('start_time', window.checked.toISOString())
        .eq('notification_enabled', true)
        .eq('notification_minutes', window.minutes)
        .is('reminder_sent_at', null);

      if (error) {
        console.error('Error fetching appointments:', error);
        continue;
      }

      for (const appointment of appointments || []) {
        try {
          // Get user email
          const { data: userData } = await supabase.auth.admin.getUserById(appointment.user_id);
          if (!userData?.user?.email) continue;

          // Get user notification settings to determine which methods to use
          const { data: notificationSettings } = await supabase
            .from('user_notification_settings')
            .select('email_notifications_enabled, sms_notifications_enabled')
            .eq('user_id', appointment.user_id)
            .single();

          const shouldSendEmail = notificationSettings?.email_notifications_enabled ?? true;
          const shouldSendSMS = notificationSettings?.sms_notifications_enabled ?? false;

          // Get account owner for settings
          const { data: accountOwner } = await supabase.rpc('get_account_owner', { 
            user_id_param: appointment.user_id 
          });
          const ownerId = accountOwner || appointment.user_id;

          // Only fetch email settings if email is enabled
          let sendgridApiKey = null;
          let fromEmail = 'noreply@interioapp.com';
          let fromName = 'InterioApp';

          if (shouldSendEmail) {
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

            sendgridApiKey = integrationSettings?.configuration?.sendgrid_api_key || Deno.env.get('SENDGRID_API_KEY');
            fromEmail = emailSettings?.sender_email || fromEmail;
            fromName = emailSettings?.sender_name || fromName;
          }

          // Format appointment details
          const startDate = new Date(appointment.start_time);
          const dateStr = startDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          const timeStr = startDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          });

          const timeUntil = window.minutes === 1440 
            ? 'tomorrow' 
            : `in ${window.minutes} minutes`;

          let emailSent = false;

          // Send email reminder if enabled and configured
          if (shouldSendEmail && sendgridApiKey) {
            try {
              const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${sendgridApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  personalizations: [{
                    to: [{ email: userData.user.email }],
                    subject: `Reminder: ${appointment.title} ${timeUntil}`,
                  }],
                  from: { email: fromEmail, name: fromName },
                  content: [{
                    type: 'text/html',
                    value: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
                          ⏰ Appointment Reminder
                        </h2>
                        
                        <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2563eb;">
                          <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #333;">
                            Your appointment is ${timeUntil}!
                          </p>
                          <h3 style="margin: 15px 0 10px 0; color: #555;">${appointment.title}</h3>
                          
                          <p style="margin: 10px 0; color: #666;">
                            <strong>📆 Date:</strong> ${dateStr}<br/>
                            <strong>🕐 Time:</strong> ${timeStr}<br/>
                            ${appointment.location ? `<strong>📍 Location:</strong> ${appointment.location}<br/>` : ''}
                            ${appointment.video_meeting_link ? `<strong>🎥 Video Meeting:</strong> <a href="${appointment.video_meeting_link}" style="color: #2563eb;">${appointment.video_meeting_link}</a><br/>` : ''}
                          </p>
                          
                          ${appointment.description ? `
                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                              <strong>Details:</strong>
                              <p style="color: #666; margin: 5px 0 0 0;">${appointment.description.replace(/\n/g, '<br>')}</p>
                            </div>
                          ` : ''}
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px;">
                          <p>This is an automated reminder from ${fromName}</p>
                        </div>
                      </div>
                    `,
                  }],
                }),
              });

              if (emailResponse.ok) {
                emailSent = true;
                console.log(`Email reminder sent for appointment ${appointment.id}`);
              } else {
                console.error(`Failed to send email for appointment ${appointment.id}`);
              }
            } catch (emailError) {
              console.error(`Error sending email for appointment ${appointment.id}:`, emailError);
            }
          }

          // TODO: Send SMS if enabled and configured
          if (shouldSendSMS) {
            console.log('SMS notifications not yet implemented');
          }

          // Always create in-app notification
          await supabase.from('notifications').insert({
            user_id: appointment.user_id,
            title: `Appointment Reminder: ${appointment.title}`,
            message: `Your appointment "${appointment.title}" is ${timeUntil} at ${timeStr}`,
            type: 'info',
            action_url: `/?tab=calendar&appointment=${appointment.id}`,
            read: false
          });

          // Mark reminder as sent
          await supabase
            .from('appointments')
            .update({ reminder_sent_at: now.toISOString() })
            .eq('id', appointment.id);

          remindersSent++;
          console.log(`Reminder sent for appointment ${appointment.id}`);
        
        } catch (error) {
          console.error(`Error sending reminder for appointment ${appointment.id}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        remindersSent,
        message: `Sent ${remindersSent} appointment reminders`
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-appointment-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
