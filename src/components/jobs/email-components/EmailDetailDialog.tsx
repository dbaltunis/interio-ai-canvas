
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  Eye, 
  MousePointer, 
  Clock, 
  RefreshCw, 
  MessageSquare,
  Calendar,
  User,
  AlertCircle,
  Copy,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSendEmail } from "@/hooks/useSendEmail";

interface Email {
  id: string;
  subject: string;
  content: string;
  recipient_email: string;
  recipient_name?: string;
  status: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  open_count: number;
  click_count: number;
  time_spent_seconds: number;
  bounce_reason?: string;
}

interface EmailDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: Email | null;
  onFollowUp?: (emailId: string, note: string) => void;
}

export const EmailDetailDialog = ({ open, onOpenChange, email, onFollowUp }: EmailDetailDialogProps) => {
  const [followUpNote, setFollowUpNote] = useState("");
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();
  const sendEmailMutation = useSendEmail();

  if (!email) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'opened': return 'bg-blue-100 text-blue-800';
      case 'clicked': return 'bg-purple-100 text-purple-800';
      case 'bounced': case 'failed': return 'bg-red-100 text-red-800';
      case 'sent': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canResend = ['bounced', 'failed'].includes(email.status);

  const handleResend = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      await sendEmailMutation.mutateAsync({
        to: email.recipient_email,
        subject: email.subject,
        content: email.content
      });
      
      toast({
        title: "Email Resent Successfully",
        description: `Email has been resent to ${email.recipient_email}`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to resend email:", error);
      toast({
        title: "Resend Failed",
        description: "Failed to resend email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleFollowUp = () => {
    if (onFollowUp && followUpNote.trim()) {
      onFollowUp(email.id, followUpNote);
      setFollowUpNote("");
      setShowFollowUp(false);
      toast({
        title: "Follow-up Recorded",
        description: "Your follow-up note has been saved successfully."
      });
    }
  };

  const handleCopyContent = () => {
    // Remove HTML tags for copying
    const textContent = email.content.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(textContent);
    toast({ 
      title: "Content Copied", 
      description: "Email content copied to clipboard (HTML tags removed)" 
    });
  };

  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Function to render HTML content safely
  const renderEmailContent = (htmlContent: string) => {
    // Simple HTML to text conversion for display
    const textContent = htmlContent
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/div>/gi, '\n')
      .replace(/<div[^>]*>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    
    return textContent;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5" />
            <div className="flex-1">
              <DialogTitle className="text-left">{email.subject}</DialogTitle>
              <DialogDescription className="text-left">
                To: {email.recipient_name || email.recipient_email}
              </DialogDescription>
            </div>
            <Badge className={getStatusColor(email.status)}>
              {email.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Eye className="h-4 w-4 mx-auto mb-1 text-blue-600" />
              <div className="text-lg font-semibold">{email.open_count}</div>
              <div className="text-xs text-gray-600">Opens</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <MousePointer className="h-4 w-4 mx-auto mb-1 text-purple-600" />
              <div className="text-lg font-semibold">{email.click_count}</div>
              <div className="text-xs text-gray-600">Clicks</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="h-4 w-4 mx-auto mb-1 text-orange-600" />
              <div className="text-lg font-semibold">{formatTimeSpent(email.time_spent_seconds)}</div>
              <div className="text-xs text-gray-600">Time Spent</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <div className="text-xs font-semibold">
                {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-xs text-gray-600">Sent Date</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <h4 className="font-semibold">Email Timeline</h4>
            <div className="space-y-2">
              {email.sent_at && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Sent:</span>
                  <span>{new Date(email.sent_at).toLocaleString()}</span>
                </div>
              )}
              {email.delivered_at && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Delivered:</span>
                  <span>{new Date(email.delivered_at).toLocaleString()}</span>
                </div>
              )}
              {email.opened_at && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">First Opened:</span>
                  <span>{new Date(email.opened_at).toLocaleString()}</span>
                </div>
              )}
              {email.clicked_at && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="font-medium">First Clicked:</span>
                  <span>{new Date(email.clicked_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bounce/Error Info */}
          {email.bounce_reason && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Delivery Issue</span>
              </div>
              <p className="text-sm text-red-700">{email.bounce_reason}</p>
            </div>
          )}

          <Separator />

          {/* Email Content Preview */}
          <div>
            <h4 className="font-semibold mb-3">Email Content</h4>
            <div className="p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {renderEmailContent(email.content)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {canResend && (
              <Button 
                onClick={handleResend}
                disabled={isResending || sendEmailMutation.isPending}
                className="flex items-center gap-2"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? "Resending..." : "Resend Email"}
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={() => setShowFollowUp(!showFollowUp)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Add Follow-up
            </Button>

            <Button 
              variant="outline"
              onClick={handleCopyContent}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Content
            </Button>
          </div>

          {/* Follow-up Section */}
          {showFollowUp && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Record Follow-up Action
              </h5>
              <Textarea
                placeholder="Record your follow-up actions, client response, next steps, or meeting notes..."
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                className="min-h-20"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleFollowUp} 
                  size="sm"
                  disabled={!followUpNote.trim()}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-3 w-3" />
                  Record Follow-up
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFollowUp(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
