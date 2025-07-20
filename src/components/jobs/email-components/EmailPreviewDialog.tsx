
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, ExternalLink } from "lucide-react";

interface EmailPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email?: any;
  template?: any;
  clientData?: any;
  quoteData?: any;
  senderInfo?: any;
}

export const EmailPreviewDialog = ({ 
  isOpen, 
  onClose, 
  email, 
  template, 
  clientData, 
  quoteData, 
  senderInfo 
}: EmailPreviewDialogProps) => {
  const emailData = email || {
    subject: template?.subject || "Email Preview",
    content: template?.content || "Email content preview",
    recipient_email: clientData?.email || "client@example.com",
    status: "draft"
  };

  // Use mock business settings for now
  const companyName = senderInfo?.company_name || "Your Company";
  const companyLogo = senderInfo?.company_logo_url || null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'opened': return 'bg-purple-100 text-purple-800';
      case 'clicked': return 'bg-orange-100 text-orange-800';
      case 'bounced': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Email Preview</span>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(emailData.status)}>
                {emailData.status}
              </Badge>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Header */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">To:</span> {emailData.recipient_email}
              </div>
              <div>
                <span className="font-medium">From:</span> {companyName}
              </div>
              <div>
                <span className="font-medium">Subject:</span> {emailData.subject}
              </div>
              <div>
                <span className="font-medium">Sent:</span> {emailData.sent_at ? new Date(emailData.sent_at).toLocaleString() : 'Not sent'}
              </div>
            </div>
          </div>

          {/* Email Content Preview */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-white p-6">
              {companyLogo && (
                <div className="mb-6">
                  <img src={companyLogo} alt="Company Logo" className="h-12" />
                </div>
              )}
              
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: emailData.content }}
              />
              
              <div className="mt-8 pt-4 border-t text-sm text-gray-600">
                <p>Best regards,</p>
                <p>{companyName}</p>
              </div>
            </div>
          </div>

          {/* Email Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-2xl font-bold text-blue-600">{emailData.open_count || 0}</div>
              <div className="text-sm text-blue-600">Opens</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-2xl font-bold text-green-600">{emailData.click_count || 0}</div>
              <div className="text-sm text-green-600">Clicks</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="text-2xl font-bold text-purple-600">{emailData.time_spent_seconds || 0}s</div>
              <div className="text-sm text-purple-600">Time Spent</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
