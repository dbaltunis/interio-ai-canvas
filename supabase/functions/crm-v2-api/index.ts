import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(part => part) // Remove empty parts
    const method = req.method

    console.log(`CRM v2 API: ${method} ${url.pathname}`)

    // GET /crm-v2-api - List all accounts  
    if (method === 'GET' && (pathParts.length === 1 || (pathParts.length === 2 && pathParts[1] === 'crm-v2-api'))) {
      const { data: accounts, error } = await supabase
        .from('crm_accounts_v2')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching accounts:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify(accounts), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST /crm-v2-api - Create new account
    if (method === 'POST' && (pathParts.length === 1 || (pathParts.length === 2 && pathParts[1] === 'crm-v2-api'))) {
      let body = {};
      try {
        const text = await req.text();
        if (text) {
          body = JSON.parse(text);
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Ensure required fields are present
      if (!body.name || body.name.trim() === '') {
        body.name = 'New Account';
      }
      
      const { data: account, error } = await supabase
        .from('crm_accounts_v2')
        .insert({
          name: body.name,
          status: body.status || 'lead',
          owner: body.owner || null,
          plugin_payments_eur: body.plugin_payments_eur || 0,
          invoice_payments_eur: body.invoice_payments_eur || 0,
          stripe_subs_eur: body.stripe_subs_eur || 0,
          mrr_eur: body.mrr_eur || 0,
          next_action: body.next_action || null,
          next_action_date: body.next_action_date || null,
          notes: body.notes || null,
          legacy_account_id: body.legacy_account_id || null,
          updated_source: 'app',
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating account:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Call mirror function (stub for now)
      if (account?.legacy_account_id) {
        try {
          await supabase.rpc('mirror_crm_v2_to_legacy', { legacy_id: account.legacy_account_id })
        } catch (error) {
          console.warn('Mirror function error (expected for stub):', error)
        }
      }

      return new Response(JSON.stringify(account), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // PATCH /crm-v2-api/:row_id - Update account
    if (method === 'PATCH' && pathParts.length >= 2) {
      const rowId = pathParts[pathParts.length - 1] // Get the last part as row_id
      let body = {};
      try {
        const text = await req.text();
        if (text) {
          body = JSON.parse(text);
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const { data: account, error } = await supabase
        .from('crm_accounts_v2')
        .update({
          ...body,
          updated_source: 'app',
          updated_at: new Date().toISOString()
        })
        .eq('row_id', rowId)
        .select()
        .single()

      if (error) {
        console.error('Error updating account:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Call mirror function (stub for now)
      if (account?.legacy_account_id) {
        try {
          await supabase.rpc('mirror_crm_v2_to_legacy', { legacy_id: account.legacy_account_id })
        } catch (error) {
          console.warn('Mirror function error (expected for stub):', error)
        }
      }

      return new Response(JSON.stringify(account), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})