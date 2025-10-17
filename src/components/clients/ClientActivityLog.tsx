import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Phone, Mail, MessageSquare, CheckCircle, Calendar, 
  FileText, Briefcase, StickyNote, Clock, TrendingUp 
} from "lucide-react";
import { useClientActivities, ActivityType } from "@/hooks/useClientActivity";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { AddActivityDialog } from "./AddActivityDialog";

interface ClientActivityLogProps {
  clientId: string;
}

const activityIcons: Record<ActivityType, any> = {
  follow_up_completed: CheckCircle,
  email_sent: Mail,
  call_made: Phone,
  meeting_held: Calendar,
  quote_created: FileText,
  project_started: Briefcase,
  note_added: StickyNote,
  reminder_snoozed: Clock,
  stage_changed: TrendingUp,
  task_completed: CheckCircle,
};

const activityColors: Record<ActivityType, string> = {
  follow_up_completed: "bg-green-100 text-green-700 border-green-300",
  email_sent: "bg-blue-100 text-blue-700 border-blue-300",
  call_made: "bg-purple-100 text-purple-700 border-purple-300",
  meeting_held: "bg-orange-100 text-orange-700 border-orange-300",
  quote_created: "bg-cyan-100 text-cyan-700 border-cyan-300",
  project_started: "bg-indigo-100 text-indigo-700 border-indigo-300",
  note_added: "bg-yellow-100 text-yellow-700 border-yellow-300",
  reminder_snoozed: "bg-gray-100 text-gray-700 border-gray-300",
  stage_changed: "bg-pink-100 text-pink-700 border-pink-300",
  task_completed: "bg-green-100 text-green-700 border-green-300",
};

export const ClientActivityLog = ({ clientId }: ClientActivityLogProps) => {
  const { data: activities, isLoading } = useClientActivities(clientId);
  const [showAddDialog, setShowAddDialog] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <StickyNote className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </CardHeader>
        <CardContent>
          {!activities || activities.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No activities recorded yet</p>
              <Button onClick={() => setShowAddDialog(true)} variant="outline">
                <StickyNote className="h-4 w-4 mr-2" />
                Add First Note
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = activityIcons[activity.activity_type] || MessageSquare;
                const colorClass = activityColors[activity.activity_type] || "bg-gray-100 text-gray-700";

                return (
                  <div key={activity.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{activity.title}</h4>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                          )}
                          {activity.team_member && (
                            <p className="text-xs text-muted-foreground mt-1">
                              By: {activity.team_member}
                            </p>
                          )}
                          {activity.value_amount !== null && activity.value_amount !== undefined && (
                            <p className="text-sm font-medium text-green-600 mt-1">
                              ${activity.value_amount.toLocaleString()}
                            </p>
                          )}
                          {activity.follow_up_date && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              Follow-up: {new Date(activity.follow_up_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddActivityDialog
        clientId={clientId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </>
  );
};
