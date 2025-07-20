
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmailPreviewDialog } from "./EmailPreviewDialog";
import { useToast } from "@/hooks/use-toast";

const mockTemplates = [
  {
    id: "1",
    name: "Welcome Email",
    subject: "Welcome to our service!",
    content: "<h1>Welcome {{client.name}}!</h1><p>Thank you for choosing us.</p>",
    category: "welcome",
    variables: []
  },
  {
    id: "2", 
    name: "Quote Follow-up",
    subject: "Following up on your quote",
    content: "<p>Hi {{client.name}},</p><p>Just following up on quote #{{quote.number}} for ${{quote.total}}.</p>",
    category: "follow-up",
    variables: []
  }
];

export const CampaignBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof mockTemplates[0] | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [recipientList, setRecipientList] = useState("");
  const { toast } = useToast();

  const handlePreview = (template: typeof mockTemplates[0]) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleSendCampaign = () => {
    if (!selectedTemplate || !campaignName) {
      toast({
        title: "Missing Information",
        description: "Please select a template and enter a campaign name",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Campaign Scheduled",
      description: `Campaign "${campaignName}" has been scheduled for sending`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Email Campaign</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input
              id="campaign-name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter campaign name"
            />
          </div>

          <div>
            <Label htmlFor="recipients">Recipients</Label>
            <Textarea
              id="recipients"
              value={recipientList}
              onChange={(e) => setRecipientList(e.target.value)}
              placeholder="Enter email addresses (one per line)"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Email Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {mockTemplates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.subject}</p>
                  <Badge variant="secondary" className="mt-1">
                    {template.category}
                  </Badge>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePreview(template)}
                  >
                    Preview
                  </Button>
                  <Button
                    onClick={() => setSelectedTemplate(template)}
                    variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                  >
                    {selectedTemplate?.id === template.id ? "Selected" : "Select"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Save Draft</Button>
        <Button onClick={handleSendCampaign}>Send Campaign</Button>
      </div>

      {selectedTemplate && (
        <EmailPreviewDialog
          isOpen={previewOpen}
          onOpenChange={setPreviewOpen}
          template={selectedTemplate}
          clientData={{ name: "John Doe", email: "john@example.com" }}
        />
      )}
    </div>
  );
};
