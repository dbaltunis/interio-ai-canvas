import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIntegrationStatus } from './useIntegrationStatus';

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

interface ContentAnalysis {
  spamScore: number;
  issues: string[];
  structureScore: number;
  structureIssues: string[];
}

interface DeliverabilityScore {
  total: number;
  maxTotal: number;
  percentage: number;
  breakdown: {
    domainAuth: { score: number; max: 40; status: 'good' | 'warning' | 'error' };
    reputation: { score: number; max: 25; status: 'good' | 'warning' | 'error' };
    content: { score: number; max: 20; status: 'good' | 'warning' | 'error' };
    structure: { score: number; max: 10; status: 'good' | 'warning' | 'error' };
    recipient: { score: number; max: 5; status: 'good' | 'warning' | 'error' };
  };
  recommendations: string[];
  canSend: boolean;
  warningLevel: 'none' | 'low' | 'medium' | 'high';
  usingSharedService: boolean;
  serviceInfo?: {
    provider: 'Resend' | 'SendGrid';
    domain: string;
    status: 'fully_authenticated' | 'partial' | 'not_configured';
  };
}

// Comprehensive spam word list
const SPAM_WORDS = [
  'free', 'urgent', 'act now', 'limited time', 'click here', 'buy now',
  'order now', 'don\'t miss', 'exclusive deal', 'special offer', 'winner',
  'congratulations', 'you won', 'cash prize', 'make money', 'earn money',
  'extra income', 'no obligation', 'risk free', 'satisfaction guaranteed',
  'double your', 'increase your', 'unlimited', '100% free', 'best price',
  'lowest price', 'amazing', 'incredible', 'unbelievable', 'miracle',
  '!!!', '???', 'URGENT', 'IMPORTANT', 'ACT NOW', 'LIMITED',
  'credit card', 'no credit check', 'no questions asked', 'apply now',
  'call now'
];

export const useEmailDeliverability = () => {
  const { hasSendGridIntegration } = useIntegrationStatus();

  return useQuery({
    queryKey: ['email-deliverability'],
    queryFn: async (): Promise<DeliverabilityReport | null> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase.functions.invoke('check-email-deliverability');
      
      if (error) {
        console.error('Error fetching deliverability:', error);
        return null;
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const analyzeEmailContent = (
  subject: string,
  content: string
): ContentAnalysis => {
  const textToCheck = (subject + ' ' + content).toLowerCase();
  const plainContent = content.replace(/<[^>]*>/g, '');
  const foundWords: string[] = [];
  const structureIssues: string[] = [];

  // Check spam words
  SPAM_WORDS.forEach(word => {
    if (textToCheck.includes(word.toLowerCase())) {
      foundWords.push(word);
    }
  });

  // Calculate spam score (0-100, lower is better)
  const spamScore = Math.min(100, foundWords.length * 15);

  // Structure checks
  let structureScore = 10; // Start with full score

  // Check subject length (30-60 chars optimal)
  if (subject.length < 10) {
    structureIssues.push('Subject too short (< 10 chars)');
    structureScore -= 2;
  } else if (subject.length > 70) {
    structureIssues.push('Subject too long (> 70 chars)');
    structureScore -= 1;
  }

  // Check for ALL CAPS (more than 30%)
  const capsRatio = (subject.match(/[A-Z]/g)?.length || 0) / Math.max(1, subject.replace(/[^a-zA-Z]/g, '').length);
  if (capsRatio > 0.3 && subject.length > 5) {
    structureIssues.push('Too many capital letters in subject');
    structureScore -= 2;
  }

  // Check excessive punctuation
  if ((subject.match(/[!?]{2,}/g)?.length || 0) > 0) {
    structureIssues.push('Excessive punctuation (!!, ??)');
    structureScore -= 2;
  }

  // Check content length
  if (plainContent.length < 50) {
    structureIssues.push('Email content too short');
    structureScore -= 2;
  }

  // Check link count
  const linkCount = (content.match(/<a /gi)?.length || 0) + (content.match(/https?:\/\//gi)?.length || 0);
  if (linkCount > 5) {
    structureIssues.push('Too many links (> 5)');
    structureScore -= 2;
  }

  // Check for personalization (good!)
  const hasPersonalization = content.includes('{{client_name}}') || content.includes('{{company_name}}');
  if (!hasPersonalization) {
    structureIssues.push('No personalization tokens used');
    structureScore -= 1;
  }

  // Check text-to-HTML ratio (if almost all images, that's bad)
  const imgCount = (content.match(/<img/gi)?.length || 0);
  if (imgCount > 3 && plainContent.length < 100) {
    structureIssues.push('Too many images vs text');
    structureScore -= 2;
  }

  return {
    spamScore,
    issues: foundWords.slice(0, 5).map(w => `Spam trigger: "${w}"`),
    structureScore: Math.max(0, structureScore),
    structureIssues,
  };
};

export const calculateDeliverabilityScore = (
  deliverabilityData: DeliverabilityReport | null | undefined,
  contentAnalysis: ContentAnalysis,
  recipientEmails: string[] = []
): DeliverabilityScore => {
  const breakdown = {
    domainAuth: { score: 0, max: 40 as const, status: 'error' as 'good' | 'warning' | 'error' },
    reputation: { score: 0, max: 25 as const, status: 'warning' as 'good' | 'warning' | 'error' },
    content: { score: 0, max: 20 as const, status: 'good' as 'good' | 'warning' | 'error' },
    structure: { score: 0, max: 10 as const, status: 'good' as 'good' | 'warning' | 'error' },
    recipient: { score: 5, max: 5 as const, status: 'good' as 'good' | 'warning' | 'error' },
  };

  const recommendations: string[] = [];
  const usingSharedService = deliverabilityData?.usingSharedService ?? false;
  const serviceInfo = deliverabilityData?.serviceInfo;

  // Domain Authentication (40%)
  if (deliverabilityData) {
    // If using shared service, domain auth is already handled
    if (usingSharedService) {
      breakdown.domainAuth.score = 40; // Full score
      breakdown.domainAuth.status = 'good';
      breakdown.reputation.score = deliverabilityData.scores.reputation;
      breakdown.reputation.status = 'good';
    } else {
      // Custom SendGrid - check their domain auth
      const { domainAuthentication } = deliverabilityData;
      if (domainAuthentication.spf.valid) breakdown.domainAuth.score += 15;
      if (domainAuthentication.dkim.valid) breakdown.domainAuth.score += 15;
      if (domainAuthentication.dmarc.valid) breakdown.domainAuth.score += 10;

      if (!domainAuthentication.spf.valid) {
        recommendations.push('Configure SPF record for your domain');
      }
      if (!domainAuthentication.dkim.valid) {
        recommendations.push('Set up DKIM signing in SendGrid');
      }
      if (!domainAuthentication.dmarc.valid) {
        recommendations.push('Add DMARC policy to DNS');
      }

      // Reputation (25%)
      breakdown.reputation.score = deliverabilityData.scores.reputation;
      if (deliverabilityData.senderReputation.isNewDomain) {
        recommendations.push('Build sender reputation with consistent sending');
      }
    }
  } else {
    // No data = assume worst case for domain auth, medium for reputation
    breakdown.domainAuth.score = 0;
    breakdown.reputation.score = 15;
    recommendations.push('Connect SendGrid for domain authentication');
  }

  // Content Score (20%)
  // Convert spam score (0-100, lower better) to content score (0-20, higher better)
  breakdown.content.score = Math.round(20 * (1 - contentAnalysis.spamScore / 100));
  if (contentAnalysis.spamScore > 30) {
    contentAnalysis.issues.forEach(issue => recommendations.push(issue));
  }

  // Structure Score (10%)
  breakdown.structure.score = contentAnalysis.structureScore;
  if (contentAnalysis.structureScore < 8) {
    contentAnalysis.structureIssues.forEach(issue => recommendations.push(issue));
  }

  // Recipient Factors (5%)
  // Check for strict providers (Yahoo, Hotmail, AOL)
  const strictProviders = ['yahoo.com', 'yahoo.co', 'hotmail.com', 'outlook.com', 'aol.com', 'live.com'];
  const strictCount = recipientEmails.filter(email => 
    strictProviders.some(provider => email.toLowerCase().includes(provider))
  ).length;
  const strictRatio = recipientEmails.length > 0 ? strictCount / recipientEmails.length : 0;
  
  if (strictRatio > 0.5) {
    breakdown.recipient.score = 3;
    recommendations.push('Many recipients use strict email providers (Yahoo, Outlook)');
  } else if (strictRatio > 0.25) {
    breakdown.recipient.score = 4;
  }

  // Set status based on scores
  breakdown.domainAuth.status = breakdown.domainAuth.score >= 30 ? 'good' : breakdown.domainAuth.score >= 15 ? 'warning' : 'error';
  breakdown.reputation.status = breakdown.reputation.score >= 18 ? 'good' : breakdown.reputation.score >= 10 ? 'warning' : 'error';
  breakdown.content.status = breakdown.content.score >= 15 ? 'good' : breakdown.content.score >= 10 ? 'warning' : 'error';
  breakdown.structure.status = breakdown.structure.score >= 7 ? 'good' : breakdown.structure.score >= 4 ? 'warning' : 'error';
  breakdown.recipient.status = breakdown.recipient.score >= 4 ? 'good' : breakdown.recipient.score >= 3 ? 'warning' : 'error';

  const total = Object.values(breakdown).reduce((sum, item) => sum + item.score, 0);
  const maxTotal = 100;
  const percentage = Math.round((total / maxTotal) * 100);

  // Determine warning level and if sending is allowed
  let warningLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
  if (percentage < 40) warningLevel = 'high';
  else if (percentage < 60) warningLevel = 'medium';
  else if (percentage < 75) warningLevel = 'low';

  return {
    total,
    maxTotal,
    percentage,
    breakdown,
    recommendations: recommendations.slice(0, 5), // Top 5 recommendations
    canSend: percentage >= 30, // Allow sending above 30%
    warningLevel,
    usingSharedService,
    serviceInfo,
  };
};
