
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  const handleInputChange = (field: string, value: string) => {
    if (!readOnly) {
      onMeasurementChange(field, value);
    }
  };

  const curtainType = measurements.curtain_type || "pair";
  const curtainSide = measurements.curtain_side || "left";

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Window Measurement Worksheet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Visual Diagram */}
          <div className="flex-1">
            <div className="relative bg-gray-50 border-2 border-gray-300 rounded-lg p-8 min-h-[400px]">
              {/* Ceiling Line */}
              <div className="absolute top-4 left-8 right-8 border-t-2 border-gray-800">
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold">
                  Ceiling Line
                </span>
              </div>

              {/* Drapery Rod */}
              <div className="absolute top-16 left-12 right-12 flex items-center">
                <div className="w-full h-2 bg-gray-600 rounded-full relative">
                  <div className="absolute -left-2 -top-1 w-4 h-4 bg-gray-700 rounded-full"></div>
                  <div className="absolute -right-2 -top-1 w-4 h-4 bg-gray-700 rounded-full"></div>
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs">
                    Drapery Rod
                  </span>
                </div>
              </div>

              {/* Window Frame */}
              <div className="absolute top-24 left-16 right-16 bottom-16">
                <div className="w-full h-full border-4 border-gray-400 bg-white relative">
                  {/* Window Panes */}
                  <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-gray-100 border border-gray-300"></div>
                    ))}
                  </div>
                  
                  {/* Measurement Labels */}
                  <div className="absolute -top-8 left-0 right-0 flex justify-center">
                    <span className="text-xs bg-white px-2 border rounded">A: Window Width</span>
                  </div>
                  <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 -rotate-90">
                    <span className="text-xs bg-white px-2 border rounded">B: Window Height</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Curtain Panels */}
              {curtainType === "pair" ? (
                <>
                  {/* Left Panel */}
                  <div className="absolute top-20 left-8 w-8 bottom-12 bg-gradient-to-r from-blue-500 to-blue-700 opacity-90 rounded-sm shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-200 to-transparent opacity-40"></div>
                    <div className="absolute top-4 bottom-4 left-1 right-1 border-l-2 border-blue-900 opacity-60"></div>
                    <div className="absolute top-6 bottom-6 left-2 right-2 border-l border-blue-800 opacity-40"></div>
                    <div className="absolute top-8 bottom-8 left-3 right-3 border-l border-blue-700 opacity-30"></div>
                    <span className="absolute -left-10 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs font-medium text-blue-800">
                      Left Panel
                    </span>
                  </div>
                  {/* Right Panel */}
                  <div className="absolute top-20 right-8 w-8 bottom-12 bg-gradient-to-r from-blue-500 to-blue-700 opacity-90 rounded-sm shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-200 to-transparent opacity-40"></div>
                    <div className="absolute top-4 bottom-4 left-1 right-1 border-l-2 border-blue-900 opacity-60"></div>
                    <div className="absolute top-6 bottom-6 left-2 right-2 border-l border-blue-800 opacity-40"></div>
                    <div className="absolute top-8 bottom-8 left-3 right-3 border-l border-blue-700 opacity-30"></div>
                    <span className="absolute -right-10 top-1/2 transform -translate-y-1/2 rotate-90 text-xs font-medium text-blue-800">
                      Right Panel
                    </span>
                  </div>
                </>
              ) : (
                /* Single Panel */
                <div className={`absolute top-20 ${curtainSide === "left" ? "left-8" : "right-8"} w-16 bottom-12 bg-gradient-to-r from-blue-500 to-blue-700 opacity-90 rounded-sm shadow-lg`}>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-200 to-transparent opacity-40"></div>
                  <div className="absolute top-4 bottom-4 left-2 right-2 border-l-2 border-blue-900 opacity-60"></div>
                  <div className="absolute top-6 bottom-6 left-3 right-3 border-l border-blue-800 opacity-40"></div>
                  <div className="absolute top-8 bottom-8 left-4 right-4 border-l border-blue-700 opacity-30"></div>
                  <div className="absolute top-10 bottom-10 left-5 right-5 border-l border-blue-600 opacity-25"></div>
                  <span className={`absolute ${curtainSide === "left" ? "-left-12" : "-right-12"} top-1/2 transform -translate-y-1/2 ${curtainSide === "left" ? "-rotate-90" : "rotate-90"} text-xs font-medium text-blue-800`}>
                    Single Panel
                  </span>
                </div>
              )}

              {/* Floor Line */}
              <div className="absolute bottom-4 left-8 right-8 border-t-2 border-gray-800">
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold">
                  Floor
                </span>
              </div>

              {/* Measurement Arrows and Labels */}
              <div className="absolute top-12 left-2 text-xs">
                <div className="flex items-center gap-1">
                  <span>C:</span>
                  <div className="w-px h-8 bg-gray-600"></div>
                </div>
              </div>
              <div className="absolute top-1/2 left-2 text-xs">
                <div className="flex items-center gap-1">
                  <span>E:</span>
                  <div className="w-px h-16 bg-gray-600"></div>
                </div>
              </div>
            </div>

            {/* Measurement Guide */}
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p><strong>A:</strong> Window Width (inside frame)</p>
              <p><strong>B:</strong> Window Height (inside frame)</p>
              <p><strong>C:</strong> Rod to Ceiling</p>
              <p><strong>D:</strong> Window to Floor</p>
              <p><strong>E:</strong> Total Height (Rod to Floor)</p>
              <p><strong>F:</strong> Total Width (including extensions)</p>
            </div>
          </div>

          {/* Measurement Inputs */}
          <div className="flex-1 space-y-4">
            {/* Curtain Configuration */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h4 className="font-medium mb-3 text-blue-800">Curtain Configuration</h4>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Curtain Type</Label>
                  <RadioGroup 
                    value={curtainType} 
                    onValueChange={(value) => handleInputChange("curtain_type", value)}
                    className="mt-2"
                    disabled={readOnly}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pair" id="pair" />
                      <Label htmlFor="pair" className="text-sm">Pair (Two panels)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single" className="text-sm">Single (One panel)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {curtainType === "single" && (
                  <div>
                    <Label className="text-sm font-medium">Panel Position</Label>
                    <RadioGroup 
                      value={curtainSide} 
                      onValueChange={(value) => handleInputChange("curtain_side", value)}
                      className="mt-2"
                      disabled={readOnly}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="left" id="left" />
                        <Label htmlFor="left" className="text-sm">Left side</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="right" id="right" />
                        <Label htmlFor="right" className="text-sm">Right side</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </div>

            {/* Main Measurements - Rail Width and Drop */}
            <div className="border rounded-lg p-4 bg-green-50">
              <h4 className="font-medium mb-3 text-green-800">Main Measurements (for Calculator)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rail_width">Rail Width (inches)</Label>
                  <Input
                    id="rail_width"
                    type="number"
                    step="0.25"
                    value={measurements.rail_width || ""}
                    onChange={(e) => handleInputChange("rail_width", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="font-semibold"
                  />
                </div>
                <div>
                  <Label htmlFor="drop">Curtain Drop (inches)</Label>
                  <Input
                    id="drop"
                    type="number"
                    step="0.25"
                    value={measurements.drop || ""}
                    onChange={(e) => handleInputChange("drop", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Detailed Window Measurements */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Detailed Window Measurements</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="measurement_a">A - Window Width (inches)</Label>
                  <Input
                    id="measurement_a"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_a || ""}
                    onChange={(e) => handleInputChange("measurement_a", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_b">B - Window Height (inches)</Label>
                  <Input
                    id="measurement_b"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_b || ""}
                    onChange={(e) => handleInputChange("measurement_b", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_c">C - Rod to Ceiling (inches)</Label>
                  <Input
                    id="measurement_c"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_c || ""}
                    onChange={(e) => handleInputChange("measurement_c", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_d">D - Window to Floor (inches)</Label>
                  <Input
                    id="measurement_d"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_d || ""}
                    onChange={(e) => handleInputChange("measurement_d", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_e">E - Total Height (inches)</Label>
                  <Input
                    id="measurement_e"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_e || ""}
                    onChange={(e) => handleInputChange("measurement_e", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_f">F - Total Width (inches)</Label>
                  <Input
                    id="measurement_f"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_f || ""}
                    onChange={(e) => handleInputChange("measurement_f", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                  />
                </div>
              </div>
            </div>

            {/* Additional Measurements for Curtain Makers */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Additional Measurements (for Curtain Makers)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rod_extension_left">Rod Extension Left (inches)</Label>
                  <Input
                    id="rod_extension_left"
                    type="number"
                    step="0.25"
                    value={measurements.rod_extension_left || ""}
                    onChange={(e) => handleInputChange("rod_extension_left", e.target.value)}
                    placeholder="8-10"
                    readOnly={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="rod_extension_right">Rod Extension Right (inches)</Label>
                  <Input
                    id="rod_extension_right"
                    type="number"
                    step="0.25"
                    value={measurements.rod_extension_right || ""}
                    onChange={(e) => handleInputChange("rod_extension_right", e.target.value)}
                    placeholder="8-10"
                    readOnly={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="panel_overlap">Panel Overlap (inches)</Label>
                  <Input
                    id="panel_overlap"
                    type="number"
                    step="0.25"
                    value={measurements.panel_overlap || ""}
                    onChange={(e) => handleInputChange("panel_overlap", e.target.value)}
                    placeholder="2-3"
                    readOnly={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="floor_clearance">Floor Clearance (inches)</Label>
                  <Input
                    id="floor_clearance"
                    type="number"
                    step="0.25"
                    value={measurements.floor_clearance || ""}
                    onChange={(e) => handleInputChange("floor_clearance", e.target.value)}
                    placeholder="0.5"
                    readOnly={readOnly}
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
