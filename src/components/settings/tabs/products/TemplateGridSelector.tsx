import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Grid3X3, Info, Loader2 } from "lucide-react";
import { useTemplateGridAssignments } from "@/hooks/useTemplateGridAssignments";

interface TemplateGridSelectorProps {
  templateId: string | undefined;
  treatmentCategory: string;
}

export const TemplateGridSelector = ({ 
  templateId,
  treatmentCategory 
}: TemplateGridSelectorProps) => {
  const {
    assignments,
    assignedGridIds,
    assignedPriceGroups,
    availableGrids,
    isLoading,
    toggleGrid,
    isAssigning,
    isUnassigning,
  } = useTemplateGridAssignments(templateId);

  // Filter grids by treatment category/product type if possible
  const relevantGrids = availableGrids.filter(grid => {
    // If grid has no product_type, show it (legacy grids)
    if (!grid.product_type) return true;
    // Match the treatment category
    return grid.product_type === treatmentCategory;
  });

  // Group grids by price group for better organization
  const gridsByPriceGroup = relevantGrids.reduce((acc, grid) => {
    const group = grid.price_group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(grid);
    return acc;
  }, {} as Record<string, typeof relevantGrids>);

  if (!templateId) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Save the template first to assign pricing grids.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (availableGrids.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No pricing grids available. Upload grids in the Pricing tab first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Grid3X3 className="h-5 w-5" />
          Assign Pricing Grids
        </CardTitle>
        <CardDescription>
          Select which pricing grids should be available for this template. 
          Only fabrics matching the selected grid price groups will be shown.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected grids summary */}
        {assignedGridIds.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-3 border-b">
            <span className="text-sm text-muted-foreground">Active grids:</span>
            {assignments.map((assignment: any) => (
              <Badge 
                key={assignment.id} 
                variant="default"
                className="cursor-pointer hover:bg-destructive"
                onClick={() => toggleGrid(assignment.pricing_grid_id)}
              >
                {assignment.pricing_grids?.name || 'Unknown'}
                {assignment.pricing_grids?.price_group && (
                  <span className="ml-1 opacity-75">
                    (Group {assignment.pricing_grids.price_group})
                  </span>
                )}
              </Badge>
            ))}
          </div>
        )}

        {/* Grid selection */}
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {Object.entries(gridsByPriceGroup).map(([priceGroup, grids]) => (
              <div key={priceGroup} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Price Group: {priceGroup}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({grids.length} grid{grids.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <div className="grid gap-2 pl-4">
                  {grids.map((grid) => {
                    const isAssigned = assignedGridIds.includes(grid.id);
                    return (
                      <label 
                        key={grid.id}
                        className={`flex items-center gap-3 p-2 rounded-md border cursor-pointer transition-colors ${
                          isAssigned 
                            ? 'bg-primary/10 border-primary' 
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <Checkbox
                          checked={isAssigned}
                          onCheckedChange={() => toggleGrid(grid.id)}
                          disabled={isAssigning || isUnassigning}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{grid.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {grid.grid_code}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Price groups info */}
        {assignedPriceGroups.length > 0 && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Fabrics with price groups <strong>{assignedPriceGroups.join(', ')}</strong> will 
              be available in the worksheet for this template.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
