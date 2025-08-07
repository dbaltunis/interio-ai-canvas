
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, FileText, User, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProjectTimelineProps {
  projectId: string;
}

interface TimelineEvent {
  id: string;
  type: 'created' | 'status_change' | 'document_upload' | 'team_assigned' | 'milestone';
  title: string;
  description: string;
  date: string;
  user?: string;
  icon: any;
  color: string;
}

export const ProjectTimeline = ({ projectId }: ProjectTimelineProps) => {
  // Mock timeline data - in real implementation, this would come from the database
  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      type: 'created',
      title: 'Project Created',
      description: 'Project was created and initialized',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'John Doe',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      id: '2',
      type: 'status_change',
      title: 'Status Updated',
      description: 'Project status changed from "planning" to "measuring"',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Jane Smith',
      icon: AlertCircle,
      color: 'bg-yellow-500'
    },
    {
      id: '3',
      type: 'document_upload',
      title: 'Documents Added',
      description: '3 measurement photos uploaded',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Mike Johnson',
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      id: '4',
      type: 'team_assigned',
      title: 'Team Member Assigned',
      description: 'Sarah Wilson assigned as project lead',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Admin',
      icon: User,
      color: 'bg-primary'
    },
    {
      id: '5',
      type: 'milestone',
      title: 'Measurement Complete',
      description: 'All room measurements have been completed and verified',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Sarah Wilson',
      icon: CheckCircle,
      color: 'bg-green-600'
    }
  ];

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'created': return 'Project';
      case 'status_change': return 'Status';
      case 'document_upload': return 'Documents';
      case 'team_assigned': return 'Team';
      case 'milestone': return 'Milestone';
      default: return 'Event';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Project Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {timelineEvents.map((event, index) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="flex items-start space-x-4">
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${event.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {index < timelineEvents.length - 1 && (
                    <div className="mt-2 h-8 w-px bg-gray-300" />
                  )}
                </div>

                {/* Event content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getEventTypeLabel(event.type)}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                  
                  {event.user && (
                    <p className="mt-1 text-xs text-gray-400">by {event.user}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
