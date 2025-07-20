
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { MakingCost } from "@/hooks/useMakingCosts";

interface MakingCostOptionMappingManagerProps {
  makingCost: MakingCost;
  onClose: () => void;
}

export const MakingCostOptionMappingManager = ({ 
  makingCost, 
  onClose 
}: MakingCostOptionMappingManagerProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold">Manage Options for {makingCost.name}</h3>
          <p className="text-sm text-muted-foreground">Configure bundled options and their mappings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Option Mapping Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Option mapping functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};
