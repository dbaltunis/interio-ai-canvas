import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Copy } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useCurtainTemplates, useDeleteCurtainTemplate, useCreateCurtainTemplate, CurtainTemplate } from "@/hooks/useCurtainTemplates";

interface CurtainTemplatesListProps {
  onEdit: (template: CurtainTemplate) => void;
}

export const CurtainTemplatesList = ({ onEdit }: CurtainTemplatesListProps) => {
  const { toast } = useToast();
  const { data: templates = [], isLoading } = useCurtainTemplates();
  const deleteTemplate = useDeleteCurtainTemplate();
  const createTemplate = useCreateCurtainTemplate();

  const handleDelete = async (templateId: string) => {
    try {
      await deleteTemplate.mutateAsync(templateId);
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleDuplicate = async (template: CurtainTemplate) => {
    try {
      const duplicatedTemplate = {
        ...template,
        name: `${template.name} - Copy`,
        description: `Copy of ${template.description || template.name}`,
        active: true
      };
      
      // Remove fields that shouldn't be copied
      const { id, user_id, created_at, updated_at, ...templateData } = duplicatedTemplate;
      
      await createTemplate.mutateAsync(templateData);
      
      toast({
        title: "Template Duplicated",
        description: "A copy of the template has been created"
      });
    } catch (error) {
      console.error("Error duplicating template:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate template. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>Loading curtain templates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>No curtain templates found.</p>
            <p className="text-sm">Create your first template to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <Card key={template.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDuplicate(template)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(template)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Template</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{template.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(template.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{template.curtain_type}</Badge>
                <Badge variant="outline">{template.heading_name}</Badge>
                <Badge variant="outline">Fullness: {template.fullness_ratio}</Badge>
                <Badge variant="outline">{template.manufacturing_type}</Badge>
                {template.is_railroadable && <Badge variant="outline">Railroadable</Badge>}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Returns:</span> L:{template.return_left}cm R:{template.return_right}cm
                </div>
                <div>
                  <span className="font-medium">Header Allowance:</span> {template.header_allowance}cm
                </div>
                <div>
                  <span className="font-medium">Waste:</span> {template.waste_percent}%
                </div>
                <div>
                  <span className="font-medium">Pricing:</span> {template.pricing_type.replace('_', ' ')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};