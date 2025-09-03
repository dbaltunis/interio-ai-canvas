import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  to: string;
  message: string;
  clientName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, message, clientName }: SMSRequest = await req.json();

    console.log(`Sending SMS to ${to}${clientName ? ` (${clientName})` : ''}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    // Get the account owner for shared settings
    const { data: accountOwner } = await supabase.rpc('get_account_owner', { 
      user_id_param: user.id 
    });
    
    const ownerId = accountOwner || user.id;

    // Get account owner's Twilio integration settings (shared by team)
    const { data: integrationSettings } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('account_owner_id', ownerId)
      .eq('integration_type', 'twilio')
      .eq('active', true)
      .single();

    // Use Twilio credentials from integration settings or fallback to env
    const twilioAccountSid = integrationSettings?.api_credentials?.account_sid || Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = integrationSettings?.api_credentials?.auth_token || Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = integrationSettings?.configuration?.phone_number || Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not found. Please configure Twilio integration.');
    }

    console.log(`Using Twilio settings from account owner: ${ownerId}`);

    // Send SMS via Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const formData = new URLSearchParams();
    formData.append('From', twilioPhoneNumber);
    formData.append('To', to);
    formData.append('Body', message);

    const smsResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!smsResponse.ok) {
      const errorText = await smsResponse.text();
      throw new Error(`Twilio API error: ${smsResponse.status} - ${errorText}`);
    }

    const result = await smsResponse.json();
    console.log("SMS sent successfully:", result.sid);

    // Log the SMS send event
    await supabase
      .from('sms_logs')
      .insert({
        user_id: user.id,
        to_number: to,
        message: message,
        status: 'sent',
        twilio_sid: result.sid,
        sent_at: new Date().toISOString()
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message_sid: result.sid,
      message: `SMS sent successfully to ${to}` 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-sms function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send SMS',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);