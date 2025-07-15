
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
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: '${error}' }, '*');
          }
          window.close();
        </script><p>Authentication failed: ${error}</p></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: '1080600437939-9ct52n3q0qj362tgq2je28uhp9bof29p.apps.googleusercontent.com',
        client_secret: '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',
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/google-oauth-callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();
    console.log('Token exchange successful');
    
    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info from Google');
    }

    const userInfo = await userInfoResponse.json();
    console.log('Got user info from Google');

    // Create Supabase client
    const supabaseClient = createClient(
      'https://ldgrcodffsalkevafbkb.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZ3Jjb2RmZnNhbGtldmFmYmtiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY5MDIwMSwiZXhwIjoyMDY2MjY2MjAxfQ.QMPtI88SaDNZY5g8V5x4mPCY5HnUZ55jlLN49x9aXW4'
    );

    // Parse state to get user_id (passed from frontend)
    const userId = state;
    
    if (!userId) {
      throw new Error('No user ID in state parameter');
    }

    console.log('Storing integration for user:', userId);

    // Store or update the integration
    const { error: dbError } = await supabaseClient
      .from('google_calendar_integrations')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        calendar_id: 'primary',
        sync_enabled: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save integration');
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
            console.log('Sending error message to parent window');
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: '${error.message}' }, '*');
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
