import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PixelCalendarIcon } from "@/components/icons/PixelArtIcons";
import { Badge } from "@/components/ui/badge";
import { Clock, Mail, Calendar, FileText, User, Building, MessageSquare } from "lucide-react";
import { useClientEmails } from "@/hooks/useClientEmails";
import { useClientJobs } from "@/hooks/useClientJobs";
import { useClientWhatsAppMessages } from "@/hooks/useClientWhatsAppMessages";

interface ClientActivityTimelineProps {
  clientId: string;
}

export const ClientActivityTimeline = ({ clientId }: ClientActivityTimelineProps) => {
  const { data: emails } = useClientEmails(clientId);
  const { data: projects } = useClientJobs(clientId);
  const { data: whatsappMessages } = useClientWhatsAppMessages(clientId);

  // Combine and sort activities
  const activities = [
    ...(emails?.map(email => ({
      id: email.id,
      type: 'email',
      title: email.subject,
      description: `Email ${email.status}${email.open_count > 0 ? ` • Opened ${email.open_count} time(s)` : ''}${email.click_count > 0 ? ` • Clicked ${email.click_count} time(s)` : ''}`,
      date: email.created_at,
      icon: Mail,
      recipient: email.recipient_email
    })) || []),
    ...(projects?.map(project => ({
      id: project.id,
      type: 'project',
      title: project.name,
      description: `Project ${project.status}`,
      date: project.created_at,
      icon: FileText
    })) || []),
    ...(whatsappMessages?.map(msg => ({
      id: msg.id,
      type: 'whatsapp',
      title: 'WhatsApp Message',
      description: msg.message_body?.substring(0, 80) + (msg.message_body?.length > 80 ? '...' : '') || 'Message sent',
      date: msg.created_at,
      icon: MessageSquare,
      recipient: msg.to_number,
      status: msg.status
    })) || [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'project':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'whatsapp':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card variant="analytics">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Activity Timeline
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {activities.length === 0 ? (
          <div className="empty-state">
            <PixelCalendarIcon className="mx-auto mb-3" size={48} />
            <p className="empty-state-title">No activity recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 10).map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={`${activity.type}-${activity.id}`} className="group relative flex items-start space-x-4 p-4 rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-border hover:bg-card hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-200">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                        {activity.title}
                      </h4>
                      <Badge className={`${getActivityColor(activity.type)} border text-xs shrink-0`} variant="secondary">
                        {activity.type}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {activity.description}
                      </p>
                      {activity.type === 'email' && (activity as any).recipient && (
                        <p className="text-xs text-muted-foreground/80 font-medium">
                          → {(activity as any).recipient}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground/70">
                      <span>{new Date(activity.date).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
