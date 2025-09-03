import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, documentType, currentStyle, projectData } = await req.json();

    console.log('AI Design Assistant request:', { prompt, documentType, currentStyle });

    // Build context-aware prompt for AI design suggestions
    const systemPrompt = `You are an expert document design assistant specializing in professional business documents like quotes, invoices, and work orders. 

Current document type: ${documentType || 'quote'}
Current style: ${JSON.stringify(currentStyle || {})}

Provide intelligent design suggestions based on:
1. Industry best practices for ${documentType || 'business documents'}
2. Professional color palettes that work well for business documents
3. Typography recommendations for readability and professionalism
4. Layout optimizations based on content type

Always respond with practical, actionable design advice that can be implemented immediately.`;

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
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiSuggestion = data.choices[0].message.content;

    console.log('AI Design Assistant response generated successfully');

    // Generate concrete design recommendations
    const designRecommendations = {
      colors: generateColorPalette(documentType),
      typography: generateTypographyRecommendations(documentType),
      layout: generateLayoutSuggestions(documentType),
      aiAdvice: aiSuggestion
    };

    return new Response(JSON.stringify(designRecommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI Design Assistant:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallbackSuggestion: "Consider using a professional blue (#1e40af) as your primary color with clean, modern typography for better readability."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateColorPalette(documentType: string) {
  const palettes = {
    quote: {
      primary: '#1e40af',
      secondary: '#3b82f6', 
      accent: '#10b981',
      background: '#f8fafc',
      text: '#1e293b'
    },
    invoice: {
      primary: '#dc2626',
      secondary: '#ef4444',
      accent: '#f59e0b', 
      background: '#fefefe',
      text: '#111827'
    },
    'work-order': {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#f9fafb', 
      text: '#374151'
    }
  };
  
  return palettes[documentType as keyof typeof palettes] || palettes.quote;
}

function generateTypographyRecommendations(documentType: string) {
  return {
    headingFont: 'Inter, system-ui, sans-serif',
    bodyFont: 'Inter, system-ui, sans-serif',
    headingSize: '1.875rem',
    bodySize: '1rem',
    lineHeight: '1.6',
    letterSpacing: '-0.025em'
  };
}

function generateLayoutSuggestions(documentType: string) {
  const suggestions = {
    quote: [
      'Use a clean header with company logo and contact info on the left, quote details on the right',
      'Organize line items in a clear table with proper spacing', 
      'Place totals section prominently on the right side',
      'Include signature area at the bottom for client approval'
    ],
    invoice: [
      'Make invoice number and due date prominent in the header',
      'Use professional color coding for overdue amounts',
      'Include payment terms and methods clearly',
      'Add QR code for easy payment processing'
    ],
    'work-order': [
      'Prioritize work description and timeline information',
      'Use status indicators for different work phases',
      'Include safety notes and requirements prominently',
      'Add sections for before/after photos'
    ]
  };
  
  return suggestions[documentType as keyof typeof suggestions] || suggestions.quote;
}