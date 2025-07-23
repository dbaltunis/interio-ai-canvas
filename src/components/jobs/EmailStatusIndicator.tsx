
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Eye, MousePointer, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useEmails } from "@/hooks/useEmails";
import { useNavigate } from "react-router-dom";

interface EmailStatusIndicatorProps {
  clientId?: string;
  projectId: string;
}

export const EmailStatusIndicator = ({ clientId, projectId }: EmailStatusIndicatorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: emails = [] } = useEmails();
  const navigate = useNavigate();

  // Filter emails for this client
  const clientEmails = emails.filter(email => email.client_id === clientId);
  
  const emailStats = {
    total: clientEmails.length,
    sent: clientEmails.filter(email => ['sent', 'delivered'].includes(email.status)).length,
    opened: clientEmails.filter(email => email.open_count > 0).length,
    clicked: clientEmails.filter(email => email.click_count > 0).length,
    bounced: clientEmails.filter(email => email.status === 'bounced').length,
    failed: clientEmails.filter(email => email.status === 'failed').length,
    pending: clientEmails.filter(email => ['queued', 'sending'].includes(email.status)).length
  };

  const getStatusColor = () => {
    if (emailStats.failed > 0 || emailStats.bounced > 0) return "destructive";
    if (emailStats.pending > 0) return "secondary";
    if (emailStats.opened > 0) return "default";
    if (emailStats.sent > 0) return "outline";
    return "secondary";
  };

  const getStatusIcon = () => {
    if (emailStats.failed > 0 || emailStats.bounced > 0) return <AlertCircle className="h-3 w-3" />;
    if (emailStats.pending > 0) return <Clock className="h-3 w-3" />;
    if (emailStats.opened > 0) return <Eye className="h-3 w-3" />;
    if (emailStats.sent > 0) return <CheckCircle className="h-3 w-3" />;
    return <Mail className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (emailStats.failed > 0) return "Failed";
    if (emailStats.bounced > 0) return "Bounced";
    if (emailStats.pending > 0) return "Pending";
    if (emailStats.opened > 0) return "Opened";
    if (emailStats.sent > 0) return "Sent";
    return "No emails";
  };

  const handleGoToEmails = () => {
    navigate(`/?tab=emails&client=${clientId}`);
    setIsOpen(false);
  };

  const handleGoToClient = () => {
    navigate(`/clients/${clientId}`);
    setIsOpen(false);
  };

  const handleGoToProject = () => {
    navigate(`/projects/${projectId}`);
    setIsOpen(false);
  };

  if (emailStats.total === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Mail className="h-3 w-3" />
        <span className="text-xs">No emails</span>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            {getStatusIcon()}
            {emailStats.total}
          </Badge>
          <span className="text-xs text-gray-600">{getStatusText()}</span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Communication Status
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Email Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Sent</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{emailStats.sent}</div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Opened</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{emailStats.opened}</div>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MousePointer className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Clicked</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{emailStats.clicked}</div>
            </div>
            
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{emailStats.pending}</div>
            </div>
          </div>

          {/* Issues */}
          {(emailStats.failed > 0 || emailStats.bounced > 0) && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Issues Detected</span>
              </div>
              {emailStats.failed > 0 && (
                <div className="text-sm text-red-700">• {emailStats.failed} failed email(s)</div>
              )}
              {emailStats.bounced > 0 && (
                <div className="text-sm text-red-700">• {emailStats.bounced} bounced email(s)</div>
              )}
            </div>
          )}

          {/* Next Steps */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Next Steps</h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleGoToEmails}
              >
                <Mail className="h-4 w-4 mr-2" />
                View Email History & Send New Email
              </Button>
              
              {clientId && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleGoToClient}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Client Details
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleGoToProject}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                View Project Details
              </Button>
            </div>
          </div>

          {/* Recent Email Activity */}
          {clientEmails.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Recent Email Activity</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {clientEmails.slice(0, 3).map((email) => (
                  <div key={email.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{email.subject}</div>
                      <div className="text-xs text-gray-500">
                        {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : 'Not sent'}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {email.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
