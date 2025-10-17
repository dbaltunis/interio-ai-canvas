import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  useFollowUpReminders, 
  useMarkReminderCompleted, 
  useCompletedReminders,
  useSnoozeReminder,
  useDeleteReminder
} from "@/hooks/useMarketing";
import { formatDistanceToNow, format } from "date-fns";
import { CheckCircle2, Clock, User, Target, Calendar, MoreVertical, Trash2, Bell } from "lucide-react";
import { useState } from "react";

export const FollowUpReminders = () => {
  const { data: reminders, isLoading } = useFollowUpReminders();
  const { data: completedReminders, isLoading: completedLoading } = useCompletedReminders();
  const markCompleted = useMarkReminderCompleted();
  const snoozeReminder = useSnoozeReminder();
  const deleteReminder = useDeleteReminder();
  const [activeTab, setActiveTab] = useState("pending");

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

  const overdueReminders = (reminders as any[])?.filter((r: any) => new Date(r.scheduled_for) < new Date()) || [];
  const upcomingReminders = (reminders as any[])?.filter((r: any) => new Date(r.scheduled_for) >= new Date()) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Follow-up Reminders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="pending">
              Pending ({reminders?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedReminders?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-0">
            {overdueReminders.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-2">Overdue ({overdueReminders.length})</h4>
                <div className="space-y-3">
                  {overdueReminders.map((reminder: any) => (
                    <ReminderCard 
                      key={reminder.id} 
                      reminder={reminder} 
                      markCompleted={markCompleted}
                      snoozeReminder={snoozeReminder}
                      deleteReminder={deleteReminder}
                      isOverdue 
                    />
                  ))}
                </div>
              </div>
            )}

            {upcomingReminders.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-blue-600 mb-2">Upcoming ({upcomingReminders.length})</h4>
                <div className="space-y-3">
                  {upcomingReminders.slice(0, 5).map((reminder: any) => (
                    <ReminderCard 
                      key={reminder.id} 
                      reminder={reminder} 
                      markCompleted={markCompleted}
                      snoozeReminder={snoozeReminder}
                      deleteReminder={deleteReminder}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            {completedLoading ? (
              <div className="text-center text-muted-foreground py-4">Loading completed tasks...</div>
            ) : !completedReminders?.length ? (
              <div className="text-center text-muted-foreground py-4">
                No completed reminders yet
              </div>
            ) : (
              <div className="space-y-3">
                {completedReminders.map((reminder: any) => (
                  <CompletedReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface ReminderCardProps {
  reminder: any;
  markCompleted: any;
  snoozeReminder: any;
  deleteReminder: any;
  isOverdue?: boolean;
}

const ReminderCard = ({ reminder, markCompleted, snoozeReminder, deleteReminder, isOverdue }: ReminderCardProps) => {
  const scheduledDate = new Date(reminder.scheduled_for);
  const client = reminder.clients;
  const deal = reminder.deals;

  const handleMarkCompleted = () => {
    markCompleted.mutate(reminder.id);
  };

  const handleSnooze = (days: number) => {
    snoozeReminder.mutate({ reminderId: reminder.id, days });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      deleteReminder.mutate(reminder.id);
    }
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
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkCompleted}
            disabled={markCompleted.isPending}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Done
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSnooze(1)}>
                <Bell className="h-4 w-4 mr-2" />
                Snooze 1 day
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSnooze(3)}>
                <Bell className="h-4 w-4 mr-2" />
                Snooze 3 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSnooze(7)}>
                <Bell className="h-4 w-4 mr-2" />
                Snooze 1 week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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

const CompletedReminderCard = ({ reminder }: { reminder: any }) => {
  const updatedDate = new Date(reminder.updated_at);
  const client = reminder.clients;

  return (
    <div className="p-3 border rounded-lg bg-muted/50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-medium text-sm line-through text-muted-foreground">{reminder.message}</div>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {client?.client_type === 'B2B' ? client?.company_name : client?.name}
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <Badge variant="outline" className="text-xs">
          {reminder.reminder_type.replace('_', ' ')}
        </Badge>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Completed {formatDistanceToNow(updatedDate, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};