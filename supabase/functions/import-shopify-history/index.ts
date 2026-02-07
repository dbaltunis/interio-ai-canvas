import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShopifyShop {
  email: string;
  company_name: string;
  country: string;
  shop_domain: string;
  first_install_date: string;
  last_activity_date: string;
  funnel_stage: string;
  last_event: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { shops } = await req.json() as { shops: ShopifyShop[] };
    
    if (!shops || !Array.isArray(shops)) {
      return new Response(
        JSON.stringify({ error: 'Invalid data: shops array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${shops.length} shops for user ${user.id}`);

    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Get existing clients by email to check for duplicates
    const { data: existingClients, error: fetchError } = await supabase
      .from('clients')
      .select('email')
      .eq('user_id', user.id);

    if (fetchError) {
      console.error('Error fetching existing clients:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch existing clients' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const existingEmails = new Set(
      existingClients?.map(c => c.email?.toLowerCase()) || []
    );

    console.log(`Found ${existingEmails.size} existing clients`);

    // Process each shop
    for (const shop of shops) {
      const emailLower = shop.email.toLowerCase();
      
      if (existingEmails.has(emailLower)) {
        console.log(`Skipping duplicate: ${shop.email}`);
        skipped++;
        continue;
      }

      // Prepare client data
      const clientData = {
        user_id: user.id,
        name: shop.company_name || shop.shop_domain.replace('.myshopify.com', ''),
        company_name: shop.company_name,
        email: shop.email,
        country: shop.country,
        funnel_stage: shop.funnel_stage,
        lead_source: 'Shopify App',
        client_type: 'business',
        notes: `Shopify Store: ${shop.shop_domain}\nLast event: ${shop.last_event}`,
        created_at: shop.first_install_date,
        last_activity_date: shop.last_activity_date,
        source: 'shopify_app_import',
      };

      const { error: insertError } = await supabase
        .from('clients')
        .insert(clientData);

      if (insertError) {
        console.error(`Error inserting ${shop.email}:`, insertError);
        errors.push(`${shop.email}: ${insertError.message}`);
      } else {
        console.log(`Inserted: ${shop.email}`);
        inserted++;
        existingEmails.add(emailLower); // Prevent duplicates within batch
      }
    }

    console.log(`Import complete: ${inserted} inserted, ${skipped} skipped, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
        total: shops.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
