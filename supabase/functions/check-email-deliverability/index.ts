import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DomainAuthStatus {
  spf: { valid: boolean; record?: string };
  dkim: { valid: boolean; configured: boolean };
  dmarc: { valid: boolean; policy?: string };
}

interface DeliverabilityReport {
  domainAuthentication: DomainAuthStatus;
  senderReputation: {
    isNewDomain: boolean;
    sendingVolume: 'low' | 'medium' | 'high';
    estimatedScore: number;
  };
  scores: {
    domainAuth: number;
    reputation: number;
    total: number;
  };
  recommendations: string[];
  usingSharedService: boolean;
  serviceInfo?: {
    provider: 'Resend' | 'SendGrid';
    domain: string;
    status: 'fully_authenticated' | 'partial' | 'not_configured';
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's SendGrid API key from integration settings
    const { data: integration, error: integrationError } = await supabase
      .from('integration_settings')
      .select('api_credentials, config')
      .eq('user_id', user.id)
      .eq('type', 'sendgrid')
      .eq('active', true)
      .maybeSingle();

    // Also get email settings to check the from_email domain
    const { data: emailSettings } = await supabase
      .from('email_settings')
      .select('from_email, from_name')
      .eq('user_id', user.id)
      .maybeSingle();

    const fromEmail = emailSettings?.from_email || '';
    const fromDomain = fromEmail.includes('@') ? fromEmail.split('@')[1] : '';

    // Check if user has custom SendGrid integration
    const apiKey = integration?.api_credentials?.api_key;
    const hasCustomSendGrid = !!apiKey;

    // If user doesn't have custom SendGrid, they're using shared Resend
    // interioapp.com is already fully authenticated
    if (!hasCustomSendGrid) {
      console.log('User is on shared Resend service - returning pre-configured deliverability');
      
      const sharedServiceReport: DeliverabilityReport = {
        domainAuthentication: {
          spf: { valid: true, record: 'Managed by InterioApp' },
          dkim: { valid: true, configured: true },
          dmarc: { valid: true, policy: 'Managed by InterioApp' },
        },
        senderReputation: {
          isNewDomain: false,
          sendingVolume: 'medium',
          estimatedScore: 85, // Established domain with good reputation
        },
        scores: {
          domainAuth: 40, // Full score - handled by InterioApp
          reputation: 21, // 85% of 25 = ~21
          total: 61,
        },
        recommendations: [
          'Upgrade to custom SendGrid to send from your own domain',
        ],
        usingSharedService: true,
        serviceInfo: {
          provider: 'Resend',
          domain: 'interioapp.com',
          status: 'fully_authenticated',
        },
      };

      return new Response(JSON.stringify(sharedServiceReport), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // User has custom SendGrid - check their domain authentication
    console.log('User has custom SendGrid - checking their domain authentication');

    // Initialize report for SendGrid users
    let report: DeliverabilityReport = {
      domainAuthentication: {
        spf: { valid: false },
        dkim: { valid: false, configured: false },
        dmarc: { valid: false },
      },
      senderReputation: {
        isNewDomain: true,
        sendingVolume: 'low',
        estimatedScore: 50,
      },
      scores: {
        domainAuth: 0,
        reputation: 15,
        total: 15,
      },
      recommendations: [],
      usingSharedService: false,
      serviceInfo: {
        provider: 'SendGrid',
        domain: fromDomain || 'Not configured',
        status: 'not_configured',
      },
    };

    // Check SendGrid domain authentication
    if (fromDomain) {
      console.log(`Checking SendGrid domain authentication for: ${fromDomain}`);

      // Get authenticated domains from SendGrid
      const domainsResponse = await fetch('https://api.sendgrid.com/v3/whitelabel/domains', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (domainsResponse.ok) {
        const domains = await domainsResponse.json();
        console.log(`Found ${domains.length} authenticated domains`);

        // Find matching domain
        const matchingDomain = domains.find((d: any) => 
          d.domain === fromDomain || 
          fromDomain.endsWith(`.${d.domain}`)
        );

        if (matchingDomain) {
          console.log(`Found matching domain: ${matchingDomain.domain}, valid: ${matchingDomain.valid}`);
          
          report.serviceInfo!.status = matchingDomain.valid ? 'fully_authenticated' : 'partial';
          
          // SPF status
          const spfRecord = matchingDomain.dns?.mail_cname || matchingDomain.dns?.spf;
          report.domainAuthentication.spf = {
            valid: spfRecord?.valid === true,
            record: spfRecord?.data,
          };

          // DKIM status
          const dkim1 = matchingDomain.dns?.dkim1;
          const dkim2 = matchingDomain.dns?.dkim2;
          report.domainAuthentication.dkim = {
            valid: (dkim1?.valid === true) && (dkim2?.valid === true || !dkim2),
            configured: !!dkim1,
          };

          // Overall domain validation
          if (matchingDomain.valid) {
            report.domainAuthentication.spf.valid = true;
            report.domainAuthentication.dkim.valid = true;
          }
        }

        // Check DMARC separately (not in SendGrid, but we can note it)
        // DMARC is typically set up via DNS, SendGrid doesn't manage it
        report.domainAuthentication.dmarc = {
          valid: false, // Can't verify without DNS lookup
          policy: undefined,
        };
      }

      // Get sending stats to estimate reputation
      try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];

        const statsResponse = await fetch(
          `https://api.sendgrid.com/v3/stats?start_date=${startDate}&end_date=${endDate}`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          let totalSent = 0;
          let totalBounces = 0;
          let totalSpamReports = 0;

          stats.forEach((day: any) => {
            day.stats?.forEach((stat: any) => {
              totalSent += stat.metrics?.requests || 0;
              totalBounces += stat.metrics?.bounces || 0;
              totalSpamReports += stat.metrics?.spam_reports || 0;
            });
          });

          // Determine volume
          if (totalSent > 1000) {
            report.senderReputation.sendingVolume = 'high';
            report.senderReputation.isNewDomain = false;
          } else if (totalSent > 100) {
            report.senderReputation.sendingVolume = 'medium';
            report.senderReputation.isNewDomain = false;
          }

          // Calculate reputation score based on bounce/spam rates
          const bounceRate = totalSent > 0 ? (totalBounces / totalSent) * 100 : 0;
          const spamRate = totalSent > 0 ? (totalSpamReports / totalSent) * 100 : 0;

          let reputationScore = 100;
          reputationScore -= bounceRate * 5; // Each % bounce = -5 points
          reputationScore -= spamRate * 20; // Each % spam = -20 points
          reputationScore = Math.max(0, Math.min(100, reputationScore));

          // New domains start lower
          if (report.senderReputation.isNewDomain) {
            reputationScore = Math.min(reputationScore, 60);
          }

          report.senderReputation.estimatedScore = Math.round(reputationScore);
        }
      } catch (statsError) {
        console.error('Error fetching SendGrid stats:', statsError);
      }
    }

    // Calculate scores based on weights
    // Domain Auth: 40% (SPF=15, DKIM=15, DMARC=10)
    let domainAuthScore = 0;
    if (report.domainAuthentication.spf.valid) domainAuthScore += 15;
    if (report.domainAuthentication.dkim.valid) domainAuthScore += 15;
    if (report.domainAuthentication.dmarc.valid) domainAuthScore += 10;

    // Reputation: 25% 
    const reputationScore = Math.round((report.senderReputation.estimatedScore / 100) * 25);

    report.scores = {
      domainAuth: domainAuthScore,
      reputation: reputationScore,
      total: domainAuthScore + reputationScore,
    };

    // Generate recommendations
    if (!report.domainAuthentication.spf.valid) {
      report.recommendations.push('Set up SPF record for your sending domain');
    }
    if (!report.domainAuthentication.dkim.valid) {
      report.recommendations.push('Configure DKIM signing in SendGrid');
    }
    if (!report.domainAuthentication.dmarc.valid) {
      report.recommendations.push('Add a DMARC policy to your DNS records');
    }
    if (report.senderReputation.isNewDomain) {
      report.recommendations.push('Build sender reputation by sending consistently');
    }
    if (report.senderReputation.sendingVolume === 'low') {
      report.recommendations.push('Increase sending volume gradually to build trust');
    }

    console.log('Deliverability report:', JSON.stringify(report, null, 2));

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error checking deliverability:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
