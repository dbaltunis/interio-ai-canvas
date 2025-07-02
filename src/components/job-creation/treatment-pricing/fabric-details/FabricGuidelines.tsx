
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const FabricGuidelines = () => {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription>
        <div className="text-sm">
          <strong>Fabric Width Guidelines:</strong>
          <div className="mt-1 space-y-1">
            <div>• <strong>Narrow fabrics (≤200cm/79"):</strong> Default to vertical orientation for better fabric utilization</div>
            <div>• <strong>Wide fabrics ({">"}200cm/79"):</strong> Default to horizontal orientation for standard curtain making</div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
