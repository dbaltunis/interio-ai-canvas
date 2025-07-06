import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Calendar, 
  Eye, 
  Users,
  FileText,
  Paperclip,
  X
} from "lucide-react";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "./RichTextEditor";

interface EmailComposerProps {
  newEmail: any;
  setNewEmail: (email: any) => void;
  selectedClients: any[];
  selectedQuotes: any[];
  onSendEmail: (attachments?: File[]) => void;
  onPreviewEmail: () => void;
  sendEmailMutation: any;
  emailSettings: any;
}

export const EmailComposer = ({
  newEmail,
  setNewEmail,
  selectedClients,
  selectedQuotes,
  onSendEmail,
  onPreviewEmail,
  sendEmailMutation,
  emailSettings
}: EmailComposerProps) => {
  const { data: templates } = useEmailTemplates();
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setNewEmail({
        ...newEmail,
        subject: template.subject,
        content: template.content,
        template_id: templateId
      });
      toast({
        title: "Template Applied",
        description: `${template.name} has been applied to your email.`
      });
    }
  };

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 10MB and will be skipped.`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
    event.target.value = ''; // Reset input
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="shadow-lg border-brand-secondary/20">
      <CardHeader className="bg-gradient-to-r from-brand-secondary/10 to-brand-primary/5 border-b border-brand-secondary/20">
        <CardTitle className="flex items-center gap-2 text-brand-primary">
          <FileText className="h-5 w-5" />
          Compose Email
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Recipients Summary */}
        {selectedClients.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-brand-secondary/10 to-brand-primary/5 rounded-lg border border-brand-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-brand-primary" />
              <span className="text-sm font-medium text-brand-primary">Recipients ({selectedClients.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedClients.map((client, index) => (
                <Badge key={index} variant="secondary" className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                  {client.name || client.email}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-primary">Additional Recipients</label>
            <Input 
              placeholder="additional@example.com (optional)" 
              value={newEmail.recipient_email}
              onChange={(e) => setNewEmail({ ...newEmail, recipient_email: e.target.value })}
              className="border-brand-secondary/30 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-primary">Email Template</label>
            <Select 
              value={newEmail.template_id}
              onValueChange={handleTemplateSelect}
            >
              <SelectTrigger className="border-brand-secondary/30 focus:border-brand-primary">
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-primary">Subject Line</label>
          <Input 
            placeholder="Enter your email subject..." 
            value={newEmail.subject}
            onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
            className="border-brand-secondary/30 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
        
        <div className="space-y-3">
          <label className="text-sm font-medium text-brand-primary">Email Content</label>
          <RichTextEditor
            value={newEmail.content}
            onChange={(content) => setNewEmail({ ...newEmail, content })}
            placeholder="Start typing your email message..."
            className="min-h-[300px] lg:min-h-[350px]"
          />
          <p className="text-xs text-brand-neutral">Use the toolbar above to format your email with bold, italic, lists, links, and more</p>
        </div>

        {/* File Attachments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-brand-primary">File Attachments</label>
            <div className="relative">
              <input
                type="file"
                multiple
                onChange={handleFileAttachment}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload"
              />
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 relative z-10 pointer-events-none border-brand-secondary/30 hover:bg-brand-secondary/10"
              >
                <Paperclip className="h-4 w-4" />
                <span className="hidden sm:inline">Attach Files</span>
                <span className="sm:hidden">Attach</span>
              </Button>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    className="flex-shrink-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <p className="text-xs text-gray-500">
                Max file size: 10MB per file. Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF
              </p>
            </div>
          )}
        </div>

        {/* Quote Details Summary */}
        {selectedQuotes.length > 0 && (
          <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 text-emerald-800 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Attached Quote Details
              </h4>
              <div className="space-y-2">
                {selectedQuotes.map(quote => (
                  <div key={quote.id} className="text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-emerald-800">Quote #{quote.quote_number}</span>
                      <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                        ${quote.total_amount.toLocaleString()}
                      </Badge>
                    </div>
                    <p className="text-emerald-600">Client: {quote.clients?.name}</p>
                    <p className="text-emerald-600">Status: {quote.status}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Action Buttons - All in One Line */}
        <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-brand-secondary/20">
          <div className="flex flex-wrap gap-2">
            {/* Attach File Button */}
            <div className="relative">
              <input
                type="file"
                multiple
                onChange={handleFileAttachment}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload-main"
              />
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 relative z-10 pointer-events-none border-brand-secondary/30 hover:bg-brand-secondary/10"
              >
                <Paperclip className="h-4 w-4" />
                Attach File
              </Button>
            </div>
            
            {/* Attach Quote Button - only show if quotes available */}
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 border-brand-secondary/30 hover:bg-brand-secondary/10"
            >
              <FileText className="h-4 w-4" />
              Attach Quote
            </Button>
            
            {/* Select Recipients Button */}
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 border-brand-secondary/30 hover:bg-brand-secondary/10"
            >
              <Users className="h-4 w-4" />
              Recipients
            </Button>
            
            {/* Schedule Send Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 border-brand-secondary/30 hover:bg-brand-secondary/10"
            >
              <Calendar className="h-4 w-4" />
              Schedule
            </Button>
            
            {/* Preview Button */}
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 border-brand-secondary/30 hover:bg-brand-secondary/10"
              onClick={onPreviewEmail}
              disabled={!newEmail.content}
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>
          
          {/* Send Email Button - Prominent */}
          <Button 
            onClick={() => onSendEmail(attachments)} 
            size="lg"
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-accent text-white font-semibold px-8 py-3 shadow-lg min-w-[140px] justify-center"
            disabled={sendEmailMutation.isPending || !emailSettings?.from_email}
          >
            <Send className="h-5 w-5" />
            {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};