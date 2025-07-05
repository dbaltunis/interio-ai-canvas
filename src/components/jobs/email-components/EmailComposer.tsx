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
  onSendEmail: () => void;
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
    <Card className="shadow-lg border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <FileText className="h-5 w-5" />
          Compose Email
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Recipients Summary */}
        {selectedClients.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Recipients ({selectedClients.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedClients.map((client, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                  {client.name || client.email}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Additional Recipients</label>
            <Input 
              placeholder="additional@example.com (optional)" 
              value={newEmail.recipient_email}
              onChange={(e) => setNewEmail({ ...newEmail, recipient_email: e.target.value })}
              className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Template</label>
            <Select 
              value={newEmail.template_id}
              onValueChange={handleTemplateSelect}
            >
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
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
          <label className="text-sm font-medium text-gray-700">Subject Line</label>
          <Input 
            placeholder="Enter your email subject..." 
            value={newEmail.subject}
            onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
            className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Email Content</label>
          <RichTextEditor
            value={newEmail.content}
            onChange={(content) => setNewEmail({ ...newEmail, content })}
            placeholder="Start typing your email message..."
            className="min-h-[300px] lg:min-h-[350px]"
          />
          <p className="text-xs text-gray-500">Use the toolbar above to format your email with bold, italic, lists, links, and more</p>
        </div>

        {/* File Attachments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">File Attachments</label>
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
                className="flex items-center gap-2 relative z-10 pointer-events-none"
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
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 text-green-800 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Attached Quote Details
              </h4>
              <div className="space-y-2">
                {selectedQuotes.map(quote => (
                  <div key={quote.id} className="text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-800">Quote #{quote.quote_number}</span>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        ${quote.total_amount.toLocaleString()}
                      </Badge>
                    </div>
                    <p className="text-green-600">Client: {quote.clients?.name}</p>
                    <p className="text-green-600">Status: {quote.status}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" className="flex items-center gap-2 border-gray-300">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule Send</span>
              <span className="sm:hidden">Schedule</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-gray-300"
              onClick={onPreviewEmail}
              disabled={!newEmail.content}
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview Email</span>
              <span className="sm:hidden">Preview</span>
            </Button>
          </div>
          <Button 
            onClick={onSendEmail} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 min-w-[120px] justify-center"
            disabled={sendEmailMutation.isPending || !emailSettings?.from_email}
          >
            <Send className="h-4 w-4" />
            {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};