
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
  AlertCircle
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
  const { toast } = useToast();
  const sendEmailMutation = useSendEmail();

  if (!email) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'opened': return 'bg-blue-100 text-blue-800';
      case 'clicked': return 'bg-purple-100 text-purple-800';
      case 'bounced': case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canResend = ['bounced', 'failed'].includes(email.status);

  const handleResend = async () => {
    try {
      await sendEmailMutation.mutateAsync({
        to: email.recipient_email,
        subject: `[RESEND] ${email.subject}`,
        content: email.content
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to resend email:", error);
    }
  };

  const handleFollowUp = () => {
    if (onFollowUp && followUpNote.trim()) {
      onFollowUp(email.id, followUpNote);
      setFollowUpNote("");
      setShowFollowUp(false);
      toast({
        title: "Follow-up Recorded",
        description: "Your follow-up note has been saved."
      });
    }
  };

  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
            <div className="p-4 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
              <div className="whitespace-pre-wrap text-sm">{email.content}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {canResend && (
              <Button 
                onClick={handleResend}
                disabled={sendEmailMutation.isPending}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {sendEmailMutation.isPending ? "Resending..." : "Resend Email"}
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={() => setShowFollowUp(!showFollowUp)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Follow Up
            </Button>

            <Button 
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(email.content);
                toast({ title: "Content Copied", description: "Email content copied to clipboard" });
              }}
            >
              Copy Content
            </Button>
          </div>

          {/* Follow-up Section */}
          {showFollowUp && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium">Add Follow-up Note</h5>
              <Textarea
                placeholder="Record your follow-up actions, client response, or next steps..."
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                className="min-h-20"
              />
              <div className="flex gap-2">
                <Button onClick={handleFollowUp} size="sm">
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
