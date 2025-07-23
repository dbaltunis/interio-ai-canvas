
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, MailOpen, MailX, Eye, MousePointer, Send, TrendingUp } from "lucide-react";
import { useEmails } from "@/hooks/useEmails";

interface EmailStatusDisplayProps {
  jobId: string;
  clientEmail?: string;
}

interface EmailKPI {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  lastSent?: string;
  lastOpened?: string;
}

export const EmailStatusDisplay = ({ jobId, clientEmail }: EmailStatusDisplayProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: emails = [] } = useEmails();

  // Filter emails for this specific job/client
  const jobEmails = emails.filter(email => {
    // Match by client email if provided, or you could add job_id to emails table
    return clientEmail ? email.recipient_email === clientEmail : false;
  });

  const calculateKPIs = (): EmailKPI => {
    const totalSent = jobEmails.filter(email => ['sent', 'delivered', 'opened', 'clicked'].includes(email.status)).length;
    const totalOpened = jobEmails.filter(email => email.open_count > 0).length;
    const totalClicked = jobEmails.filter(email => email.click_count > 0).length;
    
    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
    const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
    
    const lastSentEmail = jobEmails
      .filter(email => email.sent_at)
      .sort((a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())[0];
    
    const lastOpenedEmail = jobEmails
      .filter(email => email.open_count > 0)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

    return {
      totalSent,
      totalOpened,
      totalClicked,
      openRate,
      clickRate,
      lastSent: lastSentEmail?.sent_at,
      lastOpened: lastOpenedEmail?.updated_at
    };
  };

  const kpis = calculateKPIs();
  const hasEmails = jobEmails.length > 0;
  const lastStatus = jobEmails.length > 0 ? jobEmails[0].status : null;

  const getStatusIcon = () => {
    if (!hasEmails) {
      return <MailX className="h-4 w-4 text-gray-400" />;
    }
    
    if (kpis.totalClicked > 0) {
      return <MousePointer className="h-4 w-4 text-purple-500" />;
    }
    
    if (kpis.totalOpened > 0) {
      return <MailOpen className="h-4 w-4 text-green-500" />;
    }
    
    if (kpis.totalSent > 0) {
      return <Mail className="h-4 w-4 text-blue-500" />;
    }
    
    return <Mail className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = () => {
    if (!hasEmails) return 'bg-gray-100 text-gray-800';
    
    if (kpis.totalClicked > 0) return 'bg-purple-100 text-purple-800';
    if (kpis.totalOpened > 0) return 'bg-green-100 text-green-800';
    if (kpis.totalSent > 0) return 'bg-blue-100 text-blue-800';
    
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = () => {
    if (!hasEmails) return 'No emails';
    if (kpis.totalClicked > 0) return 'Clicked';
    if (kpis.totalOpened > 0) return 'Opened';
    if (kpis.totalSent > 0) return 'Sent';
    return 'Draft';
  };

  if (!hasEmails) {
    return (
      <div className="flex items-center space-x-2">
        <MailX className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">No emails</span>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
          {getStatusIcon()}
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-900">{kpis.totalSent}</span>
            <Badge variant="secondary" className={`${getStatusColor()} text-xs`}>
              {getStatusText()}
            </Badge>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Communication Summary
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Send className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-800">{kpis.totalSent}</div>
              <div className="text-sm text-blue-600">Sent</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Eye className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-800">{kpis.totalOpened}</div>
              <div className="text-sm text-green-600">Opened</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <MousePointer className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-800">{kpis.totalClicked}</div>
              <div className="text-sm text-purple-600">Clicked</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-800">{kpis.openRate}%</div>
              <div className="text-sm text-orange-600">Open Rate</div>
            </div>
          </div>

          {/* Email List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Recent Emails</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {jobEmails.slice(0, 10).map((email) => (
                <div key={email.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {email.subject}
                    </div>
                    <div className="text-xs text-gray-500">
                      To: {email.recipient_email}
                    </div>
                    <div className="text-xs text-gray-500">
                      {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : 'Not sent'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className={getStatusColor()}>
                      {email.status}
                    </Badge>
                    {email.open_count > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {email.open_count} opens
                      </Badge>
                    )}
                    {email.click_count > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {email.click_count} clicks
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {jobEmails.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No emails found for this job
                </div>
              )}
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-gray-600">Last Email Sent</div>
              <div className="font-medium">
                {kpis.lastSent ? new Date(kpis.lastSent).toLocaleDateString() : 'Never'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Click Rate</div>
              <div className="font-medium">{kpis.clickRate}%</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
