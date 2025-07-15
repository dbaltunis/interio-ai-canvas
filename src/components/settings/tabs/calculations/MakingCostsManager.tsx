
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const MakingCostsManager = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Making Costs</CardTitle>
          <CardDescription>
            Configure labor and fabrication cost structures for different window covering types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-brand-neutral mb-4">
              Making costs functionality will be implemented here for:
            </p>
            <ul className="text-sm text-brand-neutral space-y-2">
              <li>• Labor cost calculation</li>
              <li>• Fabrication time estimates</li>
              <li>• Complexity multipliers</li>
              <li>• Bundled option pricing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
