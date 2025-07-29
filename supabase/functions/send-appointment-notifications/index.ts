import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  notificationId: string;
  userId: string;
  appointmentDetails: {
    title: string;
    startTime: string;
    location?: string;
    videoMeetingLink?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notificationId, userId, appointmentDetails }: NotificationRequest = await req.json();

    console.log(`Processing notification ${notificationId} for user ${userId}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Get user's notification settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsError || !settings) {
      throw new Error(`No notification settings found for user ${userId}`);
    }

    // Get user email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user?.email) {
      throw new Error(`Could not get user email for ${userId}`);
    }

    const results = {
      email: null as any,
      sms: null as any,
      push: null as any,
      errors: [] as string[]
    };

    // Send Email Notification if enabled and configured
    if (settings.email_notifications_enabled && settings.email_api_key_encrypted) {
      try {
        const fromAddress = settings.email_from_address || 'notifications@yourdomain.com';
        const fromName = settings.email_from_name || 'Appointment Reminder';
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; margin-bottom: 20px;">Appointment Reminder</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              You have an upcoming appointment scheduled.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Appointment Details</h3>
              <p><strong>Event:</strong> ${appointmentDetails.title}</p>
              <p><strong>Date & Time:</strong> ${new Date(appointmentDetails.startTime).toLocaleString()}</p>
              ${appointmentDetails.location ? `<p><strong>Location:</strong> ${appointmentDetails.location}</p>` : ''}
              ${appointmentDetails.videoMeetingLink ? 
                `<p><strong>Video Meeting:</strong> <a href="${appointmentDetails.videoMeetingLink}" target="_blank" style="color: #2563eb;">Join Meeting</a></p>` : 
                ''
              }
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This is an automated reminder sent from your appointment management system.
            </p>
          </div>
        `;

        if (settings.email_service_provider === 'sendgrid') {
          const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${settings.email_api_key_encrypted}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              personalizations: [{
                to: [{ email: user.email }],
                subject: 'Appointment Reminder'
              }],
              from: {
                email: fromAddress,
                name: fromName
              },
              content: [{
                type: 'text/html',
                value: emailHtml
              }]
            })
          });

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            throw new Error(`SendGrid API error: ${emailResponse.status} - ${errorText}`);
          }

          results.email = { message: "Email sent via SendGrid" };
          console.log("Email sent successfully via SendGrid");
        } else {
          throw new Error(`Unsupported email provider: ${settings.email_service_provider}`);
        }
      } catch (error) {
        console.error("Error sending email:", error);
        results.errors.push(`Email error: ${error.message}`);
      }
    }

    // SMS notifications via Twilio
    if (settings.sms_notifications_enabled && settings.sms_api_key_encrypted && settings.sms_phone_number) {
      try {
        const twilioAccountSid = settings.sms_api_key_encrypted.split(':')[0]; // Assuming format "SID:TOKEN"
        const twilioAuthToken = settings.sms_api_key_encrypted.split(':')[1];
        
        const smsMessage = `Appointment Reminder: ${appointmentDetails.title} at ${new Date(appointmentDetails.startTime).toLocaleString()}${appointmentDetails.location ? ` at ${appointmentDetails.location}` : ''}`;
        
        // Get user's phone number (you'll need to add this to user profile or appointment)
        const userPhone = user.phone || user.user_metadata?.phone;
        
        if (userPhone) {
          const smsResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: settings.sms_phone_number,
              To: userPhone,
              Body: smsMessage
            })
          });

          if (!smsResponse.ok) {
            const errorText = await smsResponse.text();
            throw new Error(`Twilio API error: ${smsResponse.status} - ${errorText}`);
          }

          results.sms = { message: "SMS sent via Twilio" };
          console.log("SMS sent successfully via Twilio");
        } else {
          results.sms = { message: "No phone number found for user" };
        }
      } catch (error) {
        console.error("Error with SMS:", error);
        results.errors.push(`SMS error: ${error.message}`);
      }
    }

    // Create in-app notification
    try {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Appointment Reminder',
          message: `Your appointment "${appointmentDetails.title}" is coming up at ${new Date(appointmentDetails.startTime).toLocaleString()}`,
          type: 'info'
        });

      if (notifError) {
        console.error('Error creating in-app notification:', notifError);
      } else {
        results.push = { message: "In-app notification created" };
      }
    } catch (error) {
      console.error("Error creating in-app notification:", error);
      results.errors.push(`In-app notification error: ${error.message}`);
    }

    // Update notification status in database
    const { error: updateError } = await supabase
      .from('appointment_notifications')
      .update({
        status: results.errors.length > 0 ? 'failed' : 'sent',
        sent_at: new Date().toISOString(),
        error_message: results.errors.length > 0 ? results.errors.join('; ') : null,
        metadata: { results }
      })
      .eq('id', notificationId);

    if (updateError) {
      console.error('Failed to update notification status:', updateError);
    }

    return new Response(JSON.stringify({
      success: results.errors.length === 0,
      results,
      notificationId
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-appointment-notifications function:", error);
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