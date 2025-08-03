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


  // Group surfaces by room
  const surfacesByRoom = surfaces.reduce((acc, surface) => {
    const roomName = surface.room_name || 'Unassigned Room';
    if (!acc[roomName]) {
      acc[roomName] = [];
    }
    acc[roomName].push(surface);
    return acc;
  }, {} as Record<string, any[]>);

  // Calculate room totals
  const getRoomTotals = (roomSurfaces: any[]) => {
    const roomTreatments = roomSurfaces.flatMap(surface => getSurfaceTreatments(surface.id));
    const totalCost = roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);
    const worksheetCount = roomSurfaces.filter(surface => {
      const measurement = getClientMeasurementForSurface(surface);
      return measurement?.measurements && Object.keys(measurement.measurements).length > 0;
    }).length;
    const treatmentCount = roomTreatments.length;
    
    return { totalCost, worksheetCount, treatmentCount };
  };

  return (
    <>
      <div className="space-y-6">
        {Object.entries(surfacesByRoom).map(([roomName, roomSurfaces]) => {
          const { totalCost, worksheetCount, treatmentCount } = getRoomTotals(roomSurfaces as any[]);
          
          return (
            <div key={roomName} className="space-y-3">
              {/* Room Header */}
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{roomName}</h3>
                  <p className="text-2xl font-bold text-green-700">£{totalCost.toFixed(2)}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>

              {/* Room Summary */}
              <div className="flex items-center justify-between px-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {roomName}
                </span>
                <span className="text-sm text-gray-600">
                  {worksheetCount} worksheet{worksheetCount !== 1 ? 's' : ''} • {treatmentCount} treatment{treatmentCount !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Windows in Room */}
              <div className="space-y-3">
                {(roomSurfaces as any[]).map((surface) => {
                  const surfaceTreatments = getSurfaceTreatments(surface.id);
                  const clientMeasurement = getClientMeasurementForSurface(surface);
                  const hasMeasurements = clientMeasurement?.measurements && Object.keys(clientMeasurement.measurements).length > 0;

                  return (
                    <div key={surface.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      {/* Window Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <RectangleHorizontal className="h-5 w-5 text-brand-primary" />
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{surface.name}</h4>
                              {hasMeasurements ? (
                                <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                  Measured
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                                  Needs Measurement
                                </Badge>
                              )}
                            </div>
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
                      {surfaceTreatments.length > 0 ? (
                        <div className="space-y-3">
                          {surfaceTreatments.map((treatment) => (
                            <div key={treatment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              {/* Treatment Header */}
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border">
                                    <span className="text-lg">🪟</span>
                                  </div>
                                  <div>
                                    <h5 className="font-semibold text-gray-900 capitalize">
                                      {treatment.treatment_type} - {treatment.product_name || 'Custom Treatment'}
                                    </h5>
                                    <p className="text-sm text-gray-600">Quantity: {treatment.quantity || 1}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-green-700">
                                    £{treatment.total_price?.toFixed(2) || '0.00'}
                                  </div>
                                  <div className="text-xs text-gray-500">Total price</div>
                                </div>
                              </div>

                              {/* Treatment Specifications Grid */}
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                {treatment.measurements?.rail_width && (
                                  <>
                                    <div className="text-gray-600">Mechanism width</div>
                                    <div className="text-right font-medium">{treatment.measurements.rail_width} cm</div>
                                  </>
                                )}
                                
                                {treatment.measurements?.drop && (
                                  <>
                                    <div className="text-gray-600">Curtain drop</div>
                                    <div className="text-right font-medium">{treatment.measurements.drop} cm</div>
                                  </>
                                )}

                                {treatment.fabric_details?.fabric_type && (
                                  <>
                                    <div className="text-gray-600">Heading name</div>
                                    <div className="text-right font-medium">{treatment.fabric_details.fabric_type}</div>
                                  </>
                                )}

                                {treatment.fabric_details?.heading_fullness && (
                                  <>
                                    <div className="text-gray-600">Fullness</div>
                                    <div className="text-right font-medium">{treatment.fabric_details.heading_fullness}</div>
                                  </>
                                )}

                                <div className="text-gray-600">Lining</div>
                                <div className="text-right font-medium">
                                  {treatment.selected_options?.some(opt => opt.includes('lining')) ? 'Lined' : 'Unlined'}
                                </div>

                                {treatment.fabric_details?.fabric_code && (
                                  <>
                                    <div className="text-gray-600">Fabric article</div>
                                    <div className="text-right font-medium">{treatment.fabric_details.fabric_code}</div>
                                  </>
                                )}

                                {treatment.fabric_details?.fabric_width && (
                                  <>
                                    <div className="text-gray-600">Fabric width</div>
                                    <div className="text-right font-medium">{treatment.fabric_details.fabric_width} cm</div>
                                  </>
                                )}

                                {treatment.measurements?.fabric_usage && (
                                  <>
                                    <div className="text-gray-600">Fabric amount</div>
                                    <div className="text-right font-medium">{treatment.measurements.fabric_usage.toFixed(0)} cm</div>
                                  </>
                                )}

                                {treatment.material_cost && (
                                  <>
                                    <div className="text-gray-600">Fabric price</div>
                                    <div className="text-right font-medium">£{treatment.material_cost.toFixed(2)}</div>
                                  </>
                                )}

                                {treatment.labor_cost && (
                                  <>
                                    <div className="text-gray-600">Manufacturing price</div>
                                    <div className="text-right font-medium">£{treatment.labor_cost.toFixed(2)}</div>
                                  </>
                                )}
                              </div>

                              {/* Selected Options */}
                              {treatment.selected_options && treatment.selected_options.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="text-xs text-gray-600 mb-2">Selected Options:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {treatment.selected_options.map((optionId: string, index: number) => (
                                      <span key={index} className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                        Option #{optionId.slice(-4)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {treatment.notes && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="text-xs text-gray-600 mb-1">Notes:</div>
                                  <div className="text-sm text-gray-700 italic">{treatment.notes}</div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* No treatments - show status */
                        <div className="text-center py-4">
                          {hasMeasurements ? (
                            <span className="text-blue-600 font-medium">Ready for treatment selection</span>
                          ) : (
                            <span className="text-orange-600 font-medium">Measurements needed</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Measurement Worksheet Button */}
              <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors">
                <div className="flex items-center justify-center gap-2">
                  <RectangleHorizontal className="h-5 w-5" />
                  <span>Add Measurement Worksheet</span>
                </div>
              </button>
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
            room_name: surfacesByRoom[Object.keys(surfacesByRoom).find(roomName => 
              surfacesByRoom[roomName].some(s => s.id === selectedSurface.id)
            ) || 'Unknown Room']?.[0]?.room_name || 'Unknown Room'
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
