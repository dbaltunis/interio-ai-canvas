import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Send, 
  Mail, 
  Users, 
  BarChart3, 
  Eye, 
  Clock, 
  MousePointer, 
  TrendingUp,
  Plus,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Settings,
  Palette,
  Copy,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmails, useEmailKPIs, useCreateEmail } from "@/hooks/useEmails";
import { useEmailCampaigns, useCreateEmailCampaign } from "@/hooks/useEmailCampaigns";
import { useEmailTemplates, useCreateEmailTemplate } from "@/hooks/useEmailTemplates";
import { useClients } from "@/hooks/useClients";
import { useSendEmail } from "@/hooks/useSendEmail";
import { useEmailSettings, useUpdateEmailSettings } from "@/hooks/useEmailSettings";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { predefinedEmailTemplates } from "@/data/emailTemplates";
import { EmailPreviewDialog } from "./email-components/EmailPreviewDialog";
import { ClientSelector } from "./email-components/ClientSelector";
import { QuoteSelector } from "./email-components/QuoteSelector";

export const EmailsTab = () => {
  const [newEmail, setNewEmail] = useState({
    recipient_email: "",
    subject: "",
    content: "",
    template_id: ""
  });
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [emailSettingsOpen, setEmailSettingsOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState<any[]>([]);
  const [selectedQuotes, setSelectedQuotes] = useState<any[]>([]);
  const [newEmailSettings, setNewEmailSettings] = useState({
    from_email: "",
    from_name: "",
    reply_to_email: "",
    signature: ""
  });

  const { toast } = useToast();
  const { data: emails, isLoading: emailsLoading } = useEmails();
  const { data: emailKPIs, isLoading: kpisLoading } = useEmailKPIs();
  const { data: campaigns } = useEmailCampaigns();
  const { data: templates } = useEmailTemplates();
  const { data: clients } = useClients();
  const { data: emailSettings } = useEmailSettings();
  const sendEmailMutation = useSendEmail();
  const createEmailMutation = useCreateEmail();
  const createCampaignMutation = useCreateEmailCampaign();
  const createTemplateMutation = useCreateEmailTemplate();
  const updateEmailSettingsMutation = useUpdateEmailSettings();

  // Load email settings when available
  useEffect(() => {
    if (emailSettings) {
      setNewEmailSettings({
        from_email: emailSettings.from_email || "",
        from_name: emailSettings.from_name || "",
        reply_to_email: emailSettings.reply_to_email || "",
        signature: emailSettings.signature || ""
      });
    }
  }, [emailSettings]);

  const handleSendEmail = async () => {
    if (!newEmail.recipient_email || !newEmail.subject || !newEmail.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    console.log("Sending email with data:", newEmail);

    // Use the real send email mutation that calls the edge function
    sendEmailMutation.mutate({
      to: newEmail.recipient_email,
      subject: newEmail.subject,
      content: newEmail.content,
      template_id: newEmail.template_id || undefined
    });

    // Reset form
    setNewEmail({
      recipient_email: "",
      subject: "",
      content: "",
      template_id: ""
    });
  };

  const handleCreateCampaign = () => {
    createCampaignMutation.mutate({
      name: "New Campaign",
      subject: "Campaign Subject",
      content: "Campaign content...",
      status: 'draft',
      recipient_count: 0
    });
  };

  const handleUseTemplate = (templateId: string) => {
    const template = predefinedEmailTemplates.find(t => t.id === templateId);
    if (template) {
      setNewEmail(prev => ({
        ...prev,
        subject: template.subject,
        content: template.content
      }));
      setTemplateDialogOpen(false);
      toast({
        title: "Template Applied",
        description: `${template.name} template has been applied to your email.`
      });
    }
  };

  const handleSaveEmailSettings = () => {
    updateEmailSettingsMutation.mutate({
      ...newEmailSettings,
      active: true
    });
    setEmailSettingsOpen(false);
  };

  const handleCreateTemplateFromPredefined = (templateData: any) => {
    createTemplateMutation.mutate({
      name: templateData.name,
      subject: templateData.subject,
      content: templateData.content,
      template_type: templateData.template_type,
      variables: templateData.variables,
      active: true
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'sent':
        return 'default';
      case 'opened':
        return 'secondary';
      case 'clicked':
        return 'outline';
      case 'bounced':
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (kpisLoading) {
    return <div className="flex items-center justify-center h-64">Loading email data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Total Sent</p>
                <p className="text-lg font-bold">{emailKPIs?.totalSent || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Open Rate</p>
                <p className="text-lg font-bold">{emailKPIs?.openRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MousePointer className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Click Rate</p>
                <p className="text-lg font-bold">{emailKPIs?.clickRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Avg Time</p>
                <p className="text-lg font-bold">{emailKPIs?.avgTimeSpent || "0m 0s"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Delivered</p>
                <p className="text-lg font-bold">{emailKPIs?.delivered || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Bounced</p>
                <p className="text-lg font-bold">{emailKPIs?.bounced || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Settings Banner */}
      {!emailSettings?.from_email && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Email Settings Required</p>
                  <p className="text-sm text-yellow-700">Configure your sender email address to start sending emails.</p>
                </div>
              </div>
              <Button onClick={() => setEmailSettingsOpen(true)} className="bg-yellow-600 hover:bg-yellow-700">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Email Interface */}
      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Compose Email Tab */}
        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compose Email</CardTitle>
                  <CardDescription>Send individual emails or schedule campaigns</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Palette className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Choose Email Template</DialogTitle>
                        <DialogDescription>
                          Select from our professionally designed templates for your industry
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {predefinedEmailTemplates.map((template) => (
                          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-lg">{template.name}</CardTitle>
                                  <Badge variant="outline" className="mt-1">{template.category}</Badge>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleUseTemplate(template.id)}
                                >
                                  Use Template
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {template.variables.slice(0, 3).map((variable) => (
                                  <Badge key={variable} variant="secondary" className="text-xs">
                                    {variable}
                                  </Badge>
                                ))}
                                {template.variables.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{template.variables.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={emailSettingsOpen} onOpenChange={setEmailSettingsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Email Settings
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Email Settings</DialogTitle>
                        <DialogDescription>
                          Configure your sender information for outgoing emails
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="from_email">From Email Address</Label>
                          <Input
                            id="from_email"
                            type="email"
                            placeholder="your-email@company.com"
                            value={newEmailSettings.from_email}
                            onChange={(e) => setNewEmailSettings(prev => ({ ...prev, from_email: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="from_name">From Name</Label>
                          <Input
                            id="from_name"
                            placeholder="Your Company Name"
                            value={newEmailSettings.from_name}
                            onChange={(e) => setNewEmailSettings(prev => ({ ...prev, from_name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="reply_to_email">Reply-To Email (Optional)</Label>
                          <Input
                            id="reply_to_email"
                            type="email"
                            placeholder="replies@company.com"
                            value={newEmailSettings.reply_to_email}
                            onChange={(e) => setNewEmailSettings(prev => ({ ...prev, reply_to_email: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="signature">Email Signature (Optional)</Label>
                          <Textarea
                            id="signature"
                            placeholder="Best regards,&#10;Your Name&#10;Your Company"
                            value={newEmailSettings.signature}
                            onChange={(e) => setNewEmailSettings(prev => ({ ...prev, signature: e.target.value }))}
                          />
                        </div>
                        <Button onClick={handleSaveEmailSettings} className="w-full">
                          Save Settings
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">To</label>
                  <Input 
                    placeholder="recipient@example.com" 
                    value={newEmail.recipient_email}
                    onChange={(e) => setNewEmail(prev => ({ ...prev, recipient_email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Template</label>
                  <Select 
                    value={newEmail.template_id}
                    onValueChange={(value) => setNewEmail(prev => ({ ...prev, template_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input 
                  placeholder="Email subject..." 
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Write your email message here..." 
                  className="min-h-[200px]"
                  value={newEmail.content}
                  onChange={(e) => setNewEmail(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Send
                </Button>
                <Button 
                  onClick={handleSendEmail} 
                  className="flex items-center gap-2"
                  disabled={sendEmailMutation.isPending || !emailSettings?.from_email}
                >
                  <Send className="h-4 w-4" />
                  {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Email Templates</h3>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>
            
            {/* Predefined Templates Section */}
            <Card>
              <CardHeader>
                <CardTitle>Industry Templates</CardTitle>
                <CardDescription>
                  Professional templates designed for interior design businesses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {predefinedEmailTemplates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge variant="outline" className="text-xs mt-1">{template.category}</Badge>
                          </div>
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCreateTemplateFromPredefined(template)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleUseTemplate(template.id)}
                          >
                            Use Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Templates Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates?.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{template.template_type.replace('_', ' ')}</p>
                      </div>
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {(!templates || templates.length === 0) && (
                <Card className="col-span-full">
                  <CardContent className="p-6 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium mb-2">No Custom Templates Yet</h4>
                    <p className="text-sm">Save industry templates or create your own custom templates</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Email Campaigns</h3>
              <Button 
                onClick={handleCreateCampaign} 
                className="flex items-center gap-2"
                disabled={createCampaignMutation.isPending}
              >
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            </div>
            
            {campaigns && campaigns.length > 0 ? (
              <div className="grid gap-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-gray-600">{campaign.subject}</p>
                          <p className="text-xs text-gray-500">Recipients: {campaign.recipient_count}</p>
                        </div>
                        <Badge variant={campaign.status === 'completed' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium mb-2">No Campaigns Yet</h4>
                    <p className="text-sm mb-4">Create your first email campaign to reach multiple clients</p>
                    <Button onClick={handleCreateCampaign}>Create Campaign</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Performance Analytics</CardTitle>
                <CardDescription>Detailed insights into your email campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{emailKPIs?.totalOpenCount || 0}</div>
                    <div className="text-sm text-gray-600">Total Opens</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{emailKPIs?.totalClickCount || 0}</div>
                    <div className="text-sm text-gray-600">Total Clicks</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{emailKPIs?.deliveryRate || 0}%</div>
                    <div className="text-sm text-gray-600">Delivery Rate</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{campaigns?.length || 0}</div>
                    <div className="text-sm text-gray-600">Campaigns</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Email History</CardTitle>
              <CardDescription>Track all sent emails and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              {emailsLoading ? (
                <div className="text-center py-8">Loading email history...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Opens</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Time Spent</TableHead>
                      <TableHead>Sent At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emails && emails.length > 0 ? (
                      emails.map((email) => (
                        <TableRow key={email.id}>
                          <TableCell className="font-medium">{email.subject}</TableCell>
                          <TableCell>{email.recipient_email}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(email.status)}>
                              {email.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{email.open_count}</TableCell>
                          <TableCell>{email.click_count}</TableCell>
                          <TableCell>{formatTimeSpent(email.time_spent_seconds)}</TableCell>
                          <TableCell>
                            {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500">
                          No emails sent yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
