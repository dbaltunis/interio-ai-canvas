
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Layers } from "lucide-react";

interface MeasurementControlsProps {
  measurements: Record<string, any>;
  visibleMeasurements: string[];
  onToggleVisibility: (measurement: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

export const MeasurementControls = ({
  measurements,
  visibleMeasurements,
  onToggleVisibility,
  onShowAll,
  onHideAll
}: MeasurementControlsProps) => {
  const hasValue = (value: any) => value && value !== "" && value !== "0" && parseFloat(value) > 0;

  const measurementGroups = [
    {
      title: "Main Measurements",
      color: "bg-blue-100 text-blue-800",
      measurements: [
        { key: 'rail_width', label: 'Rail Width', hasValue: hasValue(measurements.rail_width) },
        { key: 'drop', label: 'Drop', hasValue: hasValue(measurements.drop) }
      ]
    },
    {
      title: "Window Details",
      color: "bg-green-100 text-green-800",
      measurements: [
        { key: 'measurement_a', label: 'Window Width (A)', hasValue: hasValue(measurements.measurement_a) },
        { key: 'measurement_b', label: 'Window Height (B)', hasValue: hasValue(measurements.measurement_b) }
      ]
    },
    {
      title: "Additional",
      color: "bg-gray-100 text-gray-800",
      measurements: [
        { key: 'measurement_c', label: 'Rod to Ceiling (C)', hasValue: hasValue(measurements.measurement_c) },
        { key: 'measurement_d', label: 'Window to Floor (D)', hasValue: hasValue(measurements.measurement_d) },
        { key: 'measurement_e', label: 'Total Height (E)', hasValue: hasValue(measurements.measurement_e) },
        { key: 'measurement_f', label: 'Total Width (F)', hasValue: hasValue(measurements.measurement_f) }
      ]
    }
  ];

  const totalWithValues = measurementGroups.reduce((acc, group) => 
    acc + group.measurements.filter(m => m.hasValue).length, 0
  );

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Layers className="h-4 w-4" />
          Measurement Display
          <Badge variant="secondary" className="ml-auto">
            {visibleMeasurements.length}/{totalWithValues}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onShowAll}
            className="flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            Show All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onHideAll}
            className="flex-1"
          >
            <EyeOff className="h-3 w-3 mr-1" />
            Hide All
          </Button>
        </div>

        {measurementGroups.map((group) => {
          const visibleInGroup = group.measurements.filter(m => 
            m.hasValue && visibleMeasurements.includes(m.key)
          ).length;
          const totalInGroup = group.measurements.filter(m => m.hasValue).length;

          if (totalInGroup === 0) return null;

          return (
            <div key={group.title} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{group.title}</h4>
                <Badge className={group.color} variant="secondary">
                  {visibleInGroup}/{totalInGroup}
                </Badge>
              </div>
              <div className="space-y-1">
                {group.measurements.map((measurement) => {
                  if (!measurement.hasValue) return null;
                  
                  const isVisible = visibleMeasurements.includes(measurement.key);
                  
                  return (
                    <Button
                      key={measurement.key}
                      variant={isVisible ? "default" : "ghost"}
                      size="sm"
                      onClick={() => onToggleVisibility(measurement.key)}
                      className="w-full justify-start text-xs h-8"
                    >
                      {isVisible ? <Eye className="h-3 w-3 mr-2" /> : <EyeOff className="h-3 w-3 mr-2" />}
                      {measurement.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
