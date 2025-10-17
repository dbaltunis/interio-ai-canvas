import { useMemo, useEffect } from 'react';
import { useUpdateClient } from './useClients';
import { useClientJobs, useClientQuotes } from './useClientJobs';
import { useClientEmails } from './useClientEmails';
import { useClientActivities } from './useClientActivity';

/**
 * Automatically calculates conversion probability based on multiple factors:
 * - Lead score (0-100)
 * - Funnel stage
 * - Email engagement
 * - Activity level
 * - Project/quote history
 */
export const useConversionProbability = (client: any) => {
  const { data: projects } = useClientJobs(client?.id);
  const { data: quotes } = useClientQuotes(client?.id);
  const { data: emails } = useClientEmails(client?.id);
  const { data: activities } = useClientActivities(client?.id);
  const updateClient = useUpdateClient();

  const calculatedProbability = useMemo(() => {
    if (!client) return 0;

    let probability = 0;

    // 1. Lead Score Factor (0-30 points)
    const leadScore = client.lead_score || 0;
    probability += Math.min(30, (leadScore / 100) * 30);

    // 2. Funnel Stage Factor (0-35 points)
    const stageWeights: Record<string, number> = {
      'lead': 5,
      'contacted': 10,
      'measuring_scheduled': 20,
      'quoted': 30,
      'approved': 35,
      'lost': 0
    };
    probability += stageWeights[client.funnel_stage || 'lead'] || 5;

    // 3. Email Engagement Factor (0-20 points)
    if (emails && emails.length > 0) {
      const totalEmails = emails.length;
      const openedEmails = emails.filter(e => e.open_count > 0).length;
      const clickedEmails = emails.filter(e => e.click_count > 0).length;
      
      const openRate = totalEmails > 0 ? (openedEmails / totalEmails) : 0;
      const clickRate = totalEmails > 0 ? (clickedEmails / totalEmails) : 0;
      
      probability += (openRate * 12) + (clickRate * 8);
    }

    // 4. Activity Level Factor (0-10 points)
    if (activities && activities.length > 0) {
      const recentActivities = activities.filter(a => {
        const activityDate = new Date(a.created_at);
        const daysSince = (Date.now() - activityDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
      });
      probability += Math.min(10, recentActivities.length * 2);
    }

    // 5. Project/Quote History Factor (0-5 points)
    const hasProjects = (projects?.length || 0) > 0;
    const hasQuotes = (quotes?.length || 0) > 0;
    if (hasProjects) probability += 3;
    if (hasQuotes) probability += 2;

    // 6. Priority Level Modifier
    const priorityBonus: Record<string, number> = {
      'low': -5,
      'medium': 0,
      'high': 5,
      'urgent': 10
    };
    probability += priorityBonus[client.priority_level || 'medium'] || 0;

    // 7. Time-based decay
    if (client.last_contact_date) {
      const lastContact = new Date(client.last_contact_date);
      const daysSinceContact = (Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceContact > 30) probability -= 10;
      else if (daysSinceContact > 14) probability -= 5;
    }

    // Ensure probability is between 0-100
    return Math.max(0, Math.min(100, Math.round(probability)));
  }, [client, projects, quotes, emails, activities]);

  // Auto-update client's conversion probability if it differs significantly
  useEffect(() => {
    if (client && Math.abs(calculatedProbability - (client.conversion_probability || 0)) >= 5) {
      // Only update if difference is 5% or more to avoid excessive updates
      updateClient.mutate({
        id: client.id,
        conversion_probability: calculatedProbability
      }, {
        onSuccess: () => {
          console.log(`Updated conversion probability for ${client.name} to ${calculatedProbability}%`);
        }
      });
    }
  }, [calculatedProbability, client]);

  return {
    probability: calculatedProbability,
    factors: {
      leadScore: client?.lead_score || 0,
      stage: client?.funnel_stage || 'lead',
      emailEngagement: emails?.length || 0,
      activityLevel: activities?.length || 0,
      hasProjects: (projects?.length || 0) > 0,
      hasQuotes: (quotes?.length || 0) > 0
    }
  };
};
