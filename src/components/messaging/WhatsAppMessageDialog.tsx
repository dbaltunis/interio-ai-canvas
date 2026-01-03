import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Image, Loader2, AlertCircle } from 'lucide-react';
import { useSendWhatsApp } from '@/hooks/useSendWhatsApp';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WhatsAppMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    id: string;
    name: string;
    phone?: string;
  };
  projectId?: string;
  quoteId?: string;
  defaultMediaUrl?: string;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  template_type: string;
  content: string;
  variables: string[];
  status: string;
  is_shared_template: boolean;
}

export const WhatsAppMessageDialog: React.FC<WhatsAppMessageDialogProps> = ({
  open,
  onOpenChange,
  client,
  projectId,
  quoteId,
  defaultMediaUrl,
}) => {
  const [messageType, setMessageType] = useState<'template' | 'freeform'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [message, setMessage] = useState('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [mediaUrl, setMediaUrl] = useState(defaultMediaUrl || '');

  const sendWhatsApp = useSendWhatsApp();

  // Update mediaUrl when defaultMediaUrl changes
  React.useEffect(() => {
    if (defaultMediaUrl) {
      setMediaUrl(defaultMediaUrl);
    }
  }, [defaultMediaUrl]);

  // Fetch templates
  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('status', 'approved')
        .order('name');

      if (error) throw error;
      
      // Parse the variables field properly
      return (data || []).map(t => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables : JSON.parse(t.variables as string || '[]')
      })) as WhatsAppTemplate[];
    },
    enabled: open,
  });

  // Get the selected template
  const template = templates.find((t) => t.id === selectedTemplate);

  // Reset variables when template changes
  useEffect(() => {
    if (template) {
      const initialVars: Record<string, string> = {};
      template.variables.forEach((v: string) => {
        // Pre-fill client_name if available
        if (v === 'client_name') {
          initialVars[v] = client.name;
        } else {
          initialVars[v] = '';
        }
      });
      setTemplateVariables(initialVars);
    }
  }, [template, client.name]);

  // Generate preview message
  const getPreviewMessage = () => {
    if (messageType === 'freeform') return message;
    if (!template) return '';

    let preview = template.content;
    for (const [key, value] of Object.entries(templateVariables)) {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
    }
    return preview;
  };

  const handleSend = async () => {
    if (!client.phone) return;

    try {
      await sendWhatsApp.mutateAsync({
        to: client.phone,
        message: messageType === 'freeform' ? message : undefined,
        templateId: messageType === 'template' ? selectedTemplate : undefined,
        templateVariables: messageType === 'template' ? templateVariables : undefined,
        mediaUrl: mediaUrl || undefined,
        clientId: client.id,
        projectId: projectId,
      });
      
      onOpenChange(false);
      // Reset form
      setMessage('');
      setSelectedTemplate('');
      setTemplateVariables({});
      setMediaUrl(defaultMediaUrl || '');
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const canSend = client.phone && (
    (messageType === 'freeform' && message.trim()) ||
    (messageType === 'template' && selectedTemplate)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Send WhatsApp to {client.name}
            <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-200">
              Enterprise
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {!client.phone && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This client doesn't have a phone number. Add a phone number to send WhatsApp messages.
            </AlertDescription>
          </Alert>
        )}

        {client.phone && (
          <div className="space-y-4">
            {/* Message Type Selection */}
            <div className="flex gap-2">
              <Button
                variant={messageType === 'template' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMessageType('template')}
              >
                Use Template
              </Button>
              <Button
                variant={messageType === 'freeform' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMessageType('freeform')}
              >
                Free-form Message
              </Button>
            </div>

            {messageType === 'freeform' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Free-form messages only work if the client has messaged you within the last 24 hours (WhatsApp policy).
                </AlertDescription>
              </Alert>
            )}

            {/* Template Selection */}
            {messageType === 'template' && (
              <div className="space-y-3">
                <div>
                  <Label>Select Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingTemplates ? "Loading..." : "Choose a template"} />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                          {t.is_shared_template && (
                            <span className="ml-2 text-xs text-muted-foreground">(Pre-approved)</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Template Variables */}
                {template && template.variables.length > 0 && (
                  <div className="space-y-2">
                    <Label>Fill in variables</Label>
                    {template.variables.map((variable: string) => (
                      <div key={variable}>
                        <Label className="text-xs text-muted-foreground capitalize">
                          {variable.replace(/_/g, ' ')}
                        </Label>
                        <Input
                          value={templateVariables[variable] || ''}
                          onChange={(e) =>
                            setTemplateVariables((prev) => ({
                              ...prev,
                              [variable]: e.target.value,
                            }))
                          }
                          placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Free-form Message */}
            {messageType === 'freeform' && (
              <div>
                <Label>Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={4}
                />
              </div>
            )}

            {/* Media URL (optional) */}
            <div>
              <Label className="flex items-center gap-1">
                <Image className="h-3 w-3" />
                Media URL (optional)
              </Label>
              <Input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add an image or document URL to send with the message
              </p>
            </div>

            {/* Preview */}
            {getPreviewMessage() && (
              <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Preview</p>
                <p className="text-sm text-green-900 dark:text-green-100 whitespace-pre-wrap">
                  {getPreviewMessage()}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!canSend || sendWhatsApp.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {sendWhatsApp.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send WhatsApp
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
