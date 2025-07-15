
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, RotateCw, RotateCcw } from "lucide-react";

interface FabricsListProps {
  fabrics: any[];
  onEdit: (fabric: any) => void;
  onDelete: any;
}

export const FabricsList = ({ fabrics, onEdit, onDelete }: FabricsListProps) => {
  if (!fabrics || fabrics.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-brand-neutral">No fabrics added yet. Add your first fabric!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {fabrics.map((fabric) => (
        <Card key={fabric.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{fabric.name}</CardTitle>
                {fabric.fabric_code && (
                  <p className="text-sm text-brand-neutral">Code: {fabric.fabric_code}</p>
                )}
                {fabric.description && (
                  <p className="text-sm text-brand-neutral mt-1">{fabric.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(fabric)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete.mutate(fabric.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <span className="font-medium">Width:</span> {fabric.fabric_width}cm
              </div>
              <div>
                <span className="font-medium">Pattern Repeat:</span> {fabric.pattern_repeat || 0}cm
              </div>
              <div>
                <span className="font-medium">Type:</span> {fabric.fabric_type || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Weight:</span> {fabric.weight || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Cost:</span> ${fabric.cost_per_meter || 0}/m
              </div>
              <div>
                <span className="font-medium">Supplier:</span> {fabric.supplier || 'Not specified'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={fabric.rotation_allowed ? "default" : "secondary"} className="flex items-center gap-1">
                {fabric.rotation_allowed ? <RotateCw className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
                {fabric.rotation_allowed ? 'Rotation allowed' : 'No rotation'}
              </Badge>
              {fabric.fabric_type && (
                <Badge variant="outline">{fabric.fabric_type}</Badge>
              )}
              {fabric.weight && (
                <Badge variant="outline">{fabric.weight} weight</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
