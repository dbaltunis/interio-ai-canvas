
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

    console.log('Syncing appointment to Google Calendar:', appointmentId);

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments_booked')
      .select(`
        *,
        appointment_schedulers (
          name,
          user_id,
          duration
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      throw new Error('Appointment not found');
    }

    // Get Google Calendar integration for the scheduler owner
    const { data: integration, error: integrationError } = await supabase
      .from('google_calendar_integrations')
      .select('*')
      .eq('user_id', appointment.appointment_schedulers.user_id)
      .eq('sync_enabled', true)
      .single();

    if (integrationError || !integration) {
      console.log('No Google Calendar integration found or sync disabled');
      return new Response(
        JSON.stringify({ message: 'No active Google Calendar integration' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Google Calendar event
    const startDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const endDateTime = new Date(startDateTime.getTime() + appointment.appointment_schedulers.duration * 60000);

    const event = {
      summary: `${appointment.appointment_schedulers.name} - ${appointment.customer_name}`,
      description: `
        Customer: ${appointment.customer_name}
        Email: ${appointment.customer_email}
        Phone: ${appointment.customer_phone || 'Not provided'}
        Location Type: ${appointment.location_type}
        ${appointment.notes ? `Notes: ${appointment.notes}` : ''}
        ${appointment.booking_message ? `Message: ${appointment.booking_message}` : ''}
      `.trim(),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: appointment.appointment_timezone || 'UTC'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: appointment.appointment_timezone || 'UTC'
      },
      attendees: [
        { email: appointment.customer_email }
      ]
    };

    // Call Google Calendar API
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${integration.calendar_id || 'primary'}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.access_token}`,
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

    const googleEvent = await response.json();

    // Store sync event record
    const { error: syncError } = await supabase
      .from('google_calendar_sync_events')
      .insert({
        integration_id: integration.id,
        appointment_id: appointmentId,
        google_event_id: googleEvent.id,
        sync_direction: 'to_google'
      });

    if (syncError) {
      console.error('Failed to store sync record:', syncError);
    }

    console.log('Successfully synced to Google Calendar:', googleEvent.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        googleEventId: googleEvent.id,
        message: 'Event synced to Google Calendar'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-to-google-calendar:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
