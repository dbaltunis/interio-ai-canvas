import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestIntegrationRequest {
  integration: {
    integration_type: string;
    api_credentials: any;
    configuration: any;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { integration }: TestIntegrationRequest = await req.json();
    console.log('Testing integration:', integration.integration_type);

    let testResult = { success: false, message: '' };

    switch (integration.integration_type) {
      case 'twilio':
        testResult = await testTwilioConnection(integration);
        break;
      case 'sendgrid':
        testResult = await testSendGridConnection(integration);
        break;
      default:
        testResult = {
          success: false,
          message: `Integration type '${integration.integration_type}' not supported`
        };
    }

    return new Response(
      JSON.stringify(testResult),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in test-integration function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Test failed: ${error.message}` 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function testTwilioConnection(integration: any) {
  try {
    const { account_sid, auth_token } = integration.api_credentials;
    const { phone_number } = integration.configuration;

    if (!account_sid || !auth_token || !phone_number) {
      return {
        success: false,
        message: 'Missing required Twilio credentials (Account SID, Auth Token, or Phone Number)'
      };
    }

    console.log('Testing Twilio with Account SID:', account_sid);

    // Test Twilio API by fetching account info
    const auth = btoa(`${account_sid}:${auth_token}`);
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${account_sid}.json`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Twilio API error:', error);
      return {
        success: false,
        message: `Twilio connection failed: ${response.status} ${response.statusText}`
      };
    }

    const accountInfo = await response.json();
    console.log('Twilio account status:', accountInfo.status);

    // Verify the phone number exists
    const phoneResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${account_sid}/IncomingPhoneNumbers.json`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    );

    if (phoneResponse.ok) {
      const phoneData = await phoneResponse.json();
      const phoneExists = phoneData.incoming_phone_numbers.some(
        (p: any) => p.phone_number === phone_number
      );

      if (!phoneExists) {
        return {
          success: false,
          message: `Phone number ${phone_number} not found in your Twilio account`
        };
      }
    }

    return {
      success: true,
      message: `Successfully connected to Twilio account (${accountInfo.friendly_name || account_sid})`
    };

  } catch (error: any) {
    console.error('Twilio test error:', error);
    return {
      success: false,
      message: `Twilio test failed: ${error.message}`
    };
  }
}

async function testSendGridConnection(integration: any) {
  try {
    const { api_key } = integration.api_credentials;

    if (!api_key) {
      return {
        success: false,
        message: 'Missing SendGrid API key'
      };
    }

    // Test SendGrid API by making a simple API call
    const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: `SendGrid connection failed: ${response.status} ${response.statusText}`
      };
    }

    const profile = await response.json();
    return {
      success: true,
      message: `Successfully connected to SendGrid (${profile.username})`
    };

  } catch (error: any) {
    console.error('SendGrid test error:', error);
    return {
      success: false,
      message: `SendGrid test failed: ${error.message}`
    };
  }
}

serve(handler);