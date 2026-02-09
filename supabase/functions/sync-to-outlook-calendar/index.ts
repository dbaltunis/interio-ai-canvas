import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function refreshMicrosoftToken(
  supabase: any,
  integration: any
): Promise<string> {
  const refreshResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: Deno.env.get('MICROSOFT_CLIENT_ID') || '',
      client_secret: Deno.env.get('MICROSOFT_CLIENT_SECRET') || '',
      refresh_token: integration.api_credentials?.refresh_token ?? '',
      grant_type: 'refresh_token',
      scope: 'Calendars.ReadWrite offline_access User.Read',
    }),
  });

  if (!refreshResponse.ok) {
    const errorText = await refreshResponse.text();
    console.error('Microsoft token refresh failed:', errorText);
    throw new Error('Failed to refresh Microsoft token');
  }

  const refreshData = await refreshResponse.json();

  await supabase
    .from('integration_settings')
    .update({
      api_credentials: {
        ...integration.api_credentials,
        access_token: refreshData.access_token,
        refresh_token: refreshData.refresh_token || integration.api_credentials.refresh_token,
        expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', integration.id);

  return refreshData.access_token;
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

    const { appointmentId } = await req.json();

    if (!appointmentId) {
      throw new Error('Missing appointmentId parameter');
    }

    console.log('Syncing appointment to Outlook Calendar:', appointmentId);

    // Get appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      throw new Error('Appointment not found');
    }

    // Validate dates
    const startTime = new Date(appointment.start_time);
    const endTime = new Date(appointment.end_time);

    if (endTime <= startTime) {
      return new Response(
        JSON.stringify({ error: 'Invalid date range: end time must be after start time' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Outlook integration
    const { data: integration, error: integrationError } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('user_id', appointment.user_id)
      .eq('integration_type', 'outlook_calendar')
      .eq('active', true)
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ message: 'No active Outlook Calendar integration' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let accessToken = integration.api_credentials?.access_token;

    // Check if token needs refresh
    if (integration.api_credentials?.expires_at && new Date(integration.api_credentials.expires_at) <= new Date()) {
      console.log('Refreshing expired Microsoft token...');
      accessToken = await refreshMicrosoftToken(supabase, integration);
    }

    // Create Outlook Calendar event via Microsoft Graph API
    const event = {
      subject: appointment.title,
      body: {
        contentType: 'text',
        content: appointment.description || '',
      },
      start: {
        dateTime: appointment.start_time,
        timeZone: 'UTC',
      },
      end: {
        dateTime: appointment.end_time,
        timeZone: 'UTC',
      },
      location: {
        displayName: appointment.location || '',
      },
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
    };

    console.log('Creating event in Outlook Calendar:', event.subject);

    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Microsoft Graph API error:', errorText);
      throw new Error(`Microsoft Graph API error: ${response.status}`);
    }

    const outlookEvent = await response.json();
    console.log('Successfully created Outlook event:', outlookEvent.id);

    // Extract Teams meeting link if generated
    const teamsLink = outlookEvent.onlineMeeting?.joinUrl;

    // Update appointment with outlook_event_id and Teams link
    const updateData: any = {
      outlook_event_id: outlookEvent.id,
    };

    if (teamsLink) {
      updateData.video_meeting_link = teamsLink;
      updateData.video_provider = 'microsoft_teams';
      updateData.video_meeting_data = {
        joinUrl: outlookEvent.onlineMeeting?.joinUrl,
        conferenceId: outlookEvent.onlineMeeting?.conferenceId,
      };
    }

    const { error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId);

    if (updateError) {
      console.error('Failed to update appointment with outlook_event_id:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        outlookEventId: outlookEvent.id,
        message: 'Event synced to Outlook Calendar',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-to-outlook-calendar:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
