import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { userId, direction, days } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    const apiKey = Deno.env.get('NYLAS_API_KEY');
    const apiUri = Deno.env.get('NYLAS_API_URI') || 'https://api.eu.nylas.com';

    if (!apiKey) {
      throw new Error('Nylas API Key not configured');
    }

    // Get user's Nylas integration from database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { data: integration, error: integrationError } = await supabaseClient
      .from('integration_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('integration_type', 'nylas_calendar')
      .eq('active', true)
      .single();

    if (integrationError || !integration) {
      throw new Error('Nylas calendar integration not found. Please connect your calendar first.');
    }

    const grantId = integration.api_credentials?.grant_id;
    if (!grantId) {
      throw new Error('No grant ID found. Please reconnect your calendar.');
    }

    const syncDirection = direction || 'from'; // 'from' = pull from provider, 'to' = push to provider
    const syncDays = days || 90;

    if (syncDirection === 'from') {
      return await syncFromProvider(supabaseClient, apiKey, apiUri, grantId, userId, syncDays);
    } else {
      return await syncToProvider(supabaseClient, apiKey, apiUri, grantId, userId, syncDays);
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

async function syncFromProvider(
  supabase: any, apiKey: string, apiUri: string, grantId: string, userId: string, days: number
) {
  const now = new Date();
  const start = Math.floor(now.getTime() / 1000);
  const end = Math.floor(new Date(now.getTime() + days * 24 * 60 * 60 * 1000).getTime() / 1000);

  // Fetch events from Nylas
  let allEvents: any[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      calendar_id: 'primary',
      start: start.toString(),
      end: end.toString(),
      limit: '200',
    });
    if (pageToken) {
      params.set('page_token', pageToken);
    }

    const response = await fetch(
      `${apiUri}/v3/grants/${grantId}/events?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch events from Nylas: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    allEvents = allEvents.concat(data.data || []);
    pageToken = data.next_cursor;
  } while (pageToken);

  // Get existing appointments with nylas_event_id to avoid duplicates
  const { data: existingAppointments } = await supabase
    .from('appointments')
    .select('id, nylas_event_id, title, start_time, end_time, description, location')
    .eq('user_id', userId)
    .not('nylas_event_id', 'is', null);

  const existingByNylasId = new Map(
    (existingAppointments || []).map((a: any) => [a.nylas_event_id, a])
  );

  // Track seen event IDs for deletion detection
  const seenNylasEventIds = new Set<string>();

  let synced = 0;
  let updated = 0;
  let deleted = 0;
  let skipped = 0;

  for (const event of allEvents) {
    // Handle cancelled events — delete locally
    if (event.status === 'cancelled') {
      const existing = existingByNylasId.get(event.id);
      if (existing) {
        console.log(`Deleting cancelled Nylas event: ${existing.title}`);
        await supabase.from('appointments').delete().eq('id', existing.id);
        deleted++;
      }
      skipped++;
      continue;
    }

    seenNylasEventIds.add(event.id);

    // Parse event times
    const startTime = parseNylasTime(event.when);
    const endTime = parseNylasEndTime(event.when);

    if (!startTime || !endTime) {
      skipped++;
      continue;
    }

    const appointmentData = {
      user_id: userId,
      title: event.title || 'No Title',
      description: event.description || '',
      start_time: startTime,
      end_time: endTime,
      location: event.location || '',
      nylas_event_id: event.id,
      appointment_type: 'personal',
      color: event.organizer_email ? undefined : '#3b82f6',
    };

    const existing = existingByNylasId.get(event.id);

    if (existing) {
      // UPDATE existing — check if anything changed
      const hasChanged =
        existing.title !== appointmentData.title ||
        existing.start_time !== appointmentData.start_time ||
        existing.end_time !== appointmentData.end_time ||
        existing.description !== appointmentData.description ||
        existing.location !== appointmentData.location;

      if (hasChanged) {
        await supabase
          .from('appointments')
          .update({
            title: appointmentData.title,
            description: appointmentData.description,
            start_time: appointmentData.start_time,
            end_time: appointmentData.end_time,
            location: appointmentData.location,
          })
          .eq('id', existing.id);
        updated++;
      }
    } else {
      // Insert new
      await supabase.from('appointments').insert(appointmentData);
      synced++;
    }
  }

  // Delete local appointments whose Nylas events no longer exist
  for (const [nylasEventId, apt] of existingByNylasId) {
    if (!seenNylasEventIds.has(nylasEventId)) {
      console.log(`Deleting locally: Nylas event ${nylasEventId} no longer exists (${apt.title})`);
      await supabase.from('appointments').delete().eq('id', apt.id);
      deleted++;
    }
  }

  // Update last sync time
  await supabase
    .from('integration_settings')
    .update({
      configuration: {
        calendar_id: 'primary',
        sync_enabled: true,
        nylas_region: 'eu',
        last_sync: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('integration_type', 'nylas_calendar');

  return new Response(
    JSON.stringify({
      success: true,
      synced,
      updated,
      deleted,
      skipped,
      total: allEvents.length,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  );
}

async function syncToProvider(
  supabase: any, apiKey: string, apiUri: string, grantId: string, userId: string, days: number
) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  // Get local appointments that need syncing:
  // 1. Appointments WITHOUT nylas_event_id and WITHOUT google_event_id (new local events)
  // 2. Appointments WITH nylas_event_id that may need updating
  const { data: localAppointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', now.toISOString())
    .lte('start_time', futureDate.toISOString());

  if (error || !localAppointments) {
    throw new Error('Failed to fetch local appointments');
  }

  let synced = 0;
  let updated = 0;
  let failed = 0;

  for (const apt of localAppointments) {
    try {
      const startTime = new Date(apt.start_time);
      const endTime = new Date(apt.end_time);

      const eventData: any = {
        title: apt.title || 'InterioApp Event',
        description: apt.description || '',
        when: {
          start_time: Math.floor(startTime.getTime() / 1000),
          end_time: Math.floor(endTime.getTime() / 1000),
        },
      };

      if (apt.location) {
        eventData.location = apt.location;
      }

      if (apt.nylas_event_id) {
        // UPDATE existing Nylas event (PUT)
        const response = await fetch(
          `${apiUri}/v3/grants/${grantId}/events/${apt.nylas_event_id}?calendar_id=primary`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(eventData),
          }
        );

        if (response.ok) {
          updated++;
        } else if (response.status === 404) {
          // Event deleted from provider — create a new one
          console.log(`Nylas event ${apt.nylas_event_id} not found, creating new`);
          const createResponse = await fetch(
            `${apiUri}/v3/grants/${grantId}/events?calendar_id=primary`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify(eventData),
            }
          );

          if (createResponse.ok) {
            const created = await createResponse.json();
            await supabase
              .from('appointments')
              .update({ nylas_event_id: created.data?.id })
              .eq('id', apt.id);
            synced++;
          } else {
            failed++;
          }
        } else {
          failed++;
        }
      } else if (!apt.google_event_id) {
        // New local event — create in Nylas
        const response = await fetch(
          `${apiUri}/v3/grants/${grantId}/events?calendar_id=primary`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(eventData),
          }
        );

        if (response.ok) {
          const created = await response.json();
          // Store the Nylas event ID back
          await supabase
            .from('appointments')
            .update({ nylas_event_id: created.data?.id })
            .eq('id', apt.id);
          synced++;
        } else {
          failed++;
        }
      }
    } catch (_) {
      failed++;
    }
  }

  return new Response(
    JSON.stringify({ success: true, synced, updated, failed, total: localAppointments.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  );
}

// Parse Nylas event time formats
function parseNylasTime(when: any): string | null {
  if (!when) return null;

  // Timespan: { start_time: unix, end_time: unix }
  if (when.start_time) {
    return new Date(when.start_time * 1000).toISOString();
  }
  // Date: { date: "YYYY-MM-DD" } (all-day event)
  if (when.date) {
    return new Date(when.date + 'T00:00:00').toISOString();
  }
  // Datespan: { start_date: "YYYY-MM-DD", end_date: "YYYY-MM-DD" }
  if (when.start_date) {
    return new Date(when.start_date + 'T00:00:00').toISOString();
  }
  return null;
}

function parseNylasEndTime(when: any): string | null {
  if (!when) return null;

  if (when.end_time) {
    return new Date(when.end_time * 1000).toISOString();
  }
  if (when.date) {
    return new Date(when.date + 'T23:59:59').toISOString();
  }
  if (when.end_date) {
    // Nylas/Google returns end_date as day AFTER the event ends
    const endDate = new Date(when.end_date + 'T00:00:00');
    endDate.setDate(endDate.getDate() - 1);
    return new Date(endDate.getTime() + 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000).toISOString();
  }
  return null;
}
