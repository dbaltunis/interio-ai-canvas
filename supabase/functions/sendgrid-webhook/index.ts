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
      const { event: eventType, timestamp, sg_event_id, sg_message_id } = event;
      
      // Get email_id from custom_args
      const email_id = event.email_id || event.unique_args?.email_id || event.custom_args?.email_id;
      
      console.log(`Processing ${eventType} event:`, {
        email_id,
        sg_event_id,
        sg_message_id,
        custom_args: event.custom_args,
        unique_args: event.unique_args
      });
      
      if (!email_id) {
        console.log("Skipping event without email_id:", eventType);
        continue;
      }

      // Handle special events that need custom logic
      switch (eventType) {
        case 'open':
          console.log("Processing email open event for email:", email_id);
          const { data: currentEmail } = await supabase
            .from('emails')
            .select('open_count, status')
            .eq('id', email_id)
            .single();
          
          if (currentEmail) {
            const newOpenCount = (currentEmail.open_count || 0) + 1;
            const newStatus = ['sent', 'delivered', 'processed'].includes(currentEmail.status) ? 'opened' : currentEmail.status;
            
            await supabase
              .from('emails')
              .update({ 
                open_count: newOpenCount,
                status: newStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', email_id);
            
            console.log(`Updated email ${email_id} open count to ${newOpenCount}`);
          }
          
          // Record analytics event
          await supabase
            .from('email_analytics')
            .insert({
              email_id: email_id,
              event_type: 'opened',
              event_data: event,
              user_agent: event.useragent,
              ip_address: event.ip,
              created_at: new Date(timestamp * 1000).toISOString()
            });
          continue;

        case 'click':
          console.log("Processing email click event for email:", email_id);
          const { data: currentEmailClick } = await supabase
            .from('emails')
            .select('click_count, status')
            .eq('id', email_id)
            .single();
          
          if (currentEmailClick) {
            const newClickCount = (currentEmailClick.click_count || 0) + 1;
            const newClickStatus = ['sent', 'delivered', 'processed', 'opened'].includes(currentEmailClick.status) ? 'clicked' : currentEmailClick.status;
            
            await supabase
              .from('emails')
              .update({ 
                click_count: newClickCount,
                status: newClickStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', email_id);
            
            console.log(`Updated email ${email_id} click count to ${newClickCount}`);
          }
          
          // Record analytics event
          await supabase
            .from('email_analytics')
            .insert({
              email_id: email_id,
              event_type: 'clicked',
              event_data: event,
              user_agent: event.useragent,
              ip_address: event.ip,
              created_at: new Date(timestamp * 1000).toISOString()
            });
          continue;
      }

      // Handle standard status updates
      let updateData: any = {
        updated_at: new Date().toISOString()
      };

      switch (eventType) {
        case 'processed':
          updateData.status = 'processed';
          break;
        case 'delivered':
          updateData.status = 'delivered';
          break;
        case 'deferred':
          updateData.status = 'deferred';
          break;
        case 'bounce':
          updateData.status = 'bounced';
          updateData.bounce_reason = event.reason || 'Email bounced';
          break;
        case 'dropped':
          updateData.status = 'dropped';
          updateData.bounce_reason = event.reason || 'Dropped by SendGrid (likely spam)';
          break;
        case 'spamreport':
          updateData.status = 'spam_reported';
          break;
        case 'unsubscribe':
        case 'group_unsubscribe':
          updateData.status = 'unsubscribed';
          break;
        default:
          console.log(`Unhandled event type: ${eventType}`);
          continue;
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
      
      console.log(`Updated email ${email_id} status to ${updateData.status}`);
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