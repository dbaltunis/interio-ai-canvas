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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting orphaned emails fix...');

    // Get all clients with their emails
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, email, user_id')
      .not('email', 'is', null);

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      throw clientsError;
    }

    console.log(`Found ${clients?.length || 0} clients with emails`);

    let fixedCount = 0;

    // For each client, find emails that match their email address but have null client_id
    for (const client of clients || []) {
      const { data: orphanedEmails, error: emailsError } = await supabase
        .from('emails')
        .select('id, recipient_email, subject')
        .eq('recipient_email', client.email)
        .eq('user_id', client.user_id)
        .is('client_id', null);

      if (emailsError) {
        console.error(`Error fetching emails for client ${client.id}:`, emailsError);
        continue;
      }

      if (orphanedEmails && orphanedEmails.length > 0) {
        console.log(`Found ${orphanedEmails.length} orphaned emails for client ${client.email}`);

        // Update these emails to link them to the client
        const { error: updateError } = await supabase
          .from('emails')
          .update({ client_id: client.id })
          .eq('recipient_email', client.email)
          .eq('user_id', client.user_id)
          .is('client_id', null);

        if (updateError) {
          console.error(`Error updating emails for client ${client.id}:`, updateError);
        } else {
          fixedCount += orphanedEmails.length;
          console.log(`Fixed ${orphanedEmails.length} emails for client ${client.email}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Fixed ${fixedCount} orphaned emails`,
        fixedCount
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in fix-orphaned-emails function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);