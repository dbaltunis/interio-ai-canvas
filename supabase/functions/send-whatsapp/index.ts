import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  to: string;
  message?: string;
  templateId?: string;
  templateVariables?: Record<string, string>;
  mediaUrl?: string;
  clientId?: string;
  projectId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('WhatsApp send function invoked');

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`User ${user.id} requesting WhatsApp send`);

    // Check for user-specific BYOA settings - REQUIRED for WhatsApp
    // Don't require verified=true, just check if credentials exist
    const { data: userSettings, error: settingsError } = await supabase
      .from('whatsapp_user_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('use_own_account', true)
      .single();

    console.log('User settings query result:', { userSettings, settingsError });

    // BYOA is required - no fallback to shared credentials
    if (!userSettings?.account_sid || !userSettings?.auth_token || !userSettings?.whatsapp_number) {
      console.log('No BYOA credentials found - WhatsApp requires own Twilio account');
      return new Response(
        JSON.stringify({ 
          error: 'WhatsApp requires your own Twilio account. Configure it in Settings > Communications.',
          requiresSetup: true
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: WhatsAppRequest = await req.json();
    const { to, message, templateId, templateVariables, mediaUrl, clientId, projectId } = body;

    if (!to) {
      throw new Error('Phone number (to) is required');
    }

    if (!message && !templateId) {
      throw new Error('Either message or templateId is required');
    }

    // Use BYOA credentials
    console.log('Using user BYOA credentials');
    const twilioAccountSid = userSettings.account_sid;
    const twilioAuthToken = userSettings.auth_token;
    const twilioWhatsAppNumber = userSettings.whatsapp_number;

    // Format phone numbers for WhatsApp
    const fromNumber = `whatsapp:${twilioWhatsAppNumber.startsWith('+') ? twilioWhatsAppNumber : '+' + twilioWhatsAppNumber}`;
    const toNumber = `whatsapp:${to.startsWith('+') ? to : '+' + to}`;

    // Validate that To and From are different numbers
    const fromClean = fromNumber.replace(/\D/g, '');
    const toClean = toNumber.replace(/\D/g, '');

    if (fromClean === toClean) {
      console.log('Cannot send message - To and From numbers are the same');
      return new Response(
        JSON.stringify({ 
          error: 'Cannot send WhatsApp message to your own business number. Please use a different recipient phone number.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending WhatsApp from ${fromNumber} to ${toNumber}`);

    // Build message body
    let messageBody = message || '';
    
    // If using a template, fetch it and apply variables
    if (templateId) {
      const { data: template, error: templateError } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError || !template) {
        throw new Error('Template not found');
      }

      if (template.status !== 'approved') {
        throw new Error('Template is not approved for use');
      }

      // Replace variables in template content
      messageBody = template.content;
      if (templateVariables) {
        for (const [key, value] of Object.entries(templateVariables)) {
          messageBody = messageBody.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
      }
    }

    // Send via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('From', fromNumber);
    formData.append('To', toNumber);
    formData.append('Body', messageBody);
    
    if (mediaUrl) {
      formData.append('MediaUrl', mediaUrl);
    }

    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio error:', twilioResult);
      throw new Error(twilioResult.message || 'Failed to send WhatsApp message');
    }

    console.log('WhatsApp message sent successfully:', twilioResult.sid);

    // Get account owner for logging
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('parent_account_id')
      .eq('user_id', user.id)
      .single();
    
    const accountOwnerId = userProfile?.parent_account_id || user.id;

    // Log the message
    const { error: logError } = await supabase
      .from('whatsapp_message_logs')
      .insert({
        account_owner_id: accountOwnerId,
        user_id: user.id,
        client_id: clientId || null,
        project_id: projectId || null,
        to_number: to,
        template_id: templateId || null,
        message_body: messageBody,
        media_url: mediaUrl || null,
        twilio_message_sid: twilioResult.sid,
        status: 'sent',
        status_updated_at: new Date().toISOString(),
      });

    if (logError) {
      console.error('Error logging message:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageSid: twilioResult.sid,
        status: twilioResult.status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-whatsapp:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
