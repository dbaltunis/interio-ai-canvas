import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, MessageSquare, Mail, Smartphone } from "lucide-react";
import { useNotificationTemplates, useCreateNotificationTemplate, useUpdateNotificationTemplate, useDeleteNotificationTemplate } from "@/hooks/useNotificationTemplates";
import type { NotificationTemplate } from "@/hooks/useNotificationTemplates";

interface TemplateFormData {
  name: string;
  type: 'email' | 'sms' | 'both';
  category: 'appointment_reminder' | 'follow_up' | 'project_update' | 'custom';
  subject: string;
  message: string;
}

export const NotificationTemplatesManager = () => {
  const { data: templates, isLoading } = useNotificationTemplates();
  const createTemplate = useCreateNotificationTemplate();
  const updateTemplate = useUpdateNotificationTemplate();
  const deleteTemplate = useDeleteNotificationTemplate();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    type: "both",
    category: "custom",
    subject: "",
    message: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "both",
      category: "custom",
      subject: "",
      message: "",
    });
    setEditingTemplate(null);
  };

  const handleCreateEdit = (template?: NotificationTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        type: template.type,
        category: template.category,
        subject: template.subject || "",
        message: template.message,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const templateData = {
      ...formData,
      variables: extractVariables(formData.message + (formData.subject || "")),
    };

    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({ id: editingTemplate.id, ...templateData });
      } else {
        await createTemplate.mutateAsync(templateData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{([^}]+)\}/g);
    return matches ? [...new Set(matches.map(match => match.slice(1, -1)))] : [];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'both': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'appointment_reminder': return 'bg-blue-100 text-blue-800';
      case 'follow_up': return 'bg-green-100 text-green-800';
      case 'project_update': return 'bg-purple-100 text-purple-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div>Loading notification templates...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notification Templates
            </CardTitle>
            <CardDescription>
              Create and manage reusable templates for your notifications
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleCreateEdit()}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "Edit Template" : "Create New Template"}
                </DialogTitle>
                <DialogDescription>
                  Create reusable notification templates with variables like {"{client_name}"}, {"{appointment_time}"}, etc.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Appointment Reminder"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email Only</SelectItem>
                        <SelectItem value="sms">SMS Only</SelectItem>
                        <SelectItem value="both">Both Email & SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="project_update">Project Update</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.type === 'email' || formData.type === 'both') && (
                  <div>
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="e.g., Reminder: Your appointment with {business_name}"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Hi {client_name}, this is a reminder..."
                    rows={4}
                    required
                  />
                  <div className="mt-2 text-xs text-muted-foreground">
                    Use variables like: {"{client_name}"}, {"{business_name}"}, {"{appointment_date}"}, {"{appointment_time}"}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTemplate.isPending || updateTemplate.isPending}>
                    {editingTemplate ? "Update" : "Create"} Template
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates && templates.length > 0 ? (
            templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(template.type)}
                      <h3 className="font-medium">{template.name}</h3>
                    </div>
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category.replace('_', ' ')}
                    </Badge>
                    {template.is_default && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.subject && `Subject: ${template.subject} | `}
                    {template.message}
                  </p>
                  {template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {"{" + variable + "}"}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCreateEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!template.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTemplate.mutate(template.id)}
                      disabled={deleteTemplate.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notification templates yet</p>
              <p className="text-sm">Create your first template to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};