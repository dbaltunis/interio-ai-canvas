import { useState } from "react";
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

interface MeasurementWorksheetProps {
  clientId: string;
  projectId?: string;
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
      const templateId = measurements.selected_template || measurements.selected_heading;
      const hasWidth = measurements.width || measurements.rail_width;
      const hasHeight = measurements.height || measurements.drop;
      
      console.log('Window summary check:', { 
        templateId, 
        hasWidth, 
        hasHeight, 
        measurements: Object.keys(measurements) 
      });
       
      if (templateId && hasWidth && hasHeight) {
        try {
          console.log('Calculating window summary for measurement:', savedMeasurement.id);
          
          // Use real fabric calculation
          const formData = {
            rail_width: measurements.rail_width || measurements.width,
            drop: measurements.drop || measurements.height,
            selected_heading: measurements.selected_heading || measurements.selected_template,
            fabric_width: measurements.fabric_width || 137,
            heading_fullness: measurements.fullness || 2.5,
            return_left: measurements.return_left || 7.5,
            return_right: measurements.return_right || 7.5,
            overlap: measurements.overlap || 10,
            bottom_hem: measurements.bottom_hem || 15,
            side_hems: measurements.side_hems || 7.5,
            fabric_item_id: measurements.fabric_item_id,
          };
          
          // Use the direct import to calculate fabric usage
          const fabricCalculation = calculateFabricUsage(formData, [], measurements.fabric_item);
          
          console.log('Fabric calculation result:', fabricCalculation);
          
          // Extract costs from fabric calculation result
          const fabricCostPerMeter = measurements.fabric_item?.price_per_meter || 25;
          const fabricCost = fabricCalculation.meters * fabricCostPerMeter;
          const manufacturingCost = 50; // Default manufacturing cost
          const totalCost = fabricCost + manufacturingCost;
          
          const summaryData = {
            window_id: savedMeasurement.id,
            linear_meters: fabricCalculation.meters,
            widths_required: fabricCalculation.widthsRequired,
            price_per_meter: fabricCostPerMeter,
            fabric_cost: fabricCost,
            lining_type: measurements.selected_lining || null,
            lining_cost: 0,
            manufacturing_type: 'machine',
            manufacturing_cost: manufacturingCost,
            total_cost: totalCost,
            template_id: templateId,
            pricing_type: 'per_metre',
            waste_percent: 5,
            currency: 'GBP',
          };
          
          console.log('Saving window summary data:', summaryData);
          await saveWindowSummary.mutateAsync(summaryData);
          console.log('Window summary saved successfully');
        } catch (summaryError) {
          console.error('Error saving window summary:', summaryError);
        }
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
