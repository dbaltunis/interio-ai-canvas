import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Layout, Save, Download, Upload, Plus, Trash2 } from "lucide-react";

interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  category: string;
  isSystem: boolean;
}

const SYSTEM_TEMPLATES: PermissionTemplate[] = [
  {
    id: "basic-staff",
    name: "Basic Staff",
    description: "Essential permissions for new team members",
    permissions: ['view_jobs', 'view_clients', 'view_calendar', 'view_inventory', 'view_profile'],
    category: "starter",
    isSystem: true
  },
  {
    id: "sales-team",
    name: "Sales Team",
    description: "Permissions for sales representatives",
    permissions: ['view_jobs', 'create_jobs', 'view_clients', 'create_clients', 'view_calendar', 'create_appointments', 'view_analytics', 'view_profile'],
    category: "department",
    isSystem: true
  },
  {
    id: "project-manager",
    name: "Project Manager",
    description: "Comprehensive permissions for project management",
    permissions: ['view_jobs', 'create_jobs', 'view_clients', 'create_clients', 'view_calendar', 'create_appointments', 'view_inventory', 'manage_inventory', 'view_window_treatments', 'manage_window_treatments', 'view_analytics', 'view_profile'],
    category: "management",
    isSystem: true
  },
  {
    id: "full-admin",
    name: "Full Administrator",
    description: "All permissions except user management",
    permissions: ['view_jobs', 'create_jobs', 'delete_jobs', 'view_clients', 'create_clients', 'delete_clients', 'view_calendar', 'create_appointments', 'delete_appointments', 'view_inventory', 'manage_inventory', 'view_window_treatments', 'manage_window_treatments', 'view_analytics', 'view_settings', 'manage_settings', 'view_profile'],
    category: "admin",
    isSystem: true
  }
];

interface PermissionTemplatesProps {
  onApplyTemplate?: (permissions: string[]) => void;
}

export const PermissionTemplates = ({ onApplyTemplate }: PermissionTemplatesProps) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<PermissionTemplate[]>(SYSTEM_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "custom",
    permissions: [] as string[]
  });

  const filteredTemplates = templates.filter(template => 
    selectedCategory === "all" || template.category === selectedCategory
  );

  const handleApplyTemplate = (template: PermissionTemplate) => {
    onApplyTemplate?.(template.permissions);
    toast({
      title: "Template applied",
      description: `Applied "${template.name}" template with ${template.permissions.length} permissions.`,
    });
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name) {
      toast({
        title: "Error",
        description: "Template name is required.",
        variant: "destructive",
      });
      return;
    }

    const template: PermissionTemplate = {
      id: `custom-${Date.now()}`,
      ...newTemplate,
      isSystem: false
    };

    setTemplates(prev => [...prev, template]);
    setIsCreateDialogOpen(false);
    setNewTemplate({ name: "", description: "", category: "custom", permissions: [] });
    
    toast({
      title: "Template created",
      description: `Template "${template.name}" has been created successfully.`,
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast({
      title: "Template deleted",
      description: "Template has been removed successfully.",
    });
  };

  const handleExportTemplates = () => {
    const customTemplates = templates.filter(t => !t.isSystem);
    const dataStr = JSON.stringify(customTemplates, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'permission-templates.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Templates exported",
      description: "Custom templates have been exported to a JSON file.",
    });
  };

  const getCategoryBadge = (category: string) => {
    const variants = {
      starter: 'secondary',
      department: 'outline',
      management: 'default',
      admin: 'destructive',
      custom: 'secondary'
    } as const;
    
    return variants[category as keyof typeof variants] || 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Permission Templates
            </CardTitle>
            <CardDescription>
              Pre-configured permission sets for common roles
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportTemplates}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Permission Template</DialogTitle>
                  <DialogDescription>
                    Create a new template with custom permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Template Name</label>
                    <Input
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Custom Sales Role"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this template is for..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTemplate}>
                      Create Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Category:</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="department">Department</SelectItem>
              <SelectItem value="management">Management</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <Badge variant={getCategoryBadge(template.category)}>
                      {template.category}
                    </Badge>
                    {template.isSystem && (
                      <Badge variant="outline">System</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                {!template.isSystem && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {template.permissions.length} permissions included
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.permissions.slice(0, 3).map(permission => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {permission.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  {template.permissions.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleApplyTemplate(template)}
              >
                Apply Template
              </Button>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No templates found for the selected category
          </div>
        )}
      </CardContent>
    </Card>
  );
};