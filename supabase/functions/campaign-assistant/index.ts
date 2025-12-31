import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CampaignContext {
  recipientCount: number;
  campaignType: 'outreach' | 'follow-up' | 're-engagement' | 'announcement';
  recipientStages?: string[];
  hasChurnedClients?: boolean;
  hasNewLeads?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, context, content } = await req.json();
    console.log(`Campaign assistant action: ${action}`, { context });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'suggest-sequence':
        systemPrompt = `You are an email marketing expert. Based on the campaign context, suggest a brief email sequence strategy. Be concise and actionable. Format as JSON with: { "suggestion": "brief strategy", "emailCount": number, "timing": "recommended timing" }`;
        userPrompt = `Campaign for ${context.recipientCount} recipients. Type: ${context.campaignType}. ${context.hasChurnedClients ? 'Includes churned customers.' : ''} ${context.hasNewLeads ? 'Includes new leads.' : ''} Suggest a sequence.`;
        break;

      case 'subject-ideas':
        systemPrompt = `You are an email copywriting expert. Generate 4 compelling subject line ideas for email campaigns. Keep them short (under 60 chars), avoid spam triggers, and make them engaging. Format as JSON: { "subjects": ["subject1", "subject2", "subject3", "subject4"] }`;
        userPrompt = `Generate subject lines for a ${context.campaignType} campaign to ${context.recipientCount} contacts.`;
        break;

      case 'spam-check':
        systemPrompt = `You are an email deliverability expert. Analyze the email content for spam triggers and provide a spam risk score (0-100) with specific issues found. Format as JSON: { "score": number, "issues": ["issue1", "issue2"], "suggestions": ["suggestion1"] }`;
        userPrompt = `Analyze this email for spam risk:\nSubject: ${content.subject}\n\nContent: ${content.body}`;
        break;

      case 'timing-suggestion':
        systemPrompt = `You are an email marketing expert. Based on the campaign type and audience, suggest optimal send times. Format as JSON: { "bestDays": ["Tuesday", "Wednesday"], "bestTimes": ["9:00 AM", "2:00 PM"], "reason": "brief explanation" }`;
        userPrompt = `Suggest best send times for a ${context.campaignType} campaign to ${context.recipientCount} business contacts.`;
        break;

      case 'generate-content':
        systemPrompt = `You are an expert email copywriter. Generate a professional, personalized email based on the campaign type. Use {{client_name}} and {{company_name}} as personalization tokens. Keep it concise, friendly, and action-oriented. Format as JSON: { "subject": "subject line under 60 chars", "content": "HTML email body with <p> tags" }`;
        userPrompt = `Generate a ${context.campaignType} email for ${context.recipientCount} recipients. Make it professional but warm.`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log('Sending request to OpenAI');

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
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;
    
    console.log('OpenAI response received');

    // Try to parse as JSON, fall back to raw text
    let result;
    try {
      result = JSON.parse(assistantMessage);
    } catch {
      result = { raw: assistantMessage };
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in campaign-assistant function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
