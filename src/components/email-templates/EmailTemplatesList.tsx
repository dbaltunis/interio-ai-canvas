import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Mail, Edit, Eye } from "lucide-react";
import { useGeneralEmailTemplates, useUpdateGeneralEmailTemplate } from "@/hooks/useGeneralEmailTemplates";
import { EmailTemplateEditor } from "./EmailTemplateEditor";
import { getTemplateTypeLabel } from "@/utils/emailTemplateVariables";
import { Skeleton } from "@/components/ui/skeleton";

export const EmailTemplatesList = () => {
  const { data: templates, isLoading } = useGeneralEmailTemplates();
  const updateTemplate = useUpdateGeneralEmailTemplate();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const handleToggleActive = async (templateId: string, currentActive: boolean) => {
    const template = templates?.find(t => t.id === templateId);
    if (!template) return;

    await updateTemplate.mutateAsync({
      id: template.id,
      subject: template.subject,
      content: template.content,
      active: !currentActive,
    });
  };

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setEditorOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {templates && templates.length > 0 ? (
          templates.map((template) => (
            <Card key={template.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{getTemplateTypeLabel(template.template_type)}</h3>
                        {template.active ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{template.subject}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <Switch
                        checked={template.active}
                        onCheckedChange={() => handleToggleActive(template.id, template.active)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Email Templates</h3>
              <p className="text-sm text-muted-foreground">
                Email templates will be created automatically when needed
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <EmailTemplateEditor
        template={selectedTemplate}
        open={editorOpen}
        onOpenChange={setEditorOpen}
      />
    </>
  );
};
