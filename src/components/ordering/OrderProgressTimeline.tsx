import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle, Edit2 } from "lucide-react";
import { format } from "date-fns";

interface Milestone {
  id: string;
  milestone_name: string;
  target_date: string;
  completed_at: string | null;
  sort_order: number;
}

interface OrderProgressTimelineProps {
  order: {
    id: string;
    batch_number: string;
    expected_completion_days: number | null;
    ai_predicted_days: number | null;
    ai_confidence: 'low' | 'medium' | 'high' | null;
    progress_start_date: string | null;
    estimated_completion_date: string | null;
    locked_at: string | null;
  };
  milestones: Milestone[];
  onEditTimeline?: () => void;
}

export const OrderProgressTimeline = ({ order, milestones, onEditTimeline }: OrderProgressTimelineProps) => {
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!order.progress_start_date || !order.expected_completion_days) return 0;
    
    const startDate = new Date(order.progress_start_date);
    const today = new Date();
    const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const percentage = Math.min((daysElapsed / order.expected_completion_days) * 100, 95);
    return Math.max(0, percentage);
  };

  const progress = calculateProgress();

  const getConfidenceBadge = () => {
    if (!order.ai_confidence) return null;
    
    const colorMap = {
      'low': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      'medium': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      'high': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
    };

    return (
      <Badge className={colorMap[order.ai_confidence]}>
        AI Confidence: {order.ai_confidence.charAt(0).toUpperCase() + order.ai_confidence.slice(1)}
      </Badge>
    );
  };

  const sortedMilestones = [...milestones].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Order Progress Timeline</CardTitle>
            <CardDescription>
              Order {order.batch_number} • {order.expected_completion_days} days estimated
            </CardDescription>
          </div>
          {getConfidenceBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          {order.estimated_completion_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Est. completion: {format(new Date(order.estimated_completion_date), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* AI Prediction Info */}
        {order.ai_predicted_days && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 text-primary" />
            <span>AI predicted {order.ai_predicted_days} days based on supplier history</span>
          </div>
        )}

        {/* Milestones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Milestones</h4>
            {onEditTimeline && (
              <Button variant="ghost" size="sm" onClick={onEditTimeline}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit Timeline
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            {sortedMilestones.map((milestone, index) => {
              const isCompleted = !!milestone.completed_at;
              const isPast = new Date(milestone.target_date) < new Date();
              const isOverdue = isPast && !isCompleted;

              return (
                <div key={milestone.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full border-2
                      ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                        isOverdue ? 'bg-red-100 border-red-500 text-red-500 dark:bg-red-900/30' :
                        'bg-background border-muted-foreground text-muted-foreground'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-xs font-semibold">{index + 1}</span>
                      )}
                    </div>
                    {index < sortedMilestones.length - 1 && (
                      <div className={`w-0.5 h-8 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">{milestone.milestone_name}</h5>
                      {isCompleted && (
                        <Badge variant="secondary" className="text-xs">
                          Completed {format(new Date(milestone.completed_at!), 'MMM d')}
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                      Target: {format(new Date(milestone.target_date), 'MMM d, yyyy')}
                      {isOverdue && ' (Overdue)'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};