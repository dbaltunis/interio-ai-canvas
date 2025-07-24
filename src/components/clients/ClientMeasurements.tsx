
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Ruler, Calendar } from "lucide-react";

interface ClientMeasurementsProps {
  clientId: string;
  onCreateMeasurement?: () => void;
}

export const ClientMeasurements = ({ clientId, onCreateMeasurement }: ClientMeasurementsProps) => {
  // Mock measurements data - replace with actual hook
  const measurements = [
    {
      id: "1",
      room: "Living Room",
      measurement_type: "window",
      measured_at: "2024-01-10",
      measured_by: "John Doe",
      notes: "Standard window measurement"
    },
    {
      id: "2",
      room: "Master Bedroom", 
      measurement_type: "door",
      measured_at: "2024-01-12",
      measured_by: "John Doe",
      notes: "French door measurement"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Measurements</CardTitle>
          {onCreateMeasurement && (
            <Button size="sm" onClick={onCreateMeasurement}>
              <Plus className="h-4 w-4 mr-2" />
              New Measurement
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {measurements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No measurements found for this client.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {measurements.map((measurement) => (
              <div key={measurement.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{measurement.room}</h4>
                  <Badge variant="outline">
                    {measurement.measurement_type}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{measurement.measured_at}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Ruler className="h-4 w-4" />
                    <span>By {measurement.measured_by}</span>
                  </div>
                </div>
                {measurement.notes && (
                  <p className="text-sm text-gray-600 mt-2">{measurement.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
