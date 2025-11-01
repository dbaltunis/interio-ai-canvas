import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { message, conversationHistory } = await req.json();

    // Fetch user's context - Shopify connection, analytics
    const { data: shopifyIntegration } = await supabase
      .from('shopify_integrations')
      .select('is_connected, shop_domain')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: shopifyAnalytics } = await supabase
      .from('shopify_analytics')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // Build context-aware system prompt
    let contextInfo = '';
    
    if (shopifyIntegration?.is_connected) {
      contextInfo += `\nShopify Store: Connected (${shopifyIntegration.shop_domain})`;
      
      if (shopifyAnalytics) {
        contextInfo += `\n- Total Orders: ${shopifyAnalytics.total_orders}`;
        contextInfo += `\n- Total Revenue: $${shopifyAnalytics.total_revenue}`;
        contextInfo += `\n- Total Customers: ${shopifyAnalytics.total_customers}`;
        contextInfo += `\n- Orders This Month: ${shopifyAnalytics.orders_this_month}`;
        contextInfo += `\n- Last Synced: ${shopifyAnalytics.last_synced_at}`;
      } else {
        contextInfo += `\n- Analytics: Not yet synced (Suggest syncing now!)`;
      }
    } else {
      contextInfo += `\nShopify Store: Not connected (Suggest connecting their store)`;
    }

    const systemPrompt = `You are an AI business advisor for InterioApp, a platform for interior design professionals.

Your role is to provide ACTIONABLE, SPECIFIC advice - not generic responses. You are contextually aware of the user's setup and business status.

Current User Context:${contextInfo}

Guidelines:
1. Give specific, actionable recommendations based on their current status
2. If they haven't synced analytics, suggest doing so
3. If they have 0 orders, provide concrete marketing strategies
4. If they need to set something up, give clear next steps
5. Keep responses concise and focused (2-3 paragraphs max)
6. Use bullet points for actionable items
7. Don't ask too many questions - provide solutions
8. Reference their actual data when giving advice

Examples of good advice:
- "I see you haven't synced your Shopify analytics yet. Click the 'Sync Analytics' button in your dashboard to see your store performance."
- "With 0 orders so far, here are 3 proven strategies: 1) Set up Instagram shopping, 2) Create a welcome discount, 3) Run a Facebook ad campaign targeting local customers."
- "Your average order value is $50. Consider creating product bundles to increase this to $75+."`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI with context:', contextInfo);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        context: {
          shopifyConnected: shopifyIntegration?.is_connected || false,
          hasAnalytics: !!shopifyAnalytics,
          totalOrders: shopifyAnalytics?.total_orders || 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-advisor function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
