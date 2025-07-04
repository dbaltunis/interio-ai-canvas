
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Calendar, 
  Eye, 
  Paperclip, 
  Image as ImageIcon,
  X,
  Upload
} from "lucide-react";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";
import { useToast } from "@/hooks/use-toast";

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
  const [attachments, setAttachments] = useState<File[]>([]);
  const { data: templates } = useEmailTemplates();
  const { toast } = useToast();

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

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
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
    <Card>
      <CardHeader>
        <CardTitle>Compose Email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recipients Summary */}
        {selectedClients.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 mb-2">
              <strong>Recipients:</strong> {selectedClients.map(c => c.name || c.email).join(", ")}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">To (Additional Recipients)</label>
            <Input 
              placeholder="additional@example.com" 
              value={newEmail.recipient_email}
              onChange={(e) => setNewEmail({ ...newEmail, recipient_email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Template</label>
            <Select 
              value={newEmail.template_id}
              onValueChange={handleTemplateSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template..." />
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
        
        <div>
          <label className="text-sm font-medium">Subject</label>
          <Input 
            placeholder="Email subject..." 
            value={newEmail.subject}
            onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Message</label>
          <Textarea 
            placeholder="Write your email message here..." 
            className="min-h-[200px]"
            value={newEmail.content}
            onChange={(e) => setNewEmail({ ...newEmail, content: e.target.value })}
          />
        </div>

        {/* File Attachments */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Attachments</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Attach File
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </div>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Paperclip className="h-4 w-4 text-gray-600" />
                    )}
                    <span className="text-sm">{file.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {formatFileSize(file.size)}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quote Details Summary */}
        {selectedQuotes.length > 0 && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Attached Quote Details:</h4>
              {selectedQuotes.map(quote => (
                <div key={quote.id} className="text-sm text-gray-600">
                  <p><strong>Quote #{quote.quote_number}:</strong> ${quote.total_amount.toLocaleString()}</p>
                  <p>Client: {quote.clients?.name}</p>
                  <p>Status: {quote.status}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Send
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={onPreviewEmail}
              disabled={!newEmail.content}
            >
              <Eye className="h-4 w-4" />
              Preview Email
            </Button>
          </div>
          <Button 
            onClick={onSendEmail} 
            className="flex items-center gap-2"
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
