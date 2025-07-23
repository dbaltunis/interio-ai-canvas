import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 text-center border-b pb-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">Window Measurement Worksheet</h2>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline">{windowType}</Badge>
          <Badge variant={hardwareType === "track" ? "default" : "secondary"}>
            {hardwareType === "track" ? "Track System" : "Rod System"}
          </Badge>
          <Badge variant={curtainType === "pair" ? "default" : "secondary"}>
            {curtainType === "pair" ? "Pair Curtains" : "Single Panel"}
          </Badge>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 2xl:grid-cols-5 gap-6">
        {/* Visual Diagram - Takes more space */}
        <div className="2xl:col-span-3 order-2 2xl:order-1">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Visual Diagram
              </CardTitle>
            </CardHeader>
            <CardContent>
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
              </div>

              {/* Measurement Guide */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-semibold mb-3 text-foreground">Measurement Guide</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
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
            </CardContent>
          </Card>
        </div>

        {/* Configuration Panel - Better organized */}
        <div className="2xl:col-span-2 order-1 2xl:order-2 space-y-4">
          {/* Hardware Type */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                Hardware Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={hardwareType} 
                onValueChange={(value) => handleInputChange("hardware_type", value)}
                disabled={readOnly}
                className="flex flex-row gap-6"
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
            </CardContent>
          </Card>

          {/* Curtain Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Curtain Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Curtain Type</Label>
                <RadioGroup 
                  value={curtainType} 
                  onValueChange={(value) => handleInputChange("curtain_type", value)}
                  disabled={readOnly}
                  className="flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pair" id="pair" />
                    <Label htmlFor="pair" className="text-sm">Pair</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single" className="text-sm">Single</Label>
                  </div>
                </RadioGroup>
              </div>

              {curtainType === "single" && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Panel Position</Label>
                  <RadioGroup 
                    value={curtainSide} 
                    onValueChange={(value) => handleInputChange("curtain_side", value)}
                    disabled={readOnly}
                    className="flex flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="left" id="left" />
                      <Label htmlFor="left" className="text-sm">Left</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="right" id="right" />
                      <Label htmlFor="right" className="text-sm">Right</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Primary Measurements */}
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Primary Measurements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rail_width" className="text-sm font-medium">{hardwareType === "track" ? "Track" : "Rail"} Width</Label>
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
                <Label htmlFor="drop" className="text-sm font-medium">Curtain Drop</Label>
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
            </CardContent>
          </Card>

          {/* Pooling Configuration */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Pooling Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Position</Label>
                <RadioGroup 
                  value={poolingOption} 
                  onValueChange={(value) => handleInputChange("pooling_option", value)}
                  disabled={readOnly}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="above_floor" id="above_floor" />
                    <Label htmlFor="above_floor" className="text-sm">Above floor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="touching_floor" id="touching_floor" />
                    <Label htmlFor="touching_floor" className="text-sm">Touching floor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="below_floor" id="below_floor" />
                    <Label htmlFor="below_floor" className="text-sm">Below floor (pooling)</Label>
                  </div>
                </RadioGroup>
              </div>

              {(poolingOption === "above_floor" || poolingOption === "below_floor") && (
                <div>
                  <Label htmlFor="pooling_amount" className="text-sm font-medium">
                    {poolingOption === "above_floor" ? "Floor Clearance" : "Pooling Amount"}
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
            </CardContent>
          </Card>

          {/* Window Measurements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                Window Measurements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="measurement_a" className="text-xs font-medium text-green-600">A - Width</Label>
                  <Input
                    id="measurement_a"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_a || ""}
                    onChange={(e) => handleInputChange("measurement_a", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_b" className="text-xs font-medium text-orange-600">B - Height</Label>
                  <Input
                    id="measurement_b"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_b || ""}
                    onChange={(e) => handleInputChange("measurement_b", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="mt-1 text-sm"
                  />
                </div>
                {hardwareType === "rod" && (
                  <div>
                    <Label htmlFor="measurement_c" className="text-xs font-medium text-red-600">C - Rod to Ceiling</Label>
                    <Input
                      id="measurement_c"
                      type="number"
                      step="0.25"
                      value={measurements.measurement_c || ""}
                      onChange={(e) => handleInputChange("measurement_c", e.target.value)}
                      placeholder="0.00"
                      readOnly={readOnly}
                      className="mt-1 text-sm"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="measurement_d" className="text-xs font-medium text-indigo-600">D - Window to Floor</Label>
                  <Input
                    id="measurement_d"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_d || ""}
                    onChange={(e) => handleInputChange("measurement_d", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_e" className="text-xs font-medium text-pink-600">E - Total Height</Label>
                  <Input
                    id="measurement_e"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_e || ""}
                    onChange={(e) => handleInputChange("measurement_e", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_f" className="text-xs font-medium text-teal-600">F - Total Width</Label>
                  <Input
                    id="measurement_f"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_f || ""}
                    onChange={(e) => handleInputChange("measurement_f", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Measurements - Collapsible */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                Additional Measurements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="rod_extension_left" className="text-xs font-medium">{hardwareType === "track" ? "Track" : "Rod"} Extension Left</Label>
                  <Input
                    id="rod_extension_left"
                    type="number"
                    step="0.25"
                    value={measurements.rod_extension_left || ""}
                    onChange={(e) => handleInputChange("rod_extension_left", e.target.value)}
                    placeholder="8-10"
                    readOnly={readOnly}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="rod_extension_right" className="text-xs font-medium">{hardwareType === "track" ? "Track" : "Rod"} Extension Right</Label>
                  <Input
                    id="rod_extension_right"
                    type="number"
                    step="0.25"
                    value={measurements.rod_extension_right || ""}
                    onChange={(e) => handleInputChange("rod_extension_right", e.target.value)}
                    placeholder="8-10"
                    readOnly={readOnly}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="panel_overlap" className="text-xs font-medium">Panel Overlap</Label>
                  <Input
                    id="panel_overlap"
                    type="number"
                    step="0.25"
                    value={measurements.panel_overlap || ""}
                    onChange={(e) => handleInputChange("panel_overlap", e.target.value)}
                    placeholder="2-3"
                    readOnly={readOnly}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="floor_clearance" className="text-xs font-medium">Floor Clearance</Label>
                  <Input
                    id="floor_clearance"
                    type="number"
                    step="0.25"
                    value={measurements.floor_clearance || ""}
                    onChange={(e) => handleInputChange("floor_clearance", e.target.value)}
                    placeholder="0.5"
                    readOnly={readOnly}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
