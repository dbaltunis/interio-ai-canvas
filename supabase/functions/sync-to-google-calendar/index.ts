
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { appointmentId, action } = await req.json();

    // Get the Google Calendar integration
    const { data: integration, error: integrationError } = await supabaseClient
      .from('google_calendar_integrations')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (integrationError || !integration) {
      throw new Error('Google Calendar not connected');
    }

    // Get the appointment details
    const { data: appointment, error: appointmentError } = await supabaseClient
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .eq('user_id', user.id)
      .single();

    if (appointmentError || !appointment) {
      throw new Error('Appointment not found');
    }

    // Check if token needs refresh
    let accessToken = integration.access_token;
    if (integration.token_expires_at && new Date(integration.token_expires_at) <= new Date()) {
      // Refresh the token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: '1080600437939-9ct52n3q0qj362tgq2je28uhp9bof29p.apps.googleusercontent.com',
          client_secret: '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',
          refresh_token: integration.refresh_token ?? '',
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh Google token');
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      // Update the stored token
      await supabaseClient
        .from('google_calendar_integrations')
        .update({
          access_token: accessToken,
          token_expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        })
        .eq('id', integration.id);
    }

    if (action === 'create') {
      // Create event in Google Calendar
      const event = {
        summary: appointment.title,
        description: appointment.description,
        start: {
          dateTime: appointment.start_time,
          timeZone: 'UTC',
        },
        end: {
          dateTime: appointment.end_time,
          timeZone: 'UTC',
        },
        location: appointment.location,
      };

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Google Calendar API error: ${error}`);
      }

      const googleEvent = await response.json();

      // Store the sync record
      await supabaseClient
        .from('google_calendar_sync_events')
        .insert({
          integration_id: integration.id,
          appointment_id: appointmentId,
          google_event_id: googleEvent.id,
          sync_direction: 'to_google',
        });

      return new Response(
        JSON.stringify({ success: true, googleEventId: googleEvent.id }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
