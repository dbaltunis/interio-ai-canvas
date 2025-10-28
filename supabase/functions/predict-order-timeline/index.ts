import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { supplier_id, material_types, order_value } = await req.json();

    // Fetch historical data for supplier
    const { data: historicalOrders, error: histError } = await supabase
      .from('batch_orders')
      .select('created_at, sent_date, actual_delivery_date, total_amount, metadata')
      .eq('supplier_id', supplier_id)
      .not('sent_date', 'is', null)
      .not('actual_delivery_date', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (histError) {
      console.error('Error fetching historical orders:', histError);
    }

    // Fetch supplier performance metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('supplier_performance_metrics')
      .select('*')
      .eq('supplier_id', supplier_id);

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
    }

    // Prepare context for AI
    const historicalContext = (historicalOrders || []).map(order => {
      const leadTime = order.sent_date && order.actual_delivery_date
        ? Math.ceil((new Date(order.actual_delivery_date).getTime() - new Date(order.sent_date).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      return {
        orderValue: order.total_amount,
        leadTimeDays: leadTime,
        metadata: order.metadata
      };
    }).filter(o => o.leadTimeDays !== null);

    const avgLeadTime = metrics && metrics.length > 0
      ? metrics[0].average_lead_time_days
      : historicalContext.length > 0
      ? historicalContext.reduce((sum, o) => sum + o.leadTimeDays!, 0) / historicalContext.length
      : null;

    const systemPrompt = `You are a manufacturing timeline prediction assistant. Analyze historical supplier performance data and predict realistic completion timelines for material orders.

Consider:
- Historical lead times from past orders
- Material complexity (fabrics, hardware, custom items)
- Order value and quantity
- Supplier reliability patterns
- Typical industry buffer times

Be conservative in estimates to account for potential delays. Provide structured predictions with milestone dates.`;

    const userPrompt = `Predict timeline for a material order:

Supplier Historical Performance:
${historicalContext.length > 0 ? `- Past ${historicalContext.length} orders analyzed
- Average lead time: ${avgLeadTime ? avgLeadTime.toFixed(1) + ' days' : 'Unknown'}
- Historical range: ${Math.min(...historicalContext.map(o => o.leadTimeDays!))} to ${Math.max(...historicalContext.map(o => o.leadTimeDays!))} days` : '- No historical data available (new supplier)'}

Current Order Details:
- Material types: ${material_types.join(', ')}
- Order value: $${order_value}

Based on this data, predict:
1. Estimated completion days (be realistic and conservative)
2. Confidence level (low/medium/high)
3. Key milestones with days offset from order date
4. Risk factors to consider
5. Recommendations for the user`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "predict_timeline",
            description: "Return structured timeline prediction",
            parameters: {
              type: "object",
              properties: {
                estimated_days: { 
                  type: "integer",
                  description: "Total estimated days until completion"
                },
                confidence: { 
                  type: "string",
                  enum: ["low", "medium", "high"],
                  description: "Confidence level in the prediction"
                },
                milestones: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      days_offset: { type: "integer" }
                    },
                    required: ["name", "days_offset"],
                    additionalProperties: false
                  }
                },
                risk_factors: {
                  type: "array",
                  items: { type: "string" }
                },
                recommendations: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["estimated_days", "confidence", "milestones", "risk_factors", "recommendations"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "predict_timeline" } },
        max_completion_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const prediction = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in predict-order-timeline:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to predict timeline',
      estimated_days: 30, // Fallback default
      confidence: 'low',
      milestones: [
        { name: 'Order Materials', days_offset: 7 },
        { name: 'Manufacturing Start', days_offset: 15 },
        { name: 'Quality Check', days_offset: 25 },
        { name: 'Ready for Delivery', days_offset: 30 }
      ],
      risk_factors: ['Unable to fetch AI prediction - using default timeline'],
      recommendations: ['Manually adjust timeline based on your experience with this supplier']
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});