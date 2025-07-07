
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useLiningOptions } from "@/hooks/useComponentOptions";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

export const LiningsSection = () => {
  const { data: linings = [], isLoading: liningsLoading } = useLiningOptions();
  const { getFabricUnitLabel } = useMeasurementUnits();
  const fabricUnit = getFabricUnitLabel();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Lining Options</h4>
        <Button size="sm" className="bg-brand-primary hover:bg-brand-accent">
          <Plus className="h-4 w-4 mr-2" />
          Add Lining
        </Button>
      </div>

      <div className="grid gap-3">
        {linings.map((lining) => (
          <Card key={lining.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Switch checked={lining.active} />
                  <div>
                    <h5 className="font-medium text-brand-primary">{lining.name}</h5>
                    <p className="text-sm text-brand-neutral">
                      ${lining.price} per {fabricUnit}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
