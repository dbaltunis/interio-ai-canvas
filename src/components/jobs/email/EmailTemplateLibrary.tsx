import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Edit, Info, Loader2, Mail, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useGeneralEmailTemplates, EmailTemplate } from "@/hooks/useGeneralEmailTemplates";
import { EmailTemplateEditor } from "@/components/email-templates/EmailTemplateEditor";
import { getTemplateTypeLabel } from "@/utils/emailTemplateVariables";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Helper to get usage context for a template type
const getTemplateUsageContext = (templateType: string): string => {
  const usageMap: Record<string, string> = {
    'quote_sent': 'Quote emails to clients',
    'quote_approved': 'Auto-sent when quote accepted',
    'quote_rejected': 'Auto-sent when quote declined',
    'project_update': 'Job page email composer',
    'installation_reminder': 'Scheduled reminders',
    'payment_reminder': 'Invoice follow-ups',
    'welcome': 'New client onboarding',
    'custom': 'Manual campaigns only',
  };
  return usageMap[templateType] || 'Manual use';
};

interface EmailTemplateLibraryProps {
  onSelectTemplate?: (template: { subject: string; content: string }) => void;
}

export const EmailTemplateLibrary = ({ onSelectTemplate }: EmailTemplateLibraryProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: templates, isLoading } = useGeneralEmailTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testingTemplate, setTestingTemplate] = useState<EmailTemplate | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditorOpen(true);
  };

  const handleUse = (template: EmailTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate({ subject: template.subject, content: template.content });
      toast({
        title: "Template Applied",
        description: "Template content has been loaded into the composer",
      });
    }
  };

  const handleOpenTestDialog = (template: EmailTemplate) => {
    setTestingTemplate(template);
    setTestEmail('');
    setTestDialogOpen(true);
  };

  const handleSendTestEmail = async () => {
    if (!testEmail || !testingTemplate) return;

    setIsSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          subject: `[TEST] ${testingTemplate.subject}`,
          html: testingTemplate.content,
        }
      });

      if (error) throw error;

      toast({
        title: "Test Email Sent",
        description: `Test email sent to ${testEmail}`,
      });
      setTestDialogOpen(false);
    } catch (error) {
      console.error('Failed to send test email:', error);
      toast({
        title: "Failed to Send",
        description: error instanceof Error ? error.message : "Could not send test email",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Strip HTML for preview
  const getPlainTextPreview = (html: string): string => {
    let text = html.replace(/<[^>]+>/g, ' ');
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Email Templates</h2>
          <p className="text-sm text-muted-foreground">Loading templates...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const activeTemplates = templates?.filter(t => t.active) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Email Templates</h2>
          <p className="text-sm text-muted-foreground">Use these templates in your email campaigns</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/settings?tab=email')}
        >
          Manage Templates
          <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>

      {/* Template Cards */}
      {activeTemplates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {activeTemplates.map((template) => {
            const preview = getPlainTextPreview(template.content);

            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{getTemplateTypeLabel(template.template_type)}</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="text-xs font-normal mt-1">
                              <Info className="h-3 w-3 mr-1" />
                              {getTemplateUsageContext(template.template_type)}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This template is automatically used for: {getTemplateUsageContext(template.template_type)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Subject:</span>
                      <p className="text-sm truncate">{template.subject}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Preview:</span>
                      <p className="text-sm text-muted-foreground line-clamp-2">{preview}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenTestDialog(template)}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    {onSelectTemplate && (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleUse(template)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Use
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Email Templates</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create email templates in Settings to use them here
            </p>
            <Button onClick={() => navigate('/settings?tab=email')}>
              Go to Email Settings
              <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Editor Dialog */}
      <EmailTemplateEditor
        template={selectedTemplate}
        open={editorOpen}
        onOpenChange={setEditorOpen}
      />

      {/* Test Email Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email to verify this template works correctly
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input 
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter your email address..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendTestEmail}
                disabled={!testEmail.trim() || isSendingTest}
              >
                {isSendingTest ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Legacy export for backwards compatibility with campaigns
export const getCampaignTemplates = () => {
  // This is now just for backwards compatibility - real templates come from database
  return {
    newsletter: {
      id: 'newsletter',
      label: 'Newsletter',
      description: 'Share updates with clients',
      icon: Send,
      name: 'Newsletter Campaign',
      type: 'announcement' as const,
      subject: 'Latest Updates from {{company_name}}',
      content: `<p>Hi {{client_name}},</p><p>We're excited to share the latest updates!</p>`,
    },
    followup: {
      id: 'followup',
      label: 'Follow-up',
      description: 'Quote and project updates',
      icon: Send,
      name: 'Follow-up Campaign',
      type: 'follow-up' as const,
      subject: 'Following up on your recent inquiry',
      content: `<p>Hi {{client_name}},</p><p>I wanted to follow up on our recent conversation.</p>`,
    },
    promotion: {
      id: 'promotion',
      label: 'Promotion',
      description: 'Special offers and services',
      icon: Send,
      name: 'Promotional Campaign',
      type: 'outreach' as const,
      subject: 'Special Offer for You!',
      content: `<p>Hi {{client_name}},</p><p>We have an exclusive offer just for you!</p>`,
    },
  };
};

export type CampaignTemplateKey = 'newsletter' | 'followup' | 'promotion';
export type CampaignTemplate = ReturnType<typeof getCampaignTemplates>[CampaignTemplateKey];
