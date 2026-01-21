import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestWhatsAppRequest {
  phoneNumber: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber }: TestWhatsAppRequest = await req.json();

    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Clean phone number
    let cleanPhone = phoneNumber.replace(/[\s\-()]/g, '');
    // Ensure it has country code
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
    }

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`User ${user.id} requesting test WhatsApp to ${cleanPhone}`);

    // Get account owner ID for settings lookup (supports sub-users)
    const { data: userProfile } = await supabaseClient
      .from('user_profiles')
      .select('parent_account_id')
      .eq('user_id', user.id)
      .single();

    const accountOwnerId = userProfile?.parent_account_id || user.id;
    console.log(`Using account owner ID: ${accountOwnerId}`);

    // Get WhatsApp settings for account owner
    const { data: userSettings, error: settingsError } = await supabaseClient
      .from('whatsapp_user_settings')
      .select('*')
      .eq('user_id', accountOwnerId)
      .eq('use_own_account', true)
      .single();

    if (settingsError || !userSettings) {
      console.error('WhatsApp settings not found:', settingsError);
      return new Response(
        JSON.stringify({ success: false, error: 'WhatsApp not configured. Please set up your Twilio WhatsApp credentials first.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!userSettings.account_sid || !userSettings.auth_token || !userSettings.whatsapp_number) {
      return new Response(
        JSON.stringify({ success: false, error: 'Incomplete WhatsApp configuration. Please provide Account SID, Auth Token, and WhatsApp number.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if To and From are the same (Twilio doesn't allow this)
    const configuredNumber = userSettings.whatsapp_number.replace(/[\s\-()whatsapp:]/gi, '');
    const recipientNumber = cleanPhone.replace(/[\s\-()whatsapp:]/gi, '');
    
    if (configuredNumber === recipientNumber || 
        configuredNumber.endsWith(recipientNumber) || 
        recipientNumber.endsWith(configuredNumber)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Cannot send to your own WhatsApp number. Please enter a different phone number to test.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Send test message via Twilio
    const auth = btoa(`${userSettings.account_sid}:${userSettings.auth_token}`);
    const fromNumber = userSettings.whatsapp_number.startsWith('whatsapp:') 
      ? userSettings.whatsapp_number 
      : `whatsapp:${userSettings.whatsapp_number}`;
    const toNumber = cleanPhone.startsWith('whatsapp:') 
      ? cleanPhone 
      : `whatsapp:${cleanPhone}`;

    console.log(`Sending test WhatsApp from ${fromNumber} to ${toNumber}`);

    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${userSettings.account_sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: toNumber,
          From: fromNumber,
          Body: '✅ This is a test message from InterioApp! Your WhatsApp integration is working correctly. 🎉',
        }),
      }
    );

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio API error:', twilioResult);
      const errorMessage = twilioResult.message || twilioResult.error_message || 'Failed to send WhatsApp message';
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Test WhatsApp sent successfully:', twilioResult.sid);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageSid: twilioResult.sid,
        status: twilioResult.status
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('Error in send-test-whatsapp function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
