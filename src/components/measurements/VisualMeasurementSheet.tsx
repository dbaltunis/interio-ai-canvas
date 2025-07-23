
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      console.log(`Changing ${field} to:`, value);
      onMeasurementChange(field, value);
    }
  };

  const curtainType = measurements.curtain_type || "pair";
  const curtainSide = measurements.curtain_side || "left";

  console.log("Current curtain type:", curtainType);
  console.log("Current curtain side:", curtainSide);

  // Helper function to check if measurement has value
  const hasValue = (value: any) => {
    return value && value !== "" && value !== "0" && parseFloat(value) > 0;
  };

  // Helper function to display measurement values
  const displayValue = (value: any) => {
    if (!hasValue(value)) return "";
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

              {/* Window Frame */}
              <div className="absolute top-24 left-16 right-16 bottom-16">
                <div className="w-full h-full border-4 border-gray-400 bg-white relative">
                  {/* Window Panes */}
                  <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-gray-100 border border-gray-300"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Curtain Panels - Dynamic based on curtain type */}
              {curtainType === "pair" ? (
                <>
                  {/* Left Panel */}
                  <div className="absolute top-16 left-14 w-8 bottom-12 bg-red-500 opacity-80 rounded-sm shadow-lg">
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
                    <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-red-800 opacity-60"></div>
                    <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-red-700 opacity-40"></div>
                    <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-red-600 opacity-30"></div>
                    <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-red-500 opacity-25"></div>
                    <div className="absolute top-2 bottom-2 left-5 w-0.5 bg-red-400 opacity-20"></div>
                    <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-red-300 opacity-15"></div>
                  </div>
                  
                  {/* Right Panel */}
                  <div className="absolute top-16 right-14 w-8 bottom-12 bg-red-500 opacity-80 rounded-sm shadow-lg">
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
                    <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-red-800 opacity-60"></div>
                    <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-red-700 opacity-40"></div>
                    <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-red-600 opacity-30"></div>
                    <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-red-500 opacity-25"></div>
                    <div className="absolute top-2 bottom-2 left-5 w-0.5 bg-red-400 opacity-20"></div>
                    <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-red-300 opacity-15"></div>
                  </div>
                </>
              ) : (
                /* Single Panel */
                <div className={`absolute top-16 ${curtainSide === "left" ? "left-14" : "right-14"} w-12 bottom-12 bg-red-500 opacity-80 rounded-sm shadow-lg`}>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
                  <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-red-800 opacity-60"></div>
                  <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-red-700 opacity-40"></div>
                  <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-red-600 opacity-30"></div>
                  <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-red-500 opacity-25"></div>
                  <div className="absolute top-2 bottom-2 left-5 w-0.5 bg-red-400 opacity-20"></div>
                  <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-red-300 opacity-15"></div>
                  <div className="absolute top-2 bottom-2 left-7 w-0.5 bg-red-200 opacity-10"></div>
                  <div className="absolute top-2 bottom-2 left-8 w-0.5 bg-red-100 opacity-5"></div>
                </div>
              )}

              {/* Rail Width measurement with arrows - only if has value */}
              {hasValue(measurements.rail_width) && (
                <div className="absolute top-0 left-12 right-12 flex items-center">
                  {/* Left arrow */}
                  <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-blue-600"></div>
                  {/* Line */}
                  <div className="flex-1 border-t-2 border-blue-600 relative">
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                      Rail Width: {displayValue(measurements.rail_width)}
                    </span>
                  </div>
                  {/* Right arrow */}
                  <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-blue-600"></div>
                </div>
              )}

              {/* Window Width Measurement (A) with arrows - only if has value */}
              {hasValue(measurements.measurement_a) && (
                <div className="absolute top-20 left-16 right-16 flex items-center">
                  {/* Left arrow */}
                  <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-green-600"></div>
                  {/* Line */}
                  <div className="flex-1 border-t-2 border-green-600 relative">
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                      A: {displayValue(measurements.measurement_a)}
                    </span>
                  </div>
                  {/* Right arrow */}
                  <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-green-600"></div>
                </div>
              )}

              {/* Curtain Drop measurement with arrows - only if has value */}
              {hasValue(measurements.drop) && (
                <div className="absolute top-16 left-4 flex flex-col items-center">
                  {/* Top arrow */}
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-purple-600"></div>
                  {/* Line */}
                  <div className="h-32 border-l-2 border-purple-600 relative">
                    <span className="absolute -left-16 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                      Drop: {displayValue(measurements.drop)}
                    </span>
                  </div>
                  {/* Bottom arrow */}
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-purple-600"></div>
                </div>
              )}

              {/* Window Height Measurement (B) with arrows - only if has value */}
              {hasValue(measurements.measurement_b) && (
                <div className="absolute top-24 left-8 bottom-16 flex flex-col items-center">
                  {/* Top arrow */}
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-orange-600"></div>
                  {/* Line */}
                  <div className="flex-1 border-l-2 border-orange-600 relative">
                    <span className="absolute -left-16 top-1/2 transform -translate-y-1/2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                      B: {displayValue(measurements.measurement_b)}
                    </span>
                  </div>
                  {/* Bottom arrow */}
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-orange-600"></div>
                </div>
              )}

              {/* Rod to Ceiling measurement (C) with arrows - only if has value */}
              {hasValue(measurements.measurement_c) && (
                <div className="absolute top-4 right-4 flex flex-col items-center">
                  {/* Top arrow */}
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-red-600"></div>
                  {/* Line */}
                  <div className="h-12 border-l-2 border-red-600 relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                      C: {displayValue(measurements.measurement_c)}
                    </span>
                  </div>
                  {/* Bottom arrow */}
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-red-600"></div>
                </div>
              )}

              {/* Floor Line */}
              <div className="absolute bottom-4 left-8 right-8 border-t-2 border-gray-800">
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold">
                  Floor
                </span>
              </div>

              {/* Window to Floor measurement (D) with arrows - only if has value */}
              {hasValue(measurements.measurement_d) && (
                <div className="absolute bottom-4 right-8 flex flex-col items-center">
                  {/* Top arrow */}
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-indigo-600"></div>
                  {/* Line */}
                  <div className="h-12 border-l-2 border-indigo-600 relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                      D: {displayValue(measurements.measurement_d)}
                    </span>
                  </div>
                  {/* Bottom arrow */}
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-indigo-600"></div>
                </div>
              )}

              {/* Total Height measurement (E) with arrows - only if has value */}
              {hasValue(measurements.measurement_e) && (
                <div className="absolute top-16 right-0 bottom-4 flex flex-col items-center">
                  {/* Top arrow */}
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-pink-600"></div>
                  {/* Line */}
                  <div className="flex-1 border-l-2 border-pink-600 relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-pink-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                      E: {displayValue(measurements.measurement_e)}
                    </span>
                  </div>
                  {/* Bottom arrow */}
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-pink-600"></div>
                </div>
              )}

              {/* Total Width measurement (F) with arrows - only if has value */}
              {hasValue(measurements.measurement_f) && (
                <div className="absolute bottom-0 left-8 right-8 flex items-center">
                  {/* Left arrow */}
                  <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-teal-600"></div>
                  {/* Line */}
                  <div className="flex-1 border-t-2 border-teal-600 relative">
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-2 py-1 rounded text-xs font-bold">
                      F: {displayValue(measurements.measurement_f)}
                    </span>
                  </div>
                  {/* Right arrow */}
                  <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-teal-600"></div>
                </div>
              )}
            </div>

            {/* Measurement Guide */}
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p><strong>A:</strong> Window Width (inside frame to inside frame)</p>
              <p><strong>B:</strong> Window Height (inside frame top to bottom)</p>
              <p><strong>C:</strong> Distance from Rod to Ceiling</p>
              <p><strong>D:</strong> Distance from Window Bottom to Floor</p>
              <p><strong>E:</strong> Total Height from Rod to Floor</p>
              <p><strong>F:</strong> Total Width including Rod Extensions</p>
            </div>
          </div>

          {/* Measurement Inputs */}
          <div className="flex-1 space-y-4">
            {/* Curtain Configuration */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h4 className="font-medium mb-3 text-blue-800">Curtain Configuration</h4>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Curtain Type</Label>
                  <Select 
                    value={curtainType} 
                    onValueChange={(value) => {
                      console.log("Curtain type changed to:", value);
                      handleInputChange("curtain_type", value);
                    }}
                    disabled={readOnly}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select curtain type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pair">Pair (Two panels)</SelectItem>
                      <SelectItem value="single">Single (One panel)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {curtainType === "single" && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Panel Position</Label>
                    <Select 
                      value={curtainSide} 
                      onValueChange={(value) => {
                        console.log("Panel side changed to:", value);
                        handleInputChange("curtain_side", value);
                      }}
                      disabled={readOnly}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select panel position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left side</SelectItem>
                        <SelectItem value="right">Right side</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Main Measurements - Rail Width and Drop */}
            <div className="border rounded-lg p-4 bg-green-50">
              <h4 className="font-medium mb-3 text-green-800">Main Measurements (for Calculator)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rail_width" className="text-sm font-medium">Rail Width</Label>
                  <p className="text-xs text-gray-600 mb-1">Total width of the curtain rail/rod</p>
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
                  <Label htmlFor="drop" className="text-sm font-medium">Curtain Drop</Label>
                  <p className="text-xs text-gray-600 mb-1">Length from rod to where curtain ends</p>
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
                  <Label htmlFor="measurement_a" className="text-sm font-medium">A - Window Width</Label>
                  <p className="text-xs text-gray-600 mb-1">Inside frame width</p>
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
                  <Label htmlFor="measurement_b" className="text-sm font-medium">B - Window Height</Label>
                  <p className="text-xs text-gray-600 mb-1">Inside frame height</p>
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
                  <Label htmlFor="measurement_c" className="text-sm font-medium">C - Rod to Ceiling</Label>
                  <p className="text-xs text-gray-600 mb-1">Distance from rod to ceiling</p>
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
                  <Label htmlFor="measurement_d" className="text-sm font-medium">D - Window to Floor</Label>
                  <p className="text-xs text-gray-600 mb-1">Distance from window bottom to floor</p>
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
                  <Label htmlFor="measurement_e" className="text-sm font-medium">E - Total Height</Label>
                  <p className="text-xs text-gray-600 mb-1">Rod to floor total height</p>
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
                  <Label htmlFor="measurement_f" className="text-sm font-medium">F - Total Width</Label>
                  <p className="text-xs text-gray-600 mb-1">Total width including extensions</p>
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
                  <Label htmlFor="rod_extension_left" className="text-sm font-medium">Rod Extension Left</Label>
                  <p className="text-xs text-gray-600 mb-1">How far rod extends beyond window left</p>
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
                  <Label htmlFor="rod_extension_right" className="text-sm font-medium">Rod Extension Right</Label>
                  <p className="text-xs text-gray-600 mb-1">How far rod extends beyond window right</p>
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
                  <Label htmlFor="panel_overlap" className="text-sm font-medium">Panel Overlap</Label>
                  <p className="text-xs text-gray-600 mb-1">How much panels overlap in center</p>
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
                  <Label htmlFor="floor_clearance" className="text-sm font-medium">Floor Clearance</Label>
                  <p className="text-xs text-gray-600 mb-1">Gap between curtain and floor</p>
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
