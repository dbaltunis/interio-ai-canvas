import { useEmails, useEmailKPIs } from "@/hooks/useEmails";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { PixelMessageIcon } from "@/components/icons/PixelArtIcons";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export const RecentEmailsWidget = () => {
  const navigate = useNavigate();
  const { data: emails, isLoading } = useEmails();
  const { data: emailKPIs } = useEmailKPIs();

  const recentEmails = emails?.slice(0, 10) || [];

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />;
      case "bounced":
      case "failed":
        return <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />;
      case "sent":
        return <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />;
      default:
        return <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />;
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
      <Card variant="analytics">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Mail className="h-4 w-4" />
            Recent Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="analytics" className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Mail className="h-4 w-4" />
            Recent Messages
          </CardTitle>
          {emailKPIs && (
            <span className="text-xs text-muted-foreground">
              {emailKPIs.openRate.toFixed(0)}% open
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {recentEmails.length === 0 ? (
        <div className="text-center py-8">
            <div className="flex justify-center mb-3">
              <PixelMessageIcon size={48} />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Start conversations</p>
            <p className="text-xs text-muted-foreground">No emails sent yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-3">
            <div className="space-y-1.5">
              {recentEmails.map((email) => (
            <div
              key={email.id}
              className="flex items-center gap-2 p-2 rounded-md bg-background border border-border/50 hover:bg-muted/50 transition-all cursor-pointer"
              onClick={() => navigate('/?tab=quotes')}
            >
              <div className="shrink-0 p-1.5 rounded-md bg-muted/50">
                {getStatusIcon(email.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-xs text-foreground line-clamp-1 flex-1">
                    {email.subject || "No subject"}
                  </h4>
                  <Badge 
                    variant={getStatusVariant(email.status)} 
                    className="text-[10px] shrink-0 h-4 px-1.5 font-medium"
                  >
                    {email.status || "pending"}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                  <span className="truncate">{email.recipient_email}</span>
                  <span>•</span>
                  <span className="shrink-0">
                    {email.created_at ? formatDistanceToNow(new Date(email.created_at), { addSuffix: true }) : ""}
                  </span>
                  {email.open_count > 0 && (
                    <span className="flex items-center gap-1 shrink-0 text-green-600 font-medium">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {email.open_count}x
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
