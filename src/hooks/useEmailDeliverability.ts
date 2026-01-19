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

// Comprehensive spam word list - significantly expanded for realistic detection
const SPAM_WORDS = [
  // Classic spam triggers
  'free', 'urgent', 'act now', 'limited time', 'click here', 'buy now',
  'order now', 'don\'t miss', 'exclusive deal', 'special offer', 'winner',
  'congratulations', 'you won', 'cash prize', 'make money', 'earn money',
  'extra income', 'no obligation', 'risk free', 'satisfaction guaranteed',
  'double your', 'increase your', 'unlimited', '100% free', 'best price',
  'lowest price', 'amazing', 'incredible', 'unbelievable', 'miracle',
  'credit card', 'no credit check', 'no questions asked', 'apply now',
  'call now',
  // Urgency words
  'hurry', 'today only', 'expires', 'deadline', 'final', 'last chance',
  'limited offer', 'while supplies last', 'for instant access', 'now or never',
  'don\'t delay', 'what are you waiting for', 'before it\'s too late',
  // Money/financial triggers
  'discount', 'save', 'cheap', 'affordable', 'bonus', 'bargain', 'clearance',
  'prize', 'cash', 'dollars', 'money back', 'refund', 'investment', 'income',
  'profit', 'earnings', 'financial freedom', 'get rich', 'wealth',
  // Hype words
  'revolutionary', 'breakthrough', 'secret', 'exclusive access', 'insider',
  'guaranteed', 'proven', 'results', 'success', 'powerful', 'effective',
  'transform', 'life-changing', 'game-changer', 'ultimate',
  // Pressure tactics
  'act immediately', 'respond now', 'take action', 'don\'t hesitate',
  'once in a lifetime', 'be the first', 'join now', 'sign up now',
  'register now', 'subscribe now', 'get started now',
  // Suspicious phrases
  'no hidden', 'no strings attached', 'this isn\'t spam', 'not spam',
  'as seen on', 'featured on', 'endorsed by', 'recommended by',
  'you have been selected', 'you\'ve been chosen', 'dear friend',
  'dear valued customer', 'attention', 'important notice',
  // Medical/health spam
  'weight loss', 'lose weight', 'diet', 'supplement', 'cure', 'treatment',
  'prescription', 'pharmacy', 'medication', 'pills', 'natural remedy',
  // Format issues (detected separately but listed for awareness)
  '!!!', '???', 'URGENT', 'IMPORTANT', 'ACT NOW', 'LIMITED', 'FREE',
  'CLICK', 'BUY', 'ORDER', 'CALL', 'WIN', 'WINNER', 'CASH', 'PRIZE',
];

// Profanity and offensive words - MAJOR penalty
const PROFANITY_WORDS = [
  'shit', 'damn', 'hell', 'ass', 'crap', 'piss', 'bastard', 'bitch',
  'fuck', 'fucking', 'fucked', 'dick', 'cock', 'pussy', 'slut', 'whore',
  'asshole', 'bullshit', 'dumbass', 'jackass', 'moron', 'idiot', 'stupid',
  'retard', 'loser', 'suck', 'sucks', 'wtf', 'stfu', 'lmao', 'lmfao',
];

// Common typos/misspellings that indicate poor quality
const COMMON_TYPOS = [
  'pelase', 'teh', 'recieve', 'definately', 'occured', 'seperate',
  'untill', 'thier', 'wich', 'becuase', 'accomodate', 'occurence',
  'refered', 'succesful', 'beleive', 'calender', 'collegue', 'comming',
  'concious', 'embarass', 'enviroment', 'goverment', 'harrass', 'independant',
  'liason', 'millenium', 'neccessary', 'occassion', 'persistant', 'privelege',
  'publically', 'recomend', 'relevent', 'resistence', 'responsability', 'succesfully',
];

// Additional patterns to check
const SPAM_PATTERNS = [
  /\$\d+/g, // Dollar amounts like $100
  /\d+%\s*(off|discount|save)/gi, // Percentage discounts
  /\b(xxx|adult|viagra|casino)\b/gi, // Adult/gambling content
  /\b(unsubscribe|opt.?out|remove\s+me)\b/gi, // Excessive unsubscribe mentions
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

  // Check for profanity FIRST (major penalty)
  let profanityCount = 0;
  PROFANITY_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = textToCheck.match(regex);
    if (matches) {
      profanityCount += matches.length;
      foundWords.push(`PROFANITY: "${word}"`);
    }
  });

  // Check spam words (case-insensitive)
  SPAM_WORDS.forEach(word => {
    if (textToCheck.includes(word.toLowerCase())) {
      foundWords.push(word);
    }
  });

  // Check spam patterns
  SPAM_PATTERNS.forEach(pattern => {
    const matches = textToCheck.match(pattern);
    if (matches && matches.length > 0) {
      foundWords.push(...matches.slice(0, 2)); // Add up to 2 matches per pattern
    }
  });

  // Check for excessive caps in the actual text (not just subject)
  const capsMatches = content.match(/\b[A-Z]{4,}\b/g);
  if (capsMatches && capsMatches.length > 2) {
    foundWords.push('EXCESSIVE CAPS');
  }

  // Check for excessive exclamation marks
  const exclamationCount = (textToCheck.match(/!/g) || []).length;
  if (exclamationCount > 3) {
    foundWords.push('Too many exclamation marks');
  }

  // Calculate spam score (0-100, lower is better) - MUCH more aggressive scoring
  // Profanity = instant major penalty (40 per word), spam words = 15 per word
  const spamScore = Math.min(100, (profanityCount * 40) + ((foundWords.length - profanityCount) * 15));

  // Structure checks
  let structureScore = 10; // Start with full score

  // Check for typos/misspellings
  const typoCount = COMMON_TYPOS.filter(typo => 
    textToCheck.includes(typo.toLowerCase())
  ).length;
  if (typoCount > 0) {
    structureIssues.push(`${typoCount} possible spelling error(s)`);
    structureScore -= Math.min(4, typoCount * 2);
  }

  // Check subject length (30-60 chars optimal)
  if (subject.length < 10) {
    structureIssues.push('Subject too short (< 10 chars)');
    structureScore -= 2;
  } else if (subject.length > 70) {
    structureIssues.push('Subject too long (> 70 chars)');
    structureScore -= 1;
  }

  // Check for ALL CAPS in subject (more than 30%)
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

  // Check content length - more aggressive
  if (plainContent.length < 30) {
    structureIssues.push('Email content extremely short');
    structureScore -= 3;
  } else if (plainContent.length < 50) {
    structureIssues.push('Email content too short');
    structureScore -= 2;
  }

  // Check for greeting/sign-off (professionalism indicators)
  const hasGreeting = /^(hi|hello|hey|dear|good morning|good afternoon|greetings)/i.test(plainContent.trim());
  const hasSignoff = /(regards|best|thanks|sincerely|cheers|kind regards|warm regards|best wishes)/i.test(plainContent);
  if (!hasGreeting && !hasSignoff && plainContent.length > 50) {
    structureIssues.push('Missing greeting or sign-off');
    structureScore -= 1;
  }

  // Check link count
  const linkCount = (content.match(/<a /gi)?.length || 0) + (content.match(/https?:\/\//gi)?.length || 0);
  if (linkCount > 5) {
    structureIssues.push('Too many links (> 5)');
    structureScore -= 2;
  } else if (linkCount > 3) {
    structureIssues.push('Consider reducing links (> 3)');
    structureScore -= 1;
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
  } else if (imgCount > 2 && plainContent.length < 200) {
    structureIssues.push('High image-to-text ratio');
    structureScore -= 1;
  }

  return {
    spamScore,
    issues: foundWords.slice(0, 5).map(w => w.startsWith('PROFANITY') ? w : `Spam trigger: "${w}"`),
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

  // Domain Authentication (40%) - REALISTIC scoring for shared service
  if (deliverabilityData) {
    if (usingSharedService) {
      // Shared service: domain auth is handled but NOT as good as custom domain
      // Lower baseline so content analysis matters MORE
      breakdown.domainAuth.score = 20; // Significantly reduced - shared domains have less trust
      breakdown.domainAuth.status = 'warning';
      recommendations.push('Using shared email service - consider SendGrid with your own domain for better deliverability');
      
      // Reputation for shared service - also reduced significantly
      breakdown.reputation.score = Math.min(12, deliverabilityData.scores.reputation || 10);
      breakdown.reputation.status = 'warning';
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
    breakdown.reputation.score = 8;
    recommendations.push('Connect SendGrid for domain authentication');
  }

  // Content Score (20%) - MUCH more aggressive penalties
  // Convert spam score (0-100, lower better) to content score (0-20, higher better)
  // Each spam word = 15 points in spamScore, so contentPenalty = spamScore * 0.5 (max 20)
  const contentPenalty = Math.min(20, contentAnalysis.spamScore * 0.5);
  breakdown.content.score = Math.round(Math.max(0, 20 - contentPenalty));
  
  // Add profanity warning immediately
  if (contentAnalysis.issues.some(issue => issue.includes('PROFANITY'))) {
    recommendations.unshift('⚠️ Profanity detected - this will likely be flagged as spam');
  }
  
  if (contentAnalysis.spamScore > 15) {
    contentAnalysis.issues.forEach(issue => recommendations.push(issue));
  }
  if (contentAnalysis.spamScore > 30) {
    recommendations.push('High spam word count detected - rewrite with neutral language');
  }

  // Structure Score (10%)
  breakdown.structure.score = contentAnalysis.structureScore;
  if (contentAnalysis.structureScore < 8) {
    contentAnalysis.structureIssues.forEach(issue => recommendations.push(issue));
  }

  // Recipient Factors (5%)
  // Check for strict providers (Yahoo, Hotmail, AOL)
  const strictProviders = ['yahoo.com', 'yahoo.co', 'hotmail.com', 'outlook.com', 'aol.com', 'live.com', 'msn.com'];
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

  // Set status based on scores - stricter thresholds
  breakdown.domainAuth.status = breakdown.domainAuth.score >= 35 ? 'good' : breakdown.domainAuth.score >= 20 ? 'warning' : 'error';
  breakdown.reputation.status = breakdown.reputation.score >= 20 ? 'good' : breakdown.reputation.score >= 12 ? 'warning' : 'error';
  breakdown.content.status = breakdown.content.score >= 16 ? 'good' : breakdown.content.score >= 10 ? 'warning' : 'error';
  breakdown.structure.status = breakdown.structure.score >= 8 ? 'good' : breakdown.structure.score >= 5 ? 'warning' : 'error';
  breakdown.recipient.status = breakdown.recipient.score >= 4 ? 'good' : breakdown.recipient.score >= 3 ? 'warning' : 'error';

  const total = Object.values(breakdown).reduce((sum, item) => sum + item.score, 0);
  const maxTotal = 100;
  const percentage = Math.round((total / maxTotal) * 100);

  // Determine warning level and if sending is allowed - adjusted thresholds
  let warningLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
  if (percentage < 45) warningLevel = 'high';
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
