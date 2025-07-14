
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

    // Get the Google Calendar integration
    const { data: integration, error: integrationError } = await supabaseClient
      .from('google_calendar_integrations')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (integrationError || !integration) {
      throw new Error('Google Calendar not connected');
    }

    // Get events from Google Calendar
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days

    let accessToken = integration.access_token;
    
    // Check if token needs refresh
    if (integration.token_expires_at && new Date(integration.token_expires_at) <= new Date()) {
      // Refresh the token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
          refresh_token: integration.refresh_token ?? '',
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh Google token');
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      await supabaseClient
        .from('google_calendar_integrations')
        .update({
          access_token: accessToken,
          token_expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        })
        .eq('id', integration.id);
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Google Calendar events');
    }

    const data = await response.json();
    const events = data.items || [];

    // Get existing sync records to avoid duplicates
    const { data: existingSyncs } = await supabaseClient
      .from('google_calendar_sync_events')
      .select('google_event_id')
      .eq('integration_id', integration.id);

    const existingEventIds = new Set(existingSyncs?.map(sync => sync.google_event_id) || []);

    let imported = 0;
    
    for (const event of events) {
      // Skip if already synced or doesn't have required fields
      if (existingEventIds.has(event.id) || !event.start?.dateTime || !event.end?.dateTime) {
        continue;
      }

      // Create appointment from Google event
      const { data: appointment, error: appointmentError } = await supabaseClient
        .from('appointments')
        .insert({
          user_id: user.id,
          title: event.summary || 'Imported from Google Calendar',
          description: event.description,
          start_time: event.start.dateTime,
          end_time: event.end.dateTime,
          location: event.location,
          appointment_type: 'meeting',
          status: 'scheduled',
        })
        .select()
        .single();

      if (!appointmentError && appointment) {
        // Create sync record
        await supabaseClient
          .from('google_calendar_sync_events')
          .insert({
            integration_id: integration.id,
            appointment_id: appointment.id,
            google_event_id: event.id,
            sync_direction: 'from_google',
          });

        imported++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, imported }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
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
