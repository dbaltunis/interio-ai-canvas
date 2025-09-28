import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkSMSRequest {
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
    const { phoneNumbers, message, userId }: BulkSMSRequest = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured');
    }

    // Check user's subscription limits
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        subscription_plans!inner(
          notification_limits
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (subError) {
      console.log('No active subscription found, checking usage limits');
    }

    const smsLimit = (subscription?.subscription_plans as any)?.notification_limits?.sms_monthly || 0;
    
    // Check current month usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: usage } = await supabase
      .from('notification_usage')
      .select('sms_count')
      .eq('user_id', userId)
      .gte('period_start', startOfMonth.toISOString())
      .single();

    const currentUsage = usage?.sms_count || 0;
    
    if (smsLimit > 0 && currentUsage + phoneNumbers.length > smsLimit) {
      throw new Error(`SMS limit exceeded. Current usage: ${currentUsage}, Limit: ${smsLimit}`);
    }

    // Send SMS messages
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (const phoneNumber of phoneNumbers) {
      try {
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: twilioPhoneNumber,
              To: phoneNumber,
              Body: message,
            }),
          }
        );

        if (response.ok) {
          successCount++;
          results.push({ phoneNumber, status: 'sent' });
        } else {
          const errorData = await response.text();
          failedCount++;
          results.push({ phoneNumber, status: 'failed', error: errorData });
        }
      } catch (error) {
        failedCount++;
        results.push({ phoneNumber, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error occurred' });
      }
    }

    // Update usage tracking
    if (successCount > 0) {
      await supabase
        .from('notification_usage')
        .upsert({
          user_id: userId,
          period_start: startOfMonth.toISOString(),
          period_end: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0).toISOString(),
          sms_count: currentUsage + successCount,
          email_count: (usage as any)?.email_count || 0,
        });
    }

    console.log(`Bulk SMS completed for user ${userId}:`, {
      total: phoneNumbers.length,
      success: successCount,
      failed: failedCount,
    });

    return new Response(
      JSON.stringify({
        success: true,
        total: phoneNumbers.length,
        success_count: successCount,
        failed_count: failedCount,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-bulk-sms:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);