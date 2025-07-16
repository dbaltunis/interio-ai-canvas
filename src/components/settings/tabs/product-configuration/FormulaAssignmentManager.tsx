
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const FormulaAssignmentManager = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Formula Assignment</CardTitle>
          <CardDescription>
            Assign calculation formulas to product types for fabric, labor, and hardware calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Formula assignment functionality coming soon.</p>
            <p className="text-sm">This will allow you to link calculation formulas to specific product types.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
