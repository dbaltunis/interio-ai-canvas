
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface RodTrackSelectorProps {
  selectedRodTrack: any;
  onSelectionChange: (selection: any) => void;
  measurements: any;
}

export const RodTrackSelector = ({
  selectedRodTrack,
  onSelectionChange,
  measurements
}: RodTrackSelectorProps) => {
  const { formatCurrency } = useMeasurementUnits();
  const [bendingDegree, setBendingDegree] = useState(0);

  const rodTrackOptions = [
    {
      id: "curtain_rod",
      name: "Curtain Rod",
      type: "rod",
      description: "Traditional decorative rod",
      basePrice: 25,
      pricePerMeter: 8,
      image: "/placeholder-rod.jpg",
      finials: true,
      bending: false
    },
    {
      id: "curtain_track",
      name: "Curtain Track",
      type: "track",
      description: "Concealed track system",
      basePrice: 35,
      pricePerMeter: 12,
      image: "/placeholder-track.jpg",
      finials: false,
      bending: true
    },
    {
      id: "bay_track",
      name: "Bay Window Track",
      type: "track",
      description: "Bendable track for bay windows",
      basePrice: 45,
      pricePerMeter: 18,
      image: "/placeholder-bay-track.jpg",
      finials: false,
      bending: true
    },
    {
      id: "ceiling_track",
      name: "Ceiling Track",
      type: "track",
      description: "Ceiling-mounted track system",
      basePrice: 30,
      pricePerMeter: 10,
      image: "/placeholder-ceiling-track.jpg",
      finials: false,
      bending: true
    },
    {
      id: "pole_system",
      name: "Pole System",
      type: "rod",
      description: "Heavy-duty pole for large windows",
      basePrice: 50,
      pricePerMeter: 15,
      image: "/placeholder-pole.jpg",
      finials: true,
      bending: false
    }
  ];

  const finialOptions = [
    { id: "ball", name: "Ball Finial", price: 8 },
    { id: "cylinder", name: "Cylinder Finial", price: 10 },
    { id: "decorative", name: "Decorative Finial", price: 15 },
    { id: "crystal", name: "Crystal Finial", price: 25 }
  ];

  const bracketOptions = [
    { id: "standard", name: "Standard Brackets", price: 5, description: "Basic wall mount" },
    { id: "heavy_duty", name: "Heavy Duty Brackets", price: 8, description: "For heavy curtains" },
    { id: "ceiling", name: "Ceiling Brackets", price: 7, description: "Ceiling mount" },
    { id: "bay", name: "Bay Window Brackets", price: 12, description: "Angled brackets" }
  ];

  const calculatePrice = (option: any) => {
    const width = parseFloat(measurements.width) || 100;
    const widthInMeters = width / 100;
    const basePrice = option.basePrice + (option.pricePerMeter * widthInMeters);
    
    // Add bending cost if applicable
    let bendingCost = 0;
    if (option.bending && bendingDegree > 0) {
      bendingCost = Math.ceil(bendingDegree / 45) * 15; // £15 per 45-degree bend
    }
    
    return basePrice + bendingCost;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rod & Track Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rodTrackOptions.map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedRodTrack?.id === option.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/30'
                }`}
                onClick={() => onSelectionChange({ ...option, price: calculatePrice(option) })}
              >
                <CardContent className="p-4">
                  <div className="w-full h-16 bg-muted rounded mb-2 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Preview</span>
                  </div>
                  <div className="font-medium text-sm mb-1">{option.name}</div>
                  <Badge variant="secondary" className="text-xs mb-2">
                    {option.type}
                  </Badge>
                  <div className="text-xs text-muted-foreground mb-2">
                    {option.description}
                  </div>
                  <div className="text-xs font-medium">
                    {formatCurrency(calculatePrice(option))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedRodTrack && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Finials Selection */}
          {selectedRodTrack.finials && (
            <Card>
              <CardHeader>
                <CardTitle>Finials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {finialOptions.map((finial) => (
                    <Button
                      key={finial.id}
                      variant="outline"
                      size="sm"
                      className="text-xs p-2 h-auto flex flex-col"
                    >
                      <span>{finial.name}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(finial.price)}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Brackets Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Brackets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {bracketOptions.map((bracket) => (
                  <Button
                    key={bracket.id}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs p-3 h-auto flex justify-between"
                  >
                    <div className="text-left">
                      <div>{bracket.name}</div>
                      <div className="text-muted-foreground">{bracket.description}</div>
                    </div>
                    <span>{formatCurrency(bracket.price)}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bending Options */}
          {selectedRodTrack.bending && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Bending Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Bending Degree: {bendingDegree}°</Label>
                    <Slider
                      value={[bendingDegree]}
                      onValueChange={(value) => setBendingDegree(value[0])}
                      max={180}
                      step={15}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Bending cost: {formatCurrency(Math.ceil(bendingDegree / 45) * 15)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
