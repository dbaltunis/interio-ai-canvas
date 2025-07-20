
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailPreviewDialog } from "./EmailPreviewDialog";
import { useToast } from "@/hooks/use-toast";

const mockTemplates = [
  {
    id: "1",
    name: "Quote Follow-up",
    subject: "Following up on your quote #{{quote.number}}",
    content: "<p>Hi {{client.name}},</p><p>I hope this email finds you well. I wanted to follow up on the quote we provided for your project.</p><p>Quote Details:</p><ul><li>Quote Number: {{quote.number}}</li><li>Total Amount: ${{quote.total}}</li></ul><p>Please let me know if you have any questions or if you'd like to proceed.</p><p>Best regards,<br/>{{sender.name}}</p>",
    category: "follow-up",
    variables: []
  }
];

export const EmailComposeTab = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof mockTemplates[0] | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const handleTemplateSelect = (templateId: string) => {
    const template = mockTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setSubject(template.subject);
      setContent(template.content);
    }
  };

  const handlePreview = () => {
    if (!selectedTemplate) return;
    setPreviewOpen(true);
  };

  const handleSendEmail = () => {
    if (!recipient || !subject || !content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before sending",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Email Sent",
      description: `Email sent successfully to ${recipient}`,
    });

    // Reset form
    setRecipient("");
    setSubject("");
    setContent("");
    setSelectedTemplate(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compose Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template">Select Template (Optional)</Label>
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {mockTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="recipient">To</Label>
            <Input
              id="recipient"
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div>
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your message here..."
              rows={10}
            />
          </div>

          <div className="flex justify-between">
            <div className="space-x-2">
              {selectedTemplate && (
                <Button variant="outline" onClick={handlePreview}>
                  Preview
                </Button>
              )}
            </div>
            <div className="space-x-2">
              <Button variant="outline">Save Draft</Button>
              <Button onClick={handleSendEmail}>Send Email</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <EmailPreviewDialog
          isOpen={previewOpen}
          onOpenChange={setPreviewOpen}
          template={{
            ...selectedTemplate,
            subject: subject,
            content: content
          }}
          clientData={{ name: "John Doe", email: recipient }}
          quoteData={{ quote_number: "Q-001", total_amount: "1500" }}
          senderInfo={{ from_name: "Your Name", from_email: "you@company.com" }}
        />
      )}
    </div>
  );
};
