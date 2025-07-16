
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { MakingCost } from "@/hooks/useMakingCosts";

interface MakingCostListProps {
  makingCosts: MakingCost[];
  onEdit: (makingCost: MakingCost) => void;
  onDelete: (id: string) => void;
}

export const MakingCostList = ({ makingCosts, onEdit, onDelete }: MakingCostListProps) => {
  if (makingCosts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No making costs configured yet. Create your first making cost to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {makingCosts.map((makingCost) => (
        <Card key={makingCost.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{makingCost.name}</CardTitle>
                <CardDescription>
                  {makingCost.description || 'No description provided'}
                </CardDescription>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(makingCost)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(makingCost.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant={makingCost.active ? "default" : "secondary"}>
                {makingCost.active ? "Active" : "Inactive"}
              </Badge>
              {makingCost.include_fabric_selection && (
                <Badge variant="outline">Includes Fabric Selection</Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>Pricing Method: {makingCost.pricing_method}</div>
              <div>Measurement Type: {makingCost.measurement_type}</div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <div>Options configured: {(makingCost.heading_options as any[])?.length || 0} heading, {(makingCost.hardware_options as any[])?.length || 0} hardware, {(makingCost.lining_options as any[])?.length || 0} lining</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
