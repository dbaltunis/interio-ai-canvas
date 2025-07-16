
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const MakingCostsForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-amber-700">Legacy Making Costs Form</CardTitle>
        <CardDescription>
          This form has been deprecated. Please use the new Product Configuration system.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center py-8">
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 mb-4">
          DEPRECATED
        </Badge>
        <p className="text-sm text-muted-foreground mb-4">
          Navigate to Settings → Products to configure making costs using the new system.
        </p>
        <div className="flex gap-2 justify-center">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
            Close
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
