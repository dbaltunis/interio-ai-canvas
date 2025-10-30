import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarEventRequest {
  summary: string;
  description: string;
  start_time: string; // ISO 8601 format
  end_time: string; // ISO 8601 format
  attendee_email: string;
  attendee_name: string;
  scheduler_email: string;
  scheduler_user_id: string; // Add this to identify which user's calendar to use
  timezone?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      summary,
      description,
      start_time,
      end_time,
      attendee_email,
      attendee_name,
      scheduler_email,
      scheduler_user_id,
      timezone = 'UTC'
    }: CalendarEventRequest = await req.json();

    console.log('Creating calendar event:', {
      summary,
      start_time,
      end_time,
      attendee_email,
      scheduler_email,
      scheduler_user_id
    });

    // Get the user's Google Calendar OAuth tokens from integration_settings
    const { data: integration, error: integrationError } = await supabase
      .from('integration_settings')
      .select('api_credentials, active')
      .eq('user_id', scheduler_user_id)
      .eq('integration_type', 'google_calendar')
      .single();
    
    if (integrationError || !integration || !integration.active) {
      console.log('User has not connected Google Calendar:', integrationError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Google Calendar not connected for this user',
          meetLink: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const credentials = integration.api_credentials as any;
    const accessToken = credentials.access_token;
    
    if (!accessToken) {
      console.log('No access token found for user');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Google Calendar access token not found',
          meetLink: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create calendar event with Google Meet
    const event = {
      summary,
      description,
      start: {
        dateTime: start_time,
        timeZone: timezone,
      },
      end: {
        dateTime: end_time,
        timeZone: timezone,
      },
      attendees: [
        { email: attendee_email, displayName: attendee_name },
        { email: scheduler_email }
      ],
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    // Create the event in Google Calendar
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${scheduler_email}/events?conferenceDataVersion=1`,
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
      const errorText = await response.text();
      console.error('Google Calendar API error:', errorText);
      throw new Error(`Failed to create calendar event: ${errorText}`);
    }

    const calendarEvent = await response.json();
    const meetLink = calendarEvent.hangoutLink || calendarEvent.conferenceData?.entryPoints?.[0]?.uri;

    console.log('Calendar event created successfully:', {
      eventId: calendarEvent.id,
      meetLink
    });

    return new Response(
      JSON.stringify({
        success: true,
        eventId: calendarEvent.id,
        meetLink,
        htmlLink: calendarEvent.htmlLink
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-calendar-event:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

