import { Card, CardContent } from "@/components/ui/card";
import { Mail, Eye, MousePointer, AlertTriangle, CheckCircle } from "lucide-react";
import { useEmails } from "@/hooks/useEmails";

export const EmailAnalytics = () => {
  const { data: emails = [] } = useEmails();

  const totalEmails = emails.length;
  const deliveredEmails = emails.filter(e => ['delivered', 'opened', 'clicked'].includes(e.status)).length;
  const bouncedEmails = emails.filter(e => ['bounced', 'failed'].includes(e.status)).length;
  const openedEmails = emails.filter(e => (e.open_count || 0) > 0).length;
  const clickedEmails = emails.filter(e => (e.click_count || 0) > 0).length;

  const deliveryRate = totalEmails > 0 ? Math.round((deliveredEmails / totalEmails) * 100) : 0;
  const bounceRate = totalEmails > 0 ? Math.round((bouncedEmails / totalEmails) * 100) : 0;
  const openRate = deliveredEmails > 0 ? Math.round((openedEmails / deliveredEmails) * 100) : 0;
  const clickRate = deliveredEmails > 0 ? Math.round((clickedEmails / deliveredEmails) * 100) : 0;

  if (totalEmails === 0) {
    return (
      <Card className="bg-muted/20">
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No messages sent yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/20">
      <CardContent className="py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Sent</span>
            </div>
            <div className="text-xl font-semibold">{totalEmails}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <CheckCircle className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs text-muted-foreground">Delivered</span>
            </div>
            <div className="text-xl font-semibold text-accent">{deliveryRate}%</div>
            <div className="text-xs text-muted-foreground">{deliveredEmails}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Eye className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Opened</span>
            </div>
            <div className="text-xl font-semibold text-primary">{openRate}%</div>
            <div className="text-xs text-muted-foreground">{openedEmails}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <MousePointer className="h-3.5 w-3.5 text-secondary" />
              <span className="text-xs text-muted-foreground">Clicked</span>
            </div>
            <div className="text-xl font-semibold text-secondary">{clickRate}%</div>
            <div className="text-xs text-muted-foreground">{clickedEmails}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              <span className="text-xs text-muted-foreground">Bounced</span>
            </div>
            <div className="text-xl font-semibold text-destructive">{bounceRate}%</div>
            <div className="text-xs text-muted-foreground">{bouncedEmails}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
