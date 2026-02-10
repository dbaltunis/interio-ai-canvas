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
    const { userId, loginHint, provider } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    const clientId = Deno.env.get('NYLAS_CLIENT_ID');
    const apiUri = Deno.env.get('NYLAS_API_URI') || 'https://api.eu.nylas.com';

    if (!clientId) {
      throw new Error(
        'Nylas Client ID not configured. ' +
        'Please set NYLAS_CLIENT_ID in your Supabase Edge Function secrets. ' +
        'You can find your Client ID in the Nylas Dashboard under App Settings.'
      );
    }

    const redirectUri = `${Deno.env.get('SUPABASE_URL') || 'https://ldgrcodffsalkevafbkb.supabase.co'}/functions/v1/nylas-oauth-callback`;

    console.log('Nylas OAuth URL generation:');
    console.log('  Client ID:', clientId.substring(0, 8) + '...');
    console.log('  API URI:', apiUri);
    console.log('  Redirect URI:', redirectUri);
    console.log('  Provider:', provider || '(any)');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      access_type: 'offline',
      state: userId,
    });

    // Allow specifying provider (google, microsoft) or show both
    if (provider) {
      params.set('provider', provider);
    }

    // Pre-fill email if provided
    if (loginHint) {
      params.set('login_hint', loginHint);
    }

    const authUrl = `${apiUri}/v3/connect/auth?${params.toString()}`;

    return new Response(
      JSON.stringify({
        authUrl,
        debug: {
          apiRegion: apiUri.includes('eu') ? 'EU' : 'US',
          redirectUri,
          provider: provider || 'any',
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Nylas auth URL error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
