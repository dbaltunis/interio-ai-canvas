import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Copy } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface CurtainTemplatesListProps {
  onEdit: (template: any) => void;
}

// Mock data for demonstration
const mockTemplates = [
  {
    id: "1",
    name: "Premium Blackout Curtains",
    description: "High-quality blackout curtains with thermal lining",
    fabric_type: "blackout",
    heading_style: "pencil_pleat",
    lining_type: "blackout",
    width_multiplier: "2.5",
    drop_allowance: "15",
    base_price: "45.00",
    installation_fee: "25.00",
    created_at: "2024-01-15"
  },
  {
    id: "2",
    name: "Luxury Silk Curtains",
    description: "Elegant silk curtains for formal rooms",
    fabric_type: "silk",
    heading_style: "eyelet",
    lining_type: "standard",
    width_multiplier: "2.0",
    drop_allowance: "20",
    base_price: "85.00",
    installation_fee: "30.00",
    created_at: "2024-01-12"
  }
];

export const CurtainTemplatesList = ({ onEdit }: CurtainTemplatesListProps) => {
  const { toast } = useToast();
  const [templates] = useState(mockTemplates);

  const handleDelete = (templateId: string) => {
    // TODO: Implement actual delete logic
    console.log("Deleting template:", templateId);
    toast({
      title: "Template Deleted",
      description: "The curtain template has been successfully deleted"
    });
  };

  const handleDuplicate = (template: any) => {
    // TODO: Implement duplicate logic
    console.log("Duplicating template:", template);
    toast({
      title: "Template Duplicated",
      description: "A copy of the template has been created"
    });
  };

  const getFabricTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      cotton: "Cotton",
      polyester: "Polyester",
      linen: "Linen",
      silk: "Silk",
      blackout: "Blackout",
      sheer: "Sheer"
    };
    return labels[type] || type;
  };

  const getHeadingStyleLabel = (style: string) => {
    const labels: { [key: string]: string } = {
      pencil_pleat: "Pencil Pleat",
      eyelet: "Eyelet",
      tab_top: "Tab Top",
      rod_pocket: "Rod Pocket",
      grommet: "Grommet"
    };
    return labels[style] || style;
  };

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
                <Badge variant="secondary">{getFabricTypeLabel(template.fabric_type)}</Badge>
                <Badge variant="outline">{getHeadingStyleLabel(template.heading_style)}</Badge>
                <Badge variant="outline">Lining: {template.lining_type}</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Width Multiplier:</span> {template.width_multiplier}
                </div>
                <div>
                  <span className="font-medium">Drop Allowance:</span> {template.drop_allowance}cm
                </div>
                <div>
                  <span className="font-medium">Base Price:</span> £{template.base_price}/m²
                </div>
                <div>
                  <span className="font-medium">Installation:</span> £{template.installation_fee}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};