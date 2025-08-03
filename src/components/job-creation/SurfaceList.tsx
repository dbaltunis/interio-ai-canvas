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

              {/* Treatment Details */}
              {surfaceTreatments.length > 0 && (
                <div className="mb-3 space-y-3">
                  {surfaceTreatments.map((treatment) => (
                    <div key={treatment.id} className="bg-white rounded-md p-3 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-gray-900 capitalize">
                            {treatment.treatment_type} - {treatment.product_name || 'Custom Treatment'}
                          </h5>
                          <p className="text-sm text-gray-600">Quantity: {treatment.quantity || 1}</p>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          ${treatment.total_price?.toFixed(2) || '0.00'}
                        </Badge>
                      </div>
                      
                      {/* Fabric Details */}
                      {treatment.fabric_details && (
                        <div className="mb-2">
                          <h6 className="text-sm font-medium text-gray-700 mb-1">Fabric Requirements:</h6>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            {treatment.fabric_details.fabric_type && (
                              <div>Type: {treatment.fabric_details.fabric_type}</div>
                            )}
                            {treatment.fabric_details.fabric_code && (
                              <div>Code: {treatment.fabric_details.fabric_code}</div>
                            )}
                            {treatment.measurements?.fabric_usage && (
                              <div>Amount: {treatment.measurements.fabric_usage.toFixed(2)}m</div>
                            )}
                            {treatment.fabric_details.fabric_width && (
                              <div>Width: {treatment.fabric_details.fabric_width}"</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Treatment Options/Extras */}
                      {treatment.selected_options && treatment.selected_options.length > 0 && (
                        <div className="mb-2">
                          <h6 className="text-sm font-medium text-gray-700 mb-1">Treatment Options:</h6>
                          <div className="flex flex-wrap gap-1">
                            {treatment.selected_options.map((optionId: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                Option #{optionId.slice(-4)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Measurements */}
                      {treatment.measurements && (
                        <div className="text-xs text-gray-500">
                          <span>Rail: {treatment.measurements.rail_width || 0}"</span>
                          <span className="mx-2">•</span>
                          <span>Drop: {treatment.measurements.drop || 0}"</span>
                          {treatment.measurements.pooling && (
                            <>
                              <span className="mx-2">•</span>
                              <span>Pooling: {treatment.measurements.pooling}"</span>
                            </>
                          )}
                        </div>
                      )}
                      
                      {/* Notes */}
                      {treatment.notes && (
                        <div className="mt-2 text-xs text-gray-600 italic">
                          {treatment.notes}
                        </div>
                      )}
                    </div>
                  ))}
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
      {selectedSurface && (
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
