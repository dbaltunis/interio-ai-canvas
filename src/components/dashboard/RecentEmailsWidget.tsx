import { useEmails, useEmailKPIs } from "@/hooks/useEmails";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const RecentEmailsWidget = () => {
  const { data: emails, isLoading } = useEmails();
  const { data: emailKPIs } = useEmailKPIs();

  const recentEmails = emails?.slice(0, 5) || [];

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "bounced":
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "sent":
        return <Send className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "delivered":
        return "default";
      case "bounced":
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Recent Emails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Recent Emails
          </CardTitle>
          {emailKPIs && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{emailKPIs.openRate.toFixed(1)}% open rate</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentEmails.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No emails sent yet</p>
          </div>
        ) : (
          recentEmails.map((email) => (
            <div
              key={email.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="mt-1">
                {getStatusIcon(email.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-foreground truncate">
                    {email.subject || "No subject"}
                  </h4>
                  <Badge variant={getStatusVariant(email.status)} className="text-xs shrink-0">
                    {email.status || "pending"}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  To: {email.recipient_email}
                </p>
                
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>
                    {email.created_at ? formatDistanceToNow(new Date(email.created_at), { addSuffix: true }) : ""}
                  </span>
                  {email.open_count > 0 && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      Opened ({email.open_count})
                    </span>
                  )}
                  {email.click_count > 0 && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-blue-600" />
                      Clicked ({email.click_count})
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
