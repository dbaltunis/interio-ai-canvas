import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFollowUpReminders, useMarkReminderCompleted } from "@/hooks/useMarketing";
import { formatDistanceToNow, format } from "date-fns";
import { CheckCircle2, Clock, User, Target, Calendar } from "lucide-react";

export const FollowUpReminders = () => {
  const { data: reminders, isLoading } = useFollowUpReminders();
  const markCompleted = useMarkReminderCompleted();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Follow-up Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading reminders...</div>
        </CardContent>
      </Card>
    );
  }

  if (!reminders?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Follow-up Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No pending reminders. Great job staying on top of follow-ups!
          </div>
        </CardContent>
      </Card>
    );
  }

  const overdueReminders = reminders.filter(r => new Date(r.scheduled_for) < new Date());
  const upcomingReminders = reminders.filter(r => new Date(r.scheduled_for) >= new Date());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Follow-up Reminders ({reminders.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {overdueReminders.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-600 mb-2">Overdue ({overdueReminders.length})</h4>
            <div className="space-y-3">
              {overdueReminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} markCompleted={markCompleted} isOverdue />
              ))}
            </div>
          </div>
        )}

        {upcomingReminders.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-blue-600 mb-2">Upcoming ({upcomingReminders.length})</h4>
            <div className="space-y-3">
              {upcomingReminders.slice(0, 5).map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} markCompleted={markCompleted} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ReminderCardProps {
  reminder: any;
  markCompleted: any;
  isOverdue?: boolean;
}

const ReminderCard = ({ reminder, markCompleted, isOverdue }: ReminderCardProps) => {
  const scheduledDate = new Date(reminder.scheduled_for);
  const client = reminder.clients;
  const deal = reminder.deals;

  const handleMarkCompleted = () => {
    markCompleted.mutate(reminder.id);
  };

  return (
    <div className={`p-3 border rounded-lg ${isOverdue ? 'border-red-200 bg-red-50' : 'border-border'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-medium text-sm">{reminder.message}</div>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {client?.client_type === 'B2B' ? client?.company_name : client?.name}
            </div>
            {deal && (
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {deal.title}
              </div>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleMarkCompleted}
          disabled={markCompleted.isPending}
          className="shrink-0"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Done
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <Badge variant={isOverdue ? "destructive" : "secondary"} className="text-xs">
          {reminder.reminder_type.replace('_', ' ')}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {isOverdue ? (
            <span className="text-red-600">
              {formatDistanceToNow(scheduledDate, { addSuffix: true })}
            </span>
          ) : (
            format(scheduledDate, 'MMM d, h:mm a')
          )}
        </div>
      </div>
    </div>
  );
};