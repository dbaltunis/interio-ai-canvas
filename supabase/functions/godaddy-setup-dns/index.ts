import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, storeId } = await req.json();
    
    console.log('[godaddy-setup-dns] Setting up DNS for domain:', domain);

    if (!domain || !storeId) {
      return new Response(
        JSON.stringify({ error: 'Domain and storeId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GODADDY_API_KEY');
    const apiSecret = Deno.env.get('GODADDY_API_SECRET');

    if (!apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({ error: 'GoDaddy API credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean domain
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').trim();
    console.log('[godaddy-setup-dns] Clean domain:', cleanDomain);

    const godaddyHeaders = {
      'Authorization': `sso-key ${apiKey}:${apiSecret}`,
      'Content-Type': 'application/json',
    };

    // Prepare DNS records
    const records = [
      // A record for root domain
      {
        type: 'A',
        name: '@',
        data: '185.158.133.1',
        ttl: 600,
      },
      // A record for www
      {
        type: 'A',
        name: 'www',
        data: '185.158.133.1',
        ttl: 600,
      },
      // TXT record for verification
      {
        type: 'TXT',
        name: '_lovable',
        data: `lovable_verify=${storeId.substring(0, 16)}`,
        ttl: 600,
      },
    ];

    console.log('[godaddy-setup-dns] Adding DNS records:', records);

    // Add each record to GoDaddy
    const results = [];
    for (const record of records) {
      try {
        const response = await fetch(
          `https://api.godaddy.com/v1/domains/${cleanDomain}/records`,
          {
            method: 'PATCH',
            headers: godaddyHeaders,
            body: JSON.stringify([record]),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[godaddy-setup-dns] Failed to add ${record.type} record:`, errorText);
          results.push({
            record: `${record.type} ${record.name}`,
            success: false,
            error: errorText,
          });
        } else {
          console.log(`[godaddy-setup-dns] Successfully added ${record.type} record for ${record.name}`);
          results.push({
            record: `${record.type} ${record.name}`,
            success: true,
          });
        }
      } catch (error) {
        console.error(`[godaddy-setup-dns] Error adding ${record.type} record:`, error);
        results.push({
          record: `${record.type} ${record.name}`,
          success: false,
          error: error.message,
        });
      }
    }

    const allSuccess = results.every(r => r.success);
    const message = allSuccess 
      ? 'All DNS records configured successfully! Your domain will be live within 10-15 minutes.'
      : 'Some DNS records could not be configured. Please check the details below.';

    return new Response(
      JSON.stringify({
        success: allSuccess,
        message,
        results,
        domain: cleanDomain,
      }),
      {
        status: allSuccess ? 200 : 207,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[godaddy-setup-dns] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
