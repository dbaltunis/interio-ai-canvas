import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  notificationId: string;
  appointmentId: string;
  userId: string;
  title: string;
  message: string;
  channels: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notificationId, appointmentId, userId, title, message, channels }: NotificationRequest = await req.json();

    console.log(`Processing notification ${notificationId} for user ${userId}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Get user's notification settings and profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

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
    if (channels.includes('email') && (profile?.email_notifications !== false)) {
      try {
        const appointmentDateTime = appointment ? new Date(appointment.start_time).toLocaleString() : 'TBD';
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; margin-bottom: 20px;">Appointment Reminder</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              You have an upcoming appointment scheduled.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Appointment Details</h3>
              <p><strong>Event:</strong> ${title}</p>
              <p><strong>Date & Time:</strong> ${appointmentDateTime}</p>
              ${appointment?.location ? `<p><strong>Location:</strong> ${appointment.location}</p>` : ''}
              ${appointment?.video_meeting_link ? `<p><strong>Video Meeting:</strong> <a href="${appointment.video_meeting_link}" style="color: #007bff; text-decoration: none;">${appointment.video_meeting_link}</a></p>` : ''}
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This is an automated reminder sent from your appointment management system.
            </p>
          </div>
        `;

        // Call send-email function
        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            to: user.email,
            subject: `Appointment Reminder: ${title}`,
            html: emailHtml,
            user_id: userId
          }
        });

        if (emailError) {
          console.error('Error sending email:', emailError);
          results.errors.push(`Email error: ${emailError.message}`);
        } else {
          results.email = { message: "Email sent successfully" };
          console.log("Email sent successfully");
        }
      } catch (error) {
        console.error("Error sending email:", error);
        results.errors.push(`Email error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      }
    }

    // SMS notifications via Twilio (if enabled and configured)
    if (channels.includes('sms') && profile?.phone_number) {
      try {
        const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
        
        if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
          const appointmentDateTime = appointment ? new Date(appointment.start_time).toLocaleString() : 'TBD';
          const smsMessage = `Appointment Reminder: ${title} at ${appointmentDateTime}${appointment?.location ? ` at ${appointment.location}` : ''}`;
          
          const smsResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: twilioPhoneNumber,
              To: profile.phone_number,
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
          results.sms = { message: "Twilio not configured" };
        }
      } catch (error) {
        console.error("Error with SMS:", error);
        results.errors.push(`SMS error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      }
    }

    // Create in-app notification (if push is included in channels)
    if (channels.includes('push')) {
      try {
        const appointmentDateTime = appointment ? new Date(appointment.start_time).toLocaleString() : 'TBD';
        
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Appointment Reminder',
            message: `Your appointment "${title}" is coming up at ${appointmentDateTime}`,
            type: 'info'
          });

        if (notifError) {
          console.error('Error creating in-app notification:', notifError);
          results.errors.push(`In-app notification error: ${notifError.message}`);
        } else {
          results.push = { message: "In-app notification created" };
        }
      } catch (error) {
        console.error("Error creating in-app notification:", error);
        results.errors.push(`In-app notification error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      }
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