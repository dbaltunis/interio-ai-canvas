import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  notificationId: string;
  userEmail: string;
  title: string;
  message: string;
  channels: string[];
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
    const { 
      notificationId, 
      userEmail, 
      title, 
      message, 
      channels, 
      appointmentDetails 
    }: NotificationRequest = await req.json();

    console.log(`Processing notification ${notificationId} for ${userEmail}`);

    const results = {
      email: null as any,
      sms: null as any,
      push: null as any,
      errors: [] as string[]
    };

    // Send Email Notification
    if (channels.includes('email')) {
      try {
        const emailResponse = await resend.emails.send({
          from: "Appointment Reminder <notifications@resend.dev>",
          to: [userEmail],
          subject: title,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; margin-bottom: 20px;">${title}</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.5;">${message}</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Appointment Details</h3>
                <p><strong>Event:</strong> ${appointmentDetails.title}</p>
                <p><strong>Date & Time:</strong> ${new Date(appointmentDetails.startTime).toLocaleString()}</p>
                ${appointmentDetails.location ? `<p><strong>Location:</strong> ${appointmentDetails.location}</p>` : ''}
                ${appointmentDetails.videoMeetingLink ? 
                  `<p><strong>Video Meeting:</strong> <a href="${appointmentDetails.videoMeetingLink}" target="_blank">Join Meeting</a></p>` : 
                  ''
                }
              </div>
              
              <p style="color: #999; font-size: 14px; margin-top: 30px;">
                This is an automated reminder for your upcoming appointment.
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

    // Send SMS Notification (placeholder for Twilio integration)
    if (channels.includes('sms')) {
      try {
        // TODO: Implement SMS notification using Twilio
        // For now, we'll just log that SMS would be sent
        console.log("SMS notification would be sent here");
        results.sms = { message: "SMS notification placeholder - implement with Twilio" };
      } catch (error) {
        console.error("Error sending SMS:", error);
        results.errors.push(`SMS error: ${error.message}`);
      }
    }

    // Send Push Notification (placeholder for web push or mobile push)
    if (channels.includes('push')) {
      try {
        // TODO: Implement push notification
        // For now, we'll create an in-app notification
        console.log("Push notification would be sent here");
        results.push = { message: "Push notification placeholder - implement with web push API" };
      } catch (error) {
        console.error("Error sending push notification:", error);
        results.errors.push(`Push error: ${error.message}`);
      }
    }

    // Update notification status in database
    const updateResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/appointment_notifications?id=eq.${notificationId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
        },
        body: JSON.stringify({
          status: results.errors.length > 0 ? 'failed' : 'sent',
          sent_at: new Date().toISOString(),
          error_message: results.errors.length > 0 ? results.errors.join('; ') : null,
          metadata: { results }
        })
      }
    );

    if (!updateResponse.ok) {
      console.error('Failed to update notification status');
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