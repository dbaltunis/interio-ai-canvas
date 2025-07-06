
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";
import { predefinedEmailTemplates } from "@/data/emailTemplates";
import { RichTextEditor } from "./RichTextEditor";
import { useToast } from "@/hooks/use-toast";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_type: string;
}

interface EmailTemplatesTabProps {
  templates: EmailTemplate[] | undefined;
  onCreateTemplate: (templateData: any) => void;
  onApplyTemplate: (subject: string, content: string, templateId?: string) => void;
  isCreating: boolean;
}

export const EmailTemplatesTab = ({ 
  templates, 
  onCreateTemplate, 
  onApplyTemplate,
  isCreating 
}: EmailTemplatesTabProps) => {
  const [customTemplateDialogOpen, setCustomTemplateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
    template_type: "custom" as const
  });
  const { toast } = useToast();

  const handleCreateCustomTemplate = () => {
    onCreateTemplate({
      ...newTemplate,
      variables: [],
      active: true
    });
    setNewTemplate({
      name: "",
      subject: "",
      content: "",
      template_type: "custom"
    });
    setCustomTemplateDialogOpen(false);
  };

  const handleCreateTemplateFromPredefined = (templateData: any) => {
    onCreateTemplate({
      name: templateData.name,
      subject: templateData.subject,
      content: templateData.content,
      template_type: templateData.template_type,
      variables: templateData.variables,
      active: true
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-semibold">Email Templates</h3>
        <Button 
          className="flex items-center gap-2 w-full sm:w-auto"
          onClick={() => setCustomTemplateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>
      
      {/* Predefined Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle>Industry Templates</CardTitle>
          <CardDescription>
            Professional templates designed for interior design businesses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefinedEmailTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium truncate">{template.name}</h4>
                      <Badge variant="outline" className="text-xs mt-1">{template.category}</Badge>
                    </div>
                    <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => handleCreateTemplateFromPredefined(template)}
                    >
                      Save Template
                    </Button>
                    <Button 
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        onApplyTemplate(template.subject, template.content);
                        toast({
                          title: "Template Applied",
                          description: `${template.name} template has been applied.`
                        });
                      }}
                    >
                      Use Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Templates Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium truncate">{template.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{template.template_type.replace(/_/g, ' ')}</p>
                </div>
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
              </div>
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    onApplyTemplate(template.subject, template.content, template.id);
                    toast({
                      title: "Template Applied",
                      description: `${template.name} template has been applied.`
                    });
                  }}
                >
                  Apply Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {(!templates || templates.length === 0) && (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">No Custom Templates Yet</h4>
              <p className="text-sm">Save industry templates or create your own custom templates</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Custom Template Creation Dialog */}
      <Dialog open={customTemplateDialogOpen} onOpenChange={setCustomTemplateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Custom Template</DialogTitle>
            <DialogDescription>
              Create a reusable email template for your business
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template_name">Template Name</Label>
              <Input
                id="template_name"
                placeholder="e.g., Quote Follow-up"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="template_subject">Subject Line</Label>
              <Input
                id="template_subject"
                placeholder="Email subject..."
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="template_content">Email Content</Label>
              <RichTextEditor
                value={newTemplate.content}
                onChange={(content) => setNewTemplate(prev => ({ ...prev, content }))}
                placeholder="Start typing your template content..."
                className="min-h-[250px]"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setCustomTemplateDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCustomTemplate}
                disabled={!newTemplate.name || !newTemplate.subject || !newTemplate.content || isCreating}
                className="w-full sm:w-auto"
              >
                {isCreating ? "Creating..." : "Create Template"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
