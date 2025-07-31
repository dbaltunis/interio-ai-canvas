
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Mail, Search, Filter, Eye, Archive, Download, MousePointer, TrendingUp, Users, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useEmails, useEmailKPIs } from "@/hooks/useEmails";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useSendEmail } from "@/hooks/useSendEmail";
import { format } from "date-fns";
import { EmailDetailDialog } from "../email-components/EmailDetailDialog";
import { EmailRowActions } from "../email-components/EmailRowActions";
import { FollowUpComposer } from "../email-components/FollowUpComposer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface EmailDashboardProps {
  showFilters?: boolean;
  setShowFilters?: (show: boolean) => void;
}

export const EmailDashboard = ({ showFilters = false, setShowFilters }: EmailDashboardProps = {}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [showEmailDetail, setShowEmailDetail] = useState(false);
  const [followUpEmailId, setFollowUpEmailId] = useState<string | null>(null);

  const { data: emails = [] } = useEmails();
  const { data: kpis } = useEmailKPIs();
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const sendEmailMutation = useSendEmail();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up real-time subscriptions for email updates
  useEffect(() => {
    const emailChannel = supabase
      .channel('email-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'emails'
        },
        (payload) => {
          console.log('Email table change detected:', payload);
          // Invalidate email queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['emails'] });
          queryClient.invalidateQueries({ queryKey: ['email-kpis'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_analytics'
        },
        (payload) => {
          console.log('Email analytics change detected:', payload);
          // Invalidate all email-related queries
          queryClient.invalidateQueries({ queryKey: ['emails'] });
          queryClient.invalidateQueries({ queryKey: ['email-kpis'] });
          queryClient.invalidateQueries({ queryKey: ['email-analytics'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(emailChannel);
    };
  }, [queryClient]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return "bg-gray-100 text-gray-700";
      case 'sent':
        return "bg-blue-100 text-blue-700";
      case 'processed':
        return "bg-indigo-100 text-indigo-700";
      case 'delivered':
        return "bg-green-100 text-green-700";
      case 'opened':
        return "bg-purple-100 text-purple-700";
      case 'clicked':
        return "bg-cyan-100 text-cyan-700";
      case 'bounced':
        return "bg-red-100 text-red-700";
      case 'dropped':
        return "bg-orange-100 text-orange-700";
      case 'spam_reported':
        return "bg-red-100 text-red-700";
      case 'unsubscribed':
        return "bg-yellow-100 text-yellow-700";
      case 'deferred':
        return "bg-amber-100 text-amber-700";
      case 'failed':
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'queued':
        return "⏳ Queued";
      case 'sent':
        return "📤 Sent";
      case 'processed':
        return "⚙️ Processing";
      case 'delivered':
        return "✅ Delivered";
      case 'opened':
        return "👀 Opened";
      case 'clicked':
        return "👆 Clicked";
      case 'bounced':
        return "↩️ Bounced";
      case 'dropped':
        return "🚫 Dropped/Spam";
      case 'spam_reported':
        return "⚠️ Spam Report";
      case 'unsubscribed':
        return "🚪 Unsubscribed";
      case 'deferred':
        return "⏸️ Deferred";
      case 'failed':
        return "❌ Failed";
      default:
        return status;
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.recipient_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || email.status === statusFilter;
    const matchesClient = clientFilter === "all" || email.client_id === clientFilter;
    const matchesProject = projectFilter === "all" || 
                          projects.find(p => p.client_id === email.client_id)?.id === projectFilter;
    
    return matchesSearch && matchesStatus && matchesClient && matchesProject;
  });

  const handleViewEmail = (email: any) => {
    setSelectedEmail(email);
    setShowEmailDetail(true);
  };

  const handleStartFollowUp = (emailId: string) => {
    setFollowUpEmailId(emailId);
  };

  const handleSendFollowUp = async (emailId: string, followUpData: { subject: string; content: string }) => {
    const originalEmail = emails.find(e => e.id === emailId);
    if (!originalEmail) return;

    try {
      await sendEmailMutation.mutateAsync({
        to: originalEmail.recipient_email,
        subject: followUpData.subject,
        content: followUpData.content,
        client_id: originalEmail.client_id,
      });
      
      setFollowUpEmailId(null);
      toast({
        title: "Follow-up Sent",
        description: "Your follow-up email has been sent successfully",
      });
    } catch (error) {
      console.error("Failed to send follow-up:", error);
    }
  };

  const handleResendEmail = async (email: any) => {
    try {
      await sendEmailMutation.mutateAsync({
        to: email.recipient_email,
        subject: email.subject,
        content: email.content,
        client_id: email.client_id,
      });
      
      toast({
        title: "Email Resent",
        description: "The email has been resent successfully",
      });
    } catch (error) {
      console.error("Failed to resend email:", error);
    }
  };

  // Calculate improved KPIs including bounced/failed
  const totalEmails = emails.length;
  const deliveredEmails = emails.filter(e => e.status === 'delivered').length;
  const bouncedEmails = emails.filter(e => ['bounced', 'failed'].includes(e.status)).length;
  const deletedEmails = emails.filter(e => ['dropped', 'spam_reported'].includes(e.status)).length;
  const openedEmails = emails.filter(e => e.open_count > 0).length;
  const clickedEmails = emails.filter(e => e.click_count > 0).length;

  const deliveryRate = totalEmails > 0 ? Math.round((deliveredEmails / totalEmails) * 100) : 0;
  const bounceRate = totalEmails > 0 ? Math.round((bouncedEmails / totalEmails) * 100) : 0;
  const deleteRate = totalEmails > 0 ? Math.round((deletedEmails / totalEmails) * 100) : 0;
  const openRate = deliveredEmails > 0 ? Math.round((openedEmails / deliveredEmails) * 100) : 0;
  const clickRate = deliveredEmails > 0 ? Math.round((clickedEmails / deliveredEmails) * 100) : 0;

  const handleKPIClick = (kpiType: string) => {
    switch (kpiType) {
      case 'deleted':
        setStatusFilter('dropped');
        break;
      case 'bounced':
        setStatusFilter('bounced');
        break;
      case 'delivered':
        setStatusFilter('delivered');
        break;
      case 'opened':
        setStatusFilter('opened');
        break;
      default:
        setStatusFilter('all');
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Dashboard - Compact View */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div 
            className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            onClick={() => handleKPIClick('total')}
          >
            <div className="flex items-center gap-1 mb-1">
              <Users className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-medium text-muted-foreground">Total</span>
            </div>
            <div className="text-lg font-bold">{totalEmails}</div>
          </div>

          <div 
            className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            onClick={() => handleKPIClick('delivered')}
          >
            <div className="flex items-center gap-1 mb-1">
              <CheckCircle className="h-3 w-3 text-green-600 group-hover:text-green-700 transition-colors" />
              <span className="text-xs font-medium text-muted-foreground">Delivered</span>
            </div>
            <div className="text-lg font-bold text-green-600">{deliveredEmails}</div>
            <span className="text-xs text-muted-foreground">{deliveryRate}%</span>
          </div>

          <div 
            className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            onClick={() => handleKPIClick('opened')}
          >
            <div className="flex items-center gap-1 mb-1">
              <Eye className="h-3 w-3 text-purple-600 group-hover:text-purple-700 transition-colors" />
              <span className="text-xs font-medium text-muted-foreground">Opened</span>
            </div>
            <div className="text-lg font-bold text-purple-600">{openedEmails}</div>
            <span className="text-xs text-muted-foreground">{openRate}%</span>
          </div>

          <div 
            className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            onClick={() => handleKPIClick('bounced')}
          >
            <div className="flex items-center gap-1 mb-1">
              <XCircle className="h-3 w-3 text-red-600 group-hover:text-red-700 transition-colors" />
              <span className="text-xs font-medium text-muted-foreground">Bounced</span>
            </div>
            <div className="text-lg font-bold text-red-600">{bouncedEmails}</div>
            <span className="text-xs text-muted-foreground">{bounceRate}%</span>
          </div>

          <div 
            className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            onClick={() => handleKPIClick('deleted')}
          >
            <div className="flex items-center gap-1 mb-1">
              <Trash2 className="h-3 w-3 text-orange-600 group-hover:text-orange-700 transition-colors" />
              <span className="text-xs font-medium text-muted-foreground">Deleted</span>
            </div>
            <div className="text-lg font-bold text-orange-600">{deletedEmails}</div>
            <span className="text-xs text-muted-foreground">{deleteRate}%</span>
          </div>
        </div>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
               <Select value={statusFilter} onValueChange={setStatusFilter}>
                 <SelectTrigger className="w-[140px]">
                   <SelectValue placeholder="Status" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Status</SelectItem>
                   <SelectItem value="queued">⏳ Queued</SelectItem>
                   <SelectItem value="sent">📤 Sent</SelectItem>
                   <SelectItem value="processed">⚙️ Processing</SelectItem>
                   <SelectItem value="delivered">✅ Delivered</SelectItem>
                   <SelectItem value="opened">👀 Opened</SelectItem>
                   <SelectItem value="clicked">👆 Clicked</SelectItem>
                   <SelectItem value="bounced">↩️ Bounced</SelectItem>
                   <SelectItem value="dropped">🚫 Dropped/Spam</SelectItem>
                   <SelectItem value="failed">❌ Failed</SelectItem>
                   <SelectItem value="deferred">⏸️ Deferred</SelectItem>
                   <SelectItem value="unsubscribed">🚪 Unsubscribed</SelectItem>
                 </SelectContent>
               </Select>

              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email List */}
      <Card>
        <CardContent className="p-0">
          {filteredEmails.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No emails found</h3>
              <p className="text-gray-500 mb-4">No emails match your current filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Subject</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Recipient</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Status</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Sent</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Engagement</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmails.map((email) => (
                  <TableRow 
                    key={email.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewEmail(email)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleViewEmail(email)}
                        className="font-medium text-gray-900 hover:text-blue-600 text-left"
                      >
                        {email.subject}
                      </button>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleViewEmail(email)}
                        className="text-sm hover:text-blue-600 text-left"
                      >
                        <div>{email.recipient_email}</div>
                        {email.client_id && (
                          <div className="text-xs text-gray-500">
                            {clients.find(c => c.id === email.client_id)?.name}
                          </div>
                        )}
                      </button>
                    </TableCell>
                     <TableCell>
                       <Badge className={`${getStatusColor(email.status)} border-0`} variant="secondary">
                         {getStatusLabel(email.status)}
                       </Badge>
                     </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {email.sent_at ? format(new Date(email.sent_at), 'MMM d, yyyy HH:mm') : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-xs">
                        {/* Always show open count for sent/delivered emails */}
                        {['sent', 'delivered', 'opened'].includes(email.status) && (
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3 text-purple-500" />
                            <span className={`font-medium ${email.open_count > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {email.open_count} {email.open_count === 1 ? 'open' : 'opens'}
                            </span>
                          </div>
                        )}
                        
                        {/* Show clicks if any */}
                        {email.click_count > 0 && (
                          <div className="flex items-center space-x-1">
                            <MousePointer className="h-3 w-3 text-blue-500" />
                            <span className="text-blue-600 font-medium">
                              {email.click_count} {email.click_count === 1 ? 'click' : 'clicks'}
                            </span>
                          </div>
                        )}
                        
                        {/* Status indicators for non-trackable emails */}
                        {email.status === 'failed' && (
                          <span className="text-red-500 text-xs">❌ Failed to send</span>
                        )}
                        {email.status === 'queued' && (
                          <span className="text-gray-400 text-xs">⏳ Queued</span>
                        )}
                        {email.status === 'bounced' && (
                          <span className="text-red-500 text-xs">↩️ Bounced</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <EmailRowActions
                        email={email}
                        onView={() => handleViewEmail(email)}
                        onFollowUp={() => handleStartFollowUp(email.id)}
                        onResend={() => handleResendEmail(email)}
                        isResending={sendEmailMutation.isPending}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Follow-up Composer */}
      {followUpEmailId && (
        <Card>
          <CardContent className="p-4">
            <FollowUpComposer
              email={emails.find(e => e.id === followUpEmailId)!}
              onSend={(followUpData) => handleSendFollowUp(followUpEmailId, followUpData)}
              onCancel={() => setFollowUpEmailId(null)}
              isSending={sendEmailMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Email Detail Dialog */}
      <EmailDetailDialog
        open={showEmailDetail}
        onOpenChange={setShowEmailDetail}
        email={selectedEmail}
        onResendEmail={handleResendEmail}
        isResending={sendEmailMutation.isPending}
      />
    </div>
  );
};
