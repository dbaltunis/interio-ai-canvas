
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ComponentAssignmentManager = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Component Assignment</CardTitle>
          <CardDescription>
            Assign components (fabrics, headings, hardware) to product types and set compatibility rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Component assignment functionality coming soon.</p>
            <p className="text-sm">This will allow you to define which components are compatible with each product type.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
