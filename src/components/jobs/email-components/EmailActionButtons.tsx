
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Reply, Forward } from "lucide-react";
import { ProjectEmailComposer } from "../email/ProjectEmailComposer";
import { useToast } from "@/hooks/use-toast";

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

interface EmailActionButtonsProps {
  email: Email;
  projectId: string;
  projectName: string;
}

export const EmailActionButtons = ({ email, projectId, projectName }: EmailActionButtonsProps) => {
  const [showEmailView, setShowEmailView] = useState(false);
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [showForwardComposer, setShowForwardComposer] = useState(false);
  const { toast } = useToast();

  const handleView = () => {
    setShowEmailView(true);
  };

  const handleReply = () => {
    setShowReplyComposer(true);
  };

  const handleForward = () => {
    setShowForwardComposer(true);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "text-brand-primary";
      case "delivered":
        return "text-green-600";
      case "opened":
        return "text-blue-600";
      case "clicked":
        return "text-purple-600";
      case "bounced":
        return "text-red-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-brand-neutral";
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleView}
          className="border-brand-secondary text-brand-primary hover:bg-brand-secondary/10"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReply}
          className="border-brand-secondary text-brand-primary hover:bg-brand-secondary/10"
        >
          <Reply className="h-4 w-4 mr-1" />
          Reply
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleForward}
          className="border-brand-secondary text-brand-primary hover:bg-brand-secondary/10"
        >
          <Forward className="h-4 w-4 mr-1" />
          Forward
        </Button>
      </div>

      {/* Email View Dialog */}
      <Dialog open={showEmailView} onOpenChange={setShowEmailView}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-brand-light border-brand-secondary/20">
          <DialogHeader>
            <DialogTitle className="text-brand-primary">Email Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Email Header */}
            <div className="bg-gradient-to-r from-brand-secondary/10 to-brand-primary/5 p-4 rounded-lg shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-brand-neutral">To:</p>
                  <p className="font-medium text-brand-primary">{email.recipient_email}</p>
                </div>
                <div>
                  <p className="text-sm text-brand-neutral">Status:</p>
                  <p className={`font-medium capitalize ${getStatusColor(email.status)}`}>{email.status}</p>
                </div>
                <div>
                  <p className="text-sm text-brand-neutral">Sent:</p>
                  <p className="text-brand-primary">{formatDate(email.sent_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-brand-neutral">Delivered:</p>
                  <p className="text-brand-primary">{formatDate(email.delivered_at)}</p>
                </div>
              </div>
            </div>

            {/* Email Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-brand-light p-3 rounded-lg shadow-sm border border-brand-secondary/20">
                <p className="text-sm text-brand-neutral">Opens</p>
                <p className="text-lg font-semibold text-brand-primary">{email.open_count}</p>
              </div>
              <div className="bg-brand-light p-3 rounded-lg shadow-sm border border-brand-secondary/20">
                <p className="text-sm text-brand-neutral">Clicks</p>
                <p className="text-lg font-semibold text-brand-primary">{email.click_count}</p>
              </div>
              <div className="bg-brand-light p-3 rounded-lg shadow-sm border border-brand-secondary/20">
                <p className="text-sm text-brand-neutral">Time Spent</p>
                <p className="text-lg font-semibold text-brand-primary">{email.time_spent_seconds}s</p>
              </div>
            </div>

            {/* Email Subject */}
            <div>
              <p className="text-sm text-brand-neutral mb-2">Subject:</p>
              <p className="font-medium text-brand-primary">{email.subject}</p>
            </div>

            {/* Email Content */}
            <div>
              <p className="text-sm text-brand-neutral mb-2">Content:</p>
              <div 
                className="prose prose-sm max-w-none bg-brand-light p-4 rounded-lg shadow-sm border border-brand-secondary/20"
                dangerouslySetInnerHTML={{ __html: email.content }}
              />
            </div>

            {/* Bounce Reason if applicable */}
            {email.bounce_reason && (
              <div className="bg-red-50 p-3 rounded-lg shadow-sm border border-red-200">
                <p className="text-sm text-red-600 font-medium">Bounce Reason:</p>
                <p className="text-red-700">{email.bounce_reason}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Composer Dialog */}
      <Dialog open={showReplyComposer} onOpenChange={setShowReplyComposer}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-brand-light border-brand-secondary/20">
          <DialogHeader>
            <DialogTitle className="text-brand-primary">Reply to Email</DialogTitle>
          </DialogHeader>
          <ProjectEmailComposer
            projectId={projectId}
            projectName={projectName}
            onClose={() => setShowReplyComposer(false)}
            initialRecipient={email.recipient_email}
            initialSubject={`Re: ${email.subject}`}
            initialContent={`<br><br>---<br>Original message:<br>${email.content}`}
          />
        </DialogContent>
      </Dialog>

      {/* Forward Composer Dialog */}
      <Dialog open={showForwardComposer} onOpenChange={setShowForwardComposer}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-brand-light border-brand-secondary/20">
          <DialogHeader>
            <DialogTitle className="text-brand-primary">Forward Email</DialogTitle>
          </DialogHeader>
          <ProjectEmailComposer
            projectId={projectId}
            projectName={projectName}
            onClose={() => setShowForwardComposer(false)}
            initialSubject={`Fwd: ${email.subject}`}
            initialContent={`<br><br>---<br>Forwarded message:<br>From: ${email.recipient_email}<br>Subject: ${email.subject}<br><br>${email.content}`}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
