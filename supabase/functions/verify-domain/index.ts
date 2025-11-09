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
    
    console.log('[verify-domain] Checking domain:', domain);

    if (!domain || !storeId) {
      return new Response(
        JSON.stringify({ error: 'Domain and storeId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean domain
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').trim();
    console.log('[verify-domain] Clean domain:', cleanDomain);

    // Check DNS records
    const checks = {
      aRecord: false,
      wwwRecord: false,
      txtRecord: false,
    };

    try {
      // Check A record for root domain
      const aResponse = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=A`);
      const aData = await aResponse.json();
      console.log('[verify-domain] A record response:', aData);
      
      if (aData.Answer) {
        checks.aRecord = aData.Answer.some((record: any) => 
          record.data === '185.158.133.1'
        );
      }

      // Check A record for www
      const wwwResponse = await fetch(`https://dns.google/resolve?name=www.${cleanDomain}&type=A`);
      const wwwData = await wwwResponse.json();
      console.log('[verify-domain] WWW record response:', wwwData);
      
      if (wwwData.Answer) {
        checks.wwwRecord = wwwData.Answer.some((record: any) => 
          record.data === '185.158.133.1'
        );
      }

      // Check TXT record
      const txtResponse = await fetch(`https://dns.google/resolve?name=_lovable.${cleanDomain}&type=TXT`);
      const txtData = await txtResponse.json();
      console.log('[verify-domain] TXT record response:', txtData);
      
      if (txtData.Answer) {
        const expectedValue = `lovable_verify=${storeId.substring(0, 16)}`;
        checks.txtRecord = txtData.Answer.some((record: any) => 
          record.data.includes(expectedValue) || record.data.includes(expectedValue.replace(/"/g, ''))
        );
      }
    } catch (dnsError) {
      console.error('[verify-domain] DNS check error:', dnsError);
    }

    console.log('[verify-domain] Check results:', checks);

    // Determine if domain is verified
    const verified = checks.aRecord && checks.txtRecord;
    
    let message = '';
    if (!checks.aRecord) {
      message = 'A record for root domain not found or incorrect. Please ensure it points to 185.158.133.1';
    } else if (!checks.wwwRecord) {
      message = 'A record for www subdomain not found. Please add it for full functionality.';
    } else if (!checks.txtRecord) {
      message = 'TXT verification record not found. Please add the _lovable TXT record.';
    } else {
      message = 'All DNS records verified successfully!';
    }

    return new Response(
      JSON.stringify({
        verified,
        message,
        checks,
        domain: cleanDomain,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[verify-domain] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        verified: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
