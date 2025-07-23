
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

  // Helper function to display measurement values
  const displayValue = (value: any) => {
    if (!value || value === "" || value === "0") return "";
    return `${value}"`;
  };

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

              {/* Rail Width measurement - above the rod */}
              {measurements.rail_width && (
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-xs">
                  <span className="bg-white px-2 border rounded font-semibold text-red-600">
                    Rail: {displayValue(measurements.rail_width)}
                  </span>
                </div>
              )}

              {/* Rod to Ceiling measurement (C) */}
              {measurements.measurement_c && (
                <div className="absolute top-4 left-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">C: {displayValue(measurements.measurement_c)}</span>
                    <div className="w-px h-12 bg-gray-600"></div>
                  </div>
                </div>
              )}

              {/* Window Frame */}
              <div className="absolute top-24 left-16 right-16 bottom-16">
                <div className="w-full h-full border-4 border-gray-400 bg-white relative">
                  {/* Window Panes */}
                  <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-gray-100 border border-gray-300"></div>
                    ))}
                  </div>
                  
                  {/* Window Width Measurement (A) */}
                  {measurements.measurement_a && (
                    <div className="absolute -top-8 left-0 right-0 flex justify-center">
                      <span className="text-xs bg-white px-2 border rounded font-semibold">
                        A: {displayValue(measurements.measurement_a)}
                      </span>
                    </div>
                  )}
                  
                  {/* Window Height Measurement (B) */}
                  {measurements.measurement_b && (
                    <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 -rotate-90">
                      <span className="text-xs bg-white px-2 border rounded font-semibold">
                        B: {displayValue(measurements.measurement_b)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Curtain Panels */}
              {curtainType === "pair" ? (
                <>
                  {/* Left Panel - attached to rod */}
                  <div className="absolute top-16 left-4 w-12 bottom-12 bg-red-500 opacity-80 rounded-sm shadow-lg">
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
                    <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-red-800 opacity-60"></div>
                    <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-red-700 opacity-40"></div>
                    <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-red-600 opacity-30"></div>
                    <span className="absolute -left-16 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs font-medium text-red-800">
                      Left Panel
                    </span>
                  </div>
                  
                  {/* Right Panel - attached to rod */}
                  <div className="absolute top-16 right-4 w-12 bottom-12 bg-red-500 opacity-80 rounded-sm shadow-lg">
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
                    <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-red-800 opacity-60"></div>
                    <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-red-700 opacity-40"></div>
                    <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-red-600 opacity-30"></div>
                    <span className="absolute -right-16 top-1/2 transform -translate-y-1/2 rotate-90 text-xs font-medium text-red-800">
                      Right Panel
                    </span>
                  </div>
                </>
              ) : (
                /* Single Panel - attached to rod */
                <div className={`absolute top-16 ${curtainSide === "left" ? "left-4" : "right-4"} w-20 bottom-12 bg-red-500 opacity-80 rounded-sm shadow-lg`}>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
                  <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-red-800 opacity-60"></div>
                  <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-red-700 opacity-40"></div>
                  <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-red-600 opacity-30"></div>
                  <div className="absolute top-2 bottom-2 left-8 w-0.5 bg-red-500 opacity-25"></div>
                  <div className="absolute top-2 bottom-2 left-10 w-0.5 bg-red-400 opacity-20"></div>
                  <div className="absolute top-2 bottom-2 left-12 w-0.5 bg-red-300 opacity-15"></div>
                  <span className={`absolute ${curtainSide === "left" ? "-left-18" : "-right-18"} top-1/2 transform -translate-y-1/2 ${curtainSide === "left" ? "-rotate-90" : "rotate-90"} text-xs font-medium text-red-800`}>
                    Single Panel
                  </span>
                </div>
              )}

              {/* Curtain Drop measurement - on the right side */}
              {measurements.drop && (
                <div className="absolute top-16 right-2 text-xs">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-48 bg-red-600"></div>
                    <span className="font-semibold text-red-600 -rotate-90 whitespace-nowrap">
                      Drop: {displayValue(measurements.drop)}
                    </span>
                  </div>
                </div>
              )}

              {/* Total Height measurement (E) */}
              {measurements.measurement_e && (
                <div className="absolute top-1/2 left-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">E: {displayValue(measurements.measurement_e)}</span>
                    <div className="w-px h-24 bg-gray-600"></div>
                  </div>
                </div>
              )}

              {/* Floor Line */}
              <div className="absolute bottom-4 left-8 right-8 border-t-2 border-gray-800">
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold">
                  Floor
                </span>
              </div>

              {/* Window to Floor measurement (D) */}
              {measurements.measurement_d && (
                <div className="absolute bottom-4 left-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">D: {displayValue(measurements.measurement_d)}</span>
                    <div className="w-px h-12 bg-gray-600"></div>
                  </div>
                </div>
              )}

              {/* Total Width measurement (F) */}
              {measurements.measurement_f && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs">
                  <span className="bg-white px-2 border rounded font-semibold">
                    F: {displayValue(measurements.measurement_f)}
                  </span>
                </div>
              )}
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
