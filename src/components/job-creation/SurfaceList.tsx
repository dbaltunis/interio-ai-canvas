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

              {/* Worksheet Treatments Display */}
              {hasMeasurements ? (
                <div className="bg-white rounded-lg p-4 border border-gray-200 mb-3">
                  <h5 className="font-medium text-gray-900 mb-3">Worksheet Details</h5>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {/* Basic measurements */}
                    <div className="text-gray-600">Width × Drop</div>
                    <div className="text-right font-medium">
                      {(() => {
                        const measurements = clientMeasurement.measurements as Record<string, any>;
                        return `${measurements.measurement_a || measurements.width || surface.width}" × ${measurements.measurement_b || measurements.drop || surface.height}"`;
                      })()}
                    </div>

                    {/* Treatment Type */}
                    <div className="text-gray-600">Treatment selected</div>
                    <div className="text-right font-medium">
                      {(() => {
                        const measurements = clientMeasurement.measurements as Record<string, any>;
                        return measurements.selected_treatment || 'Not selected';
                      })()}
                    </div>

                    {/* Heading & Fullness */}
                    <div className="text-gray-600">Heading & Fullness</div>
                    <div className="text-right font-medium">
                      {(() => {
                        const measurements = clientMeasurement.measurements as Record<string, any>;
                        return measurements.selected_heading ? 
                          `${measurements.selected_heading}${measurements.fullness_ratio ? ` - ${measurements.fullness_ratio}x` : ''}` :
                          'Not selected';
                      })()}
                    </div>

                    {/* Manufacturing Price */}
                    <div className="text-gray-600">Manufacturing price</div>
                    <div className="text-right font-medium">
                      {(() => {
                        const measurements = clientMeasurement.measurements as Record<string, any>;
                        return measurements.manufacturing_price ? 
                          `£${Number(measurements.manufacturing_price).toFixed(2)}` : 
                          '£0.00';
                      })()}
                    </div>

                    {/* Lining */}
                    <div className="text-gray-600">Lining</div>
                    <div className="text-right font-medium">
                      {(() => {
                        const measurements = clientMeasurement.measurements as Record<string, any>;
                        return measurements.selected_lining ? (
                          <span className="text-blue-600">
                            {measurements.selected_lining}
                            {measurements.lining_price && ` - £${Number(measurements.lining_price).toFixed(2)}`}
                          </span>
                        ) : (
                          <span className="text-gray-400">No lining</span>
                        );
                      })()}
                    </div>

                    {/* Fabric */}
                    <div className="text-gray-600">Fabric selected</div>
                    <div className="text-right font-medium">
                      {(() => {
                        const measurements = clientMeasurement.measurements as Record<string, any>;
                        return measurements.selected_fabric || 'Not selected';
                      })()}
                    </div>

                    <div className="text-gray-600">Fabric price (total)</div>
                    <div className="text-right font-medium">
                      {(() => {
                        const measurements = clientMeasurement.measurements as Record<string, any>;
                        return measurements.fabric_total_price ? 
                          `£${Number(measurements.fabric_total_price).toFixed(2)}` : 
                          '£0.00';
                      })()}
                    </div>

                    <div className="text-gray-600">Fabric price (per unit)</div>
                    <div className="text-right font-medium">
                      {(() => {
                        const measurements = clientMeasurement.measurements as Record<string, any>;
                        return measurements.fabric_price_per_unit ? 
                          `£${Number(measurements.fabric_price_per_unit).toFixed(2)}` : 
                          '£0.00';
                      })()}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Configured Treatments Display */}
              {surfaceTreatments.length > 0 && (
                <div className="space-y-3 mb-3">
                  <h5 className="font-medium text-gray-900">Configured Treatments</h5>
                  {surfaceTreatments.map((treatment, index) => (
                    <div key={treatment.id} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h6 className="font-medium text-gray-800">Treatment {index + 1}</h6>
                        <Badge variant="outline" className="text-xs">
                          {treatment.status || 'planned'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="text-gray-600">Type</div>
                        <div className="text-right font-medium">{treatment.treatment_type}</div>

                        <div className="text-gray-600">Product</div>
                        <div className="text-right font-medium">{treatment.product_name || 'Not specified'}</div>

                        <div className="text-gray-600">Fabric</div>
                        <div className="text-right font-medium">
                          {treatment.fabric_details?.fabric_code || treatment.fabric_type || 'Not selected'}
                        </div>

                        <div className="text-gray-600">Color/Pattern</div>
                        <div className="text-right font-medium">
                          {treatment.color || treatment.pattern || 'Not specified'}
                        </div>

                        <div className="text-gray-600">Hardware</div>
                        <div className="text-right font-medium">{treatment.hardware || 'Not specified'}</div>

                        <div className="text-gray-600">Material Cost</div>
                        <div className="text-right font-medium">£{treatment.material_cost?.toFixed(2) || '0.00'}</div>

                        <div className="text-gray-600">Labor Cost</div>
                        <div className="text-right font-medium">£{treatment.labor_cost?.toFixed(2) || '0.00'}</div>

                        <div className="text-gray-600 font-medium">Total Price</div>
                        <div className="text-right font-bold text-green-600">
                          £{treatment.total_price?.toFixed(2) || '0.00'}
                        </div>
                      </div>

                      {treatment.notes && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {treatment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

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
