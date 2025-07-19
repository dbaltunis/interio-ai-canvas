
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Calendar, FileText, Phone, MessageSquare, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useClientEmails } from "@/hooks/useClientEmails";
import { useQuotes } from "@/hooks/useQuotes";
import { useProjects } from "@/hooks/useProjects";
import { formatDistanceToNow } from "date-fns";

interface ClientActivityTimelineProps {
  clientId: string;
}

interface TimelineActivity {
  id: string;
  type: 'email' | 'quote' | 'project' | 'reminder';
  title: string;
  description: string;
  date: string;
  status?: string;
  icon: any;
  priority?: 'low' | 'medium' | 'high';
}

export const ClientActivityTimeline = ({ clientId }: ClientActivityTimelineProps) => {
  const { data: emails } = useClientEmails(clientId);
  const { data: quotes } = useQuotes();
  const { data: projects } = useProjects();

  // Combine all activities into a timeline
  const activities: TimelineActivity[] = [
    // Email activities
    ...(emails || []).map(email => ({
      id: email.id,
      type: 'email' as const,
      title: email.subject,
      description: `Email ${email.status} - ${email.open_count || 0} opens, ${email.click_count || 0} clicks`,
      date: email.created_at,
      status: email.status,
      icon: Mail,
      priority: ((email.open_count || 0) > 0 ? 'medium' : 'low') as 'medium' | 'low'
    })),
    
    // Quote activities
    ...(quotes?.filter(q => q.client_id === clientId) || []).map(quote => ({
      id: quote.id,
      type: 'quote' as const,
      title: `Quote ${quote.quote_number}`,
      description: `${quote.status} - ${quote.total_amount?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
      date: quote.created_at,
      status: quote.status,
      icon: FileText,
      priority: (quote.status === 'pending' ? 'high' : 'medium') as 'high' | 'medium'
    })),
    
    // Project activities
    ...(projects?.filter(p => p.client_id === clientId) || []).map(project => ({
      id: project.id,
      type: 'project' as const,
      title: project.name,
      description: `Project ${project.status}`,
      date: project.created_at,
      status: project.status,
      icon: Calendar,
      priority: (project.status === 'in_progress' ? 'high' : 'medium') as 'high' | 'medium'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sent':
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'opened':
      case 'clicked':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'bounced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'medium':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      default:
        return <CheckCircle className="h-3 w-3 text-green-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No activity recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 20).map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(activity.priority)}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      {activity.status && (
                        <Badge className={`${getStatusColor(activity.status)} text-xs border-0`} variant="secondary">
                          {activity.status}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {activities.length > 20 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  Load More Activities
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
