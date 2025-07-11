import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calculator, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProductTemplates } from "@/hooks/useProductTemplates";
import { useHeadingOptions } from "@/hooks/useHeadingOptions";
import { useToast } from "@/components/ui/use-toast";

interface FabricSelection {
  name: string;
  width: number;
  pricePerMeter: number;
  patternRepeat?: number;
}

interface CalculationResult {
  fabricAmount: string;
  curtainWidthTotal: string;
  fabricDropRequirements: string;
  fabricWidthRequirements: string;
  liningPrice: number;
  manufacturingPrice: number;
  fabricPrice: number;
  leftoversVertical: string;
  leftoversHorizontal: string;
}

export const ComprehensiveCalculator = () => {
  const { templates, isLoading: templatesLoading } = useProductTemplates();
  const { data: headingOptions = [], isLoading: headingsLoading } = useHeadingOptions();
  const { toast } = useToast();

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [railWidth, setRailWidth] = useState<number>(300);
  const [curtainDrop, setCurtainDrop] = useState<number>(225);
  const [selectedHeading, setSelectedHeading] = useState<string>("");
  const [selectedFabric, setSelectedFabric] = useState<FabricSelection>({
    name: "Custom Fabric",
    width: 137,
    pricePerMeter: 25.50,
    patternRepeat: 0
  });
  const [selectedLining, setSelectedLining] = useState<string>("");
  
  // Calculation results
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Get active template
  const activeTemplate = templates.find(t => t.id === selectedTemplate);
  
  // Get available headings based on template
  const availableHeadings = headingOptions.filter(heading => {
    if (!activeTemplate?.components?.headings) return false;
    return activeTemplate.components.headings[heading.id] === true;
  });

  // Sample fabric library (in production, this would come from your database)
  const fabricLibrary = [
    { name: "Premium Cotton", width: 137, pricePerMeter: 25.50, patternRepeat: 0 },
    { name: "Luxury Velvet", width: 140, pricePerMeter: 45.00, patternRepeat: 32 },
    { name: "Linen Blend", width: 150, pricePerMeter: 35.75, patternRepeat: 0 },
    { name: "Silk Dupioni", width: 110, pricePerMeter: 65.00, patternRepeat: 24 }
  ];

  const liningOptions = [
    { value: "none", label: "No Lining", price: 0 },
    { value: "standard", label: "Standard Lining", price: 8.50 },
    { value: "blackout", label: "Blackout Lining", price: 12.00 },
    { value: "thermal", label: "Thermal Lining", price: 15.00 }
  ];

  const calculateFabricRequirements = () => {
    if (!activeTemplate || !selectedHeading) {
      toast({
        title: "Missing Information",
        description: "Please select a product template and heading type",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);

    try {
      // Get selected heading details
      const headingDetails = availableHeadings.find(h => h.id === selectedHeading);
      if (!headingDetails) {
        throw new Error("Invalid heading selection");
      }

      const fullness = headingDetails.fullness;
      const headingPrice = headingDetails.price;

      // Calculate fabric requirements
      const requiredWidth = railWidth * fullness; // Total fabric width needed
      const fabricWidthAvailable = selectedFabric.width;
      
      // Calculate drops and widths
      const dropsPerWidth = Math.floor(fabricWidthAvailable / (railWidth / 1)); // Assuming single width per drop
      const widthsRequired = Math.ceil(requiredWidth / fabricWidthAvailable);
      
      // Pattern repeat considerations
      const patternRepeat = selectedFabric.patternRepeat || 0;
      const adjustedDrop = patternRepeat > 0 
        ? Math.ceil((curtainDrop + 20) / patternRepeat) * patternRepeat 
        : curtainDrop + 20; // Add 20cm for hems and headings

      // Total fabric needed in cm
      const totalFabricLength = widthsRequired * adjustedDrop;
      const totalFabricMeters = totalFabricLength / 100;

      // Fabric cost calculation
      const fabricCost = totalFabricMeters * selectedFabric.pricePerMeter;

      // Lining cost calculation
      const liningOption = liningOptions.find(l => l.value === selectedLining);
      const liningCost = liningOption ? (liningOption.price * totalFabricMeters) : 0;

      // Making cost calculation from template
      const calculationRules = activeTemplate.calculation_rules || {};
      const baseMakingCost = calculationRules.baseMakingCost || 0;
      const heightSurcharge = curtainDrop > (calculationRules.baseHeightLimit || 240) ? 
        (calculationRules.heightSurcharge1 || 0) : 0;
      
      const makingCost = (baseMakingCost + headingPrice + heightSurcharge) * (railWidth / 100);

      // Calculate leftovers
      const totalFabricUsed = totalFabricLength;
      const leftoverVertical = adjustedDrop - (curtainDrop + 20);
      const leftoverHorizontal = (widthsRequired * fabricWidthAvailable) - requiredWidth;

      // Build results
      const calculationResults: CalculationResult = {
        fabricAmount: `${totalFabricLength} cm`,
        curtainWidthTotal: `${dropsPerWidth} Drops (${(requiredWidth / railWidth).toFixed(2)})`,
        fabricDropRequirements: `${adjustedDrop} cm`,
        fabricWidthRequirements: `${requiredWidth.toFixed(0)} cm`,
        liningPrice: liningCost,
        manufacturingPrice: makingCost,
        fabricPrice: fabricCost,
        leftoversVertical: `${leftoverVertical.toFixed(2)} cm`,
        leftoversHorizontal: `${leftoverHorizontal.toFixed(2)} cm`
      };

      setResults(calculationResults);
      
      toast({
        title: "Calculation Complete",
        description: "Fabric requirements have been calculated successfully"
      });
    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate requirements",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Comprehensive Product Calculator
          </CardTitle>
          <CardDescription>
            Select your product template and specifications to calculate detailed requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Product Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product template" />
              </SelectTrigger>
              <SelectContent>
                {templates.filter(t => t.active).map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.product_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeTemplate && (
            <>
              <Separator />
              
              {/* Measurements */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="railWidth">Rail Width (cm)</Label>
                  <Input
                    id="railWidth"
                    type="number"
                    value={railWidth}
                    onChange={(e) => setRailWidth(Number(e.target.value))}
                    placeholder="300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="curtainDrop">Curtain Drop (cm)</Label>
                  <Input
                    id="curtainDrop"
                    type="number"
                    value={curtainDrop}
                    onChange={(e) => setCurtainDrop(Number(e.target.value))}
                    placeholder="225"
                  />
                </div>
              </div>

              {/* Heading Selection */}
              <div className="space-y-2">
                <Label htmlFor="heading">Heading Type</Label>
                <Select value={selectedHeading} onValueChange={setSelectedHeading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select heading type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableHeadings.map((heading) => (
                      <SelectItem key={heading.id} value={heading.id}>
                        {heading.name} (Fullness: {heading.fullness}x, Price: £{heading.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fabric Selection */}
              <div className="space-y-4">
                <Label>Fabric Selection</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fabricName">Fabric</Label>
                    <Select 
                      value={selectedFabric.name} 
                      onValueChange={(value) => {
                        const fabric = fabricLibrary.find(f => f.name === value);
                        if (fabric) setSelectedFabric(fabric);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fabricLibrary.map((fabric) => (
                          <SelectItem key={fabric.name} value={fabric.name}>
                            {fabric.name} (£{fabric.pricePerMeter}/m)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fabricWidth">Width (cm)</Label>
                    <Input
                      id="fabricWidth"
                      type="number"
                      value={selectedFabric.width}
                      onChange={(e) => setSelectedFabric(prev => ({
                        ...prev,
                        width: Number(e.target.value)
                      }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fabricPrice">Price per Meter (£)</Label>
                    <Input
                      id="fabricPrice"
                      type="number"
                      step="0.01"
                      value={selectedFabric.pricePerMeter}
                      onChange={(e) => setSelectedFabric(prev => ({
                        ...prev,
                        pricePerMeter: Number(e.target.value)
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patternRepeat">Pattern Repeat (cm)</Label>
                    <Input
                      id="patternRepeat"
                      type="number"
                      value={selectedFabric.patternRepeat || 0}
                      onChange={(e) => setSelectedFabric(prev => ({
                        ...prev,
                        patternRepeat: Number(e.target.value)
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Lining Selection */}
              <div className="space-y-2">
                <Label htmlFor="lining">Lining</Label>
                <Select value={selectedLining} onValueChange={setSelectedLining}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lining option" />
                  </SelectTrigger>
                  <SelectContent>
                    {liningOptions.map((lining) => (
                      <SelectItem key={lining.value} value={lining.value}>
                        {lining.label} {lining.price > 0 && `(+£${lining.price}/m)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={calculateFabricRequirements} 
                className="w-full"
                disabled={isCalculating}
              >
                {isCalculating ? "Calculating..." : "Calculate Requirements"}
              </Button>
            </>
          )}

          {/* Calculation Results */}
          {results && (
            <>
              <Separator />
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Calculation results (Pleated Curtain)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "Fabric amount", value: results.fabricAmount },
                    { label: "Curtain width total", value: results.curtainWidthTotal },
                    { label: "Fabric drop requirements", value: results.fabricDropRequirements },
                    { label: "Fabric width requirements", value: results.fabricWidthRequirements },
                    { label: "Lining price", value: `£${results.liningPrice.toFixed(2)}` },
                    { label: "Manufacturing price", value: `£${results.manufacturingPrice.toFixed(2)}` },
                    { label: "Fabric price", value: `£${results.fabricPrice.toFixed(2)}` },
                    { label: "Leftovers-Vertical", value: results.leftoversVertical },
                    { label: "Leftovers-Horizontal", value: results.leftoversHorizontal }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm border-b border-gray-100 pb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.value}</span>
                        <Info className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-2 mt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Price</span>
                      <span className="text-lg text-primary">
                        £{(results.fabricPrice + results.liningPrice + results.manufacturingPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!activeTemplate && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Please select a product template to begin calculating requirements. 
                Templates can be configured in Settings → Product Catalog.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};