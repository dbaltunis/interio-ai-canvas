
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

interface ComponentsListProps {
  components: any[];
  onEdit: (component: any) => void;
  onDelete: (id: string) => void;
}

export const ComponentsList = ({ components, onEdit, onDelete }: ComponentsListProps) => {
  if (!components || components.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-brand-neutral">No components added yet. Add your first component!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {components.map((component) => (
        <Card key={component.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{component.name}</CardTitle>
                {component.description && (
                  <p className="text-sm text-brand-neutral mt-1">{component.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(component)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(component.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
              <div>
                <span className="font-medium">Price:</span> ${component.price || 0}
              </div>
              <div>
                <span className="font-medium">Unit:</span> {component.unit?.replace('-', ' ') || 'per-unit'}
              </div>
              {component.fullness_ratio && component.fullness_ratio !== 1 && (
                <div>
                  <span className="font-medium">Fullness:</span> {component.fullness_ratio}x
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {component.category && (
                <Badge variant="outline">{component.category.replace('_', ' ')}</Badge>
              )}
              <Badge variant="secondary">{component.component_type.replace('_', ' ')}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
