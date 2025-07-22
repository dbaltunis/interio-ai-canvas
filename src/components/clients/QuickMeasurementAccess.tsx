
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ruler, Plus, Eye, Calendar } from "lucide-react";
import { MeasurementWorksheet } from "../measurements/MeasurementWorksheet";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";
import { format } from "date-fns";

interface QuickMeasurementAccessProps {
  clientId: string;
  clientName: string;
}

export const QuickMeasurementAccess = ({ clientId, clientName }: QuickMeasurementAccessProps) => {
  const [showNewMeasurement, setShowNewMeasurement] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<any>(null);
  const { data: measurements = [] } = useClientMeasurements(clientId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Measurements
          </div>
          <Dialog open={showNewMeasurement} onOpenChange={setShowNewMeasurement}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-3 w-3 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Measurements for {clientName}</DialogTitle>
              </DialogHeader>
              <MeasurementWorksheet
                clientId={clientId}
                onSave={() => setShowNewMeasurement(false)}
              />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {measurements.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Ruler className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No measurements yet</p>
          </div>
        ) : (
          measurements.slice(0, 3).map((measurement) => (
            <div 
              key={measurement.id} 
              className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedMeasurement(measurement)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {measurement.measurement_type}
                  </Badge>
                  {measurement.measured_at && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(measurement.measured_at), 'MMM d')}
                    </div>
                  )}
                </div>
                {measurement.notes && (
                  <p className="text-xs text-gray-600 truncate mt-1">
                    {measurement.notes}
                  </p>
                )}
              </div>
              <Button size="sm" variant="ghost">
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
        
        {measurements.length > 3 && (
          <Button variant="outline" size="sm" className="w-full text-xs">
            View all {measurements.length} measurements
          </Button>
        )}

        {/* View existing measurement dialog */}
        <Dialog open={!!selectedMeasurement} onOpenChange={() => setSelectedMeasurement(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View Measurement - {clientName}</DialogTitle>
            </DialogHeader>
            {selectedMeasurement && (
              <MeasurementWorksheet
                clientId={clientId}
                existingMeasurement={selectedMeasurement}
                onSave={() => setSelectedMeasurement(null)}
                readOnly={true}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
