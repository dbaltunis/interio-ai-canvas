
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, Eye, MousePointer, Clock, RefreshCw, User, Building, Phone, MapPin, ExternalLink, Download, Camera, Smartphone, Activity, Globe, Monitor, Circle, CheckCircle, XCircle, LogOut } from "lucide-react";
import { format } from "date-fns";
import { EmailStatusBadge } from "./EmailStatusBadge";
import { EmailAnalyticsDetail } from "./EmailAnalyticsDetail";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEmailAnalytics } from "@/hooks/useEmailAnalytics";
import type { Email } from "@/hooks/useEmails";

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
  const [refreshedEmail, setRefreshedEmail] = useState<Email | null>(email);
  const { data: emailAnalytics = [] } = useEmailAnalytics(email?.id || "");

  // Auto-refresh email data every 10 seconds
  useEffect(() => {
    if (!email?.id || !open) return;

    const refreshEmailData = async () => {
      try {
        const { data, error } = await supabase
          .from('emails')
          .select('*')
          .eq('id', email.id)
          .single();
        
        if (!error && data) {
          setRefreshedEmail(data as Email);
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

          {/* Email Analytics KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Eye className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Opens</span>
                </div>
                <div className="text-2xl font-bold">{currentEmail.open_count || 0}</div>
                <div className="text-sm text-muted-foreground">
                  {emailAnalytics.filter(e => e.event_type === 'open').length} unique
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <MousePointer className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-600">Clicks</span>
                </div>
                <div className="text-2xl font-bold">{currentEmail.click_count || 0}</div>
                <div className="text-sm text-muted-foreground">
                  {emailAnalytics.filter(e => e.event_type === 'click').length} events
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Time Spent</span>
                </div>
                <div className="text-2xl font-bold">{Math.floor((currentEmail.time_spent_seconds || 0) / 60)}m</div>
                <div className="text-sm text-muted-foreground">
                  {currentEmail.time_spent_seconds || 0}s total
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Download className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Downloads</span>
                </div>
                <div className="text-2xl font-bold">
                  {emailAnalytics.filter(e => e.event_type === 'download').length}
                </div>
                <div className="text-sm text-muted-foreground">attachments</div>
              </CardContent>
            </Card>
          </div>

          {/* Additional KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Camera className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Screenshots</span>
                </div>
                <div className="text-2xl font-bold">
                  {emailAnalytics.filter(e => e.event_type === 'screenshot').length}
                </div>
                <div className="text-sm text-muted-foreground">captured</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Smartphone className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-600">Device Types</span>
                </div>
                <div className="text-2xl font-bold">
                  {(() => {
                     const devices = emailAnalytics.map(e => {
                       const ua = e.user_agent || '';
                       if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod') || ua.includes('BlackBerry') || ua.includes('Windows Phone')) return 'Mobile';
                       if (ua.includes('Tablet')) return 'Tablet';
                       return 'Desktop';
                     });
                    return new Set(devices).size;
                  })()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {(() => {
                    const devices = emailAnalytics.map(e => {
                      const ua = e.user_agent || '';
                      if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) return 'Mobile';
                      if (ua.includes('iPad') || ua.includes('Tablet')) return 'Tablet';
                      return 'Desktop';
                    });
                    const uniqueDevices = [...new Set(devices)];
                    return uniqueDevices.length > 0 ? uniqueDevices.join(', ') : 'None detected';
                  })()}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Activity className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-600">Engagement</span>
                </div>
                <div className="text-2xl font-bold">
                  {(() => {
                    const opens = currentEmail.open_count || 0;
                    const clicks = currentEmail.click_count || 0;
                    const timeSpent = currentEmail.time_spent_seconds || 0;
                    const downloads = emailAnalytics.filter(e => e.event_type === 'download').length;
                    
                    // Calculate engagement: weighted score based on interactions
                    const engagementScore = (opens * 10) + (clicks * 25) + (Math.min(timeSpent / 60, 5) * 20) + (downloads * 30);
                    return Math.min(Math.round(engagementScore), 100);
                  })()}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Score: Opens(10pts) + Clicks(25pts) + Time(20pts) + Downloads(30pts)
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Globe className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-600">Locations</span>
                </div>
                <div className="text-2xl font-bold">
                  {new Set(emailAnalytics.filter(e => e.ip_address && e.ip_address !== 'unknown').map(e => e.ip_address)).size}
                </div>
                <div className="text-sm text-muted-foreground">
                  {(() => {
                    const uniqueIPs = new Set(emailAnalytics.filter(e => e.ip_address && e.ip_address !== 'unknown').map(e => e.ip_address));
                    return uniqueIPs.size > 0 ? 'unique IP addresses' : 'IP tracking active';
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attachments Section */}
          {currentEmail.content && currentEmail.content.includes('attachment') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Email Attachments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  This email included attachments. Download tracking is active for recipient engagement.
                </div>
                {emailAnalytics.filter(e => e.event_type === 'download').length > 0 && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ {emailAnalytics.filter(e => e.event_type === 'download').length} attachment download(s) detected
                  </div>
                )}
              </CardContent>
            </Card>
          )}

            {/* Enhanced Email Analytics */}
            <EmailAnalyticsDetail analytics={emailAnalytics} />

            {/* Email Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Email Activity Timeline</CardTitle>
              </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Email Created</div>
                     <div className="text-sm text-muted-foreground">
                       {new Date(currentEmail.created_at).toLocaleString()}
                     </div>
                   </div>
                 </div>
                 
                 {currentEmail.sent_at && (
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                     <div>
                       <div className="font-medium">Email Sent</div>
                       <div className="text-sm text-muted-foreground">
                         {new Date(currentEmail.sent_at).toLocaleString()}
                       </div>
                     </div>
                   </div>
                 )}

                 {currentEmail.status === 'delivered' && (
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                     <div>
                       <div className="font-medium">Email Delivered</div>
                       <div className="text-sm text-muted-foreground">Successfully delivered to recipient</div>
                     </div>
                   </div>
                 )}

                  {/* Individual Open Events */}
                  {emailAnalytics
                    .filter(event => event.event_type === 'open')
                    .map((openEvent, index) => (
                      <div key={openEvent.id} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">
                            Email Opened {index === 0 ? '(1st time)' : index === 1 ? '(2nd time)' : index === 2 ? '(3rd time)' : `(${index + 1}th time)`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(openEvent.created_at).toLocaleString()}
                            <div className="flex items-center gap-4 mt-1 text-xs">
                              {openEvent.event_data?.screen_resolution && (
                                <span className="flex items-center gap-1">
                                  <Monitor className="h-3 w-3" />
                                  {openEvent.event_data.screen_resolution}
                                </span>
                              )}
                              {openEvent.user_agent && (
                                <span className="flex items-center gap-1">
                                  <Smartphone className="h-3 w-3" />
                                  {(() => {
                                    const ua = openEvent.user_agent;
                                    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) return 'Mobile';
                                    if (ua.includes('iPad') || ua.includes('Tablet')) return 'Tablet';
                                    if (ua.includes('Chrome')) return 'Chrome Desktop';
                                    if (ua.includes('Firefox')) return 'Firefox Desktop';
                                    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari Desktop';
                                    return 'Desktop';
                                  })()}
                                </span>
                              )}
                              {openEvent.ip_address && openEvent.ip_address !== 'unknown' && (
                                <span className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {openEvent.ip_address}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Individual Click Events */}
                  {emailAnalytics
                    .filter(event => event.event_type === 'click')
                    .map((clickEvent, index) => (
                      <div key={clickEvent.id} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">
                            Link Clicked {index === 0 ? '(1st time)' : index === 1 ? '(2nd time)' : index === 2 ? '(3rd time)' : `(${index + 1}th time)`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(clickEvent.created_at).toLocaleString()}
                            {clickEvent.event_data?.targetUrl && (
                              <div className="text-xs text-gray-400 truncate max-w-xs mt-1">
                                → {clickEvent.event_data.targetUrl}
                              </div>
                            )}
                            <div className="flex items-center gap-4 mt-1 text-xs">
                              {clickEvent.user_agent && (
                                <span className="flex items-center gap-1">
                                  <Smartphone className="h-3 w-3" />
                                  {(() => {
                                    const ua = clickEvent.user_agent;
                                    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) return 'Mobile';
                                    if (ua.includes('iPad') || ua.includes('Tablet')) return 'Tablet';
                                    if (ua.includes('Chrome')) return 'Chrome Desktop';
                                    if (ua.includes('Firefox')) return 'Firefox Desktop';
                                    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari Desktop';
                                    return 'Desktop';
                                  })()}
                                </span>
                              )}
                              {clickEvent.ip_address && clickEvent.ip_address !== 'unknown' && (
                                <span className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {clickEvent.ip_address}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Download Events */}
                  {emailAnalytics
                    .filter(event => event.event_type === 'download')
                    .map((downloadEvent, index) => (
                      <div key={downloadEvent.id} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">
                            Attachment Downloaded {index === 0 ? '(1st time)' : index === 1 ? '(2nd time)' : index === 2 ? '(3rd time)' : `(${index + 1}th time)`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(downloadEvent.created_at).toLocaleString()}
                            {downloadEvent.event_data?.attachmentName && (
                              <div className="text-xs text-gray-400">
                                📎 {downloadEvent.event_data.attachmentName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Screenshot Events */}
                  {emailAnalytics
                    .filter(event => event.event_type === 'screenshot')
                    .map((screenshotEvent, index) => (
                      <div key={screenshotEvent.id} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">
                            Screenshot Detected {index === 0 ? '(1st time)' : index === 1 ? '(2nd time)' : index === 2 ? '(3rd time)' : `(${index + 1}th time)`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(screenshotEvent.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Time Spent Events */}
                  {emailAnalytics
                    .filter(event => event.event_type === 'time_spent')
                    .map((timeEvent, index) => (
                      <div key={timeEvent.id} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">
                            Time Spent Reading
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(timeEvent.created_at).toLocaleString()}
                            {timeEvent.event_data?.timeSpent && (
                              <span className="ml-2 text-xs font-medium text-blue-600">
                                ⏱️ {Math.floor(timeEvent.event_data.timeSpent / 60)}m {timeEvent.event_data.timeSpent % 60}s
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}


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
               </div>
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
