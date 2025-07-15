
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ProductTemplatesManager = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Templates</CardTitle>
          <CardDescription>
            Link window coverings with calculation methods and available components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-brand-neutral mb-4">
              Product templates functionality will be implemented here to link:
            </p>
            <ul className="text-sm text-brand-neutral space-y-2">
              <li>• Window covering types with calculation methods</li>
              <li>• Available fabric selections</li>
              <li>• Required and optional components</li>
              <li>• Default pricing configurations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
