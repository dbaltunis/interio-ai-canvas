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

    const { appointmentId } = await req.json();

    if (!appointmentId) {
      throw new Error('Missing appointmentId parameter');
    }

    console.log('Syncing appointment to Google Calendar:', appointmentId);

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      throw new Error('Appointment not found');
    }

    console.log('Found appointment:', appointment.title);

    // Validate dates before proceeding
    const startTime = new Date(appointment.start_time);
    const endTime = new Date(appointment.end_time);

    if (endTime <= startTime) {
      console.error('Invalid date range for appointment:', appointment.id);
      return new Response(
        JSON.stringify({
          error: 'Invalid date range: end time must be after start time',
          appointmentId: appointment.id
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get Google Calendar integration for the user
    const { data: integration, error: integrationError } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('user_id', appointment.user_id)
      .eq('integration_type', 'google_calendar')
      .eq('active', true)
      .single();

    if (integrationError || !integration) {
      console.log('No Google Calendar integration found or not active');
      return new Response(
        JSON.stringify({ message: 'No active Google Calendar integration' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Build event data — only add video meeting if explicitly requested
    const event: any = {
      summary: appointment.title,
      description: appointment.description || '',
      location: appointment.location || '',
      start: {
        dateTime: appointment.start_time,
        timeZone: 'UTC'
      },
      end: {
        dateTime: appointment.end_time,
        timeZone: 'UTC'
      },
    };

    // Only add conferenceData if the appointment explicitly has a video meeting
    if (appointment.video_provider === 'google_meet' ||
        (appointment.video_meeting_link && appointment.video_meeting_link.includes('meet.google.com'))) {
      event.conferenceData = {
        createRequest: {
          requestId: `appointment-${appointmentId}-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      };
    }

    const existingGoogleEventId = appointment.google_event_id;

    let googleEvent: any;
    let isUpdate = false;

    if (existingGoogleEventId) {
      // UPDATE existing Google Calendar event (PATCH)
      console.log('Updating existing Google Calendar event:', existingGoogleEventId);
      const conferenceParam = event.conferenceData ? '&conferenceDataVersion=1' : '';
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${existingGoogleEventId}?sendUpdates=none${conferenceParam}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        }
      );

      if (response.ok) {
        googleEvent = await response.json();
        isUpdate = true;
        console.log('Successfully updated Google Calendar event:', googleEvent.id);
      } else if (response.status === 404 || response.status === 410) {
        // Event was deleted from Google — create a new one
        console.log('Google event not found (deleted?), creating new one');
        existingGoogleEventId && null; // clear reference
      } else {
        const error = await response.text();
        console.error('Google Calendar PATCH error:', error);
        throw new Error(`Google Calendar API error: ${response.status}`);
      }
    }

    if (!googleEvent) {
      // CREATE new Google Calendar event (POST)
      console.log('Creating new event in Google Calendar:', event.summary);
      const conferenceParam = event.conferenceData ? '?conferenceDataVersion=1' : '';
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events${conferenceParam}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Google Calendar API error:', error);
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      googleEvent = await response.json();
      console.log('Successfully created Google Calendar event:', googleEvent.id);
    }

    // Extract Google Meet link if generated
    const meetLink = googleEvent.conferenceData?.entryPoints?.find(
      (ep: any) => ep.entryPointType === 'video'
    )?.uri;

    // Update appointment with google_event_id (and Meet link only if we requested one)
    const updateData: any = {
      google_event_id: googleEvent.id
    };

    if (meetLink && event.conferenceData) {
      updateData.video_meeting_link = meetLink;
      updateData.video_provider = 'google_meet';
      updateData.video_meeting_data = {
        conferenceId: googleEvent.conferenceData?.conferenceId,
        entryPoints: googleEvent.conferenceData?.entryPoints
      };
    }

    const { error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId);

    if (updateError) {
      console.error('Failed to update appointment with google_event_id:', updateError);
    }

    // Store sync event record (upsert to handle re-syncs)
    if (!isUpdate) {
      const { error: syncError } = await supabase
        .from('google_calendar_sync_events')
        .insert({
          integration_id: integration.id,
          appointment_id: appointmentId,
          google_event_id: googleEvent.id,
          sync_direction: 'to_google',
          last_synced_at: new Date().toISOString(),
        });

      if (syncError) {
        console.error('Failed to store sync record:', syncError);
      }
    } else {
      // Update existing sync record
      await supabase
        .from('google_calendar_sync_events')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('appointment_id', appointmentId)
        .eq('google_event_id', googleEvent.id);
    }

    console.log(`Successfully ${isUpdate ? 'updated' : 'created'} Google Calendar event:`, googleEvent.id);

    return new Response(
      JSON.stringify({
        success: true,
        googleEventId: googleEvent.id,
        message: `Event ${isUpdate ? 'updated in' : 'synced to'} Google Calendar`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-to-google-calendar:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
