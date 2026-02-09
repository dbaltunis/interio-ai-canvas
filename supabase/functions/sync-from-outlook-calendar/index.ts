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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Syncing from Outlook Calendar for user:', user.id);

    // Get Outlook Calendar integration - first user's own, then account owner fallback
    let { data: integration, error: integrationError } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('integration_type', 'outlook_calendar')
      .eq('active', true)
      .single();

    if (integrationError || !integration) {
      console.log('No Outlook integration for user, checking account owner...');

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('parent_account_id')
        .eq('user_id', user.id)
        .single();

      if (profile?.parent_account_id) {
        const { data: ownerIntegration } = await supabase
          .from('integration_settings')
          .select('*')
          .eq('user_id', profile.parent_account_id)
          .eq('integration_type', 'outlook_calendar')
          .eq('active', true)
          .single();

        if (ownerIntegration) {
          integration = ownerIntegration;
          integrationError = null;
        }
      }
    }

    if (integrationError || !integration) {
      throw new Error('Outlook Calendar not connected');
    }

    let accessToken = integration.api_credentials?.access_token;

    // Refresh token if needed
    if (integration.api_credentials?.expires_at && new Date(integration.api_credentials.expires_at) <= new Date()) {
      console.log('Refreshing expired Microsoft token...');
      accessToken = await refreshMicrosoftToken(supabase, integration);
    }

    // Fetch events from Outlook Calendar (next 90 days)
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const calendarUrl = `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${timeMin}&endDateTime=${timeMax}&$top=250&$orderby=start/dateTime&$select=id,subject,body,start,end,location,isAllDay,onlineMeeting`;

    console.log('Fetching Outlook calendar events...');
    const response = await fetch(calendarUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Prefer': 'outlook.timezone="UTC"',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Microsoft Graph API error:', errorText);
      throw new Error(`Failed to fetch Outlook Calendar events: ${response.status}`);
    }

    const data = await response.json();
    const events = data.value || [];
    console.log(`Found ${events.length} events from Outlook Calendar`);

    // Get existing appointments with outlook_event_id to avoid duplicates
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('outlook_event_id')
      .eq('user_id', user.id)
      .not('outlook_event_id', 'is', null);

    const existingEventIds = new Set(existingAppointments?.map((a: any) => a.outlook_event_id) || []);
    console.log(`Already synced ${existingEventIds.size} Outlook events`);

    let imported = 0;
    const errors: string[] = [];

    for (const event of events) {
      // Skip already synced
      if (existingEventIds.has(event.id)) continue;

      // Skip all-day events
      if (event.isAllDay) continue;

      // Skip events without proper start/end
      if (!event.start?.dateTime || !event.end?.dateTime) continue;

      try {
        const startDateTime = new Date(event.start.dateTime + 'Z');
        const endDateTime = new Date(event.end.dateTime + 'Z');

        const { data: appointment, error: appointmentError } = await supabase
          .from('appointments')
          .insert({
            user_id: user.id,
            title: event.subject || 'Imported Outlook Event',
            description: event.body?.content || '',
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            location: event.location?.displayName || '',
            status: 'scheduled',
            appointment_type: 'consultation',
            outlook_event_id: event.id,
          })
          .select()
          .single();

        if (appointmentError) {
          console.error('Failed to create appointment:', appointmentError);
          errors.push(`Event "${event.subject}": ${appointmentError.message}`);
          continue;
        }

        if (appointment) {
          imported++;
          console.log(`Imported Outlook event: ${event.subject}`);
        }
      } catch (err) {
        console.error('Error processing Outlook event:', err);
        errors.push(`Event "${event.subject}": ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    console.log(`Outlook import complete: ${imported} events imported, ${errors.length} errors`);

    // Update last_sync timestamp
    await supabase
      .from('integration_settings')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', integration.id);

    return new Response(
      JSON.stringify({
        success: true,
        imported,
        total: events.length,
        alreadySynced: existingEventIds.size,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Outlook sync error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
