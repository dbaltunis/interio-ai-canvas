import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, client, analytics } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Analyze email engagement data
    const openCount = email.open_count || 0;
    const clickCount = email.click_count || 0;
    const status = email.status;
    const sentDate = email.sent_at ? new Date(email.sent_at) : null;
    const daysSinceSent = sentDate ? Math.floor((new Date().getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    // Build context for AI
    const context = `
    You are an AI assistant for a window covering business specializing in blinds, curtains, shutters, and custom window treatments. 
    
    Email Analysis:
    - Subject: ${email.subject}
    - Recipient: ${email.recipient_email}
    - Status: ${status}
    - Sent: ${daysSinceSent} days ago
    - Opens: ${openCount}
    - Clicks: ${clickCount}
    - Client Type: ${client?.client_type || 'Unknown'}
    - Client Stage: ${client?.funnel_stage || 'Unknown'}
    - Company: ${client?.company_name || 'Individual client'}
    
    Analytics Events: ${analytics.length} tracked events
    
    Based on this window covering business email engagement data, provide 3-4 specific, actionable recommendations for the next steps. 
    Consider industry-specific factors like:
    - Seasonal window treatment needs
    - Home renovation cycles  
    - Interior design project timelines
    - Quote follow-up best practices
    - Measurement appointment scheduling
    - Product selection guidance
    
    Format as numbered actionable recommendations.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert window covering business advisor providing data-driven follow-up recommendations.'
          },
          {
            role: 'user',
            content: context
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Parse recommendations from the response
    const recommendations = content
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(rec => rec.length > 0);

    return new Response(
      JSON.stringify({ 
        recommendations,
        analysis: {
          engagement_level: openCount > 2 ? 'high' : openCount > 0 ? 'medium' : 'low',
          days_since_sent: daysSinceSent,
          status: status
        }
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        recommendations: [
          "Follow up with a personalized message about their window covering needs",
          "Offer a free consultation or measurement appointment", 
          "Share relevant product catalogs or design inspiration",
          "Consider seasonal promotions or current window treatment trends"
        ]
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});