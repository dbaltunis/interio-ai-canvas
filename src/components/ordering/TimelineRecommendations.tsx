import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface Milestone {
  id: string;
  milestone_name: string;
  target_date: string;
  completed_at: string | null;
}

interface TimelineRecommendationsProps {
  milestones: Milestone[];
  riskFactors?: string[];
  recommendations?: string[];
  onSetReminder?: (milestone: Milestone) => void;
  onMarkComplete?: (milestoneId: string) => void;
}

export const TimelineRecommendations = ({
  milestones,
  riskFactors = [],
  recommendations = [],
  onSetReminder,
  onMarkComplete
}: TimelineRecommendationsProps) => {
  // Find upcoming milestones (not completed, within next 7 days)
  const upcomingMilestones = milestones.filter(m => {
    if (m.completed_at) return false;
    const targetDate = new Date(m.target_date);
    const today = new Date();
    const daysUntil = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 7;
  });

  // Find overdue milestones
  const overdueMilestones = milestones.filter(m => {
    if (m.completed_at) return false;
    return new Date(m.target_date) < new Date();
  });

  const getUrgencyIcon = (daysUntil: number) => {
    if (daysUntil < 0) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (daysUntil <= 2) return <Bell className="h-4 w-4 text-orange-500" />;
    return <Clock className="h-4 w-4 text-blue-500" />;
  };

  const getDaysUntilText = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const daysUntil = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    return `In ${daysUntil} days`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Action Items & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overdue Milestones */}
        {overdueMilestones.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-600 dark:text-red-400">Overdue Tasks</h4>
            {overdueMilestones.map(milestone => (
              <div 
                key={milestone.id} 
                className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
              >
                {getUrgencyIcon(-1)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{milestone.milestone_name}</p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {getDaysUntilText(milestone.target_date)}
                  </p>
                </div>
                {onMarkComplete && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onMarkComplete(milestone.id)}
                    className="shrink-0"
                  >
                    Complete
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Milestones */}
        {upcomingMilestones.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Upcoming Tasks</h4>
            {upcomingMilestones.map(milestone => {
              const daysUntil = Math.ceil((new Date(milestone.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div 
                  key={milestone.id} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border"
                >
                  {getUrgencyIcon(daysUntil)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{milestone.milestone_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getDaysUntilText(milestone.target_date)} • {format(new Date(milestone.target_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {onSetReminder && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onSetReminder(milestone)}
                      className="shrink-0"
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Risk Factors */}
        {riskFactors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Risk Factors
            </h4>
            <div className="space-y-2">
              {riskFactors.map((risk, index) => (
                <div key={index} className="flex items-start gap-2 text-sm p-2 rounded bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                  <span className="text-orange-600 dark:text-orange-400">•</span>
                  <p className="text-orange-900 dark:text-orange-200">{risk}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Recommendations
            </h4>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 text-sm p-2 rounded bg-primary/5 border border-primary/20">
                  <span className="text-primary">✓</span>
                  <p>{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No urgent actions */}
        {overdueMilestones.length === 0 && upcomingMilestones.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No urgent actions at this time</p>
            <p className="text-xs">All milestones are on track</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function CheckCircle(props: { className: string }) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}