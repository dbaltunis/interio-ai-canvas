import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Loader2, AlertCircle, X } from 'lucide-react';
import { useSendWhatsApp } from '@/hooks/useSendWhatsApp';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WhatsAppMediaUpload } from './WhatsAppMediaUpload';
import { WhatsAppStatusIcon } from './WhatsAppStatusIcon';
import { cn } from '@/lib/utils';

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
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [message, setMessage] = useState('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [mediaUrl, setMediaUrl] = useState(defaultMediaUrl || '');

  const sendWhatsApp = useSendWhatsApp();

  // Update mediaUrl when defaultMediaUrl changes
  useEffect(() => {
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
      
      return (data || []).map(t => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables : JSON.parse(t.variables as string || '[]')
      })) as WhatsAppTemplate[];
    },
    enabled: open,
  });

  // Get the selected template
  const template = templates.find((t) => t.id === selectedTemplate);

  // Reset variables when template changes and auto-fill message
  useEffect(() => {
    if (template) {
      const initialVars: Record<string, string> = {};
      template.variables.forEach((v: string) => {
        if (v === 'client_name') {
          initialVars[v] = client.name;
        } else {
          initialVars[v] = '';
        }
      });
      setTemplateVariables(initialVars);
      
      // Auto-fill message from template
      let content = template.content;
      for (const [key, value] of Object.entries(initialVars)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
      }
      setMessage(content);
    }
  }, [template, client.name]);

  // Generate preview message
  const getPreviewMessage = () => {
    if (!message) return '';
    
    if (selectedTemplate && template) {
      let preview = template.content;
      for (const [key, value] of Object.entries(templateVariables)) {
        preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
      }
      return preview;
    }
    
    return message;
  };

  const handleTemplateSelect = (templateId: string) => {
    if (selectedTemplate === templateId) {
      // Deselect
      setSelectedTemplate('');
      setMessage('');
    } else {
      setSelectedTemplate(templateId);
    }
  };

  const handleSend = async () => {
    if (!client.phone) return;

    try {
      await sendWhatsApp.mutateAsync({
        to: client.phone,
        message: message || undefined,
        templateId: selectedTemplate || undefined,
        templateVariables: selectedTemplate ? templateVariables : undefined,
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

  const canSend = client.phone && message.trim();

  const formatPhoneNumber = (phone: string) => {
    // Format for display: +1 (555) 123-4567
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden">
        {/* Header - WhatsApp style */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#075E54] dark:bg-[#1F2C34] text-white">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/20">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{client.name}</h3>
            <p className="text-xs text-white/70">{client.phone ? formatPhoneNumber(client.phone) : 'No phone'}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {!client.phone ? (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This client doesn't have a phone number. Add a phone number to send WhatsApp messages.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            {/* Chat preview area */}
            <div className="flex-1 p-4 bg-[#ECE5DD] dark:bg-[#0B141A] min-h-[200px] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9Ii4wNSIgZD0iTTIwIDIwbTIgMGEyIDIgMCAxIDAgLTQgMGEyIDIgMCAxIDAgNCAwIi8+PC9nPjwvc3ZnPg==')]">
              {getPreviewMessage() && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-[#DCF8C6] dark:bg-[#005C4B] rounded-lg rounded-tr-none p-3 shadow-sm">
                    <p className="text-sm text-[#303030] dark:text-white whitespace-pre-wrap break-words">
                      {getPreviewMessage()}
                    </p>
                    {mediaUrl && (
                      <div className="mt-2 rounded overflow-hidden">
                        {/\.(jpg|jpeg|png|gif|webp)$/i.test(mediaUrl) ? (
                          <img src={mediaUrl} alt="Attachment" className="max-h-32 rounded" />
                        ) : (
                          <div className="flex items-center gap-2 p-2 bg-black/5 rounded text-xs">
                            📎 Attachment
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-[#667781] dark:text-white/60">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <WhatsAppStatusIcon status="pending" className="opacity-60" />
                    </div>
                  </div>
                </div>
              )}
              
              {!getPreviewMessage() && (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Type a message or select a template
                </div>
              )}
            </div>

            {/* Quick templates */}
            {templates.length > 0 && (
              <div className="px-3 py-2 border-t border-border bg-background">
                <ScrollArea className="w-full">
                  <div className="flex gap-2 pb-1">
                    {loadingTemplates ? (
                      <div className="text-xs text-muted-foreground px-2">Loading templates...</div>
                    ) : (
                      templates.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => handleTemplateSelect(t.id)}
                          className={cn(
                            "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                            "border hover:border-green-500",
                            selectedTemplate === t.id
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-muted/50 text-foreground border-border hover:bg-muted"
                          )}
                        >
                          {t.name}
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Media preview */}
            {mediaUrl && (
              <div className="px-3 py-2 border-t border-border bg-muted/30">
                <WhatsAppMediaUpload
                  currentMediaUrl={mediaUrl}
                  onMediaUploaded={setMediaUrl}
                  onRemoveMedia={() => setMediaUrl('')}
                />
              </div>
            )}

            {/* Input area */}
            <div className="flex items-end gap-2 p-3 border-t border-border bg-background">
              {/* Media upload buttons */}
              <WhatsAppMediaUpload
                currentMediaUrl=""
                onMediaUploaded={setMediaUrl}
                onRemoveMedia={() => setMediaUrl('')}
              />

              {/* Message input */}
              <div className="flex-1 relative">
                <Textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    // Clear template selection if user edits
                    if (selectedTemplate) {
                      setSelectedTemplate('');
                    }
                  }}
                  placeholder="Type a message..."
                  className="min-h-[40px] max-h-[120px] resize-none rounded-2xl pr-4 py-2.5 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-green-500"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && canSend) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
              </div>

              {/* Send button */}
              <Button
                onClick={handleSend}
                disabled={!canSend || sendWhatsApp.isPending}
                size="icon"
                className="h-10 w-10 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white flex-shrink-0"
              >
                {sendWhatsApp.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* 24-hour window notice */}
            {!selectedTemplate && message && (
              <div className="px-3 pb-2 bg-background">
                <p className="text-[10px] text-muted-foreground text-center">
                  Free-form messages require the client to have messaged you within 24 hours
                </p>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
