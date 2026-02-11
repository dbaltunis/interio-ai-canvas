
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cross-Origin-Opener-Policy': 'unsafe-none',
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
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-oauth-callback`,
        }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);

      // Parse Google's error for a user-friendly message
      let errorDetail = 'Token exchange failed';
      let debugInfo = '';
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.error_description || errorJson.error || errorDetail;
        debugInfo = errorJson.error || '';
      } catch (_) {
        errorDetail = errorText.substring(0, 200);
      }

      // Log redirect_uri for debugging redirect_uri_mismatch
      const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-oauth-callback`;
      console.error('Redirect URI used:', redirectUri);
      console.error('Client ID prefix:', (Deno.env.get('GOOGLE_CLIENT_ID') || '').substring(0, 20) + '...');

      const safeError = errorDetail.replace(/'/g, "\\'").replace(/</g, '&lt;');
      const safeDebug = debugInfo.replace(/'/g, "\\'");

      return new Response(
        `<html><body><script>
          console.log('Sending token exchange error to parent');
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: '${safeError}' }, '*');
          }
          window.close();
        </script>
        <p>Authentication failed: ${safeError}</p>
        ${safeDebug === 'redirect_uri_mismatch' ? '<p style="margin-top:10px;font-size:12px;color:#666;">The redirect URI configured in Google Cloud Console does not match.<br/>Expected: <code>' + redirectUri + '</code><br/>Please add this URL to your Google Cloud Console → Credentials → OAuth 2.0 Client → Authorized redirect URIs.</p>' : ''}
        </body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    const tokens = await tokenResponse.json();
    console.log('Token exchange successful');

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
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
      .from('integration_settings')
      .upsert({
        user_id: userId,
        integration_type: 'google_calendar',
        active: true,
        api_credentials: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt,
        },
        configuration: {
          calendar_id: 'primary',
          sync_enabled: true,
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,integration_type'
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

    // Return success page with multiple fallback methods to notify parent window
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Google Calendar Connected</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              text-align: center;
              padding: 40px 20px;
              background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
              min-height: 100vh;
              margin: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .success-icon {
              width: 80px;
              height: 80px;
              background: #10b981;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 24px;
            }
            .success-icon svg {
              width: 40px;
              height: 40px;
              color: white;
            }
            h2 {
              color: #1f2937;
              margin: 0 0 12px;
              font-size: 24px;
            }
            p {
              color: #6b7280;
              margin: 0 0 24px;
              font-size: 16px;
            }
            .close-btn {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 12px 32px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              transition: background 0.2s;
            }
            .close-btn:hover {
              background: #2563eb;
            }
            .status {
              margin-top: 16px;
              font-size: 12px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2>Calendar Connected!</h2>
          <p>Your Google Calendar is now connected successfully.</p>
          <button class="close-btn" onclick="closeWindow()">Close Window</button>
          <div class="status" id="status">Notifying app...</div>
          
          <script>
            let notified = false;
            
            function updateStatus(msg) {
              document.getElementById('status').textContent = msg;
            }
            
            function closeWindow() {
              try { window.close(); } catch(e) {}
              // If close fails, show message
              setTimeout(() => {
                updateStatus('You can close this tab manually.');
              }, 500);
            }
            
            // Method 1: postMessage to parent window
            try {
              if (window.opener && !window.opener.closed) {
                console.log('Sending postMessage to opener');
                window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', timestamp: Date.now() }, '*');
                notified = true;
                updateStatus('App notified via postMessage');
              }
            } catch(e) {
              console.log('postMessage failed:', e);
            }
            
            // Method 2: localStorage event (works across same-origin tabs)
            try {
              const successKey = 'google_calendar_auth_success';
              const successData = JSON.stringify({ 
                success: true, 
                timestamp: Date.now(),
                userId: '${userId}'
              });
              localStorage.setItem(successKey, successData);
              console.log('Set localStorage success flag');
              updateStatus('App notified via storage event');
              notified = true;
              
              // Clean up after a short delay
              setTimeout(() => {
                try { localStorage.removeItem(successKey); } catch(e) {}
              }, 5000);
            } catch(e) {
              console.log('localStorage failed:', e);
            }
            
            // Method 3: Try to focus opener and close popup after delay
            setTimeout(() => {
              try {
                if (window.opener && !window.opener.closed) {
                  window.opener.focus();
                }
              } catch(e) {}
              
              updateStatus('Connection complete! You can close this window.');
              
              // Auto-close after 3 seconds
              setTimeout(() => {
                closeWindow();
              }, 2000);
            }, 1500);
          </script>
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
          <p>Authentication failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}</p>
        </body>
      </html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );
  }
});
