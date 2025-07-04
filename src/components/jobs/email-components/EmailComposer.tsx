
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
  FileText
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

  return (
    <Card className="shadow-lg border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <FileText className="h-5 w-5" />
          Compose Email
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            className="min-h-[350px]"
          />
          <p className="text-xs text-gray-500">Use the toolbar above to format your email with bold, italic, lists, links, and more</p>
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
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2 border-gray-300">
              <Calendar className="h-4 w-4" />
              Schedule Send
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-gray-300"
              onClick={onPreviewEmail}
              disabled={!newEmail.content}
            >
              <Eye className="h-4 w-4" />
              Preview Email
            </Button>
          </div>
          <Button 
            onClick={onSendEmail} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 min-w-[120px]"
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
