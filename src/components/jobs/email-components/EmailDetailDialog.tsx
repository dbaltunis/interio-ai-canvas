
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, Eye, MousePointer, Clock, RefreshCw, User, Building, Phone, MapPin, ExternalLink, Brain, Target, MessageSquare } from "lucide-react";
import { EmailStatusBadge } from "./EmailStatusBadge";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Email } from "@/hooks/useEmails";
import { format } from "date-fns";

interface EmailDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: Email | null;
  onResendEmail?: (email: Email) => void;
  isResending?: boolean;
}

export const EmailDetailDialog = ({ open, onOpenChange, email, onResendEmail, isResending }: EmailDetailDialogProps) => {
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const navigate = useNavigate();
  const [refreshedEmail, setRefreshedEmail] = useState<Email | null>(null);
  const [emailAnalytics, setEmailAnalytics] = useState<any[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Fetch email analytics
  useEffect(() => {
    if (!email?.id || !open) return;

    const fetchEmailAnalytics = async () => {
      try {
        const { data: analytics } = await supabase
          .from('email_analytics')
          .select('*')
          .eq('email_id', email.id)
          .order('created_at', { ascending: true });
        
        if (analytics) {
          setEmailAnalytics(analytics);
        }
      } catch (error) {
        console.error('Error fetching email analytics:', error);
      }
    };

    fetchEmailAnalytics();
  }, [email?.id, open]);

  // Auto-refresh email data every 10 seconds
  useEffect(() => {
    if (!email?.id || !open) return;

    const refreshEmailData = async () => {
      try {
        const [emailResponse, analyticsResponse] = await Promise.all([
          supabase.from('emails').select('*').eq('id', email.id).single(),
          supabase.from('email_analytics').select('*').eq('email_id', email.id).order('created_at', { ascending: true })
        ]);
        
        if (!emailResponse.error && emailResponse.data) {
          setRefreshedEmail(emailResponse.data as Email);
        }
        
        if (!analyticsResponse.error && analyticsResponse.data) {
          setEmailAnalytics(analyticsResponse.data);
        }
      } catch (error) {
        console.error('Error refreshing email data:', error);
      }
    };

    // Initial refresh
    refreshEmailData();

    // Set up interval for auto-refresh every 10 seconds
    const interval = setInterval(refreshEmailData, 10000);

    return () => clearInterval(interval);
  }, [email?.id, open]);

  // Reset refreshed email when email prop changes
  useEffect(() => {
    setRefreshedEmail(email);
  }, [email]);

  const currentEmail = refreshedEmail || email;
  
  if (!currentEmail) return null;

  const client = currentEmail.client_id ? clients.find(c => c.id === currentEmail.client_id) : null;
  const clientProjects = client ? projects.filter(p => p.client_id === client.id) : [];
  const activeProjects = clientProjects.filter(p => !['completed', 'cancelled'].includes(p.status));

  // Generate AI recommendations (moved after variable declarations)
  useEffect(() => {
    if (!currentEmail || !open) return;

    const generateRecommendations = async () => {
      setLoadingRecommendations(true);
      try {
        const response = await supabase.functions.invoke('generate-email-recommendations', {
          body: {
            email: currentEmail,
            client: client,
            analytics: emailAnalytics
          }
        });
        
        if (response.data?.recommendations) {
          setAiRecommendations(response.data.recommendations);
        }
      } catch (error) {
        console.error('Error generating recommendations:', error);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    if (emailAnalytics.length > 0 || ['delivered', 'opened', 'clicked', 'bounced'].includes(currentEmail.status)) {
      generateRecommendations();
    }
  }, [currentEmail, client, emailAnalytics, open]);

  const handleViewClient = () => {
    if (client) {
      navigate(`/clients/${client.id}`);
      onOpenChange(false);
    }
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Communication Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Email Header */}
            <Card>
            <CardHeader>
              <CardTitle className="text-lg">{currentEmail.subject}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>To: {currentEmail.recipient_email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Sent: {currentEmail.sent_at ? new Date(currentEmail.sent_at).toLocaleString() : 'Not sent'}</span>
                </div>
                <EmailStatusBadge status={currentEmail.status || 'queued'} />
              </div>
            </CardHeader>
          </Card>

          {/* Client Information */}
          {client && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Client Information
                  </span>
                  <Button variant="outline" size="sm" onClick={handleViewClient}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Client
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-lg">{client.name}</h4>
                    {client.company_name && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Building className="h-4 w-4" />
                        {client.company_name}
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {client.phone}
                      </div>
                    )}
                  </div>
                  <div>
                    {client.address && (
                      <div className="flex items-start gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <div>
                          <div>{client.address}</div>
                          <div>{client.city}, {client.state} {client.zip_code}</div>
                        </div>
                      </div>
                    )}
                    <div className="mt-2">
                      <Badge variant="outline">{client.funnel_stage}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects Information */}
          {clientProjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Projects ({clientProjects.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clientProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {project.status}
                          </Badge>
                          <span>•</span>
                          <span>{project.funnel_stage}</span>
                          {project.due_date && (
                            <>
                              <span>•</span>
                              <span>Due: {new Date(project.due_date).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleViewProject(project.id)}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Project
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Analytics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Eye className="h-4 w-4 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-600">{currentEmail.open_count || 0}</span>
                </div>
                <div className="text-sm text-muted-foreground">Opens</div>
                {currentEmail.open_count > 0 && (
                  <div className="text-xs text-green-600 mt-1">Email was opened</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <MousePointer className="h-4 w-4 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">{currentEmail.click_count || 0}</span>
                </div>
                <div className="text-sm text-muted-foreground">Clicks</div>
                {currentEmail.click_count > 0 && (
                  <div className="text-xs text-green-600 mt-1">Links were clicked</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">{currentEmail.time_spent_seconds || 0}s</span>
                </div>
                <div className="text-sm text-muted-foreground">Time Spent</div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Email Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Email Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Email Created */}
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Email Created</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(currentEmail.created_at), 'MMM d, yyyy HH:mm:ss')}
                    </div>
                  </div>
                </div>
                
                {/* Email Sent */}
                {currentEmail.sent_at && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Email Sent</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(currentEmail.sent_at), 'MMM d, yyyy HH:mm:ss')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Analytics Events */}
                {emailAnalytics.map((event, index) => {
                  const eventTime = new Date(event.created_at);
                  const isOpenEvent = event.event_type === 'opened' || event.event_type === 'open';
                  const isClickEvent = event.event_type === 'clicked' || event.event_type === 'click';
                  const isDeliveredEvent = event.event_type === 'delivered';
                  const isProcessedEvent = event.event_type === 'processed';
                  
                  let icon, color, title, details;
                  
                  if (isOpenEvent) {
                    icon = '👀';
                    color = 'bg-purple-500';
                    title = `Email Opened ${emailAnalytics.filter(e => e.event_type === event.event_type).findIndex(e => e.id === event.id) + 1}`;
                    details = `IP: ${event.ip_address}, User Agent: ${event.user_agent?.substring(0, 50)}...`;
                  } else if (isClickEvent) {
                    icon = '👆';
                    color = 'bg-orange-500';
                    title = `Link Clicked ${emailAnalytics.filter(e => e.event_type === event.event_type).findIndex(e => e.id === event.id) + 1}`;
                    details = `URL: ${event.event_data?.url || 'Unknown'}, IP: ${event.ip_address}`;
                  } else if (isDeliveredEvent) {
                    icon = '✅';
                    color = 'bg-green-500';
                    title = 'Email Delivered';
                    details = `Successfully delivered to ${currentEmail.recipient_email}`;
                  } else if (isProcessedEvent) {
                    icon = '⚙️';
                    color = 'bg-blue-500';
                    title = 'Email Processed';
                    details = 'Email processed by SendGrid';
                  } else {
                    icon = '📊';
                    color = 'bg-gray-500';
                    title = `${event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)} Event`;
                    details = `Event tracked: ${event.event_type}`;
                  }

                  return (
                    <div key={event.id} className="flex items-center gap-3">
                      <div className={`w-2 h-2 ${color} rounded-full`}></div>
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          <span>{icon}</span>
                          {title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(eventTime, 'MMM d, yyyy HH:mm:ss')}
                        </div>
                        {details && (
                          <div className="text-xs text-gray-500 mt-1">
                            {details}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Status Events */}
                {currentEmail.status === 'bounced' && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Email Bounced</div>
                      <div className="text-sm text-muted-foreground">
                        {currentEmail.bounce_reason || 'Email bounced'}
                      </div>
                    </div>
                  </div>
                )}

                {currentEmail.status === 'failed' && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Email Failed</div>
                      <div className="text-sm text-muted-foreground">
                        {currentEmail.bounce_reason || 'Email failed to send'}
                      </div>
                    </div>
                  </div>
                )}

                {emailAnalytics.length === 0 && !currentEmail.sent_at && (
                  <div className="text-sm text-gray-500 italic">
                    No activity events recorded yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Recommendations for Window Covering Business
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRecommendations ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                  Generating personalized recommendations...
                </div>
              ) : aiRecommendations.length > 0 ? (
                <div className="space-y-3">
                  {aiRecommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-center w-6 h-6 bg-purple-600 text-white text-sm font-medium rounded-full mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{recommendation}</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-xs text-blue-700">
                        <strong>Industry Focus:</strong> These recommendations are tailored for window covering businesses, 
                        considering seasonal patterns, design consultation needs, and measurement appointment scheduling.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Recommendations will appear once there's engagement data to analyze.
                </div>
              )}
            </CardContent>
          </Card>

           {/* Email Content */}
           <Card>
             <CardHeader>
               <CardTitle>Email Content</CardTitle>
             </CardHeader>
             <CardContent>
               <div 
                 className="prose max-w-none"
                 dangerouslySetInnerHTML={{ __html: currentEmail.content || 'No content available' }}
               />
             </CardContent>
           </Card>

           {/* Actions */}
           <div className="flex justify-between">
             <div className="flex gap-2">
               {client && (
                 <Button variant="outline" onClick={handleViewClient}>
                   <User className="h-4 w-4 mr-2" />
                   View Client Profile
                 </Button>
               )}
               {activeProjects.length > 0 && (
                 <Button variant="outline" onClick={() => handleViewProject(activeProjects[0].id)}>
                   <Building className="h-4 w-4 mr-2" />
                   View Active Project
                 </Button>
               )}
             </div>
             
             {onResendEmail && currentEmail.status !== 'sent' && currentEmail.status !== 'delivered' && (
               <Button 
                 onClick={() => onResendEmail(currentEmail)}
                 disabled={isResending}
                 className="flex items-center gap-2"
               >
                 <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                 {isResending ? 'Resending...' : 'Resend Email'}
               </Button>
             )}
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
