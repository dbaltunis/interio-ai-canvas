import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RectangleHorizontal, Trash2, Eye } from "lucide-react";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";
import { WindowManagementDialog } from "./WindowManagementDialog";
import { useUserCurrency, formatCurrency } from "@/components/job-creation/treatment-pricing/window-covering-options/currencyUtils";
import { useBusinessSettings, formatMeasurement } from "@/hooks/useBusinessSettings";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";

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
  const { data: inventory = [] } = useEnhancedInventory();
  const { data: curtainTemplates = [] } = useCurtainTemplates();
  const userCurrency = useUserCurrency();
  const { data: businessSettings } = useBusinessSettings();
  
  // Get measurement units from business settings
  const getMeasurementUnits = () => {
    try {
      return businessSettings?.measurement_units 
        ? JSON.parse(businessSettings.measurement_units) 
        : { length: 'inches', currency: 'USD' };
    } catch {
      return { length: 'inches', currency: 'USD' };
    }
  };
  
  const units = getMeasurementUnits();

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

  // Calculate fabric usage for a surface (using same logic as VisualMeasurementSheet)
  const calculateSurfaceFabricUsage = (measurements: Record<string, any>) => {
    const selectedFabric = measurements.selected_fabric;
    const railWidth = Number(measurements.rail_width || 0);
    const drop = Number(measurements.drop || 0);
    const selectedTemplate = measurements.selected_template;
    
    if (!selectedFabric || !railWidth || !drop || !selectedTemplate) {
      return null;
    }

    const selectedFabricItem = inventory.find(item => item.id === selectedFabric);
    if (!selectedFabricItem) {
      return null;
    }

    try {
      const pooling = parseFloat(measurements.pooling_amount || "0");
      
      // Get template data
      const template = curtainTemplates.find(t => t.id === selectedTemplate);
      if (!template) return null;
      
      const fabricWidthCm = selectedFabricItem.fabric_width || 137;
      
      // Manufacturing allowances from template
      const headerHem = template.header_allowance || 8;
      const bottomHem = template.bottom_hem || 8;
      const sideHems = template.side_hems || 0;
      const seamHems = template.seam_hems || 0;
      const returnLeft = template.return_left || 0;
      const returnRight = template.return_right || 0;
      
      // Calculate required width with fullness
      const requiredWidth = railWidth * template.fullness_ratio;
      const curtainCount = template.curtain_type === 'pair' ? 2 : 1;
      const totalSideHems = sideHems * 2 * curtainCount;
      const totalWidthWithAllowances = requiredWidth + returnLeft + returnRight + totalSideHems;
      
      // Calculate widths needed
      const widthsRequired = Math.ceil(totalWidthWithAllowances / fabricWidthCm);
      const totalSeamAllowance = widthsRequired > 1 ? (widthsRequired - 1) * seamHems * 2 : 0;
      
      // Calculate total drop with allowances
      const totalDrop = drop + headerHem + bottomHem + pooling;
      const wasteMultiplier = 1 + ((template.waste_percent || 0) / 100);
      
      // Linear metres calculation
      const linearMeters = ((totalDrop + totalSeamAllowance) / 100) * widthsRequired * wasteMultiplier;
      
      // Pricing
      const pricePerMeter = selectedFabricItem.price_per_meter || selectedFabricItem.unit_price || selectedFabricItem.selling_price || 0;
      const fabricCost = linearMeters * pricePerMeter;
      
      // Lining cost
      let liningCost = 0;
      const liningType = measurements.selected_lining;
      if (liningType && liningType !== 'none') {
        const liningCostPerMetre = liningType === 'Interlining' ? 26.63 : 15;
        liningCost = linearMeters * liningCostPerMetre;
      }
      
      // Manufacturing cost (based on template pricing)
      let manufacturingCost = 0;
      if (template.pricing_type === 'per_metre') {
        manufacturingCost = linearMeters * (template.machine_price_per_metre || 0);
      } else if (template.pricing_type === 'per_drop') {
        manufacturingCost = widthsRequired * (template.machine_price_per_drop || 0);
      }
      
      const totalCost = fabricCost + liningCost + manufacturingCost;
      
      return {
        linearMeters,
        widthsRequired,
        fabricCost,
        liningCost,
        manufacturingCost,
        totalCost,
        pricePerMeter,
        fabricName: selectedFabricItem.name || 'Selected Fabric',
        liningType: liningType || 'None'
      };
    } catch (error) {
      console.error('Error calculating fabric usage:', error);
      return null;
    }
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
                          return `${formatMeasurement(width, units.length)} × ${formatMeasurement(height, units.length)} (From worksheet)`;
                        })()
                      ) : (
                        `${formatMeasurement(surface.width, units.length)} × ${formatMeasurement(surface.height, units.length)} (Basic dimensions)`
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
                       // Display the actual treatment type from worksheet
                       return measurements.treatment_type || measurements.selected_treatment || 'Curtains';
                     })()}
                   </h5>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                   {/* Fabric Calculation - Using actual worksheet data */}
                   {(() => {
                     const measurements = clientMeasurement.measurements as Record<string, any>;
                     const selectedTemplate = measurements.selected_template;
                     const selectedFabric = measurements.selected_fabric;
                     const railWidth = Number(measurements.rail_width || 0);
                     const drop = Number(measurements.drop || 0);
                     
                     // Debug logging to see what data we have
                     console.log('SurfaceList - Measurement data check:', {
                       selectedTemplate,
                       selectedFabric,
                       railWidth,
                       drop,
                       allMeasurements: measurements
                     });
                     
                     if (selectedTemplate && selectedFabric && railWidth && drop) {
                       // Use the actual fabric calculation from the worksheet
                       try {
                         const fabricCalculation = calculateSurfaceFabricUsage(measurements);
                         console.log('SurfaceList - Fabric calculation result:', fabricCalculation);
                        
                         if (fabricCalculation) {
                           return (
                             <>
                               {/* Cost Calculation Header */}
                               <div className="col-span-2 font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
                                 <span className="text-lg">💰</span>
                                 Cost Calculation
                               </div>
                               
                                {/* Template Information */}
                                <div className="col-span-2 bg-blue-50 p-3 rounded-lg mb-3">
                                  <div className="text-sm text-gray-600 mb-1">
                                    Template: <span className="font-medium text-blue-700">
                                      {(() => {
                                        const template = curtainTemplates.find(t => t.id === selectedTemplate);
                                        return template?.name || selectedTemplate || measurements.treatment_type || 'Unknown Template';
                                      })()}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Pricing: {(() => {
                                      const template = curtainTemplates.find(t => t.id === selectedTemplate);
                                      return template?.pricing_type || 'per_metre';
                                    })()} • 
                                    Waste factor: {(() => {
                                      const template = curtainTemplates.find(t => t.id === selectedTemplate);
                                      return measurements.waste_factor || template?.waste_percent || 5;
                                    })()}%
                                  </div>
                                </div>
                               
                               {/* Fabric Usage */}
                               <div className="text-gray-600 flex items-center gap-1">
                                 <span className="text-blue-600">🧵</span>
                                 Fabric
                               </div>
                               <div className="text-right font-medium">
                                 <div className="font-bold text-lg">{formatCurrency(fabricCalculation.fabricCost, userCurrency)}</div>
                                 <div className="text-sm text-gray-600">
                                   {fabricCalculation.linearMeters.toFixed(2)}m linear ({fabricCalculation.widthsRequired} width(s) × {(drop/100).toFixed(2)}m drop)
                                 </div>
                                  <div className="text-xs text-blue-600">
                                    {(() => {
                                      const fabricItem = inventory.find(item => item.id === selectedFabric);
                                      return fabricItem?.name || 'Selected Fabric';
                                    })()} • {formatCurrency(fabricCalculation.pricePerMeter, userCurrency)}/m
                                  </div>
                               </div>
                               
                               {/* Lining (if selected) */}
                               {fabricCalculation.liningCost > 0 && (
                                 <>
                                   <div className="text-gray-600 flex items-center gap-1">
                                     <span className="text-purple-600">📋</span>
                                     Lining
                                   </div>
                                   <div className="text-right font-medium">
                                     <div className="font-bold text-lg text-purple-600">
                                       {formatCurrency(fabricCalculation.liningCost, userCurrency)}
                                     </div>
                                     <div className="text-sm text-gray-600">{fabricCalculation.liningType}</div>
                                   </div>
                                 </>
                               )}
                               
                               {/* Manufacturing */}
                               <div className="text-gray-600 flex items-center gap-1">
                                 <span className="text-orange-600">🏭</span>
                                 Manufacturing
                               </div>
                               <div className="text-right font-medium">
                                 <div className="font-bold text-lg text-orange-600">
                                   {formatCurrency(fabricCalculation.manufacturingCost, userCurrency)}
                                 </div>
                                  <div className="text-sm text-gray-600">{(() => {
                                    const template = curtainTemplates.find(t => t.id === selectedTemplate);
                                    return template?.manufacturing_type || 'machine';
                                  })()}</div>
                               </div>
                               
                               {/* View calculation details link */}
                               <div className="col-span-2 text-center mt-2">
                                 <button className="text-xs text-blue-500 hover:text-blue-700 underline">
                                   View calculation details
                                 </button>
                               </div>
                               
                               {/* Total Cost */}
                               <div className="col-span-2 border-t pt-3 mt-3">
                                 <div className="flex items-center justify-between">
                                   <span className="text-gray-800 font-semibold flex items-center gap-1">
                                     <span className="text-green-600">💲</span>
                                     Total Cost
                                   </span>
                                   <span className="font-bold text-green-600 text-xl">
                                     {formatCurrency(fabricCalculation.totalCost, userCurrency)}
                                   </span>
                                 </div>
                               </div>
                             </>
                           );
                         }
                      } catch (error) {
                        console.error('Error calculating fabric usage for display:', error);
                      }
                    }
                    
                     // Fallback to detailed diagnostic display
                     return (
                       <>
                         {/* Diagnostic Information */}
                         <div className="col-span-2 font-medium text-orange-600 mb-2 pb-2 border-b border-orange-200">
                           Missing Data for Calculation
                         </div>
                         
                         {/* Width and Drop */}
                         <div className="text-gray-600">Width × Drop</div>
                         <div className="text-right font-medium">
                           {railWidth ? `${formatMeasurement(railWidth, units.length)}` : '❌ Missing'} × 
                           {drop ? `${formatMeasurement(drop, units.length)}` : '❌ Missing'}
                         </div>
                         
                           {/* Template Status */}
                           <div className="text-gray-600">
                             {(() => {
                               const template = curtainTemplates.find(t => t.id === selectedTemplate) || 
                                              curtainTemplates.find(t => t.name === measurements.treatment_type);
                               return template ? template.name : (measurements.treatment_type || 'Template');
                             })()}
                           </div>
                           <div className="text-right font-medium">
                             {(() => {
                               const hasTemplate = selectedTemplate || measurements.treatment_type || measurements.selected_treatment || measurements.template_id;
                               if (hasTemplate) {
                                 const template = curtainTemplates.find(t => t.id === selectedTemplate) || 
                                                curtainTemplates.find(t => t.name === measurements.treatment_type);
                                 return (
                                   <div>
                                     <span className="text-green-600">✓ Selected</span>
                                     {template && <div className="text-xs text-gray-500">{template.name}</div>}
                                   </div>
                                 );
                               }
                               return <span className="text-red-600">❌ Not selected</span>;
                             })()}
                           </div>
                          
                          {/* Fabric Status */}
                          <div className="text-gray-600">Fabric</div>
                          <div className="text-right font-medium">
                            {(() => {
                              if (selectedFabric) {
                                const fabricItem = inventory.find(item => item.id === selectedFabric);
                                return (
                                  <div>
                                    <span className="text-green-600">✓ Selected</span>
                                    {fabricItem && <div className="text-xs text-gray-500">{fabricItem.name}</div>}
                                  </div>
                                );
                              }
                              return <span className="text-red-600">❌ Not selected</span>;
                            })()}
                          </div>
                          
                          {/* Available Data Summary */}
                          <div className="col-span-2 mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="text-xs text-blue-700">
                              <div className="font-medium mb-1">Available data in worksheet:</div>
                              <div>• Rail Width: {railWidth ? `${railWidth}cm` : 'Missing'}</div>
                              <div>• Drop: {drop ? `${drop}cm` : 'Missing'}</div>
                              <div>• Template: {(() => {
                                const template = curtainTemplates.find(t => t.id === selectedTemplate) || 
                                               curtainTemplates.find(t => t.name === measurements.treatment_type);
                                return template ? template.name : (selectedTemplate ? 'ID: ' + selectedTemplate : 'Missing');
                              })()}</div>
                              <div>• Fabric: {(() => {
                                const fabricItem = inventory.find(item => item.id === selectedFabric);
                                return fabricItem ? fabricItem.name : (selectedFabric ? 'ID: ' + selectedFabric : 'Missing');
                              })()}</div>
                              {(!selectedTemplate || !selectedFabric || !railWidth || !drop) && (
                                <div className="mt-2 text-xs text-orange-600">
                                  Complete the measurement worksheet to see pricing calculations.
                                </div>
                              )}
                            </div>
                          </div>
                       </>
                     );
                  })()}
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
                        <div className="text-right font-medium">{formatCurrency(treatment.material_cost || 0, userCurrency)}</div>

                        <div className="text-gray-600">Labor Cost</div>
                        <div className="text-right font-medium">{formatCurrency(treatment.labor_cost || 0, userCurrency)}</div>

                        <div className="text-gray-600 font-medium">Total Price</div>
                        <div className="text-right font-bold text-green-600">
                          {formatCurrency(treatment.total_price || 0, userCurrency)}
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
