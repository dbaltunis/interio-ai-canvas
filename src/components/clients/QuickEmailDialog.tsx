import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGeneralEmailTemplates } from '@/hooks/useGeneralEmailTemplates';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { processTemplateVariables, getTemplateTypeLabel } from '@/utils/emailTemplateVariables';

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
  const [sending, setSending] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const { toast } = useToast();
  
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

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSubject('');
      setMessage('');
      setSelectedTemplateId('');
    }
  }, [open]);

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
          to: client.email,
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
          recipient_email: client.email!,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Email to {client.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
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
              value={client.email || ''}
              disabled
              className="bg-muted"
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
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
            />
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
              disabled={sending || !subject.trim() || !message.trim()}
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
