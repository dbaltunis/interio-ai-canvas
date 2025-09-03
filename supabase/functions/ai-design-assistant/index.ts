import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        fallbackSuggestion: "Please configure your OpenAI API key to enable AI design suggestions.",
        designRecommendations: generateFallbackRecommendations()
      }), {
        status: 200, // Return 200 with fallback instead of 500
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt, documentType, currentStyle, projectData } = await req.json();
    console.log('AI Design Assistant request:', { prompt, documentType, hasApiKey: !!openAIApiKey });

    // Enhanced system prompt for better design suggestions
    const systemPrompt = `You are an expert interior design and document template specialist. 

Document Type: ${documentType || 'quote'}
Industry: Interior Design & Window Treatments
Current Style: ${JSON.stringify(currentStyle || {})}

Create intelligent, actionable design suggestions for professional business documents used by interior designers and curtain retailers. Focus on:

1. Professional color schemes that convey trust and luxury
2. Typography that ensures readability while maintaining elegance  
3. Layout structures that guide the eye and highlight important information
4. Brand elements that establish credibility
5. Visual hierarchy that makes pricing and services clear

Provide specific, implementable recommendations that can be applied immediately. Consider the target audience: homeowners and businesses seeking premium interior design services.`;

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
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    const aiSuggestion = data.choices[0].message.content;

    console.log('AI Design Assistant response generated successfully');

    // Generate comprehensive design recommendations
    const designRecommendations = {
      colors: generateColorPalette(documentType),
      typography: generateTypographyRecommendations(documentType),
      layout: generateLayoutSuggestions(documentType),
      aiAdvice: aiSuggestion,
      templates: generateSmartTemplates(documentType, prompt),
      blocks: generateRecommendedBlocks(documentType)
    };

    return new Response(JSON.stringify(designRecommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI Design Assistant:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      designRecommendations: generateFallbackRecommendations()
    }), {
      status: 200, // Return 200 with fallback recommendations
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackRecommendations() {
  return {
    colors: generateColorPalette('quote'),
    typography: generateTypographyRecommendations('quote'),
    layout: generateLayoutSuggestions('quote'),
    aiAdvice: "Consider using a professional color scheme with navy blue or deep green as primary colors, paired with clean typography for a trustworthy appearance. Structure your quote with clear sections for services, pricing, and terms.",
    templates: generateSmartTemplates('quote', 'professional quote'),
    blocks: generateRecommendedBlocks('quote')
  };
}

function generateColorPalette(documentType: string) {
  const palettes = {
    quote: {
      primary: '#1e40af',
      secondary: '#3b82f6', 
      accent: '#10b981',
      background: '#fafafa',
      text: '#1e293b',
      border: '#e2e8f0'
    },
    invoice: {
      primary: '#dc2626',
      secondary: '#ef4444',
      accent: '#f59e0b', 
      background: '#fefefe',
      text: '#111827',
      border: '#d1d5db'
    },
    proposal: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#f9fafb', 
      text: '#374151',
      border: '#d1d5db'
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
    letterSpacing: '-0.025em',
    fontWeights: {
      heading: '600',
      subheading: '500',
      body: '400',
      emphasis: '500'
    }
  };
}

function generateLayoutSuggestions(documentType: string) {
  const suggestions = {
    quote: [
      'Professional header with logo and company details prominently displayed',
      'Clear client information section with elegant formatting', 
      'Detailed service/product table with visual hierarchy',
      'Prominent pricing section with clear breakdowns',
      'Professional footer with terms and contact information',
      'Signature area for client approval'
    ],
    invoice: [
      'Invoice number and due date prominently displayed',
      'Professional billing information layout',
      'Clear itemized services with quantities and rates',
      'Payment terms and methods clearly outlined',
      'Overdue notices with appropriate styling'
    ],
    proposal: [
      'Executive summary section at the top',
      'Detailed project scope and timeline',
      'Visual mockups or inspiration images',
      'Investment breakdown with package options',
      'Next steps and approval process'
    ]
  };
  
  return suggestions[documentType as keyof typeof suggestions] || suggestions.quote;
}

function generateSmartTemplates(documentType: string, prompt: string) {
  return [
    {
      name: 'Luxury Interior Design Quote',
      description: 'Premium template for high-end interior design services',
      style: 'luxury',
      recommendedFor: 'High-value residential projects'
    },
    {
      name: 'Professional Business Quote', 
      description: 'Clean, corporate template for commercial projects',
      style: 'professional',
      recommendedFor: 'Commercial and office spaces'
    },
    {
      name: 'Boutique Curtain Specialist',
      description: 'Specialized template for window treatment services',
      style: 'specialized',
      recommendedFor: 'Custom curtain and blind installations'
    }
  ];
}

function generateRecommendedBlocks(documentType: string) {
  return [
    { type: 'header', priority: 'high', reason: 'Professional brand presentation' },
    { type: 'client-info', priority: 'high', reason: 'Clear project identification' },
    { type: 'products', priority: 'high', reason: 'Detailed service breakdown' },
    { type: 'totals', priority: 'high', reason: 'Clear pricing summary' },
    { type: 'signature', priority: 'medium', reason: 'Professional approval process' },
    { type: 'text', priority: 'medium', reason: 'Custom messaging and terms' }
  ];
}