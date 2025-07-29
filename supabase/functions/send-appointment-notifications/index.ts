import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

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
        const resend = new Resend(settings.email_api_key_encrypted);
        
        const fromAddress = settings.email_from_address || 'notifications@yourdomain.com';
        const fromName = settings.email_from_name || 'Appointment Reminder';
        
        const emailResponse = await resend.emails.send({
          from: `${fromName} <${fromAddress}>`,
          to: [user.email],
          subject: 'Appointment Reminder',
          html: `
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
          `,
        });

        results.email = emailResponse;
        console.log("Email sent successfully:", emailResponse);
      } catch (error) {
        console.error("Error sending email:", error);
        results.errors.push(`Email error: ${error.message}`);
      }
    }

    // SMS notifications (if enabled in future)
    if (settings.sms_notifications_enabled) {
      try {
        console.log("SMS notifications not yet implemented");
        results.sms = { message: "SMS notifications will be available soon" };
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