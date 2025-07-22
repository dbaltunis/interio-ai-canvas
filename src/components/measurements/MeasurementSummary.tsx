
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ruler, Calendar, MapPin, Layers, User } from "lucide-react";
import { format } from "date-fns";

interface MeasurementSummaryProps {
  measurements: Record<string, any>;
  measurementType: string;
  roomName?: string;
  windowCoveringName?: string;
  measuredBy?: string;
  measuredAt?: string;
  notes?: string;
}

export const MeasurementSummary = ({ 
  measurements, 
  measurementType,
  roomName,
  windowCoveringName,
  measuredBy,
  measuredAt,
  notes
}: MeasurementSummaryProps) => {
  const keyMeasurements = [
    { key: 'measurement_a', label: 'Window Width', unit: 'inches' },
    { key: 'measurement_b', label: 'Window Height', unit: 'inches' },
    { key: 'measurement_e', label: 'Total Height', unit: 'inches' },
    { key: 'measurement_f', label: 'Total Width', unit: 'inches' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Ruler className="h-5 w-5" />
          Measurement Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Header Info */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {measurementType.replace('_', ' ')}
          </Badge>
          {roomName && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="h-3 w-3" />
              {roomName}
            </div>
          )}
          {windowCoveringName && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Layers className="h-3 w-3" />
              {windowCoveringName}
            </div>
          )}
        </div>

        {/* Key Measurements */}
        <div className="grid grid-cols-2 gap-4">
          {keyMeasurements.map(({ key, label, unit }) => (
            <div key={key} className="space-y-1">
              <p className="text-sm font-medium text-gray-700">{label}</p>
              <p className="text-lg font-mono">
                {measurements[key] ? `${measurements[key]}" ${unit}` : 'Not recorded'}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="border-t pt-4 space-y-2">
          {measuredBy && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              Measured by {measuredBy}
            </div>
          )}
          {measuredAt && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              {format(new Date(measuredAt), 'PPP')}
            </div>
          )}
          {notes && (
            <div className="pt-2">
              <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
              <p className="text-sm text-gray-600">{notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
