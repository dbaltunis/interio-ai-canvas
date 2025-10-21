import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, Send, Eye, MousePointer, AlertCircle, CheckCircle, 
  Clock, TrendingUp, Calendar, MessageSquare, RefreshCw, ArrowLeft
} from "lucide-react";
import { useClientEmails } from "@/hooks/useClientEmails";
import { formatDistanceToNow } from "date-fns";
import { useState, useRef, useEffect } from "react";
import { EmailComposer } from "../jobs/email/EmailComposer";

interface EnhancedClientEmailHistoryProps {
  clientId: string;
  clientEmail?: string;
  onComposeEmail?: () => void;
}

export const EnhancedClientEmailHistory = ({ 
  clientId, 
  clientEmail, 
  onComposeEmail 
}: EnhancedClientEmailHistoryProps) => {
  const { data: emails, isLoading } = useClientEmails(clientId);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [showComposer, setShowComposer] = useState(false);
  const emailSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Store ref in window for external scrolling
    if (emailSectionRef.current) {
      (window as any).scrollToEmailSection = () => {
        emailSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    }
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  const totalSent = emails?.length || 0;
  const totalOpened = emails?.filter(e => e.open_count > 0).length || 0;
  const totalClicked = emails?.filter(e => e.click_count > 0).length || 0;
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;

  // Email engagement tracking
  const needsFollowUp = emails?.filter(e => {
    const sentDate = new Date(e.sent_at || e.created_at);
    const daysSinceSent = Math.floor((Date.now() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceSent >= 3 && e.open_count === 0;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'opened':
        return 'bg-green-50 text-green-700 border-green-300';
      case 'clicked':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      case 'bounced':
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-300';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return Send;
      case 'opened':
        return Eye;
      case 'clicked':
        return MousePointer;
      case 'bounced':
      case 'failed':
        return AlertCircle;
      default:
        return Mail;
    }
  };

  const handleComposeClick = () => {
    setShowComposer(true);
    if (onComposeEmail) {
      onComposeEmail();
    }
  };

  const handleCloseComposer = () => {
    setShowComposer(false);
  };

  // If showing composer, render only that
  if (showComposer) {
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCloseComposer}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Email History
        </Button>
        <EmailComposer
          clientId={clientId}
          onClose={handleCloseComposer}
        />
      </div>
    );
  }

  return (
    <div ref={emailSectionRef} className="space-y-6" id="email-section">
      {/* Email Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{totalSent}</p>
              </div>
              <Send className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold">{openRate}%</p>
                <p className="text-xs text-muted-foreground">{totalOpened} opened</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold">{clickRate}%</p>
                <p className="text-xs text-muted-foreground">{totalClicked} clicked</p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Needs Follow-up</p>
                <p className="text-2xl font-bold">{needsFollowUp.length}</p>
                <p className="text-xs text-muted-foreground">No response</p>
              </div>
              <RefreshCw className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Follow-up Alerts */}
      {needsFollowUp.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-orange-900">Follow-up Recommended</h4>
                <p className="text-sm text-orange-800 mt-1">
                  {needsFollowUp.length} email{needsFollowUp.length > 1 ? 's have' : ' has'} not been opened 
                  in 3+ days. Consider a follow-up message or phone call.
                </p>
                {onComposeEmail && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2 border-orange-300 hover:bg-orange-100"
                    onClick={handleComposeClick}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Follow-up
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Email History</CardTitle>
          {clientEmail && onComposeEmail && (
            <Button onClick={handleComposeClick} size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Compose Email
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!emails || emails.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No emails sent yet</p>
              {clientEmail && onComposeEmail && (
                <Button onClick={handleComposeClick} variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send First Email
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {emails.map((email) => {
                const StatusIcon = getStatusIcon(email.status);
                const statusColor = getStatusColor(email.status);

                return (
                  <div
                    key={email.id}
                    className="group flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/5 transition-all cursor-pointer"
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className={`p-2 rounded-full ${statusColor}`}>
                      <StatusIcon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{email.subject}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(email.sent_at || email.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="outline" className={statusColor}>
                          {email.status}
                        </Badge>
                      </div>

                      {/* Email Engagement Metrics */}
                      <div className="flex items-center gap-4 text-xs">
                        {email.open_count > 0 && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Eye className="h-3 w-3" />
                            Opened {email.open_count}x
                          </span>
                        )}
                        {email.click_count > 0 && (
                          <span className="flex items-center gap-1 text-purple-600">
                            <MousePointer className="h-3 w-3" />
                            Clicked {email.click_count}x
                          </span>
                        )}
                        {email.open_count === 0 && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Not opened yet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Engagement Tips */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Email Engagement Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <p><strong>Best time to follow up:</strong> 2-3 business days after no response</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <p><strong>Personalize:</strong> Reference previous conversations or specific needs</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <p><strong>Multi-channel:</strong> Combine email with phone calls for better engagement</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <p><strong>Track opens:</strong> Use open rates to determine interest level</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
