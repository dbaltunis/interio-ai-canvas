import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface BulkSMSRequest {
  campaignId?: string;
  templateId?: string;
  phoneNumbers: string[];
  message: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId, templateId, phoneNumbers, message, userId }: BulkSMSRequest = await req.json();

    if (!phoneNumbers || phoneNumbers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Phone numbers are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error('Missing Twilio credentials');
      return new Response(
        JSON.stringify({ 
          error: 'Twilio credentials not configured properly',
          details: {
            hasAccountSid: !!twilioAccountSid,
            hasAuthToken: !!twilioAuthToken,
            hasPhoneNumber: !!twilioPhoneNumber
          }
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    let sentCount = 0;
    let failedCount = 0;
    const results = [];

    // Update campaign status to sending if campaign exists
    if (campaignId) {
      await supabase
        .from('sms_campaigns')
        .update({ status: 'sending', sent_at: new Date().toISOString() })
        .eq('id', campaignId);
    }

    // Send SMS to each phone number
    for (const phoneNumber of phoneNumbers) {
      try {
        console.log(`Sending SMS to ${phoneNumber}`);
        
        const twilioResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: phoneNumber,
              From: twilioPhoneNumber,
              Body: message,
            }),
          }
        );

        if (!twilioResponse.ok) {
          const error = await twilioResponse.text();
          console.error(`Twilio API error for ${phoneNumber}:`, error);
          failedCount++;
          
          // Log failed delivery
          await supabase.from('sms_delivery_logs').insert({
            campaign_id: campaignId,
            template_id: templateId,
            phone_number: phoneNumber,
            message: message,
            status: 'failed',
            error_message: error,
          });

          results.push({ phoneNumber, status: 'failed', error });
        } else {
          const result = await twilioResponse.json();
          sentCount++;
          
          // Log successful delivery
          await supabase.from('sms_delivery_logs').insert({
            campaign_id: campaignId,
            template_id: templateId,
            phone_number: phoneNumber,
            message: message,
            status: 'sent',
            provider_message_id: result.sid,
            sent_at: new Date().toISOString(),
          });

          results.push({ phoneNumber, status: 'sent', messageId: result.sid });
        }
      } catch (error: any) {
        failedCount++;
        console.error(`Error sending SMS to ${phoneNumber}:`, error);
        
        // Log failed delivery
        await supabase.from('sms_delivery_logs').insert({
          campaign_id: campaignId,
          template_id: templateId,
          phone_number: phoneNumber,
          message: message,
          status: 'failed',
          error_message: error.message,
        });

        results.push({ phoneNumber, status: 'failed', error: error.message });
      }
    }

    // Update campaign statistics
    if (campaignId) {
      const status = failedCount === phoneNumbers.length ? 'failed' : 'completed';
      await supabase
        .from('sms_campaigns')
        .update({ 
          status,
          sent_count: sentCount,
          failed_count: failedCount,
        })
        .eq('id', campaignId);
    }

    console.log(`SMS sending complete: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        failedCount,
        totalRequested: phoneNumbers.length,
        results
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-bulk-sms function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);