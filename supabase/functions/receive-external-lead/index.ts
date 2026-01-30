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

// Classify inquiry type based on message content and form data
function classifyInquiryType(message: string, productType?: string): string {
  const lowerMessage = (message || '').toLowerCase()
  
  // Check for product type first (indicates quote request)
  if (productType) {
    return 'quote_request'
  }
  
  // Check for demo keywords
  if (lowerMessage.includes('demo') || lowerMessage.includes('demonstration') || lowerMessage.includes('trial')) {
    return 'demo_request'
  }
  
  // Check for partnership keywords
  if (lowerMessage.includes('partner') || lowerMessage.includes('reseller') || lowerMessage.includes('distributor') || lowerMessage.includes('wholesale')) {
    return 'partnership'
  }
  
  // Check for support keywords
  if (lowerMessage.includes('help') || lowerMessage.includes('issue') || lowerMessage.includes('problem') || lowerMessage.includes('bug') || lowerMessage.includes('support')) {
    return 'support'
  }
  
  return 'general'
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
      hasApiKey: !!body.apiKey,
      hasMessage: !!body.message
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

    // Classify the inquiry type
    const inquiryType = classifyInquiryType(body.message || '', body.productType)
    console.log('[receive-external-lead] Classified inquiry type:', inquiryType)

    // Prepare metadata for the inquiry
    const inquiryMetadata: Record<string, string> = {}
    if (body.orderVolume) inquiryMetadata.orderVolume = body.orderVolume
    if (body.productType) inquiryMetadata.productType = body.productType
    if (body.company) inquiryMetadata.company = body.company
    if (body.country) inquiryMetadata.country = body.country
    if (body.phone) inquiryMetadata.phone = body.phone

    // Check for existing client with this email
    const { data: existingLead, error: checkError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('email', body.email.trim().toLowerCase())
      .eq('user_id', DEFAULT_LEADS_USER_ID)
      .maybeSingle()

    if (checkError) {
      console.error('[receive-external-lead] Error checking for existing client:', checkError)
      return new Response(
        JSON.stringify({ error: 'Internal server error', details: checkError.message }),
        { status: 500, headers: { ...responseHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let clientId: string
    let isFollowUp = false

    if (existingLead) {
      // EXISTING CLIENT - Create follow-up inquiry
      clientId = existingLead.id
      isFollowUp = true
      console.log('[receive-external-lead] Existing client found, creating follow-up inquiry:', clientId)

      // Insert the inquiry (message will be stored here, not lost!)
      const { error: inquiryError } = await supabase
        .from('client_inquiries')
        .insert({
          client_id: clientId,
          user_id: DEFAULT_LEADS_USER_ID,
          inquiry_type: inquiryType,
          message: body.message?.trim() || 'No message provided',
          source: body.source?.trim() || 'interioapp.com',
          metadata: inquiryMetadata,
          is_read: false,
        })

      if (inquiryError) {
        console.error('[receive-external-lead] Error inserting follow-up inquiry:', inquiryError)
        // Don't fail the request, but log the error
      } else {
        console.log('[receive-external-lead] Follow-up inquiry created successfully')
      }

      // Update client's last activity date
      const { error: updateError } = await supabase
        .from('clients')
        .update({ 
          updated_at: new Date().toISOString(),
          // Optionally update company/country if provided and missing
          ...(body.company && { company_name: body.company.trim() }),
          ...(body.country && { country: body.country.trim() }),
          ...(body.phone && { phone: body.phone.trim() }),
        })
        .eq('id', clientId)

      if (updateError) {
        console.error('[receive-external-lead] Error updating client:', updateError)
      }

      // Log activity for the follow-up
      try {
        await supabase
          .from('client_activity_log')
          .insert({
            client_id: clientId,
            user_id: DEFAULT_LEADS_USER_ID,
            activity_type: 'note_added',
            title: `New ${inquiryType.replace('_', ' ')} received`,
            description: `Follow-up inquiry from ${body.name}: "${(body.message || '').substring(0, 100)}${(body.message || '').length > 100 ? '...' : ''}"`,
            metadata: { source: body.source, inquiry_type: inquiryType },
          })
        console.log('[receive-external-lead] Activity log created for follow-up')
      } catch (activityError) {
        console.error('[receive-external-lead] Error creating activity log:', activityError)
      }

    } else {
      // NEW CLIENT - Create client and initial inquiry
      console.log('[receive-external-lead] Creating new client')

      // Prepare lead_source_details JSON
      const leadSourceDetails: Record<string, string> = {}
      if (body.orderVolume) leadSourceDetails.orderVolume = body.orderVolume
      if (body.productType) leadSourceDetails.productType = body.productType

      // Insert new client
      const { data: newLead, error: insertError } = await supabase
        .from('clients')
        .insert({
          user_id: DEFAULT_LEADS_USER_ID,
          name: body.name.trim(),
          email: body.email.trim().toLowerCase(),
          phone: body.phone?.trim() || null,
          company_name: body.company?.trim() || null,
          country: body.country?.trim() || null,
          notes: body.message?.trim() || null, // Keep for backwards compatibility
          source: body.source?.trim() || 'interioapp.com',
          lead_source: 'External Website',
          lead_source_details: Object.keys(leadSourceDetails).length > 0 ? leadSourceDetails : null,
          funnel_stage: 'lead',
          client_type: 'business',
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('[receive-external-lead] Error inserting client:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to create lead', details: insertError.message }),
          { status: 500, headers: { ...responseHeaders, 'Content-Type': 'application/json' } }
        )
      }

      clientId = newLead.id
      console.log('[receive-external-lead] New client created:', clientId)

      // Insert the initial inquiry
      const { error: inquiryError } = await supabase
        .from('client_inquiries')
        .insert({
          client_id: clientId,
          user_id: DEFAULT_LEADS_USER_ID,
          inquiry_type: inquiryType,
          message: body.message?.trim() || 'No message provided',
          source: body.source?.trim() || 'interioapp.com',
          metadata: inquiryMetadata,
          is_read: false,
        })

      if (inquiryError) {
        console.error('[receive-external-lead] Error inserting initial inquiry:', inquiryError)
        // Don't fail the request, the client was created successfully
      } else {
        console.log('[receive-external-lead] Initial inquiry created successfully')
      }

      // Log activity for new lead
      try {
        await supabase
          .from('client_activity_log')
          .insert({
            client_id: clientId,
            user_id: DEFAULT_LEADS_USER_ID,
            activity_type: 'note_added',
            title: `New ${inquiryType.replace('_', ' ')} - Lead Created`,
            description: `New lead from ${body.source || 'interioapp.com'}: "${(body.message || '').substring(0, 100)}${(body.message || '').length > 100 ? '...' : ''}"`,
            metadata: { source: body.source, inquiry_type: inquiryType },
          })
        console.log('[receive-external-lead] Activity log created for new lead')
      } catch (activityError) {
        console.error('[receive-external-lead] Error creating activity log:', activityError)
      }
    }

    console.log('[receive-external-lead] Request completed successfully:', { 
      clientId, 
      isFollowUp, 
      inquiryType 
    })
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        leadId: clientId, 
        followUp: isFollowUp,
        inquiryType: inquiryType,
        message: isFollowUp 
          ? 'Follow-up inquiry recorded successfully' 
          : 'New lead created successfully'
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
