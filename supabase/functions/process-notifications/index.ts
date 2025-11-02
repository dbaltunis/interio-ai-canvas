import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log("Processing scheduled notifications...");
    
    // Get pending notifications that are due to be sent
    const now = new Date().toISOString();
    const { data: notifications, error } = await supabase
      .from('appointment_notifications')
      .select('*, appointments(title, start_time, location, video_meeting_link), user_profiles(display_name)')
      .eq('status', 'pending')
      .lte('scheduled_for', now);

    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
    console.log(`Found ${notifications.length} notifications to process`);

    const results = [];

    for (const notification of notifications) {
      try {
        // Get user email from auth.users table
        const userResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/get_user_email`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json',
              'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            },
            body: JSON.stringify({ user_id: notification.user_id })
          }
        );

        let userEmail = null;
        if (userResponse.ok) {
          const emailResult = await userResponse.json();
          userEmail = emailResult;
        }

        if (!userEmail) {
          console.warn(`No email found for user ${notification.user_id}`);
          continue;
        }

        // Send notification via the notification service
        const notificationResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-appointment-notifications`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              notificationId: notification.id,
              userEmail: userEmail,
              title: notification.title,
              message: notification.message,
              channels: notification.channels,
              appointmentDetails: {
                title: notification.appointments?.title || 'Appointment',
                startTime: notification.appointments?.start_time || notification.scheduled_for,
                location: notification.appointments?.location,
                videoMeetingLink: notification.appointments?.video_meeting_link,
              }
            })
          }
        );

        const notificationResult = await notificationResponse.json();
        results.push({
          notificationId: notification.id,
          success: notificationResponse.ok,
          result: notificationResult
        });

        console.log(`Processed notification ${notification.id}:`, notificationResult);
      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error);
        results.push({
          notificationId: notification.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      results
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in process-notifications function:", error);
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