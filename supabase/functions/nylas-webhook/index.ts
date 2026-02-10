import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-nylas-signature',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Nylas webhook challenge verification (GET)
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const challenge = url.searchParams.get('challenge');
    if (challenge) {
      console.log('Nylas webhook challenge received, responding');
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    return new Response('OK', { status: 200 });
  }

  // Process webhook notification (POST)
  try {
    const body = await req.text();
    const signature = req.headers.get('x-nylas-signature') || req.headers.get('X-Nylas-Signature');
    const webhookSecret = Deno.env.get('NYLAS_WEBHOOK_SECRET');

    // Verify signature if secret is configured
    if (webhookSecret && signature) {
      try {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(webhookSecret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
        const expectedSignature = Array.from(new Uint8Array(sig))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        if (expectedSignature !== signature) {
          console.error('Webhook signature mismatch');
          return new Response('Invalid signature', { status: 401 });
        }
      } catch (sigError) {
        console.error('Signature verification error:', sigError);
        // Continue processing even if verification fails (allows development)
      }
    }

    const payload = JSON.parse(body);
    const triggerType = payload.type;
    const eventData = payload.data?.object;
    const grantId = eventData?.grant_id;

    console.log(`Nylas webhook received: ${triggerType}, grant: ${grantId}`);

    if (!eventData || !grantId) {
      console.log('No event data or grant_id in webhook, skipping');
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Find the user associated with this grant_id
    const { data: integration } = await supabase
      .from('integration_settings')
      .select('user_id')
      .eq('integration_type', 'nylas_calendar')
      .eq('active', true)
      .filter('api_credentials->>grant_id', 'eq', grantId)
      .single();

    if (!integration) {
      console.log(`No integration found for grant_id: ${grantId}`);
      return new Response(JSON.stringify({ received: true, skipped: 'no_integration' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = integration.user_id;

    // Handle different trigger types
    if (triggerType === 'event.created' || triggerType === 'event.created.transformed') {
      await handleEventCreated(supabase, userId, eventData);
    } else if (triggerType === 'event.updated' || triggerType === 'event.updated.transformed') {
      await handleEventUpdated(supabase, userId, eventData);
    } else if (triggerType === 'event.deleted' || triggerType === 'event.deleted.transformed') {
      await handleEventDeleted(supabase, userId, eventData);
    } else if (triggerType === 'grant.expired') {
      await handleGrantExpired(supabase, userId, grantId);
    } else {
      console.log(`Unhandled trigger type: ${triggerType}`);
    }

    return new Response(
      JSON.stringify({ received: true, processed: triggerType }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Always return 200 to prevent Nylas from retrying on processing errors
    return new Response(
      JSON.stringify({ received: true, error: error.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleEventCreated(supabase: any, userId: string, event: any) {
  const nylasEventId = event.id;

  // Check if we already have this event (avoid duplicates)
  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('user_id', userId)
    .eq('nylas_event_id', nylasEventId)
    .maybeSingle();

  if (existing) {
    console.log(`Event ${nylasEventId} already exists locally, skipping create`);
    return;
  }

  const startTime = parseNylasTime(event.when);
  const endTime = parseNylasEndTime(event.when);

  if (!startTime || !endTime) {
    console.log('Cannot parse event times, skipping');
    return;
  }

  const appointmentData: any = {
    user_id: userId,
    title: event.title || 'No Title',
    description: event.description || '',
    start_time: startTime,
    end_time: endTime,
    location: event.location || '',
    nylas_event_id: nylasEventId,
    appointment_type: 'personal',
  };

  // Include participants/attendees
  if (event.participants && event.participants.length > 0) {
    appointmentData.invited_client_emails = event.participants
      .map((p: any) => p.email)
      .filter(Boolean);
  }

  const { error } = await supabase.from('appointments').insert(appointmentData);
  if (error) {
    console.error('Failed to create appointment from webhook:', error);
    return;
  }

  // Create in-app notification
  await createNotification(supabase, userId, {
    title: 'New Calendar Event',
    message: `"${event.title || 'Untitled'}" was added to your calendar`,
    type: 'info',
    category: 'calendar',
    source_type: 'nylas_webhook',
    source_id: nylasEventId,
    action_url: '/?tab=calendar',
  });

  console.log(`Created appointment from webhook: ${event.title}`);
}

async function handleEventUpdated(supabase: any, userId: string, event: any) {
  const nylasEventId = event.id;

  const { data: existing } = await supabase
    .from('appointments')
    .select('id, title, start_time, end_time, description, location')
    .eq('user_id', userId)
    .eq('nylas_event_id', nylasEventId)
    .maybeSingle();

  if (!existing) {
    // Event doesn't exist locally — create it
    console.log(`Updated event ${nylasEventId} not found locally, creating`);
    await handleEventCreated(supabase, userId, event);
    return;
  }

  const startTime = parseNylasTime(event.when);
  const endTime = parseNylasEndTime(event.when);

  if (!startTime || !endTime) return;

  const newTitle = event.title || 'No Title';
  const newDescription = event.description || '';
  const newLocation = event.location || '';

  const hasChanged =
    existing.title !== newTitle ||
    existing.start_time !== startTime ||
    existing.end_time !== endTime ||
    existing.description !== newDescription ||
    existing.location !== newLocation;

  if (!hasChanged) {
    console.log(`Event ${nylasEventId} unchanged, skipping update`);
    return;
  }

  const updateData: any = {
    title: newTitle,
    description: newDescription,
    start_time: startTime,
    end_time: endTime,
    location: newLocation,
    updated_at: new Date().toISOString(),
  };

  // Update participants if present
  if (event.participants && event.participants.length > 0) {
    updateData.invited_client_emails = event.participants
      .map((p: any) => p.email)
      .filter(Boolean);
  }

  const { error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', existing.id);

  if (error) {
    console.error('Failed to update appointment from webhook:', error);
    return;
  }

  // Create notification
  await createNotification(supabase, userId, {
    title: 'Calendar Event Updated',
    message: `"${newTitle}" was updated`,
    type: 'info',
    category: 'calendar',
    source_type: 'nylas_webhook',
    source_id: nylasEventId,
    action_url: '/?tab=calendar',
  });

  console.log(`Updated appointment from webhook: ${newTitle}`);
}

async function handleEventDeleted(supabase: any, userId: string, event: any) {
  const nylasEventId = event.id;

  const { data: existing } = await supabase
    .from('appointments')
    .select('id, title')
    .eq('user_id', userId)
    .eq('nylas_event_id', nylasEventId)
    .maybeSingle();

  if (!existing) {
    console.log(`Deleted event ${nylasEventId} not found locally, skipping`);
    return;
  }

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', existing.id);

  if (error) {
    console.error('Failed to delete appointment from webhook:', error);
    return;
  }

  // Create notification
  await createNotification(supabase, userId, {
    title: 'Calendar Event Deleted',
    message: `"${existing.title}" was removed from your calendar`,
    type: 'warning',
    category: 'calendar',
    source_type: 'nylas_webhook',
    source_id: nylasEventId,
    action_url: '/?tab=calendar',
  });

  console.log(`Deleted appointment from webhook: ${existing.title}`);
}

async function handleGrantExpired(supabase: any, userId: string, grantId: string) {
  // Mark integration as inactive
  await supabase
    .from('integration_settings')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('integration_type', 'nylas_calendar');

  // Notify user
  await createNotification(supabase, userId, {
    title: 'Calendar Connection Expired',
    message: 'Your calendar connection has expired. Please reconnect in Calendar Settings to continue syncing.',
    type: 'warning',
    category: 'calendar',
    source_type: 'nylas_webhook',
    source_id: grantId,
    action_url: '/?tab=calendar',
    priority: 'high',
  });

  console.log(`Grant expired for user ${userId}`);
}

async function createNotification(
  supabase: any,
  userId: string,
  notification: {
    title: string;
    message: string;
    type: string;
    category: string;
    source_type: string;
    source_id: string;
    action_url?: string;
    priority?: string;
  }
) {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      category: notification.category,
      source_type: notification.source_type,
      source_id: notification.source_id,
      action_url: notification.action_url || null,
      priority: notification.priority || 'normal',
      read: false,
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

// Parse Nylas event time formats
function parseNylasTime(when: any): string | null {
  if (!when) return null;
  if (when.start_time) return new Date(when.start_time * 1000).toISOString();
  if (when.date) return new Date(when.date + 'T00:00:00').toISOString();
  if (when.start_date) return new Date(when.start_date + 'T00:00:00').toISOString();
  return null;
}

function parseNylasEndTime(when: any): string | null {
  if (!when) return null;
  if (when.end_time) return new Date(when.end_time * 1000).toISOString();
  if (when.date) return new Date(when.date + 'T23:59:59').toISOString();
  if (when.end_date) {
    const endDate = new Date(when.end_date + 'T00:00:00');
    endDate.setDate(endDate.getDate() - 1);
    return new Date(endDate.getTime() + 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000).toISOString();
  }
  return null;
}
