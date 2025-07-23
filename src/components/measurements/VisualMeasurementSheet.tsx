
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

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
  const hardwareType = measurements.hardware_type || "rod";
  const poolingOption = measurements.pooling_option || "above_floor";
  const poolingAmount = measurements.pooling_amount || "";

  console.log("Current curtain type:", curtainType);
  console.log("Current curtain side:", curtainSide);
  console.log("Current hardware type:", hardwareType);
  console.log("Current pooling option:", poolingOption);
  console.log("Current pooling amount:", poolingAmount);

  // Helper function to check if measurement has value
  const hasValue = (value: any) => {
    return value && value !== "" && value !== "0" && parseFloat(value) > 0;
  };

  // Helper function to display measurement values
  const displayValue = (value: any) => {
    if (!hasValue(value)) return "";
    return `${value}"`;
  };

  // Calculate curtain bottom position based on pooling
  const getCurtainBottomPosition = () => {
    if (poolingOption === "touching_floor") {
      return "bottom-4"; // Touching floor
    } else if (poolingOption === "below_floor" && hasValue(poolingAmount)) {
      return "bottom-0"; // Below floor level
    } else {
      return "bottom-12"; // Above floor (default)
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">Window Measurement Worksheet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Visual Diagram */}
          <div className="flex-1 min-w-0">
            <div className="relative bg-gradient-to-b from-blue-50 to-gray-50 border-2 border-gray-200 rounded-xl p-8 min-h-[500px] shadow-inner">
              {/* Ceiling Line */}
              <div className="absolute top-4 left-8 right-8 border-t-2 border-gray-800">
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold bg-white px-2 rounded">
                  Ceiling Line
                </span>
              </div>

              {/* Hardware - Track (on ceiling) or Rod (below ceiling) */}
              <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-12 right-12 flex items-center`}>
                {hardwareType === "track" ? (
                  <div className="w-full h-4 bg-gray-600 relative rounded-sm shadow-md">
                    <div className="absolute -left-2 -top-1 w-3 h-6 bg-gray-700 rounded-sm"></div>
                    <div className="absolute -right-2 -top-1 w-3 h-6 bg-gray-700 rounded-sm"></div>
                    <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-xs font-semibold bg-gray-600 text-white px-3 py-1 rounded">
                      Curtain Track
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-3 bg-gray-600 rounded-full relative shadow-md">
                    <div className="absolute -left-3 -top-1 w-5 h-5 bg-gray-700 rounded-full shadow-sm"></div>
                    <div className="absolute -right-3 -top-1 w-5 h-5 bg-gray-700 rounded-full shadow-sm"></div>
                    <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-xs font-semibold bg-gray-600 text-white px-3 py-1 rounded">
                      Curtain Rod
                    </span>
                  </div>
                )}
              </div>

              {/* Window Frame */}
              <div className="absolute top-28 left-16 right-16 bottom-20">
                <div className="w-full h-full border-4 border-gray-500 bg-white relative rounded-sm shadow-lg">
                  {/* Window Panes */}
                  <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-blue-50 border border-gray-300 rounded-sm"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Curtain Panels - Dynamic based on curtain type, hardware type, and pooling */}
              {curtainType === "pair" ? (
                <>
                  {/* Left Panel */}
                  <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-14 w-10 ${getCurtainBottomPosition()} bg-gradient-to-r from-red-600 to-red-500 opacity-85 rounded-sm shadow-xl`}>
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
                    {/* Curtain fold lines */}
                    <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-red-800 opacity-60"></div>
                    <div className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-red-700 opacity-50"></div>
                    <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-red-600 opacity-40"></div>
                    <div className="absolute top-2 bottom-2 left-5.5 w-0.5 bg-red-500 opacity-30"></div>
                    <div className="absolute top-2 bottom-2 left-7 w-0.5 bg-red-400 opacity-25"></div>
                    <div className="absolute top-2 bottom-2 left-8.5 w-0.5 bg-red-300 opacity-20"></div>
                    
                    {/* Pooling visual effect */}
                    {poolingOption === "below_floor" && hasValue(poolingAmount) && (
                      <div className="absolute -bottom-6 left-0 w-full h-6 bg-gradient-to-b from-red-500 to-red-400 opacity-70 rounded-b-lg shadow-lg"></div>
                    )}
                  </div>
                  
                  {/* Right Panel */}
                  <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} right-14 w-10 ${getCurtainBottomPosition()} bg-gradient-to-r from-red-600 to-red-500 opacity-85 rounded-sm shadow-xl`}>
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
                    {/* Curtain fold lines */}
                    <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-red-800 opacity-60"></div>
                    <div className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-red-700 opacity-50"></div>
                    <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-red-600 opacity-40"></div>
                    <div className="absolute top-2 bottom-2 left-5.5 w-0.5 bg-red-500 opacity-30"></div>
                    <div className="absolute top-2 bottom-2 left-7 w-0.5 bg-red-400 opacity-25"></div>
                    <div className="absolute top-2 bottom-2 left-8.5 w-0.5 bg-red-300 opacity-20"></div>
                    
                    {/* Pooling visual effect */}
                    {poolingOption === "below_floor" && hasValue(poolingAmount) && (
                      <div className="absolute -bottom-6 left-0 w-full h-6 bg-gradient-to-b from-red-500 to-red-400 opacity-70 rounded-b-lg shadow-lg"></div>
                    )}
                  </div>
                </>
              ) : (
                /* Single Panel */
                <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} ${curtainSide === "left" ? "left-14" : "right-14"} w-14 ${getCurtainBottomPosition()} bg-gradient-to-r from-red-600 to-red-500 opacity-85 rounded-sm shadow-xl`}>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
                  {/* Curtain fold lines */}
                  <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-red-800 opacity-60"></div>
                  <div className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-red-700 opacity-50"></div>
                  <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-red-600 opacity-40"></div>
                  <div className="absolute top-2 bottom-2 left-5.5 w-0.5 bg-red-500 opacity-30"></div>
                  <div className="absolute top-2 bottom-2 left-7 w-0.5 bg-red-400 opacity-25"></div>
                  <div className="absolute top-2 bottom-2 left-8.5 w-0.5 bg-red-300 opacity-20"></div>
                  <div className="absolute top-2 bottom-2 left-10 w-0.5 bg-red-200 opacity-15"></div>
                  <div className="absolute top-2 bottom-2 left-11.5 w-0.5 bg-red-100 opacity-10"></div>
                  
                  {/* Pooling visual effect */}
                  {poolingOption === "below_floor" && hasValue(poolingAmount) && (
                    <div className="absolute -bottom-6 left-0 w-full h-6 bg-gradient-to-b from-red-500 to-red-400 opacity-70 rounded-b-lg shadow-lg"></div>
                  )}
                </div>
              )}

              {/* Rail Width measurement - positioned near the hardware */}
              {hasValue(measurements.rail_width) && (
                <div className={`absolute ${hardwareType === "track" ? "top-0" : "top-12"} left-12 right-12 flex items-center`}>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-blue-600"></div>
                  <div className="flex-1 border-t-2 border-blue-600 relative">
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Rail Width: {displayValue(measurements.rail_width)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-blue-600"></div>
                </div>
              )}

              {/* Window Width Measurement (A) */}
              {hasValue(measurements.measurement_a) && (
                <div className="absolute top-24 left-16 right-16 flex items-center">
                  <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-green-600"></div>
                  <div className="flex-1 border-t-2 border-green-600 relative">
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      A: {displayValue(measurements.measurement_a)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-green-600"></div>
                </div>
              )}

              {/* Curtain Drop measurement - from hardware to bottom of curtain */}
              {hasValue(measurements.drop) && (
                <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-4 flex flex-col items-center`}>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-purple-600"></div>
                  <div className={`${hardwareType === "track" ? "h-72" : "h-64"} border-l-2 border-purple-600 relative`}>
                    <span className="absolute -left-20 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
                      Drop: {displayValue(measurements.drop)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-purple-600"></div>
                </div>
              )}

              {/* Window Height Measurement (B) */}
              {hasValue(measurements.measurement_b) && (
                <div className="absolute top-28 left-8 bottom-20 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-orange-600"></div>
                  <div className="flex-1 border-l-2 border-orange-600 relative">
                    <span className="absolute -left-16 top-1/2 transform -translate-y-1/2 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
                      B: {displayValue(measurements.measurement_b)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-orange-600"></div>
                </div>
              )}

              {/* Rod to Ceiling measurement (C) - only for rod, not track */}
              {hasValue(measurements.measurement_c) && hardwareType === "rod" && (
                <div className="absolute top-4 right-4 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-red-600"></div>
                  <div className="h-12 border-l-2 border-red-600 relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
                      C: {displayValue(measurements.measurement_c)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-red-600"></div>
                </div>
              )}

              {/* Floor Line */}
              <div className="absolute bottom-4 left-8 right-8 border-t-4 border-gray-800">
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-semibold bg-white px-2 rounded shadow-sm">
                  Floor
                </span>
              </div>

              {/* Pooling measurement indicator */}
              {poolingOption === "below_floor" && hasValue(poolingAmount) && (
                <div className="absolute bottom-0 left-6 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-amber-600"></div>
                  <div className="h-6 border-l-2 border-amber-600 relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
                      Pooling: {displayValue(poolingAmount)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-amber-600"></div>
                </div>
              )}

              {/* Above floor clearance measurement indicator */}
              {poolingOption === "above_floor" && hasValue(poolingAmount) && (
                <div className="absolute bottom-8 left-6 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-emerald-600"></div>
                  <div className="h-8 border-l-2 border-emerald-600 relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
                      Clearance: {displayValue(poolingAmount)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-emerald-600"></div>
                </div>
              )}

              {/* Window to Floor measurement (D) */}
              {hasValue(measurements.measurement_d) && (
                <div className="absolute bottom-4 right-8 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-indigo-600"></div>
                  <div className="h-16 border-l-2 border-indigo-600 relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
                      D: {displayValue(measurements.measurement_d)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-indigo-600"></div>
                </div>
              )}

              {/* Total Height measurement (E) - from hardware to floor */}
              {hasValue(measurements.measurement_e) && (
                <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} right-0 bottom-4 flex flex-col items-center`}>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-pink-600"></div>
                  <div className="flex-1 border-l-2 border-pink-600 relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
                      E: {displayValue(measurements.measurement_e)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-pink-600"></div>
                </div>
              )}

              {/* Total Width measurement (F) - from extension to extension */}
              {hasValue(measurements.measurement_f) && (
                <div className="absolute bottom-0 left-4 right-4 flex items-center">
                  <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-teal-600"></div>
                  <div className="flex-1 border-t-2 border-teal-600 relative">
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      F: {displayValue(measurements.measurement_f)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-teal-600"></div>
                </div>
              )}
            </div>

            {/* Measurement Guide */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-semibold mb-3 text-gray-800">Measurement Guide</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                <p><span className="font-medium text-green-600">A:</span> Window Width (inside frame to inside frame)</p>
                <p><span className="font-medium text-orange-600">B:</span> Window Height (inside frame top to bottom)</p>
                {hardwareType === "rod" && (
                  <p><span className="font-medium text-red-600">C:</span> Distance from Rod to Ceiling</p>
                )}
                <p><span className="font-medium text-indigo-600">D:</span> Distance from Window Bottom to Floor</p>
                <p><span className="font-medium text-pink-600">E:</span> Total Height from {hardwareType === "track" ? "Track" : "Rod"} to Floor</p>
                <p><span className="font-medium text-teal-600">F:</span> Total Width including {hardwareType === "track" ? "Track" : "Rod"} Extensions</p>
              </div>
            </div>
          </div>

          {/* Configuration and Measurement Inputs */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Hardware Type */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-semibold mb-4 text-gray-800 flex items-center">
                <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
                Hardware Type
              </h4>
              <RadioGroup 
                value={hardwareType} 
                onValueChange={(value) => handleInputChange("hardware_type", value)}
                disabled={readOnly}
                className="flex flex-row space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rod" id="rod" />
                  <Label htmlFor="rod" className="font-medium">Rod</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="track" id="track" />
                  <Label htmlFor="track" className="font-medium">Track</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Curtain Configuration */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-semibold mb-4 text-blue-800 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Curtain Configuration
              </h4>
              
              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold mb-3 block text-blue-700">Curtain Type</Label>
                  <RadioGroup 
                    value={curtainType} 
                    onValueChange={(value) => {
                      console.log("Curtain type changed to:", value);
                      handleInputChange("curtain_type", value);
                    }}
                    disabled={readOnly}
                    className="flex flex-row space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pair" id="pair" />
                      <Label htmlFor="pair" className="font-medium">Pair (Two panels)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single" className="font-medium">Single (One panel)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {curtainType === "single" && (
                  <div>
                    <Label className="text-sm font-semibold mb-3 block text-blue-700">Panel Position</Label>
                    <RadioGroup 
                      value={curtainSide} 
                      onValueChange={(value) => {
                        console.log("Panel side changed to:", value);
                        handleInputChange("curtain_side", value);
                      }}
                      disabled={readOnly}
                      className="flex flex-row space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="left" id="left" />
                        <Label htmlFor="left" className="font-medium">Left side</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="right" id="right" />
                        <Label htmlFor="right" className="font-medium">Right side</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </div>

            {/* Main Measurements - Rail Width and Drop */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-semibold mb-4 text-green-800 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Main Measurements (for Calculator)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rail_width" className="text-sm font-semibold text-green-700">{hardwareType === "track" ? "Track" : "Rail"} Width</Label>
                  <p className="text-xs text-green-600 mb-2">Total width of the curtain {hardwareType === "track" ? "track" : "rail/rod"}</p>
                  <Input
                    id="rail_width"
                    type="number"
                    step="0.25"
                    value={measurements.rail_width || ""}
                    onChange={(e) => handleInputChange("rail_width", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="font-semibold border-green-300 focus:border-green-500"
                  />
                </div>
                <div>
                  <Label htmlFor="drop" className="text-sm font-semibold text-green-700">Curtain Drop</Label>
                  <p className="text-xs text-green-600 mb-2">Length of curtain panel from {hardwareType === "track" ? "track" : "rod"} to bottom</p>
                  <Input
                    id="drop"
                    type="number"
                    step="0.25"
                    value={measurements.drop || ""}
                    onChange={(e) => handleInputChange("drop", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="font-semibold border-green-300 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Pooling Configuration */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-semibold mb-4 text-amber-800 flex items-center">
                <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                Pooling Configuration
              </h4>
              
              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold mb-3 block text-amber-700">Pooling Position</Label>
                  <RadioGroup 
                    value={poolingOption} 
                    onValueChange={(value) => {
                      console.log("Pooling option changed to:", value);
                      handleInputChange("pooling_option", value);
                    }}
                    disabled={readOnly}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="above_floor" id="above_floor" />
                      <Label htmlFor="above_floor" className="font-medium">Above floor (hanging)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="touching_floor" id="touching_floor" />
                      <Label htmlFor="touching_floor" className="font-medium">Touching floor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="below_floor" id="below_floor" />
                      <Label htmlFor="below_floor" className="font-medium">Below floor (pooling)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {(poolingOption === "above_floor" || poolingOption === "below_floor") && (
                  <div>
                    <Label htmlFor="pooling_amount" className="text-sm font-semibold text-amber-700">
                      {poolingOption === "above_floor" ? "Floor Clearance" : "Pooling Amount"}
                    </Label>
                    <p className="text-xs text-amber-600 mb-2">
                      {poolingOption === "above_floor" 
                        ? "Distance between curtain bottom and floor" 
                        : "How much fabric pools on the floor"}
                    </p>
                    <Input
                      id="pooling_amount"
                      type="number"
                      step="0.25"
                      value={poolingAmount}
                      onChange={(e) => handleInputChange("pooling_amount", e.target.value)}
                      placeholder="2.00"
                      readOnly={readOnly}
                      className="font-semibold border-amber-300 focus:border-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Detailed Window Measurements */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-semibold mb-4 text-gray-800 flex items-center">
                <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
                Detailed Window Measurements
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="measurement_a" className="text-sm font-semibold text-gray-700">A - Window Width</Label>
                  <p className="text-xs text-gray-600 mb-2">Inside frame width</p>
                  <Input
                    id="measurement_a"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_a || ""}
                    onChange={(e) => handleInputChange("measurement_a", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="border-gray-300 focus:border-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_b" className="text-sm font-semibold text-gray-700">B - Window Height</Label>
                  <p className="text-xs text-gray-600 mb-2">Inside frame height</p>
                  <Input
                    id="measurement_b"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_b || ""}
                    onChange={(e) => handleInputChange("measurement_b", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="border-gray-300 focus:border-gray-500"
                  />
                </div>
                {hardwareType === "rod" && (
                  <div>
                    <Label htmlFor="measurement_c" className="text-sm font-semibold text-gray-700">C - Rod to Ceiling</Label>
                    <p className="text-xs text-gray-600 mb-2">Distance from rod to ceiling</p>
                    <Input
                      id="measurement_c"
                      type="number"
                      step="0.25"
                      value={measurements.measurement_c || ""}
                      onChange={(e) => handleInputChange("measurement_c", e.target.value)}
                      placeholder="0.00"
                      readOnly={readOnly}
                      className="border-gray-300 focus:border-gray-500"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="measurement_d" className="text-sm font-semibold text-gray-700">D - Window to Floor</Label>
                  <p className="text-xs text-gray-600 mb-2">Distance from window bottom to floor</p>
                  <Input
                    id="measurement_d"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_d || ""}
                    onChange={(e) => handleInputChange("measurement_d", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="border-gray-300 focus:border-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_e" className="text-sm font-semibold text-gray-700">E - Total Height</Label>
                  <p className="text-xs text-gray-600 mb-2">{hardwareType === "track" ? "Track" : "Rod"} to floor total height</p>
                  <Input
                    id="measurement_e"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_e || ""}
                    onChange={(e) => handleInputChange("measurement_e", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="border-gray-300 focus:border-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_f" className="text-sm font-semibold text-gray-700">F - Total Width</Label>
                  <p className="text-xs text-gray-600 mb-2">Total width including extensions</p>
                  <Input
                    id="measurement_f"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_f || ""}
                    onChange={(e) => handleInputChange("measurement_f", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="border-gray-300 focus:border-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Measurements for Curtain Makers */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-semibold mb-4 text-slate-800 flex items-center">
                <span className="w-2 h-2 bg-slate-500 rounded-full mr-3"></span>
                Additional Measurements (for Curtain Makers)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rod_extension_left" className="text-sm font-semibold text-slate-700">{hardwareType === "track" ? "Track" : "Rod"} Extension Left</Label>
                  <p className="text-xs text-slate-600 mb-2">How far {hardwareType === "track" ? "track" : "rod"} extends beyond window left</p>
                  <Input
                    id="rod_extension_left"
                    type="number"
                    step="0.25"
                    value={measurements.rod_extension_left || ""}
                    onChange={(e) => handleInputChange("rod_extension_left", e.target.value)}
                    placeholder="8-10"
                    readOnly={readOnly}
                    className="border-slate-300 focus:border-slate-500"
                  />
                </div>
                <div>
                  <Label htmlFor="rod_extension_right" className="text-sm font-semibold text-slate-700">{hardwareType === "track" ? "Track" : "Rod"} Extension Right</Label>
                  <p className="text-xs text-slate-600 mb-2">How far {hardwareType === "track" ? "track" : "rod"} extends beyond window right</p>
                  <Input
                    id="rod_extension_right"
                    type="number"
                    step="0.25"
                    value={measurements.rod_extension_right || ""}
                    onChange={(e) => handleInputChange("rod_extension_right", e.target.value)}
                    placeholder="8-10"
                    readOnly={readOnly}
                    className="border-slate-300 focus:border-slate-500"
                  />
                </div>
                <div>
                  <Label htmlFor="panel_overlap" className="text-sm font-semibold text-slate-700">Panel Overlap</Label>
                  <p className="text-xs text-slate-600 mb-2">How much panels overlap in center</p>
                  <Input
                    id="panel_overlap"
                    type="number"
                    step="0.25"
                    value={measurements.panel_overlap || ""}
                    onChange={(e) => handleInputChange("panel_overlap", e.target.value)}
                    placeholder="2-3"
                    readOnly={readOnly}
                    className="border-slate-300 focus:border-slate-500"
                  />
                </div>
                <div>
                  <Label htmlFor="floor_clearance" className="text-sm font-semibold text-slate-700">Floor Clearance</Label>
                  <p className="text-xs text-slate-600 mb-2">Gap between curtain and floor</p>
                  <Input
                    id="floor_clearance"
                    type="number"
                    step="0.25"
                    value={measurements.floor_clearance || ""}
                    onChange={(e) => handleInputChange("floor_clearance", e.target.value)}
                    placeholder="0.5"
                    readOnly={readOnly}
                    className="border-slate-300 focus:border-slate-500"
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
