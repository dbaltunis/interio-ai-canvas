import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Syncing from Google Calendar for user:', user.id);

    // Get the Google Calendar integration - first try user's own integration
    let { data: integration, error: integrationError } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('integration_type', 'google_calendar')
      .eq('active', true)
      .single();

    // If no integration found for user, check account owner's integration
    if (integrationError || !integration) {
      console.log('No integration found for user, checking account owner...');

      // Get user's profile to find account owner
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('parent_account_id')
        .eq('user_id', user.id)
        .single();

      if (profile?.parent_account_id) {
        console.log('User has parent account, checking owner integration:', profile.parent_account_id);

        // Try to get account owner's integration
        const { data: ownerIntegration, error: ownerError } = await supabase
          .from('integration_settings')
          .select('*')
          .eq('user_id', profile.parent_account_id)
          .eq('integration_type', 'google_calendar')
          .eq('active', true)
          .single();

        if (ownerIntegration) {
          console.log('Found account owner integration:', ownerIntegration.id);
          integration = ownerIntegration;
          integrationError = null;
        } else {
          console.error('Account owner integration not found:', ownerError);
        }
      }
    }

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
        
        // Mark integration as inactive so user is prompted to reconnect
        await supabase
          .from('integration_settings')
          .update({ active: false, updated_at: new Date().toISOString() })
          .eq('id', integration.id);

        return new Response(
          JSON.stringify({ 
            error: 'Google Calendar token expired. Please reconnect your calendar in Settings.',
            reconnect_required: true 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          }
        );
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      await supabase
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

    // Get calendar ID from configuration or use 'primary'
    const calendarId = integration.configuration?.calendar_id || 'primary';

    // Get events from Google Calendar (next 90 days)
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    console.log(`Fetching events from calendar: ${calendarId}`);

    // Paginate through all events (Google returns max 250 per page)
    let events: any[] = [];
    let pageToken: string | undefined;

    do {
      const pageParam = pageToken ? `&pageToken=${pageToken}` : '';
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=250&showDeleted=true${pageParam}`,
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
      events = events.concat(data.items || []);
      pageToken = data.nextPageToken;
      console.log(`Fetched ${data.items?.length || 0} events (page ${pageToken ? 'has more' : 'final'})`);
    } while (pageToken);

    console.log(`Found ${events.length} total events from Google Calendar`);

    // Get ALL existing appointments with google_event_id (for update + delete detection)
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('id, google_event_id, title, start_time, end_time, description, location')
      .eq('user_id', user.id)
      .not('google_event_id', 'is', null);

    const existingByGoogleId = new Map(
      (existingAppointments || []).map(a => [a.google_event_id, a])
    );
    console.log(`Already synced ${existingByGoogleId.size} events`);

    // Track which google_event_ids we see in this sync (for deletion detection)
    const seenGoogleEventIds = new Set<string>();

    let imported = 0;
    let updated = 0;
    let deleted = 0;
    const errors: string[] = [];

    for (const event of events) {
      // Handle cancelled/deleted events
      if (event.status === 'cancelled') {
        const existing = existingByGoogleId.get(event.id);
        if (existing) {
          console.log(`Deleting cancelled event: ${existing.title}`);
          await supabase.from('appointments').delete().eq('id', existing.id);
          await supabase.from('google_calendar_sync_events').delete().eq('google_event_id', event.id);
          deleted++;
        }
        continue;
      }

      seenGoogleEventIds.add(event.id);

      const existing = existingByGoogleId.get(event.id);

      try {
        // Handle both timed events (dateTime) and all-day events (date)
        let startDateTime: Date;
        let endDateTime: Date;
        let isAllDay = false;

        if (event.start?.dateTime && event.end?.dateTime) {
          startDateTime = new Date(event.start.dateTime);
          endDateTime = new Date(event.end.dateTime);
        } else if (event.start?.date && event.end?.date) {
          // All-day event: use date strings (YYYY-MM-DD)
          startDateTime = new Date(event.start.date + 'T00:00:00');
          endDateTime = new Date(event.end.date + 'T00:00:00');
          isAllDay = true;
        } else {
          // Skip events without any time info
          continue;
        }

        if (existing) {
          // UPDATE existing appointment if Google event changed
          const hasChanged =
            existing.title !== (event.summary || 'Imported Event') ||
            existing.start_time !== startDateTime.toISOString() ||
            existing.end_time !== endDateTime.toISOString() ||
            existing.description !== (event.description || '') ||
            existing.location !== (event.location || '');

          if (hasChanged) {
            console.log(`Updating event: ${event.summary}`);
            await supabase
              .from('appointments')
              .update({
                title: event.summary || 'Imported Event',
                description: event.description || '',
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                location: event.location || '',
              })
              .eq('id', existing.id);
            updated++;
          }
        } else {
          // CREATE new appointment from Google event
          const { data: appointment, error: appointmentError } = await supabase
            .from('appointments')
            .insert({
              user_id: user.id,
              title: event.summary || 'Imported Event',
              description: event.description || '',
              start_time: startDateTime.toISOString(),
              end_time: endDateTime.toISOString(),
              location: event.location || '',
              status: 'scheduled',
              appointment_type: 'consultation',
              google_event_id: event.id,
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
            const { error: syncError } = await supabase
              .from('google_calendar_sync_events')
              .insert({
                integration_id: integration.id,
                appointment_id: appointment.id,
                google_event_id: event.id,
                sync_direction: 'from_google',
                last_synced_at: new Date().toISOString(),
              });

            if (syncError) {
              console.error('Failed to create sync record:', syncError);
            } else {
              imported++;
              console.log(`Imported event: ${event.summary}`);
            }
          }
        }
      } catch (err) {
        console.error('Error processing event:', err);
        errors.push(`Event "${event.summary}": ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Delete local appointments whose Google events no longer exist
    // (only for events that were synced FROM Google, not created locally and pushed)
    for (const [googleEventId, apt] of existingByGoogleId) {
      if (!seenGoogleEventIds.has(googleEventId)) {
        // Check if this was originally synced FROM google (not pushed TO google)
        const { data: syncRecord } = await supabase
          .from('google_calendar_sync_events')
          .select('sync_direction')
          .eq('google_event_id', googleEventId)
          .single();

        if (syncRecord?.sync_direction === 'from_google') {
          console.log(`Deleting locally: Google event ${googleEventId} no longer exists (${apt.title})`);
          await supabase.from('appointments').delete().eq('id', apt.id);
          await supabase.from('google_calendar_sync_events').delete().eq('google_event_id', googleEventId);
          deleted++;
        }
      }
    }

    console.log(`Sync complete: ${imported} imported, ${updated} updated, ${deleted} deleted, ${errors.length} errors`);

    // Update last_sync timestamp
    await supabase
      .from('integration_settings')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', integration.id);

    return new Response(
      JSON.stringify({
        success: true,
        imported,
        updated,
        deleted,
        total: events.length,
        alreadySynced: existingByGoogleId.size,
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
