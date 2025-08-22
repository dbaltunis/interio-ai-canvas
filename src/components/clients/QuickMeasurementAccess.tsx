
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ruler, Calendar, User, Eye, Plus, FileText } from "lucide-react";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";
import { useClientJobs } from "@/hooks/useClientJobs";
import { formatDistanceToNow } from "date-fns";

interface QuickMeasurementAccessProps {
  clientId: string;
  clientName: string;
}

export const QuickMeasurementAccess = ({ clientId, clientName }: QuickMeasurementAccessProps) => {
  const { data: measurements } = useClientMeasurements(clientId);
  const { data: projects } = useClientJobs(clientId);
  const [selectedMeasurement, setSelectedMeasurement] = useState<any>(null);

  // Get measurements from projects as well - temporarily disabled until proper project measurements integration
  const projectMeasurements: any[] = []; // Will implement proper project measurements later

  const totalMeasurements = (measurements?.length || 0) + projectMeasurements.length;

  const handleViewMeasurement = (measurement: any) => {
    setSelectedMeasurement(measurement);
  };

  const getMeasurementSummary = (measurementData: any) => {
    if (!measurementData) return "No measurements";
    
    try {
      const data = typeof measurementData === 'string' ? JSON.parse(measurementData) : measurementData;
      const entries = Object.entries(data);
      if (entries.length === 0) return "No measurements";
      
      return `${entries.length} measurement${entries.length !== 1 ? 's' : ''}`;
    } catch {
      return "Invalid measurement data";
    }
  };

  const getPhotoCount = (photos: any) => {
    if (!photos) return 0;
    
    try {
      if (Array.isArray(photos)) {
        return photos.length;
      }
      if (typeof photos === 'string') {
        const parsed = JSON.parse(photos);
        return Array.isArray(parsed) ? parsed.length : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Measurements ({totalMeasurements})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalMeasurements === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Ruler className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No measurements recorded yet</p>
              <Button className="mt-2" variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Take Measurements
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Direct client measurements */}
              {measurements?.slice(0, 3).map((measurement) => (
                <div key={measurement.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {measurement.measurement_type.replace('_', ' ')}
                      </Badge>
                      {measurement.measured_by && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {measurement.measured_by}
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium">
                      {getMeasurementSummary(measurement.measurements)}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(measurement.measured_at), { addSuffix: true })}
                      </div>
                      {getPhotoCount(measurement.photos) > 0 && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {getPhotoCount(measurement.photos)} photo{getPhotoCount(measurement.photos) !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewMeasurement(measurement)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Project measurements - temporarily disabled */}

              {totalMeasurements > 3 && (
                <Button variant="outline" size="sm" className="w-full">
                  View All {totalMeasurements} Measurements
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Measurement Details Modal */}
      {selectedMeasurement && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {selectedMeasurement.type === 'project' 
                    ? `Project: ${selectedMeasurement.project_name}` 
                    : `${selectedMeasurement.measurement_type?.replace('_', ' ') || 'Measurement'}`
                  }
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedMeasurement(null)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedMeasurement.measured_by && (
                  <div>
                    <p className="text-sm text-muted-foreground">Measured by</p>
                    <p className="font-medium">{selectedMeasurement.measured_by}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Measurements</p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(
                        typeof selectedMeasurement.measurements === 'string' 
                          ? JSON.parse(selectedMeasurement.measurements)
                          : selectedMeasurement.measurements, 
                        null, 
                        2
                      )}
                    </pre>
                  </div>
                </div>

                {selectedMeasurement.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p>{selectedMeasurement.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
