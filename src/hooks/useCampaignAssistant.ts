import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CampaignContext {
  recipientCount: number;
  campaignType: 'outreach' | 'follow-up' | 're-engagement' | 'announcement';
  recipientStages?: string[];
  hasChurnedClients?: boolean;
  hasNewLeads?: boolean;
}

interface SubjectSuggestions {
  subjects: string[];
}

interface SpamCheckResult {
  score: number;
  issues: string[];
  suggestions: string[];
}

interface TimingSuggestion {
  bestDays: string[];
  bestTimes: string[];
  reason: string;
}

export const useCampaignAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getSubjectIdeas = async (context: CampaignContext): Promise<SubjectSuggestions | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('campaign-assistant', {
        body: { action: 'subject-ideas', context }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.result as SubjectSuggestions;
    } catch (error) {
      console.error('Failed to get subject ideas:', error);
      toast.error('Failed to generate subject ideas');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const checkSpamRisk = async (subject: string, body: string): Promise<SpamCheckResult | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('campaign-assistant', {
        body: { 
          action: 'spam-check', 
          context: {},
          content: { subject, body }
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.result as SpamCheckResult;
    } catch (error) {
      console.error('Failed to check spam risk:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getTimingSuggestions = async (context: CampaignContext): Promise<TimingSuggestion | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('campaign-assistant', {
        body: { action: 'timing-suggestion', context }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.result as TimingSuggestion;
    } catch (error) {
      console.error('Failed to get timing suggestions:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getSubjectIdeas,
    checkSpamRisk,
    getTimingSuggestions,
  };
};
