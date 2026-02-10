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
    const { userId, action } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    const apiKey = Deno.env.get('NYLAS_API_KEY');
    const apiUri = Deno.env.get('NYLAS_API_URI') || 'https://api.eu.nylas.com';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://ldgrcodffsalkevafbkb.supabase.co';

    if (!apiKey) {
      throw new Error(
        'Nylas API Key not configured. ' +
        'Please set NYLAS_API_KEY in your Supabase Edge Function secrets.'
      );
    }

    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Check user has a Nylas integration
    const { data: integration } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('integration_type', 'nylas_calendar')
      .eq('active', true)
      .single();

    if (!integration) {
      throw new Error('Nylas calendar not connected. Please connect your calendar first.');
    }

    if (action === 'status') {
      return await getWebhookStatus(apiKey, apiUri, supabaseUrl, integration);
    }

    if (action === 'delete') {
      return await deleteWebhook(apiKey, apiUri, integration, supabase, userId);
    }

    // Default: create webhook
    return await createWebhook(apiKey, apiUri, supabaseUrl, integration, supabase, userId);

  } catch (error) {
    console.error('Nylas webhook setup error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

async function createWebhook(
  apiKey: string,
  apiUri: string,
  supabaseUrl: string,
  integration: any,
  supabase: any,
  userId: string
) {
  const webhookUrl = `${supabaseUrl}/functions/v1/nylas-webhook`;

  // Check if webhook already exists
  const existingWebhookId = integration.configuration?.webhook_id;
  if (existingWebhookId) {
    // Verify it still exists
    const checkResponse = await fetch(`${apiUri}/v3/webhooks/${existingWebhookId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
    });
    if (checkResponse.ok) {
      const existing = await checkResponse.json();
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Webhook already active',
          webhookId: existingWebhookId,
          status: existing.data?.status || 'active',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    // Webhook no longer exists, create a new one
  }

  // Create new webhook subscription
  const response = await fetch(`${apiUri}/v3/webhooks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      trigger_types: [
        'event.created',
        'event.updated',
        'event.deleted',
        'grant.expired',
      ],
      webhook_url: webhookUrl,
      description: `InterioApp calendar sync for ${integration.api_credentials?.email || userId}`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to create Nylas webhook:', errorText);
    throw new Error(`Failed to create webhook: ${response.status} - ${errorText}`);
  }

  const webhookData = await response.json();
  const webhookId = webhookData.data?.id;
  const webhookSecret = webhookData.data?.webhook_secret;

  // Store webhook ID in integration configuration
  const updatedConfig = {
    ...(integration.configuration || {}),
    webhook_id: webhookId,
    webhook_active: true,
  };

  await supabase
    .from('integration_settings')
    .update({
      configuration: updatedConfig,
      webhook_url: webhookUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('integration_type', 'nylas_calendar');

  console.log(`Nylas webhook created: ${webhookId}`);

  return new Response(
    JSON.stringify({
      success: true,
      webhookId,
      webhookSecret,
      message: 'Webhook created successfully. Store the webhook_secret securely as NYLAS_WEBHOOK_SECRET environment variable.',
      triggerTypes: ['event.created', 'event.updated', 'event.deleted', 'grant.expired'],
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  );
}

async function getWebhookStatus(
  apiKey: string,
  apiUri: string,
  supabaseUrl: string,
  integration: any
) {
  const webhookId = integration.configuration?.webhook_id;

  if (!webhookId) {
    return new Response(
      JSON.stringify({ active: false, message: 'No webhook configured' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }

  const response = await fetch(`${apiUri}/v3/webhooks/${webhookId}`, {
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
  });

  if (!response.ok) {
    return new Response(
      JSON.stringify({ active: false, message: 'Webhook not found or expired' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }

  const data = await response.json();

  return new Response(
    JSON.stringify({
      active: data.data?.status === 'active',
      webhookId,
      status: data.data?.status,
      triggerTypes: data.data?.trigger_types,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  );
}

async function deleteWebhook(
  apiKey: string,
  apiUri: string,
  integration: any,
  supabase: any,
  userId: string
) {
  const webhookId = integration.configuration?.webhook_id;

  if (!webhookId) {
    return new Response(
      JSON.stringify({ success: true, message: 'No webhook to delete' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }

  // Delete from Nylas
  await fetch(`${apiUri}/v3/webhooks/${webhookId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });

  // Clear from integration settings
  const updatedConfig = {
    ...(integration.configuration || {}),
    webhook_id: null,
    webhook_active: false,
  };

  await supabase
    .from('integration_settings')
    .update({
      configuration: updatedConfig,
      webhook_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('integration_type', 'nylas_calendar');

  return new Response(
    JSON.stringify({ success: true, message: 'Webhook deleted' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  );
}
