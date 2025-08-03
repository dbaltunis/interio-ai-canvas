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
                    <h4 className="font-medium text-gray-900">{surface.name}</h4>
                    <p className="text-sm text-gray-500">
                      {hasMeasurements ? (
                        (() => {
                          const measurements = clientMeasurement.measurements as Record<string, any>;
                          return `${measurements.measurement_a || surface.width}" × ${measurements.measurement_b || surface.height}"`;
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

              {/* Window Details Display - From Worksheet */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 mb-3">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {/* Treatment Type */}
                  <div className="text-gray-600">Treatment selected</div>
                  <div className="text-right font-medium">
                    {(() => {
                      const measurements = hasMeasurements ? clientMeasurement.measurements as Record<string, any> : null;
                      return measurements?.selected_treatment ? 
                        measurements.selected_treatment : 
                        (surfaceTreatments.length > 0 ? surfaceTreatments[0].treatment_type : 'None selected');
                    })()}
                  </div>

                  {/* Width and Drop */}
                  <div className="text-gray-600">Width × Drop</div>
                  <div className="text-right font-medium">
                    {hasMeasurements ? (
                      (() => {
                        const measurements = clientMeasurement.measurements as Record<string, any>;
                        return `${measurements.measurement_a || measurements.width || surface.width}" × ${measurements.measurement_b || measurements.drop || surface.height}"`;
                      })()
                    ) : (
                      `${surface.width}" × ${surface.height}"`
                    )}
                  </div>

                  {/* Heading Option with Fullness */}
                  <div className="text-gray-600">Heading & Fullness</div>
                  <div className="text-right font-medium">
                    {(() => {
                      const measurements = hasMeasurements ? clientMeasurement.measurements as Record<string, any> : null;
                      return measurements?.selected_heading ? (
                        `${measurements.selected_heading}${measurements.fullness_ratio ? ` - ${measurements.fullness_ratio}x` : ''}`
                      ) : surfaceTreatments.length > 0 && surfaceTreatments[0].fabric_details?.fabric_type ? (
                        `${surfaceTreatments[0].fabric_details.fabric_type} - ${surfaceTreatments[0].fabric_details.heading_fullness || '1.0x'}`
                      ) : (
                        'Not selected'
                      );
                    })()}
                  </div>

                  {/* Manufacturing Price */}
                  <div className="text-gray-600">Manufacturing price</div>
                  <div className="text-right font-medium">
                    {(() => {
                      const measurements = hasMeasurements ? clientMeasurement.measurements as Record<string, any> : null;
                      return measurements?.manufacturing_price ? (
                        `£${Number(measurements.manufacturing_price).toFixed(2)}`
                      ) : surfaceTreatments.length > 0 && surfaceTreatments[0].labor_cost ? (
                        `£${surfaceTreatments[0].labor_cost.toFixed(2)}`
                      ) : (
                        '£0.00'
                      );
                    })()}
                  </div>

                  {/* Lining Selection and Price */}
                  <div className="text-gray-600">Lining</div>
                  <div className="text-right font-medium">
                    {(() => {
                      const measurements = hasMeasurements ? clientMeasurement.measurements as Record<string, any> : null;
                      return measurements?.selected_lining ? (
                        <span className="text-blue-600">
                          {measurements.selected_lining}
                          {measurements.lining_price && ` - £${Number(measurements.lining_price).toFixed(2)}`}
                        </span>
                      ) : surfaceTreatments.length > 0 ? (
                        surfaceTreatments[0].selected_options?.some((opt: string) => opt.includes('lining')) ? (
                          <span className="text-blue-600">Selected - £15.00</span>
                        ) : (
                          <span className="text-gray-400">No lining</span>
                        )
                      ) : (
                        <span className="text-gray-400">No lining</span>
                      );
                    })()}
                  </div>

                  {/* Fabric Selection with Total and Per Unit Price */}
                  <div className="text-gray-600">Fabric selected</div>
                  <div className="text-right font-medium">
                    {(() => {
                      const measurements = hasMeasurements ? clientMeasurement.measurements as Record<string, any> : null;
                      return measurements?.selected_fabric ? (
                        measurements.selected_fabric
                      ) : surfaceTreatments.length > 0 && surfaceTreatments[0].fabric_details?.fabric_code ? (
                        surfaceTreatments[0].fabric_details.fabric_code
                      ) : (
                        'Not selected'
                      );
                    })()}
                  </div>

                  <div className="text-gray-600">Fabric price (total)</div>
                  <div className="text-right font-medium">
                    {(() => {
                      const measurements = hasMeasurements ? clientMeasurement.measurements as Record<string, any> : null;
                      return measurements?.fabric_total_price ? (
                        `£${Number(measurements.fabric_total_price).toFixed(2)}`
                      ) : surfaceTreatments.length > 0 && surfaceTreatments[0].material_cost ? (
                        `£${surfaceTreatments[0].material_cost.toFixed(2)}`
                      ) : (
                        '£0.00'
                      );
                    })()}
                  </div>

                  <div className="text-gray-600">Fabric price (per unit)</div>
                  <div className="text-right font-medium">
                    {(() => {
                      const measurements = hasMeasurements ? clientMeasurement.measurements as Record<string, any> : null;
                      return measurements?.fabric_price_per_unit ? (
                        `£${Number(measurements.fabric_price_per_unit).toFixed(2)}`
                      ) : surfaceTreatments.length > 0 && surfaceTreatments[0].fabric_details?.fabric_cost_per_yard ? (
                        `£${surfaceTreatments[0].fabric_details.fabric_cost_per_yard}`
                      ) : (
                        '£0.00'
                      );
                    })()}
                  </div>
                </div>

                {/* Total Price Section */}
                {surfaceTreatments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">Total Price:</span>
                      <span className="text-2xl font-bold text-green-600">
                        £{surfaceTreatments[0].total_price?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Summary */}
              <div className="text-center py-2 text-sm">
                {surfaceTreatments.length > 0 ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Treatment Configured
                  </Badge>
                ) : hasMeasurements ? (
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    Ready for treatment selection
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    Measurements needed
                  </Badge>
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
