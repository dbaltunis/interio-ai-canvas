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

    console.log('Syncing Google Calendar for user:', user.id);

    // Get the Google Calendar integration
    const { data: integration, error: integrationError } = await supabaseClient
      .from('integration_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('integration_type', 'google_calendar')
      .single();

    if (integrationError || !integration) {
      console.error('Integration not found:', integrationError);
      throw new Error('Google Calendar not connected');
    }

    console.log('Found integration:', integration.id);

    let accessToken = integration.api_credentials?.access_token;
    
    // Check if token needs refresh
    if (integration.api_credentials?.expires_at && new Date(integration.api_credentials.expires_at) <= new Date()) {
      console.log('Refreshing expired token...');
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
          refresh_token: integration.api_credentials?.refresh_token ?? '',
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        const errorText = await refreshResponse.text();
        console.error('Token refresh failed:', errorText);
        throw new Error('Failed to refresh Google token');
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      await supabaseClient
        .from('integration_settings')
        .update({
          api_credentials: {
            ...integration.api_credentials,
            access_token: accessToken,
            expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', integration.id);
      
      console.log('Token refreshed successfully');
    }

    // Get events from Google Calendar (next 90 days)
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    console.log('Fetching Google Calendar events...');
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=250`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Calendar API error:', errorText);
      throw new Error(`Failed to fetch Google Calendar events: ${response.status}`);
    }

    const data = await response.json();
    const events = data.items || [];
    console.log(`Found ${events.length} events from Google Calendar`);

    // Get existing sync records to avoid duplicates
    const { data: existingSyncs } = await supabaseClient
      .from('google_calendar_sync_events')
      .select('google_event_id')
      .eq('integration_id', integration.id);

    const existingEventIds = new Set(existingSyncs?.map(sync => sync.google_event_id) || []);
    console.log(`Already synced ${existingEventIds.size} events`);

    let imported = 0;
    const errors: string[] = [];
    
    for (const event of events) {
      // Skip if already synced
      if (existingEventIds.has(event.id)) {
        continue;
      }

      // Skip all-day events or events without proper time info
      if (!event.start?.dateTime || !event.end?.dateTime) {
        continue;
      }

      try {
        // Parse date and time from the Google Calendar event
        const startDateTime = new Date(event.start.dateTime);
        const endDateTime = new Date(event.end.dateTime);
        
        const appointmentDate = startDateTime.toISOString().split('T')[0]; // YYYY-MM-DD
        const appointmentTime = startDateTime.toTimeString().split(' ')[0]; // HH:MM:SS

        // Create appointment from Google event
        const { data: appointment, error: appointmentError } = await supabaseClient
          .from('appointments_booked')
          .insert({
            scheduler_id: null, // No scheduler for imported events
            customer_name: event.summary || 'Imported Event',
            customer_email: user.email || '',
            customer_phone: '',
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            location_type: event.location ? 'on-site' : 'remote',
            notes: event.description || '',
            booking_message: `Imported from Google Calendar: ${event.summary || 'Untitled'}`,
            customer_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            appointment_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            status: 'confirmed',
          })
          .select()
          .single();

        if (appointmentError) {
          console.error('Failed to create appointment:', appointmentError);
          errors.push(`Event "${event.summary}": ${appointmentError.message}`);
          continue;
        }

        if (appointment) {
          // Create sync record
          const { error: syncError } = await supabaseClient
            .from('google_calendar_sync_events')
            .insert({
              integration_id: integration.id,
              appointment_id: appointment.id,
              google_event_id: event.id,
              sync_direction: 'from_google',
            });

          if (syncError) {
            console.error('Failed to create sync record:', syncError);
          } else {
            imported++;
            console.log(`Imported event: ${event.summary}`);
          }
        }
      } catch (err) {
        console.error('Error processing event:', err);
        errors.push(`Event "${event.summary}": ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    console.log(`Import complete: ${imported} events imported, ${errors.length} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported, 
        total: events.length,
        alreadySynced: existingEventIds.size,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
