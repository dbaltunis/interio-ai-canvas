import { useEmails, useEmailKPIs } from "@/hooks/useEmails";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export const RecentEmailsWidget = () => {
  const navigate = useNavigate();
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
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
            Recent Emails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 sm:h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Mail className="h-4 w-4" />
            Recent Emails
          </CardTitle>
          {emailKPIs && (
            <span className="text-xs text-muted-foreground">
              {emailKPIs.openRate.toFixed(0)}% open
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {recentEmails.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Mail className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-xs">No emails sent yet</p>
          </div>
        ) : (
          recentEmails.map((email) => (
            <div
              key={email.id}
              className="flex items-start gap-2.5 p-3 rounded-lg bg-background border border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
              onClick={() => navigate('/?tab=quotes')}
            >
              <div className="mt-0.5 shrink-0 p-1.5 rounded-md bg-muted/50">
                {getStatusIcon(email.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-foreground truncate">
                    {email.subject || "No subject"}
                  </h4>
                  <Badge 
                    variant={getStatusVariant(email.status)} 
                    className="text-xs shrink-0 h-5 px-2 font-medium"
                  >
                    {email.status || "pending"}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground truncate mb-1">
                  To: {email.recipient_email}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">
                    {email.created_at ? formatDistanceToNow(new Date(email.created_at), { addSuffix: true }) : ""}
                  </span>
                  {email.open_count > 0 && (
                    <span className="flex items-center gap-1 shrink-0 text-green-600 font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      Opened {email.open_count}x
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
