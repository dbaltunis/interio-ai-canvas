
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('OAuth callback received:', req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    console.log('OAuth params:', { code: !!code, state, error });

    if (error) {
      console.error('OAuth error:', error);
      return new Response(
        `<html><body><script>
          console.log('Sending auth error to parent');
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: '${error}' }, '*');
          }
          window.close();
        </script><p>Authentication failed: ${error}</p></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    if (!code) {
      console.error('No authorization code received');
      return new Response(
        `<html><body><script>
          console.log('Sending no code error to parent');
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'No authorization code received' }, '*');
          }
          window.close();
        </script><p>Authentication failed: No authorization code received</p></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    // Exchange code for tokens
    console.log('Exchanging code for tokens...');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '1080600437939-9ct52n3q0qj362tgq2je28uhp9bof29p.apps.googleusercontent.com',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/google-oauth-callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return new Response(
        `<html><body><script>
          console.log('Sending token exchange error to parent');
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'Failed to exchange authorization code' }, '*');
          }
          window.close();
        </script><p>Authentication failed: Token exchange failed</p></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    const tokens = await tokenResponse.json();
    console.log('Token exchange successful');

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || 'https://ldgrcodffsalkevafbkb.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Parse state to get user_id (passed from frontend)
    const userId = state;
    
    if (!userId) {
      console.error('No user ID in state parameter');
      return new Response(
        `<html><body><script>
          console.log('Sending user ID error to parent');
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'Authentication state error' }, '*');
          }
          window.close();
        </script><p>Authentication failed: Invalid state</p></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    console.log('Storing integration for user:', userId);

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000)).toISOString();

    // Store or update the integration
    const { error: dbError } = await supabaseClient
      .from('google_calendar_integrations')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt,
        calendar_id: 'primary',
        sync_enabled: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        `<html><body><script>
          console.log('Sending database error to parent');
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'Failed to save integration' }, '*');
          }
          window.close();
        </script><p>Authentication failed: Database error</p></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    console.log('Integration saved successfully');

    // Return success page that closes the popup
    return new Response(
      `<html>
        <body>
          <script>
            console.log('Sending success message to parent window');
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '*');
            }
            setTimeout(() => window.close(), 1000);
          </script>
          <p>Authorization successful! This window will close automatically.</p>
        </body>
      </html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(
      `<html>
        <body>
          <script>
            console.log('Sending unexpected error to parent window');
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'Unexpected error occurred' }, '*');
            }
            setTimeout(() => window.close(), 1000);
          </script>
          <p>Authentication failed: ${error.message}</p>
        </body>
      </html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );
  }
});
