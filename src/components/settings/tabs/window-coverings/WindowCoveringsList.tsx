
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";

interface WindowCoveringsListProps {
  windowCoverings: any[];
  onEdit: (windowCovering: any) => void;
  onDelete: any;
}

export const WindowCoveringsList = ({ windowCoverings, onEdit, onDelete }: WindowCoveringsListProps) => {
  if (!windowCoverings || windowCoverings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-brand-neutral">No window coverings created yet. Add your first window covering type!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {windowCoverings.map((wc) => (
        <Card key={wc.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{wc.name}</CardTitle>
                {wc.description && (
                  <p className="text-sm text-brand-neutral mt-1">{wc.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(wc)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete.mutate(wc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Pricing:</span> {wc.fabrication_pricing_method?.replace('_', ' ') || 'Not set'}
              </div>
              <div>
                <span className="font-medium">Margin:</span> {wc.margin_percentage || 0}%
              </div>
              <div>
                <span className="font-medium">Size Range:</span> {wc.minimum_width || 0}-{wc.maximum_width || 0}cm × {wc.minimum_height || 0}-{wc.maximum_height || 0}cm
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
