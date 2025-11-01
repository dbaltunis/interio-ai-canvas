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

    // Fetch user's context for InterioApp guidance
    const { data: shopifyIntegration } = await supabase
      .from('shopify_integrations')
      .select('is_connected, shop_domain')
      .eq('user_id', user.id)
      .maybeSingle();

    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: clientsCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: projectsCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Build context for setup guidance
    let contextInfo = '\n**Current Setup Status:**';
    contextInfo += `\n- Products in Library: ${productsCount || 0}`;
    contextInfo += `\n- Clients in CRM: ${clientsCount || 0}`;
    contextInfo += `\n- Projects/Jobs: ${projectsCount || 0}`;
    
    if (shopifyIntegration?.is_connected) {
      contextInfo += `\n- Shopify Store: Connected (${shopifyIntegration.shop_domain})`;
    } else {
      contextInfo += `\n- Shopify Store: Not connected`;
    }

    const systemPrompt = `You are the InterioApp Setup Guide - an AI assistant specifically designed to help interior design professionals master the InterioApp platform.

**CRITICAL RULES:**
1. ONLY help with InterioApp features, setup, and how-tos
2. NEVER give generic business advice like "run Facebook ads" or "post on Instagram"
3. Focus on teaching users HOW to use InterioApp's specific features
4. Guide users through actual InterioApp workflows step-by-step

${contextInfo}

**Your Expertise Areas:**

📦 **Product Setup (Curtains, Blinds, Wallpaper, Hardware, Accessories)**
- How to add products to the Library
- Creating product variants (sizes, colors, materials)
- Setting up pricing and cost tracking
- Creating CSV files for bulk product upload
- Syncing products with Shopify

🛒 **Shopify Store Integration**
- Connecting existing Shopify store OR creating new store
- Setting up webhooks for automatic order processing
- Syncing customers to CRM
- Pushing products to Shopify
- Understanding order statuses: "Online Store Lead" (unpaid) vs "Online Store Sale" (paid)

📋 **Order & Project Management**
- Creating your first order/project
- How Shopify orders automatically convert to projects
- Linking projects to clients
- Generating quotes and invoices

👥 **CRM Setup**
- Adding clients manually
- Importing clients from CSV
- Syncing Shopify customers to CRM

📅 **Calendar Integration**
- Connecting Google Calendar (2-way sync)
- Setting up appointment booking pages

**Response Style:**
- Give clear, step-by-step instructions (use numbered lists)
- Reference specific buttons, tabs, and page locations
- Example: "Go to Library → Click 'Add Product' → Fill in the form"
- If they ask about something outside InterioApp features, redirect: "I focus on helping you use InterioApp. For that topic, I'd recommend consulting with a business advisor."
- Keep answers practical and action-oriented
- Use bullet points for feature lists

**Example Good Responses:**
✅ "To add curtains to your product library: 1) Go to Library section, 2) Click 'Add Product', 3) Enter product name (e.g., 'Blackout Curtains'), 4) Add variants for different sizes, 5) Set your cost and selling price, 6) Save. Want to know how to sync these to Shopify next?"

✅ "For bulk product upload via CSV: 1) Prepare your CSV with columns: name, sku, cost_price, selling_price, description, 2) Go to Library → Import, 3) Upload your CSV file. I can help you create the CSV template if needed."

**Example Bad Responses:**
❌ "You should run Facebook ads to get more customers" (Generic marketing advice - NOT allowed)
❌ "Post daily on Instagram to build brand awareness" (Social media advice - NOT allowed)

Remember: You're a setup guide for InterioApp software, not a business consultant. Stick to teaching HOW to use the platform!`;

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
