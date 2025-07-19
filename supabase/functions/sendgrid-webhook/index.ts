
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("SendGrid webhook called with method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const events = await req.json();
    console.log("Processing SendGrid webhook events:", events.length);

    for (const event of events) {
      const { event: eventType, email_id, timestamp } = event;
      
      if (!email_id) {
        console.log("Skipping event without email_id:", eventType);
        continue;
      }

      console.log(`Processing ${eventType} event for email ${email_id}`);

      // Update email status based on event type
      let updateData: any = {
        updated_at: new Date().toISOString()
      };

      switch (eventType) {
        case 'delivered':
          updateData.status = 'delivered';
          break;
        case 'open':
          await supabase
            .from('emails')
            .update({ 
              open_count: supabase.raw('open_count + 1'),
              updated_at: new Date().toISOString()
            })
            .eq('id', email_id);
          
          // Record analytics event
          await supabase
            .from('email_analytics')
            .insert({
              email_id: email_id,
              event_type: 'open',
              event_data: event,
              user_agent: event.useragent,
              ip_address: event.ip,
              created_at: new Date(timestamp * 1000).toISOString()
            });
          continue;
          
        case 'click':
          await supabase
            .from('emails')
            .update({ 
              click_count: supabase.raw('click_count + 1'),
              updated_at: new Date().toISOString()
            })
            .eq('id', email_id);
          
          // Record analytics event
          await supabase
            .from('email_analytics')
            .insert({
              email_id: email_id,
              event_type: 'click',
              event_data: event,
              user_agent: event.useragent,
              ip_address: event.ip,
              created_at: new Date(timestamp * 1000).toISOString()
            });
          continue;
          
        case 'bounce':
        case 'dropped':
          updateData.status = 'bounced';
          updateData.bounce_reason = event.reason || event.sg_event_id;
          break;
          
        case 'spam_report':
        case 'unsubscribe':
          updateData.status = 'failed';
          updateData.bounce_reason = eventType;
          break;
      }

      // Update email record
      await supabase
        .from('emails')
        .update(updateData)
        .eq('id', email_id);

      // Record analytics event for all events
      await supabase
        .from('email_analytics')
        .insert({
          email_id: email_id,
          event_type: eventType,
          event_data: event,
          user_agent: event.useragent,
          ip_address: event.ip,
          created_at: new Date(timestamp * 1000).toISOString()
        });
    }

    return new Response(
      JSON.stringify({ success: true, processed: events.length }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in sendgrid-webhook function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
