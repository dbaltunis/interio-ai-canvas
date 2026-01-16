import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Mail, Edit, Plus } from "lucide-react";
import { useGeneralEmailTemplates, useUpdateGeneralEmailTemplate, useCreateGeneralEmailTemplate, EmailTemplate } from "@/hooks/useGeneralEmailTemplates";
import { EmailTemplateEditor } from "./EmailTemplateEditor";
import { getTemplateTypeLabel } from "@/utils/emailTemplateVariables";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TEMPLATE_TYPE_OPTIONS = [
  { value: 'quote_sent', label: 'Quote Sent' },
  { value: 'quote_approved', label: 'Quote Approved' },
  { value: 'quote_rejected', label: 'Quote Rejected' },
  { value: 'project_update', label: 'Project Update' },
  { value: 'installation_reminder', label: 'Installation Reminder' },
  { value: 'payment_reminder', label: 'Payment Reminder' },
  { value: 'welcome', label: 'Welcome Email' },
  { value: 'custom', label: 'Custom Template' },
];

export const EmailTemplatesList = () => {
  const { data: templates, isLoading } = useGeneralEmailTemplates();
  const updateTemplate = useUpdateGeneralEmailTemplate();
  const createTemplate = useCreateGeneralEmailTemplate();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTemplateType, setNewTemplateType] = useState('custom');
  const [newTemplateSubject, setNewTemplateSubject] = useState('');

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

  const handleCreateTemplate = async () => {
    if (!newTemplateSubject.trim()) return;
    
    await createTemplate.mutateAsync({
      template_type: newTemplateType,
      subject: newTemplateSubject,
      content: '<p>Enter your email content here...</p>',
      active: true,
      variables: [],
    });
    
    setCreateDialogOpen(false);
    setNewTemplateType('custom');
    setNewTemplateSubject('');
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
        {/* Create Template Button */}
        <Button onClick={() => setCreateDialogOpen(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Email Template
        </Button>
        
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
              <p className="text-sm text-muted-foreground mb-4">
                Create your first email template to get started
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Editor Dialog */}
      <EmailTemplateEditor
        template={selectedTemplate}
        open={editorOpen}
        onOpenChange={setEditorOpen}
      />

      {/* Create Template Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
            <DialogDescription>
              Create a new email template for your communications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Type</Label>
              <Select value={newTemplateType} onValueChange={setNewTemplateType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input 
                value={newTemplateSubject}
                onChange={(e) => setNewTemplateSubject(e.target.value)}
                placeholder="Enter email subject..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTemplate}
                disabled={!newTemplateSubject.trim() || createTemplate.isPending}
              >
                {createTemplate.isPending ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
