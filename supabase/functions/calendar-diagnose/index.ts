import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '(NOT SET)';
    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const nylasClientId = Deno.env.get('NYLAS_CLIENT_ID');
    const nylasApiKey = Deno.env.get('NYLAS_API_KEY');
    const nylasApiUri = Deno.env.get('NYLAS_API_URI') || 'https://api.eu.nylas.com';

    const googleRedirectUri = `${supabaseUrl}/functions/v1/google-oauth-callback`;
    const nylasRedirectUri = `${supabaseUrl}/functions/v1/nylas-oauth-callback`;

    const diagnostics = {
      supabase_url: supabaseUrl,
      google: {
        client_id_set: !!googleClientId,
        client_id_prefix: googleClientId ? googleClientId.substring(0, 20) + '...' : '(NOT SET)',
        client_secret_set: !!googleClientSecret,
        client_secret_length: googleClientSecret ? googleClientSecret.length : 0,
        redirect_uri: googleRedirectUri,
        instructions: !googleClientId || !googleClientSecret
          ? 'Missing credentials. Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets and set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET. Then add the redirect_uri above to Google Cloud Console → Credentials → OAuth 2.0 Client → Authorized redirect URIs.'
          : 'Credentials are set. If token exchange fails, verify the redirect_uri is registered in Google Cloud Console → Credentials → OAuth 2.0 Client → Authorized redirect URIs.',
      },
      nylas: {
        client_id_set: !!nylasClientId,
        client_id_prefix: nylasClientId ? nylasClientId.substring(0, 12) + '...' : '(NOT SET)',
        api_key_set: !!nylasApiKey,
        api_key_length: nylasApiKey ? nylasApiKey.length : 0,
        api_uri: nylasApiUri,
        redirect_uri: nylasRedirectUri,
        instructions: !nylasClientId || !nylasApiKey
          ? 'Missing credentials. Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets and set NYLAS_CLIENT_ID and NYLAS_API_KEY. Then add the redirect_uri above to Nylas Dashboard → Application Settings → Callback URIs.'
          : 'Credentials are set. If auth fails, verify the redirect_uri is registered in Nylas Dashboard → Application Settings → Callback URIs.',
      },
    };

    // Optionally test Google token endpoint reachability
    try {
      const testResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'test' }),
      });
      const testText = await testResponse.text();
      // We expect an error, but this proves the endpoint is reachable
      (diagnostics.google as any).token_endpoint_reachable = true;
      // Parse the error to see what Google says
      try {
        const testJson = JSON.parse(testText);
        (diagnostics.google as any).token_endpoint_response = testJson.error || 'ok';
      } catch (_) {
        (diagnostics.google as any).token_endpoint_response = 'reachable';
      }
    } catch (e) {
      (diagnostics.google as any).token_endpoint_reachable = false;
      (diagnostics.google as any).token_endpoint_error = e.message;
    }

    return new Response(
      JSON.stringify(diagnostics, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
