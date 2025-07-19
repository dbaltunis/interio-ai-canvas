
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Copy, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const CalendarEmailIntegration = () => {
  const { toast } = useToast();
  const [emailTemplate, setEmailTemplate] = useState({
    subject: "Schedule a Meeting",
    body: "Hi there! I'd like to schedule a meeting with you. Please click the link below to book a time that works for you:\n\n[BOOKING_LINK]\n\nLooking forward to connecting!"
  });

  const handleCopyTemplate = () => {
    const template = `Subject: ${emailTemplate.subject}\n\n${emailTemplate.body}`;
    navigator.clipboard.writeText(template);
    toast({
      title: "Template Copied",
      description: "Email template copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Template
          </CardTitle>
          <CardDescription>
            Create email templates with embedded booking links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email-subject">Subject Line</Label>
            <Input
              id="email-subject"
              value={emailTemplate.subject}
              onChange={(e) => setEmailTemplate(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter email subject"
            />
          </div>
          
          <div>
            <Label htmlFor="email-body">Email Body</Label>
            <Textarea
              id="email-body"
              value={emailTemplate.body}
              onChange={(e) => setEmailTemplate(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Enter email body text. Use [BOOKING_LINK] as placeholder for the booking link."
              rows={6}
            />
            <p className="text-sm text-gray-500 mt-1">
              Use <code>[BOOKING_LINK]</code> as a placeholder for the actual booking link
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleCopyTemplate} variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              Copy Template
            </Button>
            <Button variant="outline" disabled>
              <Send className="w-4 h-4 mr-2" />
              Send Test Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
