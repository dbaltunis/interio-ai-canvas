
import { useState } from "react";
import { useEmails } from "@/hooks/useEmails";
import { useProjects } from "@/hooks/useProjects";
import { EmailActionButtons } from "../email-components/EmailActionButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, Eye, MousePointer } from "lucide-react";

interface ProjectEmailHistoryProps {
  projectId: string;
}

export const ProjectEmailHistory = ({ projectId }: ProjectEmailHistoryProps) => {
  const { data: emails = [], isLoading } = useEmails();
  const { data: projects } = useProjects();
  
  const project = projects?.find(p => p.id === projectId);
  const projectEmails = emails.filter(email => email.project_id === projectId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-brand-secondary/20 text-brand-primary";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "opened":
        return "bg-blue-100 text-blue-800";
      case "clicked":
        return "bg-purple-100 text-purple-800";
      case "bounced":
        return "bg-red-100 text-red-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-brand-secondary/20 text-brand-neutral";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-brand-secondary/10 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-brand-secondary/20 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-brand-secondary/20 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (projectEmails.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-secondary/20 to-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-brand-primary" />
        </div>
        <h3 className="text-lg font-medium text-brand-primary mb-2">No emails yet</h3>
        <p className="text-brand-neutral max-w-md mx-auto">
          Start communicating with your client by sending the first email for this project.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projectEmails.map((email) => (
        <Card key={email.id} className="bg-brand-light border-brand-secondary/20 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg text-brand-primary mb-1">
                  {email.subject}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-brand-neutral">
                  <span>To: {email.recipient_email}</span>
                  <span>•</span>
                  <Badge className={getStatusColor(email.status)}>
                    {email.status}
                  </Badge>
                </div>
              </div>
              <div className="text-right text-sm text-brand-neutral">
                <p className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(email.sent_at)}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-brand-neutral">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{email.open_count} opens</span>
                </div>
                <div className="flex items-center gap-1">
                  <MousePointer className="h-3 w-3" />
                  <span>{email.click_count} clicks</span>
                </div>
                {email.delivered_at && (
                  <span className="text-green-600">
                    Delivered {formatDate(email.delivered_at)}
                  </span>
                )}
              </div>
              
              <EmailActionButtons
                email={email}
                projectId={projectId}
                projectName={project?.name || "Unknown Project"}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
