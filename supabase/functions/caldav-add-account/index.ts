import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createDAVClient } from "https://esm.sh/tsdav@2.1.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, serverUrl, accountName } = await req.json();

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    console.log('Testing CalDAV connection...');

    // Test connection by creating DAV client
    const client = await createDAVClient({
      serverUrl,
      credentials: {
        username: email,
        password: password,
      },
      authMethod: 'Basic',
      defaultAccountType: 'caldav',
    });

    // Fetch calendars to verify connection
    const calendars = await client.fetchCalendars();
    console.log(`Found ${calendars.length} calendars`);

    // Encrypt password (simple base64 for now - in production use proper encryption)
    const passwordEncrypted = btoa(password);

    // Insert account
    const { data: account, error: insertError } = await supabase
      .from('caldav_accounts')
      .insert({
        user_id: user.id,
        account_name: accountName,
        email: email,
        server_url: serverUrl,
        username: email,
        password_encrypted: passwordEncrypted,
        sync_enabled: true,
        active: true,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Insert calendars
    for (const calendar of calendars) {
      await supabase
        .from('caldav_calendars')
        .insert({
          account_id: account.id,
          calendar_id: calendar.url,
          display_name: calendar.displayName || 'Calendar',
          description: calendar.description || '',
          color: calendar.calendarColor || '#3B82F6',
          timezone: calendar.timezone || 'UTC',
          sync_enabled: true,
          read_only: false,
        });
    }

    // Trigger immediate sync
    console.log('Starting immediate sync...');
    await supabase.functions.invoke('caldav-sync', {
      body: { accountId: account.id },
    });

    return new Response(
      JSON.stringify({ success: true, account, calendarsFound: calendars.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Add account error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to add calendar account',
        details: 'Check your email and password. For Google/Apple, use an app-specific password.'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
