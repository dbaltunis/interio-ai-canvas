
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, name } = await req.json();

    console.log('Generating description for category:', category, 'name:', name);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert in window treatment and fabric calculations. Generate clear, concise descriptions for calculation formulas based on the category.

Write descriptions that explain:
1. What the formula calculates
2. When it should be used
3. What factors it considers

Keep descriptions professional but easy to understand. Maximum 2-3 sentences.

Category: ${category}
Formula Name: ${name || 'Not specified'}`;

    const categoryPrompts = {
      fabric_calculation: "Generate a description for a fabric calculation formula that determines how much fabric is needed",
      pricing_calculation: "Generate a description for a pricing calculation formula that determines cost",
      labor_calculation: "Generate a description for a labor calculation formula that estimates work time/cost",
      hardware_calculation: "Generate a description for a hardware calculation formula that determines hardware requirements"
    };

    const prompt = categoryPrompts[category] || "Generate a description for this calculation formula";

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    const description = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ description }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-description function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
