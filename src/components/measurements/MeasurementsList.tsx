
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ruler, Eye, Edit, Trash2, Calendar, MapPin, Layers } from "lucide-react";
import { useClientMeasurements, useUpdateClientMeasurement } from "@/hooks/useClientMeasurements";
import { useRooms } from "@/hooks/useRooms";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { format } from "date-fns";

interface MeasurementsListProps {
  clientId: string;
  projectId?: string;
  onViewMeasurement: (measurement: any) => void;
  onEditMeasurement: (measurement: any) => void;
}

export const MeasurementsList = ({ 
  clientId, 
  projectId, 
  onViewMeasurement, 
  onEditMeasurement 
}: MeasurementsListProps) => {
  const { data: measurements = [] } = useClientMeasurements(clientId);
  const { data: rooms = [] } = useRooms(projectId);
  const { data: windowCoverings = [] } = useWindowCoverings();
  const updateMeasurement = useUpdateClientMeasurement();

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.name || "Unassigned Room";
  };

  const getWindowCoveringName = (coveringId: string) => {
    const covering = windowCoverings.find(c => c.id === coveringId);
    return covering?.name || "Not Selected";
  };

  const handleDeleteMeasurement = async (measurementId: string) => {
    if (confirm("Are you sure you want to delete this measurement?")) {
      // Note: We'd need to add a delete mutation to the hook
      console.log("Delete measurement:", measurementId);
    }
  };

  if (measurements.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Ruler className="h-8 w-8 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500">No measurements recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {measurements.map((measurement) => (
        <Card key={measurement.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {measurement.measurement_type.replace('_', ' ')}
                  </Badge>
                  {measurement.room_id && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      {getRoomName(measurement.room_id)}
                    </div>
                  )}
                  {measurement.window_covering_id && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Layers className="h-3 w-3" />
                      {getWindowCoveringName(measurement.window_covering_id)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {measurement.measured_at ? 
                    format(new Date(measurement.measured_at), 'PPP') : 
                    'Date not recorded'
                  }
                  {measurement.measured_by && (
                    <span>• Measured by {measurement.measured_by}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onViewMeasurement(measurement)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onEditMeasurement(measurement)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleDeleteMeasurement(measurement.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          {measurement.notes && (
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600">{measurement.notes}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
