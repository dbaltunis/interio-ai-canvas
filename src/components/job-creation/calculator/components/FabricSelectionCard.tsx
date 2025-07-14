
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FabricSelector } from '@/components/fabric/FabricSelector';

interface FabricSelectionCardProps {
  selectedFabricId?: string;
  onSelectFabric: (fabricId: string, fabric: any) => void;
  setFabricOrientation: (orientation: "vertical" | "horizontal") => void;
}

export const FabricSelectionCard = ({
  selectedFabricId,
  onSelectFabric,
  setFabricOrientation
}: FabricSelectionCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Fabric</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FabricSelector
          selectedFabricId={selectedFabricId}
          onSelectFabric={(fabricId, fabric) => {
            console.log('Fabric selected in calculator:', fabric);
            onSelectFabric(fabricId, fabric);
            
            // Set the fabric orientation from the selected fabric
            if (fabric.rotation) {
              setFabricOrientation(fabric.rotation);
            }
          }}
        />
      </CardContent>
    </Card>
  );
};
