import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RectangleHorizontal, Trash2, Eye } from "lucide-react";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";
import { WindowManagementDialog } from "./WindowManagementDialog";

interface SurfaceListProps {
  surfaces: any[];
  treatments: any[];
  clientId?: string;
  projectId?: string;
  onAddTreatment: (surfaceId: string, treatmentType: string, treatmentData?: any) => void;
  onUpdateSurface: (surfaceId: string, updates: any) => void;
  onDeleteSurface: (surfaceId: string) => void;
}

export const SurfaceList = ({
  surfaces,
  treatments,
  clientId,
  projectId,
  onAddTreatment,
  onUpdateSurface,
  onDeleteSurface
}: SurfaceListProps) => {
  const [selectedSurface, setSelectedSurface] = useState<any>(null);
  const [showWindowDialog, setShowWindowDialog] = useState(false);
  
  const { data: clientMeasurements } = useClientMeasurements(clientId);

  const handleViewWindow = (surface: any) => {
    setSelectedSurface(surface);
    setShowWindowDialog(true);
  };

  const handleCloseWindow = () => {
    setSelectedSurface(null);
    setShowWindowDialog(false);
  };

  // Find matching client measurement for a surface
  const getClientMeasurementForSurface = (surface: any) => {
    return clientMeasurements?.find(measurement => 
      measurement.notes?.includes(surface.name) || 
      measurement.project_id === projectId
    );
  };

  const getSurfaceTreatments = (surfaceId: string) => {
    return treatments.filter(t => t.window_id === surfaceId);
  };


  return (
    <>
      <div className="space-y-3">
        {surfaces.map((surface) => {
          const surfaceTreatments = getSurfaceTreatments(surface.id);
          const clientMeasurement = getClientMeasurementForSurface(surface);
          const hasMeasurements = clientMeasurement?.measurements && Object.keys(clientMeasurement.measurements).length > 0;

          return (
            <div key={surface.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <RectangleHorizontal className="h-5 w-5 text-brand-primary" />
                  
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      {surface.name}
                      {hasMeasurements ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                          Measured
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                          Needs Measurement
                        </Badge>
                      )}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {hasMeasurements ? (
                        (() => {
                          const measurements = clientMeasurement.measurements as Record<string, any>;
                          return (
                            <>
                              {clientMeasurement.measurement_type?.replace('_', ' ')} • 
                              {measurements.measurement_a ? ` ${measurements.measurement_a}"` : ''} × 
                              {measurements.measurement_b ? ` ${measurements.measurement_b}"` : ''}
                            </>
                          );
                        })()
                      ) : (
                        `${surface.width}" × ${surface.height}" (Basic dimensions)`
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleViewWindow(surface)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View Window
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteSurface(surface.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Existing Treatments */}
              {surfaceTreatments.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {surfaceTreatments.map((treatment) => (
                      <Badge key={treatment.id} variant="default" className="capitalize">
                        {treatment.treatment_type} - ${treatment.total_price || 0}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Treatment Summary */}
              <div className="text-center py-2 text-sm text-gray-600">
                {surfaceTreatments.length > 0 ? (
                  <span>
                    {surfaceTreatments.length} treatment{surfaceTreatments.length > 1 ? 's' : ''} configured • 
                    Total: ${surfaceTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0).toFixed(2)}
                  </span>
                ) : hasMeasurements ? (
                  <span className="text-blue-600">Ready for treatment selection</span>
                ) : (
                  <span className="text-orange-600">Measurements needed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Window Management Dialog */}
      {selectedSurface && clientId && (
        <WindowManagementDialog
          isOpen={showWindowDialog}
          onClose={handleCloseWindow}
          surface={{
            ...selectedSurface,
            room_name: surfaces.find(s => s.id === selectedSurface.id)?.room_name || 'Unknown Room'
          }}
          clientId={clientId}
          projectId={projectId || ''}
          existingMeasurement={getClientMeasurementForSurface(selectedSurface)}
          existingTreatments={getSurfaceTreatments(selectedSurface.id)}
          onSaveTreatment={(treatmentData) => onAddTreatment(selectedSurface.id, treatmentData.treatment_type, treatmentData)}
        />
      )}
    </>
  );
};
