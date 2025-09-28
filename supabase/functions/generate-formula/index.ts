
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
    const { description, category, outputUnit } = await req.json();

    console.log('Generating formula for description:', description, 'category:', category, 'outputUnit:', outputUnit);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert in window treatment and fabric calculation formulas. Generate mathematical formulas for fabric calculations based on user descriptions.

Available variables you can use:
- width: window width
- height: window height (also called drop)
- fullness: fullness ratio (e.g., 2.5 for curtains)
- pattern_repeat: pattern repeat size
- hem_allowance: hem allowance
- seam_allowance: seam allowance
- fabric_width: fabric width
- waste_factor: waste factor percentage

Category: ${category}
Output Unit: ${outputUnit}

Return ONLY the mathematical formula expression, no explanation. Use standard mathematical operators (+, -, *, /, parentheses).

Examples:
- For curtain fabric: (width * fullness * height) + hem_allowance + (pattern_repeat * 2)
- For blind fabric: width + seam_allowance * 2
- For labor cost: (width * height * complexity_factor) + base_labor_cost`;

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
          { role: 'user', content: `Generate a formula for: ${description}` }
        ],
        temperature: 0.3,
        max_tokens: 200,
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

    const formula = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ formula }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-formula function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
