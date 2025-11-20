import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Recycle, Trash2, RotateCcw } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { convertLength } from "@/hooks/useBusinessSettings";
import { FabricPoolItem } from "@/hooks/useClientFabricPool";
import { format } from "date-fns";

interface FabricPoolDisplayProps {
  allLeftover: FabricPoolItem[];
  onDelete?: (leftoverId: string) => void;
  onRelease?: (leftoverId: string) => void;
  showActions?: boolean;
}

export const FabricPoolDisplay = ({
  allLeftover,
  onDelete,
  onRelease,
  showActions = true
}: FabricPoolDisplayProps) => {
  const { units, getLengthUnitLabel } = useMeasurementUnits();

  const formatLength = (lengthCm: number) => {
    const converted = convertLength(lengthCm, 'cm', units.length);
    return `${converted.toFixed(1)}${getLengthUnitLabel()}`;
  };

  const availableLeftover = allLeftover.filter(item => item.is_available);
  const usedLeftover = allLeftover.filter(item => !item.is_available);

  if (allLeftover.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Recycle className="h-5 w-5" />
            Fabric Pool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No leftover fabric recorded yet. Leftover fabric from treatments will appear here for reuse.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Recycle className="h-5 w-5" />
          Fabric Pool
          <Badge variant="secondary">
            {availableLeftover.length} available
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Leftover */}
        {availableLeftover.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-green-700 dark:text-green-400">
              Available for Use
            </h4>
            {availableLeftover.map((item) => (
              <div 
                key={item.id}
                className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {item.fabric_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {formatLength(item.leftover_length_cm)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {item.orientation}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      From: {item.treatment_name || 'Unknown treatment'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {format(new Date(item.created_at), 'MMM d, yyyy')}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>

                  {showActions && onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(item.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Used Leftover */}
        {usedLeftover.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">
              Used in Treatments
            </h4>
            {usedLeftover.map((item) => (
              <div 
                key={item.id}
                className="p-3 border rounded-lg bg-muted/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm line-through text-muted-foreground">
                        {item.fabric_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {formatLength(item.leftover_length_cm)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Originally from: {item.treatment_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400">
                      Used in: {item.used_in_treatment_name}
                    </p>
                    {item.used_at && (
                      <p className="text-xs text-muted-foreground">
                        Used: {format(new Date(item.used_at), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>

                  {showActions && onRelease && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRelease(item.id)}
                      title="Release back to available"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};