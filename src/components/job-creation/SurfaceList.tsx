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
    console.log(`=== FINDING MEASUREMENT FOR SURFACE ${surface.name} ===`);
    console.log(`Surface ID: ${surface.id}, Room ID: ${surface.room_id}`);
    console.log(`All client measurements:`, clientMeasurements);
    
    const matchedMeasurement = clientMeasurements?.find(measurement => {
      // First priority: exact match by room_id and surface name in notes
      const roomMatch = measurement.room_id === surface.room_id;
      const nameMatch = measurement.notes?.includes(surface.name);
      
      console.log(`Checking measurement ${measurement.id}: room_match=${roomMatch}, name_match=${nameMatch}, notes="${measurement.notes}"`);
      
      return roomMatch && nameMatch;
    });
    
    console.log(`Found measurement for ${surface.name}:`, matchedMeasurement?.id || 'none');
    console.log(`=== END SURFACE MEASUREMENT LOOKUP ===`);
    return matchedMeasurement;
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
                          // Use rail_width/drop if available (from worksheet), otherwise use measurement_a/b
                          const width = measurements.rail_width || measurements.measurement_a || surface.width;
                          const height = measurements.drop || measurements.measurement_b || surface.height;
                          return `${width}" × ${height}" (From worksheet)`;
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
              {hasMeasurements && (getSurfaceTreatments(surface.id).length > 0 || (clientMeasurement?.measurements && Object.keys(clientMeasurement.measurements).some(key => key.includes('selected_')))) ? (
                <div className="bg-white rounded-lg p-4 border border-gray-200 mb-3">
                  <h5 className="font-medium text-gray-900 mb-3">
                    {(() => {
                      const measurements = clientMeasurement.measurements as Record<string, any>;
                      // Get the actual selected treatment name or default
                      const selectedTreatment = measurements.selected_treatment || measurements.treatment_type || 'Selected Treatment';
                      return selectedTreatment;
                    })()}
                  </h5>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {/* Width and Drop from Treatment */}
                  <div className="text-gray-600">Width × Drop</div>
                  <div className="text-right font-medium">
                    {(() => {
                      const measurements = clientMeasurement.measurements as Record<string, any>;
                      // Get dimensions from treatment measurements or fallback to surface dimensions  
                      const width = measurements.rail_width || measurements.measurement_a || surface.width;
                      const drop = measurements.drop || measurements.measurement_b || surface.height;
                      return `${width}" × ${drop}"`;
                    })()}
                  </div>


                  {/* Heading & Fullness */}
                  <div className="text-gray-600">Heading & Fullness</div>
                  <div className="text-right font-medium">
                    {(() => {
                      const measurements = clientMeasurement.measurements as Record<string, any>;
                      // Get actual selected heading name and fullness
                      const selectedHeading = measurements.selected_heading_name || measurements.heading_type || 'Standard';
                      const fullness = measurements.heading_fullness || measurements.fullness || '2x';
                      return `${selectedHeading} - ${fullness}`;
                    })()}
                  </div>

                  {/* Manufacturing Price */}
                  <div className="text-gray-600">Manufacturing price</div>
                  <div className="text-right font-medium">
                    {(() => {
                      const measurements = clientMeasurement.measurements as Record<string, any>;
                      const manufacturingCost = Number(measurements.manufacturing_cost || measurements.labor_cost || 0);
                      return `£${manufacturingCost.toFixed(2)}`;
                    })()}
                  </div>

                  {/* Lining */}
                  <div className="text-gray-600">Lining</div>
                  <div className="text-right font-medium text-blue-600">
                    {(() => {
                      const measurements = clientMeasurement.measurements as Record<string, any>;
                      const selectedLining = measurements.selected_lining || measurements.lining_type || 'None';
                      const liningCost = Number(measurements.lining_cost || measurements.lining_price || 0);
                      if (liningCost > 0) {
                        return `${selectedLining} - £${liningCost.toFixed(2)}`;
                      }
                      return selectedLining;
                    })()}
                  </div>

                  {/* Fabric Name and Price per Unit */}
                  <div className="text-gray-600">Fabric selected</div>
                  <div className="text-right font-medium">
                    {(() => {
                      const measurements = clientMeasurement.measurements as Record<string, any>;
                      const fabricName = measurements.selected_fabric_name || measurements.fabric_name || 'Selected fabric';
                      const fabricCost = Number(measurements.fabric_cost || measurements.fabric_price || 0);
                      if (fabricCost > 0) {
                        return `${fabricName} - £${fabricCost.toFixed(2)}/m`;
                      }
                      return fabricName;
                    })()}
                  </div>

                  {/* Fabric Total Price */}
                  <div className="text-gray-600">Fabric price (total)</div>
                  <div className="text-right font-medium">
                    {(() => {
                      const measurements = clientMeasurement.measurements as Record<string, any>;
                      const fabricTotal = Number(measurements.fabric_total_cost || measurements.fabric_total_price || 0);
                      return `£${fabricTotal.toFixed(2)}`;
                    })()}
                  </div>

                  {/* Total Cost */}
                  <div className="text-gray-600 font-medium border-t pt-2">Total Cost</div>
                  <div className="text-right font-bold text-green-600 border-t pt-2">
                    {(() => {
                      const measurements = clientMeasurement.measurements as Record<string, any>;
                      // Calculate total from all components
                      const fabricTotal = Number(measurements.fabric_total_cost || measurements.fabric_total_price || 0);
                      const liningCost = Number(measurements.lining_cost || measurements.lining_price || 0);
                      const manufacturingCost = Number(measurements.manufacturing_cost || measurements.labor_cost || 0);
                      const totalCost = Number(measurements.total_cost || measurements.total_price || 0);
                      
                      // Use explicit total if available, otherwise calculate from components
                      const finalTotal = totalCost > 0 ? totalCost : (fabricTotal + liningCost + manufacturingCost);
                      return `£${finalTotal.toFixed(2)}`;
                    })()}
                  </div>
                </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border border-gray-200 mb-3">
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🪟</div>
                    <h5 className="font-medium text-gray-500 mb-2">Empty Window</h5>
                    <p className="text-sm text-gray-400">No treatment selected</p>
                  </div>
                </div>
              )}

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
