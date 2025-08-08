import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Save, Upload } from "lucide-react";
import { useCreateClientMeasurement, useUpdateClientMeasurement } from "@/hooks/useClientMeasurements";
import { useSaveWindowSummary } from "@/hooks/useWindowSummary";
import { calculateFabricUsage } from "@/components/job-creation/treatment-pricing/fabric-calculation/fabricUsageCalculator";
import { useRooms } from "@/hooks/useRooms";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { VisualMeasurementSheet } from "./VisualMeasurementSheet";
import { MeasurementSummary } from "./MeasurementSummary";
import { cmToM } from "@/utils/unitConversion";
import { useQueryClient } from "@tanstack/react-query";

interface MeasurementWorksheetProps {
  clientId: string;
  projectId?: string;
  surfaceId?: string; // Add surfaceId prop
  existingMeasurement?: any;
  onSave?: () => void;
  readOnly?: boolean;
}

const WINDOW_TYPES = [
  { value: "standard", label: "Standard Window" },
  { value: "bay", label: "Bay Window" },
  { value: "french_doors", label: "French Doors" },
  { value: "sliding_doors", label: "Sliding Doors" },
  { value: "large_window", label: "Large Window" },
  { value: "corner_window", label: "Corner Window" }
];

export const MeasurementWorksheet = ({ 
  clientId, 
  projectId,
  surfaceId, 
  existingMeasurement, 
  onSave,
  readOnly = false
}: MeasurementWorksheetProps) => {
  const [windowType, setWindowType] = useState(existingMeasurement?.measurement_type || "standard");
  const [selectedRoom, setSelectedRoom] = useState(existingMeasurement?.room_id || "no_room");
  const [selectedWindowCovering, setSelectedWindowCovering] = useState(existingMeasurement?.window_covering_id || "no_covering");
  const [measurements, setMeasurements] = useState(existingMeasurement?.measurements || {});
  const [notes, setNotes] = useState(existingMeasurement?.notes || "");
  const [measuredBy, setMeasuredBy] = useState(existingMeasurement?.measured_by || "");
  const [photos, setPhotos] = useState<string[]>(existingMeasurement?.photos || []);

  // Reset state when creating new measurements (when existingMeasurement becomes null)
  useEffect(() => {
    if (!existingMeasurement) {
      setWindowType("standard");
      setSelectedRoom("no_room");
      setSelectedWindowCovering("no_covering");
      setMeasurements({});
      setNotes("");
      setMeasuredBy("");
      setPhotos([]);
      console.log('🔄 RESET: Cleared form state for new measurement');
    }
  }, [existingMeasurement]);

  const createMeasurement = useCreateClientMeasurement();
  const updateMeasurement = useUpdateClientMeasurement();
  const saveWindowSummary = useSaveWindowSummary();
  const { data: rooms = [] } = useRooms(projectId);
  const { data: windowCoverings = [] } = useWindowCoverings();

  // Define which fields are string-based (not numeric)
  const stringFields = ['curtain_type', 'curtain_side', 'hardware_type', 'pooling_option'];

  const handleMeasurementChange = (field: string, value: string) => {
    if (readOnly) return;
    
    console.log(`Changing ${field} to:`, value);
    
    setMeasurements(prev => {
      const newMeasurements = { ...prev };
      
      // For string fields, keep as string
      if (stringFields.includes(field)) {
        newMeasurements[field] = value;
      } else {
        // For numeric fields, convert to number
        newMeasurements[field] = parseFloat(value) || 0;
      }
      
      console.log(`New measurements:`, newMeasurements);
      return newMeasurements;
    });
  };

  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (readOnly) return;
    
    const measurementData = {
      client_id: clientId,
      project_id: projectId,
      room_id: selectedRoom === "no_room" ? null : selectedRoom,
      window_covering_id: selectedWindowCovering === "no_covering" ? null : selectedWindowCovering,
      measurement_type: windowType,
      measurements,
      photos,
      notes,
      measured_by: measuredBy,
      measured_at: new Date().toISOString()
    };

    try {
      let savedMeasurement;
      if (existingMeasurement?.id) {
        savedMeasurement = await updateMeasurement.mutateAsync({
          id: existingMeasurement.id,
          ...measurementData
        });
      } else {
        savedMeasurement = await createMeasurement.mutateAsync(measurementData);
      }
      
      // Calculate and save window summary if we have the required data
      // Check all possible template/heading field names
      const templateId = measurements.selected_template ?? 
                        measurements.selected_heading ?? 
                        measurements.heading_type ??
                        measurements.template_id ??
                        'default_template'; // Use default if none selected
      
      // Check all possible width field names                  
      const railWidthCm = measurements.rail_width ?? 
                         measurements.width ?? 
                         measurements.window_width ??
                         measurements.track_width ?? 0;
                         
      // Check all possible drop/height field names
      const dropCm = measurements.drop ?? 
                    measurements.height ?? 
                    measurements.window_height ??
                    measurements.curtain_drop ?? 0;
      
      console.log('💾 SAVE: Window summary check:', { 
        surfaceId,
        templateId, 
        railWidthCm, 
        dropCm,
        hasTemplateId: !!templateId,
        hasWidth: railWidthCm > 0,
        hasDrop: dropCm > 0,
        measurements: Object.keys(measurements),
        measurementValues: measurements
      });
       
      if (surfaceId && railWidthCm > 0 && dropCm > 0) {
        try {
          console.log('💾 SAVE: Calculating window summary for window_id:', surfaceId);
          
          // Use consistent unit conversion - all calculations in metres
          const railWidthM = cmToM(railWidthCm);
          const dropM = cmToM(dropCm);
          
          // Get fabric details with fallback pricing
          const fabricItem = measurements.fabric_item || measurements.selected_fabric || null;
          const fabricPricePerMeter = fabricItem?.price_per_meter ?? measurements.fabric_price_per_meter ?? 45;
          const fabricWidthCm = measurements.fabric_width ?? fabricItem?.fabric_width ?? 140;
          const fabricWidthM = cmToM(fabricWidthCm);
          
          // Calculate fabric requirements using the same logic as VisualMeasurementSheet
          const fullnessRatio = measurements.fullness ?? 2.0;
          const returnLeft = cmToM(measurements.return_left ?? 7.5);
          const returnRight = cmToM(measurements.return_right ?? 7.5);
          const overlap = cmToM(measurements.overlap ?? 10);
          const bottomHem = cmToM(measurements.bottom_hem ?? 15);
          const headerHem = cmToM(measurements.header_allowance ?? 8);
          const sideHems = cmToM(measurements.side_hems ?? 7.5);
          const seamHems = cmToM(measurements.seam_hems ?? 1.5);
          const wastePercent = measurements.waste_percent ?? 5;
          
          // Required width calculation
          const requiredWidthM = railWidthM * fullnessRatio + returnLeft + returnRight + overlap;
          
          // Calculate widths needed (round up)
          const widthsRequired = Math.ceil(requiredWidthM / fabricWidthM);
          
          // Total drop including hems
          const totalDropM = dropM + bottomHem + headerHem;
          
          // Linear metres calculation (with seam allowances for joining widths)
          const seamAllowance = widthsRequired > 1 ? (widthsRequired - 1) * seamHems : 0;
          const linearMetersBase = widthsRequired * totalDropM;
          const linearMetersWithWaste = linearMetersBase * (1 + wastePercent / 100);
          const linearMeters = linearMetersWithWaste;
          
          // Cost calculations
          const fabricCost = linearMeters * fabricPricePerMeter;
          
          // Lining calculations
          const liningType = measurements.selected_lining ?? null;
          const liningPricePerMeter = measurements.lining_price_per_meter ?? 22;
          const liningCost = liningType ? linearMeters * liningPricePerMeter : 0;
          
          // Manufacturing costs
          const manufacturingType = measurements.manufacturing_type ?? 'machine';
          const manufacturingCost = manufacturingType === 'hand' ? 150 : 50;
          
          // Total cost
          const totalCost = fabricCost + liningCost + manufacturingCost;
          
          // Build detailed breakdown for itemized display
          const costBreakdown: any[] = [
            {
              id: 'fabric',
              name: fabricItem?.name || 'Fabric',
              description: `${Number(linearMeters.toFixed(2))}m × ${widthsRequired} width(s)`,
              quantity: Number(linearMeters.toFixed(2)),
              unit: 'meters',
              unit_price: fabricPricePerMeter,
              total_cost: Number(fabricCost.toFixed(2)),
              category: 'fabric',
              details: {
                fabric_width_cm: fabricWidthCm,
                fullness_ratio: fullnessRatio,
                waste_percent: wastePercent,
                required_width_m: Number(requiredWidthM.toFixed(2)),
                total_drop_m: Number(totalDropM.toFixed(2))
              }
            }
          ];

          if (liningType && liningCost > 0) {
            costBreakdown.push({
              id: 'lining',
              name: liningType,
              description: `${Number(linearMeters.toFixed(2))}m`,
              quantity: Number(linearMeters.toFixed(2)),
              unit: 'meters',
              unit_price: liningPricePerMeter,
              total_cost: Number(liningCost.toFixed(2)),
              category: 'lining',
              details: { 
                type: liningType,
                price_per_meter: liningPricePerMeter
              }
            });
          }

          costBreakdown.push({
            id: 'manufacturing',
            name: `${manufacturingType} Manufacturing`,
            description: manufacturingType === 'hand' ? 'Hand-finished curtains' : 'Machine-made curtains',
            total_cost: Number(manufacturingCost.toFixed(2)),
            category: 'manufacturing',
            details: { 
              type: manufacturingType,
              description: manufacturingType === 'hand' ? 'Hand-finished curtains' : 'Machine-made curtains'
            }
          });

          const summaryData = {
            window_id: surfaceId,
            linear_meters: Number(linearMeters.toFixed(2)),
            widths_required: widthsRequired,
            price_per_meter: Number(fabricPricePerMeter.toFixed(2)),
            fabric_cost: Number(fabricCost.toFixed(2)),
            lining_type: liningType,
            lining_cost: Number(liningCost.toFixed(2)),
            manufacturing_type: manufacturingType,
            manufacturing_cost: Number(manufacturingCost.toFixed(2)),
            total_cost: Number(totalCost.toFixed(2)),
            pricing_type: 'per_metre',
            waste_percent: wastePercent,
            currency: 'GBP',
            // Enhanced breakdown data
            template_name: templateId ? 'Curtain Template' : null,
            template_details: templateId ? { 
              id: templateId,
              name: 'Curtain Template'
            } : {},
            fabric_details: {
              name: fabricItem?.name || 'Fabric',
              width_cm: fabricWidthCm,
              price_per_meter: fabricPricePerMeter,
              meters_used: Number(linearMeters.toFixed(2)),
              total_cost: Number(fabricCost.toFixed(2)),
              widths_required: widthsRequired
            },
            lining_details: liningType ? {
              type: liningType,
              price_per_meter: liningPricePerMeter,
              meters_used: Number(linearMeters.toFixed(2)),
              total_cost: Number(liningCost.toFixed(2))
            } : {},
            heading_details: templateId ? {
              type: 'Template Based',
              cost: 0
            } : {},
            extras_details: [],
            cost_breakdown: costBreakdown,
            measurements_details: {
              rail_width_cm: railWidthCm,
              drop_cm: dropCm,
              fullness_ratio: fullnessRatio,
              return_left: returnLeft,
              return_right: returnRight,
              overlap: overlap,
              bottom_hem: bottomHem,
              header_hem: headerHem,
              side_hems: sideHems,
              seam_hems: seamHems,
              waste_percent: wastePercent
            }
          };
          
          console.log('💾 SAVE: Saving window summary data:', summaryData);
          await saveWindowSummary.mutateAsync(summaryData);
          console.log('💾 SAVE: Window summary saved successfully for window_id:', surfaceId);
          
          // Invalidate queries to refresh the card
          queryClient.invalidateQueries({ queryKey: ['window-summary', surfaceId] });
        } catch (summaryError) {
          console.error('Error saving window summary:', summaryError);
        }
      } else {
        console.log('❌ SAVE: Skipping window summary - missing required data:', {
          surfaceId: !!surfaceId,
          templateId: !!templateId,
          railWidthCm: railWidthCm > 0,
          dropCm: dropCm > 0,
          actualValues: { surfaceId, templateId, railWidthCm, dropCm }
        });
      }

      onSave?.();
    } catch (error) {
      console.error('Error saving measurement:', error);
    }
  };

  const getRoomName = () => {
    if (selectedRoom === "no_room") return null;
    const room = rooms.find(r => r.id === selectedRoom);
    return room?.name;
  };

  const getWindowCoveringName = () => {
    if (selectedWindowCovering === "no_covering") return null;
    const covering = windowCoverings.find(c => c.id === selectedWindowCovering);
    return covering?.name;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {readOnly ? "View Measurement" : "Measurement Worksheet"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="windowType">Window Type</Label>
              <Select value={windowType} onValueChange={setWindowType} disabled={readOnly}>
                <SelectTrigger>
                  <SelectValue placeholder="Select window type" />
                </SelectTrigger>
                <SelectContent>
                  {WINDOW_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {projectId && (
              <div>
                <Label htmlFor="room">Room</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={readOnly}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_room">No Room Selected</SelectItem>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="windowCovering">Window Covering</Label>
              <Select value={selectedWindowCovering} onValueChange={setSelectedWindowCovering} disabled={readOnly}>
                <SelectTrigger>
                  <SelectValue placeholder="Select window covering" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_covering">Not Selected</SelectItem>
                  {windowCoverings.map((covering) => (
                    <SelectItem key={covering.id} value={covering.id}>
                      {covering.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="measuredBy">Measured By</Label>
              <Input
                id="measuredBy"
                value={measuredBy}
                onChange={(e) => setMeasuredBy(e.target.value)}
                placeholder="Enter name"
                readOnly={readOnly}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about the measurements..."
              rows={3}
              readOnly={readOnly}
            />
          </div>

          {!readOnly && (
            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Add Photos
              </Button>
              
              <Button 
                onClick={handleSave}
                disabled={createMeasurement.isPending || updateMeasurement.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {existingMeasurement ? "Update" : "Save"} Measurements
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Show summary if in read-only mode */}
      {readOnly && (
        <MeasurementSummary
          measurements={measurements}
          measurementType={windowType}
          roomName={getRoomName()}
          windowCoveringName={getWindowCoveringName()}
          measuredBy={measuredBy}
          measuredAt={existingMeasurement?.measured_at}
          notes={notes}
        />
      )}

      {/* Visual Measurement Sheet */}
      <VisualMeasurementSheet
        measurements={measurements}
        onMeasurementChange={handleMeasurementChange}
        readOnly={readOnly}
        windowType={windowType}
      />
    </div>
  );
};
