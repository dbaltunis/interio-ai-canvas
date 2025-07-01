
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WindowCoveringsManagement } from "./products/WindowCoveringsManagement";

export const ProductCatalogTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold text-brand-primary">Window Coverings</h3>
        <p className="text-brand-neutral">Manage your window covering products and options</p>
      </div>

      <WindowCoveringsManagement />
    </div>
  );
};
