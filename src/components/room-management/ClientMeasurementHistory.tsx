
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Eye, Clock, Home } from "lucide-react";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";
import { MeasurementWorksheet } from "../measurements/MeasurementWorksheet";

interface ClientMeasurementHistoryProps {
  clientId: string;
  currentProjectId?: string;
  onCopyMeasurement?: (measurement: any) => void;
}

export const ClientMeasurementHistory = ({
  clientId,
  currentProjectId,
  onCopyMeasurement
}: ClientMeasurementHistoryProps) => {
  const [selectedMeasurement, setSelectedMeasurement] = useState<any>(null);
  const [showViewer, setShowViewer] = useState(false);
  
  const { data: measurements = [] } = useClientMeasurements(clientId);

  const groupedMeasurements = measurements.reduce((acc, measurement) => {
    const projectId = measurement.project_id || 'no_project';
    if (!acc[projectId]) {
      acc[projectId] = [];
    }
    acc[projectId].push(measurement);
    return acc;
  }, {} as Record<string, any[]>);

  const handleViewMeasurement = (measurement: any) => {
    setSelectedMeasurement(measurement);
    setShowViewer(true);
  };

  const handleCopyMeasurement = (measurement: any) => {
    onCopyMeasurement?.(measurement);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Previous Measurements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(groupedMeasurements).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No previous measurements found</p>
              <p className="text-sm">This is a new client</p>
            </div>
          ) : (
            Object.entries(groupedMeasurements).map(([projectId, projectMeasurements]) => (
              <Card key={projectId} className="bg-muted/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <span className="font-medium">
                        {projectId === 'no_project' ? 'General Measurements' : `Project ${projectId.slice(0, 8)}...`}
                      </span>
                    </div>
                    <Badge variant="secondary">
                      {projectMeasurements.length} measurements
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {projectMeasurements.map((measurement) => (
                    <div
                      key={measurement.id}
                      className="flex items-center justify-between p-2 bg-background rounded border"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {measurement.measurement_type} - {new Date(measurement.measured_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Measured by: {measurement.measured_by || 'Unknown'}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewMeasurement(measurement)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {currentProjectId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyMeasurement(measurement)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Measurement Viewer Dialog */}
      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              View Measurement - {selectedMeasurement?.measurement_type}
            </DialogTitle>
          </DialogHeader>
          {selectedMeasurement && (
            <MeasurementWorksheet
              clientId={clientId}
              projectId={selectedMeasurement.project_id}
              existingMeasurement={selectedMeasurement}
              onSave={() => setShowViewer(false)}
              readOnly={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
