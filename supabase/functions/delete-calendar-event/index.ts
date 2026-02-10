import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Deletes an event from all connected external calendars (Google, Outlook, Nylas).
 * Called before the appointment is deleted from the database.
 */
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

    console.log('Deleting event from external calendars:', appointmentId);

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      // Appointment already deleted or not found — nothing to do
      return new Response(
        JSON.stringify({ success: true, message: 'Appointment not found, nothing to delete' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: Record<string, string> = {};

    // Delete from Google Calendar
    if (appointment.google_event_id) {
      try {
        const { data: integration } = await supabase
          .from('integration_settings')
          .select('*')
          .eq('user_id', appointment.user_id)
          .eq('integration_type', 'google_calendar')
          .eq('active', true)
          .single();

        if (integration) {
          let accessToken = integration.api_credentials?.access_token;

          // Refresh token if expired
          if (integration.api_credentials?.expires_at && new Date(integration.api_credentials.expires_at) <= new Date()) {
            const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
                client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
                refresh_token: integration.api_credentials?.refresh_token ?? '',
                grant_type: 'refresh_token',
              }),
            });

            if (refreshResponse.ok) {
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
            }
          }

          const calendarId = integration.configuration?.calendar_id || 'primary';
          const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${appointment.google_event_id}`,
            {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${accessToken}` },
            }
          );

          if (response.ok || response.status === 204 || response.status === 404 || response.status === 410) {
            results.google = 'deleted';
            console.log('Deleted from Google Calendar:', appointment.google_event_id);

            // Clean up sync records
            await supabase
              .from('google_calendar_sync_events')
              .delete()
              .eq('google_event_id', appointment.google_event_id);
          } else {
            results.google = `error: ${response.status}`;
            console.error('Failed to delete from Google:', response.status);
          }
        }
      } catch (err) {
        results.google = `error: ${err instanceof Error ? err.message : 'unknown'}`;
        console.error('Google delete error:', err);
      }
    }

    // Delete from Outlook Calendar
    if (appointment.outlook_event_id) {
      try {
        const { data: integration } = await supabase
          .from('integration_settings')
          .select('*')
          .eq('user_id', appointment.user_id)
          .eq('integration_type', 'outlook_calendar')
          .eq('active', true)
          .single();

        if (integration) {
          let accessToken = integration.api_credentials?.access_token;

          // Refresh token if expired
          if (integration.api_credentials?.expires_at && new Date(integration.api_credentials.expires_at) <= new Date()) {
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

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              accessToken = refreshData.access_token;

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
            }
          }

          const response = await fetch(
            `https://graph.microsoft.com/v1.0/me/events/${appointment.outlook_event_id}`,
            {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${accessToken}` },
            }
          );

          if (response.ok || response.status === 204 || response.status === 404) {
            results.outlook = 'deleted';
            console.log('Deleted from Outlook:', appointment.outlook_event_id);
          } else {
            results.outlook = `error: ${response.status}`;
            console.error('Failed to delete from Outlook:', response.status);
          }
        }
      } catch (err) {
        results.outlook = `error: ${err instanceof Error ? err.message : 'unknown'}`;
        console.error('Outlook delete error:', err);
      }
    }

    // Delete from Nylas Calendar
    if (appointment.nylas_event_id) {
      try {
        const { data: integration } = await supabase
          .from('integration_settings')
          .select('*')
          .eq('user_id', appointment.user_id)
          .eq('integration_type', 'nylas_calendar')
          .eq('active', true)
          .single();

        if (integration) {
          const apiKey = Deno.env.get('NYLAS_API_KEY');
          const apiUri = Deno.env.get('NYLAS_API_URI') || 'https://api.eu.nylas.com';
          const grantId = integration.api_credentials?.grant_id;

          if (apiKey && grantId) {
            const response = await fetch(
              `${apiUri}/v3/grants/${grantId}/events/${appointment.nylas_event_id}?calendar_id=primary`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${apiKey}`,
                  'Accept': 'application/json',
                },
              }
            );

            if (response.ok || response.status === 204 || response.status === 404) {
              results.nylas = 'deleted';
              console.log('Deleted from Nylas:', appointment.nylas_event_id);
            } else {
              results.nylas = `error: ${response.status}`;
              console.error('Failed to delete from Nylas:', response.status);
            }
          }
        }
      } catch (err) {
        results.nylas = `error: ${err instanceof Error ? err.message : 'unknown'}`;
        console.error('Nylas delete error:', err);
      }
    }

    console.log('External calendar deletion results:', results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in delete-calendar-event:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
