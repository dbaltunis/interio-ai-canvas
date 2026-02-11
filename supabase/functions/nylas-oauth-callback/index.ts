import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cross-Origin-Opener-Policy': 'unsafe-none',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error) {
      return new Response(
        renderHTML('error', `Authentication failed: ${errorDescription || error}`, 'NYLAS_AUTH_ERROR', error),
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    if (!code) {
      return new Response(
        renderHTML('error', 'No authorization code received', 'NYLAS_AUTH_ERROR', 'no_code'),
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    const userId = state;
    if (!userId) {
      return new Response(
        renderHTML('error', 'Authentication state error', 'NYLAS_AUTH_ERROR', 'invalid_state'),
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    // Exchange code for grant_id via Nylas v3 token endpoint
    const apiUri = Deno.env.get('NYLAS_API_URI') || 'https://api.eu.nylas.com';
    const clientId = Deno.env.get('NYLAS_CLIENT_ID') || '';
    const apiKey = Deno.env.get('NYLAS_API_KEY') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL not configured');
    }
    const redirectUri = `${supabaseUrl}/functions/v1/nylas-oauth-callback`;

    const tokenResponse = await fetch(`${apiUri}/v3/connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: apiKey, // In Nylas v3, the API key serves as client_secret
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return new Response(
        renderHTML('error', 'Failed to exchange authorization code', 'NYLAS_AUTH_ERROR', 'token_exchange_failed'),
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    const tokenData = await tokenResponse.json();
    const grantId = tokenData.grant_id;
    const email = tokenData.email || '';

    if (!grantId) {
      return new Response(
        renderHTML('error', 'No grant ID received from Nylas', 'NYLAS_AUTH_ERROR', 'no_grant_id'),
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    // Detect provider from grant info
    // Fetch grant details to determine if Google or Microsoft
    let provider = 'unknown';
    try {
      const grantResponse = await fetch(`${apiUri}/v3/grants/${grantId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
      });
      if (grantResponse.ok) {
        const grantData = await grantResponse.json();
        provider = grantData?.data?.provider || 'unknown';
      }
    } catch (_) {
      // Non-critical — we can still store the grant
    }

    // Store the integration in Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const integrationData = {
      user_id: userId,
      integration_type: 'nylas_calendar',
      active: true,
      api_credentials: {
        grant_id: grantId,
        email,
        provider,
      },
      configuration: {
        calendar_id: 'primary',
        sync_enabled: true,
        nylas_region: 'eu',
      },
      updated_at: new Date().toISOString(),
    };

    const { error: dbError } = await supabaseClient
      .from('integration_settings')
      .upsert(integrationData, { onConflict: 'user_id,integration_type' });

    if (dbError) {
      return new Response(
        renderHTML('error', 'Failed to save integration', 'NYLAS_AUTH_ERROR', 'db_error'),
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    // Success
    const providerName = provider === 'microsoft' ? 'Microsoft/Outlook' : provider === 'google' ? 'Google' : 'Calendar';
    return new Response(
      renderHTML('success', `Your ${providerName} Calendar is now connected!`, 'NYLAS_AUTH_SUCCESS', '', userId),
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    return new Response(
      renderHTML('error', 'Unexpected error occurred', 'NYLAS_AUTH_ERROR', 'unexpected'),
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );
  }
});

function renderHTML(type: 'success' | 'error', message: string, eventType: string, errorDetail: string = '', userId: string = ''): string {
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? '#10b981' : '#ef4444';
  const icon = isSuccess
    ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />'
    : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />';
  const title = isSuccess ? 'Calendar Connected!' : 'Connection Failed';

  return `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%); min-height: 100vh; margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .icon { width: 80px; height: 80px; background: ${bgColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
    .icon svg { width: 40px; height: 40px; color: white; }
    h2 { color: #1f2937; margin: 0 0 12px; font-size: 24px; }
    p { color: #6b7280; margin: 0 0 24px; font-size: 16px; }
    .btn { background: #3b82f6; color: white; border: none; padding: 12px 32px; border-radius: 8px; font-size: 16px; cursor: pointer; }
    .btn:hover { background: #2563eb; }
    .status { margin-top: 16px; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="icon">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">${icon}</svg>
  </div>
  <h2>${title}</h2>
  <p>${message}</p>
  <button class="btn" onclick="try{window.close()}catch(e){}">Close Window</button>
  <div class="status" id="status">Notifying app...</div>
  <script>
    // Notify parent window
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: '${eventType}'${errorDetail ? `, error: '${errorDetail}'` : ''} }, '*');
      }
    } catch(e) {}

    // localStorage fallback
    try {
      localStorage.setItem('nylas_calendar_auth_${isSuccess ? 'success' : 'error'}', JSON.stringify({
        ${isSuccess ? 'success: true' : `error: '${errorDetail}'`},
        timestamp: Date.now(),
        userId: '${userId}'
      }));
      setTimeout(() => { try { localStorage.removeItem('nylas_calendar_auth_${isSuccess ? 'success' : 'error'}'); } catch(e) {} }, 5000);
    } catch(e) {}

    // Auto-close
    document.getElementById('status').textContent = '${isSuccess ? 'Connection complete!' : 'Please close this window.'}';
    ${isSuccess ? "setTimeout(() => { try { if (window.opener) window.opener.focus(); } catch(e) {} setTimeout(() => { try { window.close(); } catch(e) {} }, 2000); }, 1500);" : ""}
  </script>
</body>
</html>`;
}
