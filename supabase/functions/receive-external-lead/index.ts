import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers restricted to interioapp.com domains
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Will be validated below
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const allowedOrigins = [
  'https://interioapp.com',
  'https://www.interioapp.com',
]

// Default user ID for all external leads (Darius B. - baltunis@curtainscalculator.com)
const DEFAULT_LEADS_USER_ID = 'ec930f73-ef23-4430-921f-1b401859825d'

interface LeadRequest {
  name: string
  email: string
  phone?: string
  company?: string
  country?: string
  message?: string
  orderVolume?: string
  productType?: string
  source?: string
  apiKey: string
}

Deno.serve(async (req) => {
  // Get origin for CORS validation
  const origin = req.headers.get('origin') || ''
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  
  const responseHeaders = {
    ...corsHeaders,
    'Access-Control-Allow-Origin': corsOrigin,
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: responseHeaders })
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...responseHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body: LeadRequest = await req.json()
    console.log('[receive-external-lead] Received request:', { 
      name: body.name, 
      email: body.email, 
      source: body.source,
      hasApiKey: !!body.apiKey 
    })

    // Validate API key
    const expectedApiKey = Deno.env.get('EXTERNAL_LEADS_API_KEY')
    if (!expectedApiKey) {
      console.error('[receive-external-lead] EXTERNAL_LEADS_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...responseHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (body.apiKey !== expectedApiKey) {
      console.warn('[receive-external-lead] Invalid API key attempt')
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...responseHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate required fields
    const missingFields: string[] = []
    if (!body.name?.trim()) missingFields.push('name')
    if (!body.email?.trim()) missingFields.push('email')

    if (missingFields.length > 0) {
      console.warn('[receive-external-lead] Missing required fields:', missingFields)
      return new Response(
        JSON.stringify({ error: `Missing required fields: ${missingFields.join(', ')}` }),
        { status: 400, headers: { ...responseHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email.trim())) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...responseHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check for duplicate email (for the default user)
    const { data: existingLead, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', body.email.trim().toLowerCase())
      .eq('user_id', DEFAULT_LEADS_USER_ID)
      .maybeSingle()

    if (checkError) {
      console.error('[receive-external-lead] Error checking for duplicate:', checkError)
      return new Response(
        JSON.stringify({ error: 'Internal server error', details: checkError.message }),
        { status: 500, headers: { ...responseHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If duplicate found, return existing ID
    if (existingLead) {
      console.log('[receive-external-lead] Duplicate lead found:', existingLead.id)
      return new Response(
        JSON.stringify({ 
          success: true, 
          leadId: existingLead.id, 
          duplicate: true,
          message: 'Lead already exists with this email'
        }),
        { status: 200, headers: { ...responseHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare lead_source_details JSON
    const leadSourceDetails: Record<string, string> = {}
    if (body.orderVolume) leadSourceDetails.orderVolume = body.orderVolume
    if (body.productType) leadSourceDetails.productType = body.productType

    // Insert new lead
    const { data: newLead, error: insertError } = await supabase
      .from('clients')
      .insert({
        user_id: DEFAULT_LEADS_USER_ID,
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
        company_name: body.company?.trim() || null,
        country: body.country?.trim() || null,
        notes: body.message?.trim() || null,
        source: body.source?.trim() || 'interioapp.com',
        lead_source: 'External Website',
        lead_source_details: Object.keys(leadSourceDetails).length > 0 ? leadSourceDetails : null,
        funnel_stage: 'lead',
        client_type: 'business',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('[receive-external-lead] Error inserting lead:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create lead', details: insertError.message }),
        { status: 500, headers: { ...responseHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[receive-external-lead] Lead created successfully:', newLead.id)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        leadId: newLead.id, 
        duplicate: false 
      }),
      { status: 200, headers: { ...responseHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[receive-external-lead] Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...responseHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
