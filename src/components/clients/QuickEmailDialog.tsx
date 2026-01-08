import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCanSendEmails } from '@/hooks/useCanSendEmails';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, Edit } from 'lucide-react';
import { RichTextEditor } from '@/components/jobs/email-components/RichTextEditor';
import { EmailTemplateWithBusiness } from '@/components/email/EmailTemplateWithBusiness';
import { EmailSpamScore } from '@/components/email/EmailSpamScore';
import { supabase } from '@/integrations/supabase/client';
import { useGeneralEmailTemplates } from '@/hooks/useGeneralEmailTemplates';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { processTemplateVariables, getTemplateTypeLabel } from '@/utils/emailTemplateVariables';
import { useCampaignAssistant } from '@/hooks/useCampaignAssistant';

interface QuickEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    id: string;
    name: string;
    email?: string;
  };
}

export const QuickEmailDialog = ({ open, onOpenChange, client }: QuickEmailDialogProps) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [toEmail, setToEmail] = useState(client.email || '');
  const [sending, setSending] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [editorKey, setEditorKey] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [spamResult, setSpamResult] = useState<{ score: number; issues: string[]; suggestions: string[] } | null>(null);
  const [isCheckingSpam, setIsCheckingSpam] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canSendEmails, isPermissionLoaded } = useCanSendEmails();
  const { checkSpamRisk } = useCampaignAssistant();
  
  const { data: templates, isLoading: templatesLoading } = useGeneralEmailTemplates();
  const { data: businessSettings } = useBusinessSettings();

  // Pre-fill with lead_initial_contact template when dialog opens
  useEffect(() => {
    if (open && templates && templates.length > 0) {
      // Find lead_initial_contact template, or use first available
      const leadTemplate = templates.find(t => t.template_type === 'lead_initial_contact');
      const defaultTemplate = leadTemplate || templates[0];
      
      if (defaultTemplate && !selectedTemplateId) {
        setSelectedTemplateId(defaultTemplate.id);
        applyTemplate(defaultTemplate);
      }
    }
  }, [open, templates]);

  // Reset form when dialog closes, reset toEmail when it opens
  useEffect(() => {
    if (!open) {
      setSubject('');
      setMessage('');
      setSelectedTemplateId('');
      setEditorKey(prev => prev + 1);
      setShowPreview(false);
      setSpamResult(null);
    } else {
      setToEmail(client.email || '');
    }
  }, [open, client.email]);

  const applyTemplate = (template: { subject: string; content: string }) => {
    const templateData = {
      client: {
        name: client.name,
        email: client.email,
      },
      company: {
        name: businessSettings?.company_name || 'Our Company',
        phone: businessSettings?.business_phone || '',
        email: businessSettings?.business_email || '',
      },
      sender: {
        name: businessSettings?.company_name || 'Your Team',
        signature: `Best regards,\n${businessSettings?.company_name || 'Your Team'}`,
      },
    };

    setSubject(processTemplateVariables(template.subject, templateData));
    setMessage(processTemplateVariables(template.content, templateData));
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    
    if (templateId === 'blank') {
      setSubject('');
      setMessage('');
      return;
    }
    
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      applyTemplate(template);
    }
  };

  const handleSend = async () => {
    if (!isPermissionLoaded || !canSendEmails) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to send emails.",
        variant: "destructive",
      });
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both subject and message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-client-email', {
        body: {
          to: toEmail,
          clientName: client.name,
          subject: subject,
          message: message,
        },
      });

      if (error) throw error;

      // Log this email in the database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('emails').insert({
          user_id: user.id,
          client_id: client.id,
          recipient_email: toEmail,
          subject: subject,
          content: message,
          status: 'sent',
          sent_at: new Date().toISOString(),
        });
      }

      toast({
        title: "Email sent!",
        description: `Email sent successfully to ${client.name}`,
      });

      // Reset form and close dialog
      setSubject('');
      setMessage('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleCheckSpam = async () => {
    if (!subject && !message) return;
    
    setIsCheckingSpam(true);
    try {
      const result = await checkSpamRisk(subject, message);
      if (result) {
        setSpamResult(result);
      }
    } catch (error) {
      console.error('Error checking spam:', error);
    } finally {
      setIsCheckingSpam(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Email to {client.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {isPermissionLoaded && !canSendEmails && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don't have permission to send emails.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="template">Email Template</Label>
            <Select 
              value={selectedTemplateId} 
              onValueChange={handleTemplateChange}
              disabled={templatesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={templatesLoading ? "Loading templates..." : "Select a template"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blank">Blank Email</SelectItem>
                {templates?.filter(t => t.active).map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {getTemplateTypeLabel(template.template_type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="email"
              placeholder="Enter recipient email..."
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label htmlFor="message">Message</Label>
                <div className="flex ml-3 bg-muted rounded-md p-0.5">
                  <Button
                    type="button"
                    variant={!showPreview ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setShowPreview(false)}
                    className="h-6 px-2 text-xs gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant={showPreview ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setShowPreview(true)}
                    className="h-6 px-2 text-xs gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                </div>
              </div>
              <EmailSpamScore
                result={spamResult}
                isLoading={isCheckingSpam}
                onCheck={handleCheckSpam}
              />
            </div>
            
            {showPreview ? (
              <div className="border rounded-md max-h-[280px] overflow-y-auto">
                <EmailTemplateWithBusiness
                  subject={subject}
                  content={message}
                  clientData={{
                    name: client.name,
                    email: client.email || '',
                    company_name: ''
                  }}
                />
              </div>
            ) : (
              <RichTextEditor
                key={editorKey}
                value={message}
                onChange={(val) => {
                  setMessage(val);
                  setSpamResult(null); // Clear spam result when content changes
                }}
                placeholder="Enter your message..."
                className="max-h-[280px]"
              />
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending || !subject.trim() || !message.trim() || !isPermissionLoaded || !canSendEmails}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
