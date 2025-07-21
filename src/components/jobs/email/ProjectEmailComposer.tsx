
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Send, Paperclip, Users } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useSendEmail } from "@/hooks/useSendEmail";
import { useToast } from "@/hooks/use-toast";

interface ProjectEmailComposerProps {
  projectId: string;
  projectName: string;
  onClose?: () => void;
}

export const ProjectEmailComposer = ({ 
  projectId, 
  projectName, 
  onClose 
}: ProjectEmailComposerProps) => {
  const [emailData, setEmailData] = useState({
    recipients: [] as string[],
    subject: `Update: ${projectName}`,
    content: "",
    template: ""
  });
  
  const [newRecipient, setNewRecipient] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const { data: clients = [] } = useClients();
  const sendEmailMutation = useSendEmail();
  const { toast } = useToast();

  const emailTemplates = [
    {
      id: "project_update",
      name: "Project Update",
      subject: `Project Update: ${projectName}`,
      content: `<p>Dear [Client Name],</p><p>I wanted to provide you with an update on your project: <strong>${projectName}</strong></p><p>Current Status: [Status]</p><p>Next Steps: [Next Steps]</p><p>Please don't hesitate to reach out if you have any questions.</p><p>Best regards,<br/>[Your Name]</p>`
    },
    {
      id: "quote_follow_up",
      name: "Quote Follow-up",
      subject: `Follow-up: Quote for ${projectName}`,
      content: `<p>Dear [Client Name],</p><p>I hope this message finds you well. I wanted to follow up on the quote we provided for your project: <strong>${projectName}</strong></p><p>Do you have any questions about the proposal? I'm happy to discuss any aspects in detail.</p><p>Looking forward to hearing from you.</p><p>Best regards,<br/>[Your Name]</p>`
    },
    {
      id: "completion_notice",
      name: "Project Completion",
      subject: `Project Completed: ${projectName}`,
      content: `<p>Dear [Client Name],</p><p>I'm pleased to inform you that your project <strong>${projectName}</strong> has been completed successfully!</p><p>Thank you for choosing our services. We hope you're delighted with the results.</p><p>Please let us know if you need any follow-up assistance.</p><p>Best regards,<br/>[Your Name]</p>`
    }
  ];

  const handleAddRecipient = () => {
    if (newRecipient && !emailData.recipients.includes(newRecipient)) {
      setEmailData(prev => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient]
      }));
      setNewRecipient("");
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setEmailData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setEmailData(prev => ({
        ...prev,
        subject: template.subject,
        content: template.content,
        template: templateId
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendEmail = async () => {
    if (emailData.recipients.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one recipient",
        variant: "destructive",
      });
      return;
    }

    if (!emailData.subject.trim() || !emailData.content.trim()) {
      toast({
        title: "Error", 
        description: "Please fill in subject and content",
        variant: "destructive",
      });
      return;
    }

    try {
      // Send email to each recipient
      for (const recipient of emailData.recipients) {
        await sendEmailMutation.mutateAsync({
          to: recipient,
          subject: emailData.subject,
          content: emailData.content,
          attachments: attachments,
        });
      }

      toast({
        title: "Success",
        description: `Email sent to ${emailData.recipients.length} recipient(s)`,
      });

      if (onClose) onClose();
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Compose Project Email
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Sending email for project: <span className="font-medium">{projectName}</span>
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Email Template Selection */}
        <div className="space-y-2">
          <Label>Email Template</Label>
          <Select onValueChange={handleTemplateSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a template (optional)" />
            </SelectTrigger>
            <SelectContent>
              {emailTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Recipients */}
        <div className="space-y-3">
          <Label>Recipients</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select onValueChange={setNewRecipient} value={newRecipient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select from clients or enter email" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.email || ""}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {client.name} - {client.email}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Or enter email directly"
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddRecipient} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {emailData.recipients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {emailData.recipients.map((email) => (
                <Badge key={email} variant="secondary" className="flex items-center gap-1">
                  {email}
                  <button
                    onClick={() => handleRemoveRecipient(email)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={emailData.subject}
            onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Enter email subject"
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Message</Label>
          <Textarea
            id="content"
            value={emailData.content}
            onChange={(e) => setEmailData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Enter your message"
            rows={10}
            className="min-h-[200px]"
          />
        </div>

        {/* Attachments */}
        <div className="space-y-3">
          <Label>Attachments</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="flex items-center gap-2"
            >
              <Paperclip className="h-4 w-4" />
              Add Files
            </Button>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <span className="text-sm">{file.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSendEmail}
            disabled={sendEmailMutation.isPending}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
