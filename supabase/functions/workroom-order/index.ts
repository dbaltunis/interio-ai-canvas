import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BOMItem {
  item_name: string
  quantity: number
  unit: string
  unit_price: number
  total_price: number
  category?: string
  notes?: string
}

interface CutListItem {
  item: string
  fabric_width: number
  cut_width: number
  cut_length: number
  quantity: number
  wastage: number
  notes?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { window_id, format = 'json' } = await req.json()

    if (!window_id) {
      return new Response(
        JSON.stringify({ error: 'window_id is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get window data with BOM
    const { data: window, error: windowError } = await supabaseClient
      .from('job_windows')
      .select(`
        *,
        product_templates (name)
      `)
      .eq('id', window_id)
      .single()

    if (windowError) throw windowError

    const state = window.state as any
    const bom = window.bom as BOMItem[] || []

    // Generate cut list from BOM and measurements
    const cutList: CutListItem[] = []
    if (state?.selectedFabric && state?.measurements) {
      const { rail_width, drop } = state.measurements
      const fabricWidth = state.selectedFabric.width || 1400 // Default fabric width
      
      // Calculate fabric cuts
      const curtainWidth = rail_width * (state.fullness_ratio || 2.0)
      const curtainDrop = drop + (state.header_allowance || 80) + (state.bottom_hem || 150)
      
      cutList.push({
        item: `Main fabric - ${state.selectedFabric.name}`,
        fabric_width: fabricWidth,
        cut_width: curtainWidth,
        cut_length: curtainDrop,
        quantity: state.panelSetup === 'pair' ? 2 : 1,
        wastage: 5,
        notes: `${state.panelSetup} panel setup`
      })

      if (state.selectedLining) {
        cutList.push({
          item: `Lining - ${state.selectedLining.name}`,
          fabric_width: state.selectedLining.width || 1400,
          cut_width: curtainWidth,
          cut_length: curtainDrop - 50, // Lining slightly shorter
          quantity: state.panelSetup === 'pair' ? 2 : 1,
          wastage: 3,
          notes: 'Lining fabric'
        })
      }
    }

    // Compile workroom order data
    const workroomOrder = {
      window_id,
      job_id: window.job_id,
      template: window.product_templates?.name || 'Unknown Template',
      client_reference: `Job ${window.job_id}`,
      measurements: state?.measurements || {},
      specifications: {
        fabric: state?.selectedFabric?.name || 'Not specified',
        lining: state?.selectedLining?.name || 'None',
        heading: state?.selectedHeading || 'Standard',
        hardware: state?.selectedHardware?.map((h: any) => h.name).join(', ') || 'None',
        panel_setup: state?.panelSetup || 'pair'
      },
      bom,
      cut_list: cutList,
      notes: state?.notes || '',
      special_instructions: state?.special_instructions || '',
      created_at: new Date().toISOString()
    }

    if (format === 'json') {
      return new Response(
        JSON.stringify(workroomOrder, null, 2),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="workroom-order-${window_id}.json"`
          } 
        }
      )
    }

    if (format === 'pdf') {
      // Generate PDF content
      const pdfContent = generateWorkroomPDF(workroomOrder)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          pdf_content: pdfContent,
          download_url: `data:application/pdf;base64,${btoa(pdfContent)}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid format. Use "json" or "pdf"' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate workroom order', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function generateWorkroomPDF(order: any): string {
  // Simple PDF-like content (in a real implementation, you'd use a PDF library)
  const pdfText = `
WORKROOM ORDER
==============

Order ID: ${order.window_id}
Job Reference: ${order.client_reference}
Template: ${order.template}
Date: ${new Date(order.created_at).toLocaleDateString()}

MEASUREMENTS
------------
${Object.entries(order.measurements).map(([key, value]) => 
  `${key}: ${value}mm`
).join('\n')}

SPECIFICATIONS
--------------
Fabric: ${order.specifications.fabric}
Lining: ${order.specifications.lining}
Heading: ${order.specifications.heading}
Hardware: ${order.specifications.hardware}
Panel Setup: ${order.specifications.panel_setup}

BILL OF MATERIALS
-----------------
${order.bom.map((item: BOMItem) => 
  `${item.item_name} - Qty: ${item.quantity} ${item.unit} @ $${item.unit_price} = $${item.total_price}`
).join('\n')}

CUT LIST
--------
${order.cut_list.map((item: CutListItem) => 
  `${item.item}: ${item.cut_width}mm x ${item.cut_length}mm (Qty: ${item.quantity}, Wastage: ${item.wastage}%)`
).join('\n')}

NOTES
-----
${order.notes}

SPECIAL INSTRUCTIONS
-------------------
${order.special_instructions}
`
  
  return pdfText
}