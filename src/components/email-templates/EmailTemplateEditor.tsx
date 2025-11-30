import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Eye, Code } from "lucide-react";
import { EmailTemplate, useUpdateGeneralEmailTemplate } from "@/hooks/useGeneralEmailTemplates";
import { getAvailableVariables, processTemplateVariables, getExampleTemplateData, getTemplateTypeLabel } from "@/utils/emailTemplateVariables";

interface EmailTemplateEditorProps {
  template: EmailTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmailTemplateEditor = ({ template, open, onOpenChange }: EmailTemplateEditorProps) => {
  const [subject, setSubject] = useState(template?.subject || "");
  const [content, setContent] = useState(template?.content || "");
  const updateTemplate = useUpdateGeneralEmailTemplate();

  const availableVariables = template ? getAvailableVariables(template.template_type) : [];
  const exampleData = getExampleTemplateData();

  const handleSave = async () => {
    if (!template) return;

    await updateTemplate.mutateAsync({
      id: template.id,
      subject,
      content,
      active: template.active,
    });

    onOpenChange(false);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + `{{${variable}}}` + content.substring(end);
      setContent(newContent);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + variable.length + 4;
      }, 0);
    } else {
      setContent(content + `{{${variable}}}`);
    }
  };

  const previewContent = processTemplateVariables(content, exampleData);
  const previewSubject = processTemplateVariables(subject, exampleData);

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Email Template: {getTemplateTypeLabel(template.template_type)}</DialogTitle>
          <DialogDescription>
            Customize your email template with variables and HTML styling
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            {/* Subject Line */}
            <div className="space-y-2">
              <Label htmlFor="template-subject">Subject Line</Label>
              <Input
                id="template-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
              />
            </div>

            {/* Available Variables */}
            <div className="space-y-2">
              <Label>Available Variables (click to insert)</Label>
              <div className="flex flex-wrap gap-2">
                {availableVariables.map((variable) => (
                  <Badge
                    key={variable}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => insertVariable(variable)}
                  >
                    {variable}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Template Content */}
            <div className="space-y-2">
              <Label htmlFor="template-content">Email Content (HTML)</Label>
              <Textarea
                id="template-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter email content with HTML..."
                className="min-h-[400px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                You can use HTML for styling. Variables use format: {`{{variable.name}}`}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateTemplate.isPending}>
                {updateTemplate.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Subject:</Label>
                  <p className="font-semibold">{previewSubject}</p>
                </div>
                <div
                  className="border rounded-lg p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
                <p className="text-xs text-muted-foreground">
                  This preview uses example data. Real emails will use actual client and project information.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
