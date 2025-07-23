
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface TreatmentTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  measurements: any;
}

export const TreatmentTypeSelector = ({
  selectedType,
  onTypeChange,
  measurements
}: TreatmentTypeSelectorProps) => {
  const { formatCurrency } = useMeasurementUnits();
  const [customOptions, setCustomOptions] = useState({
    fullness: "2.5",
    heading: "pencil_pleat",
    lining: "none"
  });

  const treatmentTypes = [
    {
      id: "curtains",
      name: "Curtains",
      category: "fabric",
      description: "Traditional fabric window treatments",
      basePrice: 45,
      image: "/placeholder-curtains.jpg",
      options: ["fullness", "heading", "lining"]
    },
    {
      id: "drapes",
      name: "Drapes",
      category: "fabric", 
      description: "Formal, lined fabric treatments",
      basePrice: 65,
      image: "/placeholder-drapes.jpg",
      options: ["fullness", "heading", "lining", "interline"]
    },
    {
      id: "blinds",
      name: "Blinds",
      category: "hard",
      description: "Horizontal or vertical slat systems",
      basePrice: 35,
      image: "/placeholder-blinds.jpg",
      options: ["slat_size", "control_type"]
    },
    {
      id: "shutters",
      name: "Shutters",
      category: "hard",
      description: "Solid panel window coverings",
      basePrice: 120,
      image: "/placeholder-shutters.jpg",
      options: ["panel_config", "louvre_size"]
    },
    {
      id: "roman_shades",
      name: "Roman Shades",
      category: "fabric",
      description: "Flat fabric panels that fold upward",
      basePrice: 55,
      image: "/placeholder-roman.jpg",
      options: ["fold_style", "lining"]
    },
    {
      id: "roller_shades",
      name: "Roller Shades",
      category: "hard",
      description: "Simple roll-up window coverings",
      basePrice: 40,
      image: "/placeholder-roller.jpg",
      options: ["fabric_type", "control_type"]
    }
  ];

  const headingStyles = [
    { id: "pencil_pleat", name: "Pencil Pleat", multiplier: 2.5 },
    { id: "pinch_pleat", name: "Pinch Pleat", multiplier: 2.0 },
    { id: "wave", name: "Wave", multiplier: 1.6 },
    { id: "eyelet", name: "Eyelet", multiplier: 2.0 },
    { id: "tab_top", name: "Tab Top", multiplier: 1.5 }
  ];

  const liningOptions = [
    { id: "none", name: "No Lining", price: 0 },
    { id: "standard", name: "Standard Lining", price: 8 },
    { id: "blackout", name: "Blackout Lining", price: 12 },
    { id: "thermal", name: "Thermal Lining", price: 10 }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Treatment Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {treatmentTypes.map((treatment) => (
              <Card
                key={treatment.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedType === treatment.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/30'
                }`}
                onClick={() => onTypeChange(treatment.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-full h-24 bg-muted rounded mb-2 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Preview</span>
                  </div>
                  <div className="font-medium text-sm mb-1">{treatment.name}</div>
                  <Badge variant="secondary" className="text-xs mb-2">
                    {treatment.category}
                  </Badge>
                  <div className="text-xs text-muted-foreground mb-2">
                    {treatment.description}
                  </div>
                  <div className="text-xs font-medium">
                    From {formatCurrency(treatment.basePrice)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedType && (
        <Card>
          <CardHeader>
            <CardTitle>Treatment Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(selectedType === "curtains" || selectedType === "drapes" || selectedType === "roman_shades") && (
              <>
                <div>
                  <Label>Heading Style</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {headingStyles.map((style) => (
                      <Button
                        key={style.id}
                        variant={customOptions.heading === style.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCustomOptions(prev => ({ ...prev, heading: style.id }))}
                        className="text-xs"
                      >
                        {style.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="fullness">Fullness Ratio</Label>
                  <Input
                    id="fullness"
                    type="number"
                    step="0.1"
                    value={customOptions.fullness}
                    onChange={(e) => setCustomOptions(prev => ({ ...prev, fullness: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Fabric width to window width ratio (typically 2.0-3.0)
                  </p>
                </div>

                <div>
                  <Label>Lining Options</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {liningOptions.map((lining) => (
                      <Button
                        key={lining.id}
                        variant={customOptions.lining === lining.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCustomOptions(prev => ({ ...prev, lining: lining.id }))}
                        className="text-xs"
                      >
                        {lining.name}
                        {lining.price > 0 && (
                          <span className="ml-1">+{formatCurrency(lining.price)}</span>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
