
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Mail, Calendar, FileText, User, Building } from "lucide-react";
import { useClientEmails } from "@/hooks/useClientEmails";
import { useClientJobs } from "@/hooks/useClientJobs";

interface ClientActivityTimelineProps {
  clientId: string;
}

export const ClientActivityTimeline = ({ clientId }: ClientActivityTimelineProps) => {
  const { data: emails } = useClientEmails(clientId);
  const { data: projects } = useClientJobs(clientId);

  // Combine and sort activities
  const activities = [
    ...(emails?.map(email => ({
      id: email.id,
      type: 'email',
      title: email.subject,
      description: `Email ${email.status}`,
      date: email.created_at,
      icon: Mail
    })) || []),
    ...(projects?.map(project => ({
      id: project.id,
      type: 'project',
      title: project.name,
      description: `Project ${project.status}`,
      date: project.created_at,
      icon: FileText
    })) || [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'project':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No activity recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 10).map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                      <IconComponent className="h-4 w-4 text-brand-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <Badge className={`${getActivityColor(activity.type)} border text-xs`} variant="secondary">
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
