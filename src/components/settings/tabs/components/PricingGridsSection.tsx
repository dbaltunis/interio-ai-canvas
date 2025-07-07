
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export const PricingGridsSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">CSV Pricing Grids</h4>
        <Button size="sm" className="bg-brand-primary hover:bg-brand-accent">
          <Plus className="h-4 w-4 mr-2" />
          Upload CSV Grid
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Pricing Grid</CardTitle>
          <CardDescription>
            Upload CSV files with width/height pricing tables for blinds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="gridName">Grid Name</Label>
            <Input id="gridName" placeholder="e.g., Roman Blinds - Premium" />
          </div>
          <div>
            <Label htmlFor="csvFile">CSV File</Label>
            <Input id="csvFile" type="file" accept=".csv" />
            <p className="text-xs text-brand-neutral mt-1">
              Format: Width ranges in first row, Height ranges in first column, prices in cells
            </p>
          </div>
          <Button className="bg-brand-primary hover:bg-brand-accent">
            Upload & Process Grid
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-center py-4">
            <p className="text-brand-neutral">No pricing grids uploaded yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
