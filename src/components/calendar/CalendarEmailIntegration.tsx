
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Copy, Calendar, Link2, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppointmentSchedulers } from "@/hooks/useAppointmentSchedulers";

export const CalendarEmailIntegration = () => {
  const { toast } = useToast();
  const { data: schedulers } = useAppointmentSchedulers();
  const [selectedScheduler, setSelectedScheduler] = useState<string>("");
  const [embedType, setEmbedType] = useState<"link" | "button" | "html">("link");

  const generateSchedulerSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const generateEmbedCode = () => {
    const scheduler = schedulers?.find(s => s.id === selectedScheduler);
    if (!scheduler) return "";

    const baseUrl = window.location.origin;
    const slug = generateSchedulerSlug(scheduler.name);
    const bookingUrl = `${baseUrl}/book/${slug}`;

    switch (embedType) {
      case "link":
        return bookingUrl;
      case "button":
        return `<a href="${bookingUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">Book ${scheduler.name}</a>`;
      case "html":
        return `
<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; max-width: 400px; font-family: Arial, sans-serif;">
  <h3 style="margin: 0 0 10px 0; color: #1f2937;">${scheduler.name}</h3>
  <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">${scheduler.description || 'Schedule your appointment'}</p>
  <div style="margin-bottom: 15px;">
    <span style="display: inline-block; padding: 4px 8px; background-color: #f3f4f6; color: #374151; border-radius: 4px; font-size: 12px;">
      ⏰ ${scheduler.duration} minutes
    </span>
  </div>
  <a href="${bookingUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; width: 100%; text-align: center; box-sizing: border-box;">
    Schedule Now
  </a>
</div>`;
      default:
        return "";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard"
    });
  };

  const emailTemplateWithCalendar = () => {
    const scheduler = schedulers?.find(s => s.id === selectedScheduler);
    if (!scheduler) return "";

    return `
Subject: Let's Schedule a Meeting

Hi [Client Name],

I hope this email finds you well. I'd like to schedule a ${scheduler.name} with you to discuss your project.

You can easily book a time that works for you using my online calendar:

${generateEmbedCode()}

This ${scheduler.duration}-minute session will allow us to:
- Discuss your requirements
- Answer any questions you may have
- Plan the next steps

Looking forward to connecting with you soon!

Best regards,
[Your Name]
    `.trim();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Calendar Integration
          </CardTitle>
          <p className="text-sm text-gray-600">
            Embed booking links in your emails to make scheduling seamless
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="scheduler-select">Select Scheduler</Label>
            <Select
              value={selectedScheduler}
              onValueChange={setSelectedScheduler}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a scheduler to embed" />
              </SelectTrigger>
              <SelectContent>
                {schedulers?.map((scheduler) => (
                  <SelectItem key={scheduler.id} value={scheduler.id}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {scheduler.name} ({scheduler.duration}min)
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedScheduler && (
            <>
              <div>
                <Label htmlFor="embed-type">Embed Type</Label>
                <Select
                  value={embedType}
                  onValueChange={(value: "link" | "button" | "html") => setEmbedType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4" />
                        Simple Link
                      </div>
                    </SelectItem>
                    <SelectItem value="button">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        HTML Button
                      </div>
                    </SelectItem>
                    <SelectItem value="html">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Full HTML Card
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Generated Code</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generateEmbedCode())}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={generateEmbedCode()}
                  readOnly
                  rows={embedType === "html" ? 8 : 3}
                  className="font-mono text-sm"
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Email Template Example</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(emailTemplateWithCalendar())}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Template
                  </Button>
                </div>
                <Textarea
                  value={emailTemplateWithCalendar()}
                  readOnly
                  rows={12}
                  className="text-sm"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Preview</h4>
                <div 
                  className="bg-white p-4 rounded border"
                  dangerouslySetInnerHTML={{ __html: generateEmbedCode() }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
