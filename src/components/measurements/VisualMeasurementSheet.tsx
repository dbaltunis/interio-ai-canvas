
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MeasurementDiagram } from "./visual/MeasurementDiagram";
import { MeasurementControls } from "./visual/MeasurementControls";
import { useIsMobile } from "@/hooks/use-mobile";

interface VisualMeasurementSheetProps {
  measurements: Record<string, any>;
  onMeasurementChange: (field: string, value: string) => void;
  readOnly?: boolean;
  windowType: string;
}

export const VisualMeasurementSheet = ({ 
  measurements, 
  onMeasurementChange, 
  readOnly = false,
  windowType 
}: VisualMeasurementSheetProps) => {
  const isMobile = useIsMobile();
  
  // Helper function to check if measurement has value
  const hasValue = (value: any) => value && value !== "" && value !== "0" && parseFloat(value) > 0;
  
  // Initialize with all measurements that have values
  const getInitialVisibleMeasurements = () => {
    const allMeasurements = [
      'rail_width', 'drop', 'measurement_a', 'measurement_b', 
      'measurement_c', 'measurement_d', 'measurement_e', 'measurement_f'
    ];
    return allMeasurements.filter(key => hasValue(measurements[key]));
  };

  const [visibleMeasurements, setVisibleMeasurements] = useState<string[]>(getInitialVisibleMeasurements());
  const [isControlsOpen, setIsControlsOpen] = useState(!isMobile);
  const [isConfigOpen, setIsConfigOpen] = useState(!isMobile);
  const [isMeasurementsOpen, setIsMeasurementsOpen] = useState(!isMobile);

  const handleInputChange = (field: string, value: string) => {
    if (!readOnly) {
      console.log(`Changing ${field} to:`, value);
      onMeasurementChange(field, value);
      
      // Auto-add measurement to visible list if it now has a value
      if (hasValue(value) && !visibleMeasurements.includes(field)) {
        setVisibleMeasurements(prev => [...prev, field]);
      }
      // Remove from visible list if value is cleared
      if (!hasValue(value) && visibleMeasurements.includes(field)) {
        setVisibleMeasurements(prev => prev.filter(m => m !== field));
      }
    }
  };

  const handleToggleVisibility = (measurement: string) => {
    setVisibleMeasurements(prev => 
      prev.includes(measurement) 
        ? prev.filter(m => m !== measurement)
        : [...prev, measurement]
    );
  };

  const handleShowAll = () => {
    const allMeasurements = [
      'rail_width', 'drop', 'measurement_a', 'measurement_b', 
      'measurement_c', 'measurement_d', 'measurement_e', 'measurement_f'
    ];
    setVisibleMeasurements(allMeasurements.filter(key => hasValue(measurements[key])));
  };

  const handleHideAll = () => {
    setVisibleMeasurements([]);
  };

  const curtainType = measurements.curtain_type || "pair";
  const curtainSide = measurements.curtain_side || "left";
  const hardwareType = measurements.hardware_type || "rod";
  const poolingOption = measurements.pooling_option || "above_floor";
  const poolingAmount = measurements.pooling_amount || "";

  if (isMobile) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-lg font-bold">Window Measurement Worksheet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Diagram - Always visible on mobile */}
          <div className="w-full">
            <MeasurementDiagram
              measurements={measurements}
              windowType={windowType}
              visibleMeasurements={visibleMeasurements}
            />
          </div>

          {/* Measurement Guide */}
          <div className="p-3 bg-gray-50 rounded-lg border text-sm">
            <h4 className="font-semibold mb-2 text-gray-800">Measurement Guide</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <p><span className="font-medium text-green-600">A:</span> Window Width</p>
              <p><span className="font-medium text-orange-600">B:</span> Window Height</p>
              {hardwareType === "rod" && (
                <p><span className="font-medium text-red-600">C:</span> Rod to Ceiling</p>
              )}
              <p><span className="font-medium text-indigo-600">D:</span> Window to Floor</p>
              <p><span className="font-medium text-pink-600">E:</span> Total Height</p>
              <p><span className="font-medium text-teal-600">F:</span> Total Width</p>
            </div>
          </div>

          {/* Collapsible Controls */}
          <Collapsible open={isControlsOpen} onOpenChange={setIsControlsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Measurement Controls
                {isControlsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <MeasurementControls
                measurements={measurements}
                visibleMeasurements={visibleMeasurements}
                onToggleVisibility={handleToggleVisibility}
                onShowAll={handleShowAll}
                onHideAll={handleHideAll}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Collapsible Configuration */}
          <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Configuration & Main Measurements
                {isConfigOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              {/* Hardware Type */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="font-semibold mb-3 text-gray-800">Hardware Type</h4>
                <RadioGroup 
                  value={hardwareType} 
                  onValueChange={(value) => handleInputChange("hardware_type", value)}
                  disabled={readOnly}
                  className="flex flex-row space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rod" id="rod" />
                    <Label htmlFor="rod">Rod</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="track" id="track" />
                    <Label htmlFor="track">Track</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Curtain Configuration */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
                <h4 className="font-semibold mb-3 text-blue-800">Curtain Configuration</h4>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Curtain Type</Label>
                    <RadioGroup 
                      value={curtainType} 
                      onValueChange={(value) => handleInputChange("curtain_type", value)}
                      disabled={readOnly}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pair" id="pair" />
                        <Label htmlFor="pair">Pair (Two panels)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="single" />
                        <Label htmlFor="single">Single (One panel)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {curtainType === "single" && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Panel Position</Label>
                      <RadioGroup 
                        value={curtainSide} 
                        onValueChange={(value) => handleInputChange("curtain_side", value)}
                        disabled={readOnly}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="left" id="left" />
                          <Label htmlFor="left">Left side</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="right" id="right" />
                          <Label htmlFor="right">Right side</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Measurements */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 shadow-sm">
                <h4 className="font-semibold mb-3 text-green-800">Main Measurements</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="rail_width" className="text-sm font-semibold">{hardwareType === "track" ? "Track" : "Rail"} Width</Label>
                    <Input
                      id="rail_width"
                      type="number"
                      step="0.25"
                      value={measurements.rail_width || ""}
                      onChange={(e) => handleInputChange("rail_width", e.target.value)}
                      placeholder="0.00"
                      readOnly={readOnly}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="drop" className="text-sm font-semibold">Curtain Drop</Label>
                    <Input
                      id="drop"
                      type="number"
                      step="0.25"
                      value={measurements.drop || ""}
                      onChange={(e) => handleInputChange("drop", e.target.value)}
                      placeholder="0.00"
                      readOnly={readOnly}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Pooling Configuration */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                <h4 className="font-semibold mb-3 text-amber-800">Pooling Configuration</h4>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Position</Label>
                    <RadioGroup 
                      value={poolingOption} 
                      onValueChange={(value) => handleInputChange("pooling_option", value)}
                      disabled={readOnly}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="above_floor" id="above_floor" />
                        <Label htmlFor="above_floor">Above floor</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="touching_floor" id="touching_floor" />
                        <Label htmlFor="touching_floor">Touching floor</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="below_floor" id="below_floor" />
                        <Label htmlFor="below_floor">Below floor</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {(poolingOption === "above_floor" || poolingOption === "below_floor") && (
                    <div>
                      <Label htmlFor="pooling_amount" className="text-sm font-semibold">
                        {poolingOption === "above_floor" ? "Clearance" : "Pooling Amount"}
                      </Label>
                      <Input
                        id="pooling_amount"
                        type="number"
                        step="0.25"
                        value={poolingAmount}
                        onChange={(e) => handleInputChange("pooling_amount", e.target.value)}
                        placeholder="2.00"
                        readOnly={readOnly}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Collapsible Detailed Measurements */}
          <Collapsible open={isMeasurementsOpen} onOpenChange={setIsMeasurementsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Detailed Measurements
                {isMeasurementsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor="measurement_a" className="text-sm font-semibold">A - Window Width</Label>
                    <Input
                      id="measurement_a"
                      type="number"
                      step="0.25"
                      value={measurements.measurement_a || ""}
                      onChange={(e) => handleInputChange("measurement_a", e.target.value)}
                      placeholder="0.00"
                      readOnly={readOnly}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="measurement_b" className="text-sm font-semibold">B - Window Height</Label>
                    <Input
                      id="measurement_b"
                      type="number"
                      step="0.25"
                      value={measurements.measurement_b || ""}
                      onChange={(e) => handleInputChange("measurement_b", e.target.value)}
                      placeholder="0.00"
                      readOnly={readOnly}
                      className="mt-1"
                    />
                  </div>
                  {hardwareType === "rod" && (
                    <div>
                      <Label htmlFor="measurement_c" className="text-sm font-semibold">C - Rod to Ceiling</Label>
                      <Input
                        id="measurement_c"
                        type="number"
                        step="0.25"
                        value={measurements.measurement_c || ""}
                        onChange={(e) => handleInputChange("measurement_c", e.target.value)}
                        placeholder="0.00"
                        readOnly={readOnly}
                        className="mt-1"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="measurement_d" className="text-sm font-semibold">D - Window to Floor</Label>
                    <Input
                      id="measurement_d"
                      type="number"
                      step="0.25"
                      value={measurements.measurement_d || ""}
                      onChange={(e) => handleInputChange("measurement_d", e.target.value)}
                      placeholder="0.00"
                      readOnly={readOnly}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="measurement_e" className="text-sm font-semibold">E - Total Height</Label>
                    <Input
                      id="measurement_e"
                      type="number"
                      step="0.25"
                      value={measurements.measurement_e || ""}
                      onChange={(e) => handleInputChange("measurement_e", e.target.value)}
                      placeholder="0.00"
                      readOnly={readOnly}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="measurement_f" className="text-sm font-semibold">F - Total Width</Label>
                    <Input
                      id="measurement_f"
                      type="number"
                      step="0.25"
                      value={measurements.measurement_f || ""}
                      onChange={(e) => handleInputChange("measurement_f", e.target.value)}
                      placeholder="0.00"
                      readOnly={readOnly}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    );
  }

  // Desktop Layout with sticky diagram
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">Window Measurement Worksheet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Diagram - Sticky on desktop */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <div className="lg:sticky lg:top-4 space-y-4">
              <MeasurementDiagram
                measurements={measurements}
                windowType={windowType}
                visibleMeasurements={visibleMeasurements}
              />

              {/* Measurement Guide */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold mb-3 text-gray-800">Measurement Guide</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <p><span className="font-medium text-green-600">A:</span> Window Width (inside frame)</p>
                  <p><span className="font-medium text-orange-600">B:</span> Window Height (inside frame)</p>
                  {hardwareType === "rod" && (
                    <p><span className="font-medium text-red-600">C:</span> Rod to Ceiling</p>
                  )}
                  <p><span className="font-medium text-indigo-600">D:</span> Window Bottom to Floor</p>
                  <p><span className="font-medium text-pink-600">E:</span> Total Height ({hardwareType === "track" ? "Track" : "Rod"} to Floor)</p>
                  <p><span className="font-medium text-teal-600">F:</span> Total Width including Extensions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls - Scrollable on desktop */}
          <div className="order-2 lg:order-2 space-y-4 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto">
            {/* Measurement Controls */}
            <MeasurementControls
              measurements={measurements}
              visibleMeasurements={visibleMeasurements}
              onToggleVisibility={handleToggleVisibility}
              onShowAll={handleShowAll}
              onHideAll={handleHideAll}
            />

            {/* Hardware Type */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold mb-3 text-gray-800">Hardware Type</h4>
              <RadioGroup 
                value={hardwareType} 
                onValueChange={(value) => handleInputChange("hardware_type", value)}
                disabled={readOnly}
                className="flex flex-row space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rod" id="rod" />
                  <Label htmlFor="rod">Rod</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="track" id="track" />
                  <Label htmlFor="track">Track</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Curtain Configuration */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold mb-3 text-blue-800">Curtain Configuration</h4>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Curtain Type</Label>
                  <RadioGroup 
                    value={curtainType} 
                    onValueChange={(value) => handleInputChange("curtain_type", value)}
                    disabled={readOnly}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pair" id="pair" />
                      <Label htmlFor="pair">Pair (Two panels)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single">Single (One panel)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {curtainType === "single" && (
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Panel Position</Label>
                    <RadioGroup 
                      value={curtainSide} 
                      onValueChange={(value) => handleInputChange("curtain_side", value)}
                      disabled={readOnly}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="left" id="left" />
                        <Label htmlFor="left">Left side</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="right" id="right" />
                        <Label htmlFor="right">Right side</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold mb-3 text-green-800">Main Measurements</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="rail_width" className="text-sm font-semibold">{hardwareType === "track" ? "Track" : "Rail"} Width</Label>
                  <Input
                    id="rail_width"
                    type="number"
                    step="0.25"
                    value={measurements.rail_width || ""}
                    onChange={(e) => handleInputChange("rail_width", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="drop" className="text-sm font-semibold">Curtain Drop</Label>
                  <Input
                    id="drop"
                    type="number"
                    step="0.25"
                    value={measurements.drop || ""}
                    onChange={(e) => handleInputChange("drop", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold mb-3 text-amber-800">Pooling Configuration</h4>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Position</Label>
                  <RadioGroup 
                    value={poolingOption} 
                    onValueChange={(value) => handleInputChange("pooling_option", value)}
                    disabled={readOnly}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="above_floor" id="above_floor" />
                      <Label htmlFor="above_floor">Above floor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="touching_floor" id="touching_floor" />
                      <Label htmlFor="touching_floor">Touching floor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="below_floor" id="below_floor" />
                      <Label htmlFor="below_floor">Below floor</Label>
                    </div>
                  </RadioGroup>
                </div>

                {(poolingOption === "above_floor" || poolingOption === "below_floor") && (
                  <div>
                    <Label htmlFor="pooling_amount" className="text-sm font-semibold">
                      {poolingOption === "above_floor" ? "Clearance" : "Pooling Amount"}
                    </Label>
                    <Input
                      id="pooling_amount"
                      type="number"
                      step="0.25"
                      value={poolingAmount}
                      onChange={(e) => handleInputChange("pooling_amount", e.target.value)}
                      placeholder="2.00"
                      readOnly={readOnly}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold mb-3 text-gray-800">Detailed Measurements</h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="measurement_a" className="text-sm font-semibold">A - Window Width</Label>
                  <Input
                    id="measurement_a"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_a || ""}
                    onChange={(e) => handleInputChange("measurement_a", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_b" className="text-sm font-semibold">B - Window Height</Label>
                  <Input
                    id="measurement_b"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_b || ""}
                    onChange={(e) => handleInputChange("measurement_b", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="mt-1"
                  />
                </div>
                {hardwareType === "rod" && (
                  <div>
                    <Label htmlFor="measurement_c" className="text-sm font-semibold">C - Rod to Ceiling</Label>
                    <Input
                      id="measurement_c"
                      type="number"
                      step="0.25"
                      value={measurements.measurement_c || ""}
                      onChange={(e) => handleInputChange("measurement_c", e.target.value)}
                      placeholder="0.00"
                      readOnly={readOnly}
                      className="mt-1"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="measurement_d" className="text-sm font-semibold">D - Window to Floor</Label>
                  <Input
                    id="measurement_d"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_d || ""}
                    onChange={(e) => handleInputChange("measurement_d", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_e" className="text-sm font-semibold">E - Total Height</Label>
                  <Input
                    id="measurement_e"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_e || ""}
                    onChange={(e) => handleInputChange("measurement_e", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_f" className="text-sm font-semibold">F - Total Width</Label>
                  <Input
                    id="measurement_f"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_f || ""}
                    onChange={(e) => handleInputChange("measurement_f", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
