import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, MessageSquare, Calendar, FileText, Building } from "lucide-react";
import { useSMSTemplates } from "@/hooks/useSMSTemplates";
import { SMSTemplateDialog } from "./SMSTemplateDialog";
import { format } from "date-fns";

const getTemplateTypeIcon = (type: string) => {
  switch (type) {
    case 'appointment':
      return <Calendar className="h-4 w-4" />;
    case 'quote':
      return <FileText className="h-4 w-4" />;
    case 'project':
      return <Building className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

const getTemplateTypeColor = (type: string) => {
  switch (type) {
    case 'appointment':
      return 'bg-blue-100 text-blue-800';
    case 'quote':
      return 'bg-green-100 text-green-800';
    case 'project':
      return 'bg-primary/10 text-primary';
    case 'marketing':
      return 'bg-orange-100 text-orange-800';
    case 'reminder':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const SMSTemplates = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  const { data: templates, isLoading } = useSMSTemplates();

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const templateTypeStats = templates?.reduce((acc, template) => {
    acc[template.template_type] = (acc[template.template_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  if (isLoading) {
    return <div>Loading SMS templates...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SMS Templates</h2>
          <p className="text-muted-foreground">
            Create reusable SMS templates for automated notifications
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Template Type Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointment</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {templateTypeStats.appointment || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quote</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {templateTypeStats.quote || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project</CardTitle>
            <Building className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {templateTypeStats.project || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marketing</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {templateTypeStats.marketing || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Templates</CardTitle>
          <CardDescription>
            Create common SMS templates quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="cursor-pointer hover:bg-gray-50" onClick={handleCreateNew}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">Appointment Reminder</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Remind clients about upcoming appointments
                </p>
                <Button variant="outline" size="sm">
                  Create Template
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50" onClick={handleCreateNew}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base">Quote Ready</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Notify clients when quotes are ready
                </p>
                <Button variant="outline" size="sm">
                  Create Template
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50" onClick={handleCreateNew}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Project Update</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Update clients on project progress
                </p>
                <Button variant="outline" size="sm">
                  Create Template
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50" onClick={handleCreateNew}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-base">Follow-up</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Follow up after service completion
                </p>
                <Button variant="outline" size="sm">
                  Create Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {!templates || templates.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No SMS templates</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first SMS template.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Variables</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {getTemplateTypeIcon(template.template_type)}
                        <span>{template.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTemplateTypeColor(template.template_type)}>
                        {template.template_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {template.message}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.variables?.map((variable: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {variable}
                          </Badge>
                        )) || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.active ? "default" : "secondary"}>
                        {template.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(template.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SMSTemplateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        template={editingTemplate}
      />
    </div>
  );
};