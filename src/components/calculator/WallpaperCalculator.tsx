import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Wallpaper, Plus, Trash2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

interface WallpaperSpecs {
  rollWidth: number;
  rollLength: number;
  patternRepeat: number;
  pricePerRoll: number;
  wastagePercentage: number;
}

interface Deduction {
  id: string;
  width: number;
  height: number;
  description: string;
}

interface CalculationResult {
  totalArea: number;
  deductionsArea: number;
  netArea: number;
  dropsNeeded: number;
  dropsPerRoll: number;
  rollsNeeded: number;
  rollsWithWastage: number;
  wastageRolls: number;
  totalCost: number;
  dropHeight: number;
  usableAreaPerRoll: number;
}

export const WallpaperCalculator = () => {
  const { toast } = useToast();

  // Room dimensions
  const [roomWidth, setRoomWidth] = useState<number>(400);
  const [roomHeight, setRoomHeight] = useState<number>(250);
  const [numberOfWalls, setNumberOfWalls] = useState<number>(4);

  // Wallpaper specifications
  const [wallpaperSpecs, setWallpaperSpecs] = useState<WallpaperSpecs>({
    rollWidth: 53,
    rollLength: 1000,
    patternRepeat: 0,
    pricePerRoll: 45.0,
    wastagePercentage: 10,
  });

  // Deductions (doors, windows)
  const [deductions, setDeductions] = useState<Deduction[]>([]);

  // Results
  const [results, setResults] = useState<CalculationResult | null>(null);

  const addDeduction = () => {
    const newDeduction: Deduction = {
      id: `deduction-${Date.now()}`,
      width: 90,
      height: 210,
      description: "Door/Window",
    };
    setDeductions([...deductions, newDeduction]);
  };

  const removeDeduction = (id: string) => {
    setDeductions(deductions.filter((d) => d.id !== id));
  };

  const updateDeduction = (id: string, field: keyof Deduction, value: string | number) => {
    setDeductions(
      deductions.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const calculateWallpaper = () => {
    try {
      const { rollWidth, rollLength, patternRepeat, pricePerRoll, wastagePercentage } = wallpaperSpecs;

      // Calculate total wall perimeter
      const perimeter = roomWidth * numberOfWalls;

      // Calculate total wall area
      const totalWallArea = (perimeter * roomHeight) / 10000; // Convert to m²

      // Calculate deductions area
      const deductionsArea = deductions.reduce((total, d) => {
        return total + (d.width * d.height) / 10000; // Convert to m²
      }, 0);

      // Net area to cover
      const netArea = totalWallArea - deductionsArea;

      // Calculate drop height (room height + pattern repeat for matching)
      const dropHeight = patternRepeat > 0 
        ? Math.ceil((roomHeight + patternRepeat) / patternRepeat) * patternRepeat 
        : roomHeight;

      // Calculate how many drops per roll
      const dropsPerRoll = Math.floor(rollLength / dropHeight);

      // Calculate number of drops needed around room
      const dropsNeeded = Math.ceil(perimeter / rollWidth);

      // Calculate rolls needed
      const rollsNeeded = Math.ceil(dropsNeeded / dropsPerRoll);

      // Add wastage
      const rollsWithWastage = Math.ceil(rollsNeeded * (1 + wastagePercentage / 100));

      // Calculate usable area per roll
      const usableAreaPerRoll = (dropsPerRoll * rollWidth * dropHeight) / 10000; // Convert to m²

      // Calculate total cost
      const totalCost = rollsWithWastage * pricePerRoll;

      const calculationResults: CalculationResult = {
        totalArea: totalWallArea,
        deductionsArea,
        netArea,
        dropsNeeded,
        dropsPerRoll,
        rollsNeeded,
        rollsWithWastage,
        wastageRolls: rollsWithWastage - rollsNeeded,
        totalCost,
        dropHeight,
        usableAreaPerRoll,
      };

      setResults(calculationResults);

      toast({
        title: "Calculation Complete",
        description: `You need ${rollsWithWastage} rolls of wallpaper`,
      });
    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate requirements",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallpaper className="h-5 w-5" />
            Wallpaper Calculator
          </CardTitle>
          <CardDescription>
            Calculate wallpaper requirements based on room dimensions and specifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Room Dimensions */}
          <div className="space-y-4">
            <h3 className="font-medium">Room Dimensions</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomWidth">Room Width (cm)</Label>
                <Input
                  id="roomWidth"
                  type="number"
                  value={roomWidth}
                  onChange={(e) => setRoomWidth(Number(e.target.value))}
                  placeholder="400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomHeight">Room Height (cm)</Label>
                <Input
                  id="roomHeight"
                  type="number"
                  value={roomHeight}
                  onChange={(e) => setRoomHeight(Number(e.target.value))}
                  placeholder="250"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfWalls">Number of Walls</Label>
                <Select
                  value={numberOfWalls.toString()}
                  onValueChange={(value) => setNumberOfWalls(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Wall</SelectItem>
                    <SelectItem value="2">2 Walls</SelectItem>
                    <SelectItem value="3">3 Walls</SelectItem>
                    <SelectItem value="4">4 Walls</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Wallpaper Specifications */}
          <div className="space-y-4">
            <h3 className="font-medium">Wallpaper Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rollWidth">Roll Width (cm)</Label>
                <Input
                  id="rollWidth"
                  type="number"
                  value={wallpaperSpecs.rollWidth}
                  onChange={(e) =>
                    setWallpaperSpecs({ ...wallpaperSpecs, rollWidth: Number(e.target.value) })
                  }
                  placeholder="53"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollLength">Roll Length (cm)</Label>
                <Input
                  id="rollLength"
                  type="number"
                  value={wallpaperSpecs.rollLength}
                  onChange={(e) =>
                    setWallpaperSpecs({ ...wallpaperSpecs, rollLength: Number(e.target.value) })
                  }
                  placeholder="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patternRepeat">Pattern Repeat (cm)</Label>
                <Input
                  id="patternRepeat"
                  type="number"
                  value={wallpaperSpecs.patternRepeat}
                  onChange={(e) =>
                    setWallpaperSpecs({ ...wallpaperSpecs, patternRepeat: Number(e.target.value) })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerRoll">Price per Roll (£)</Label>
                <Input
                  id="pricePerRoll"
                  type="number"
                  step="0.01"
                  value={wallpaperSpecs.pricePerRoll}
                  onChange={(e) =>
                    setWallpaperSpecs({ ...wallpaperSpecs, pricePerRoll: Number(e.target.value) })
                  }
                  placeholder="45.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wastagePercentage">Wastage (%)</Label>
                <Input
                  id="wastagePercentage"
                  type="number"
                  value={wallpaperSpecs.wastagePercentage}
                  onChange={(e) =>
                    setWallpaperSpecs({
                      ...wallpaperSpecs,
                      wastagePercentage: Number(e.target.value),
                    })
                  }
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Deductions (Doors/Windows) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Deductions (Doors/Windows)</h3>
              <Button onClick={addDeduction} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Deduction
              </Button>
            </div>

            {deductions.length === 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No deductions added. Add doors or windows to subtract from total area.
                </AlertDescription>
              </Alert>
            )}

            {deductions.map((deduction) => (
              <Card key={deduction.id}>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={deduction.description}
                        onChange={(e) =>
                          updateDeduction(deduction.id, "description", e.target.value)
                        }
                        placeholder="Door/Window"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Width (cm)</Label>
                      <Input
                        type="number"
                        value={deduction.width}
                        onChange={(e) =>
                          updateDeduction(deduction.id, "width", Number(e.target.value))
                        }
                        placeholder="90"
                      />
                    </div>
                    <div className="space-y-2 flex items-end gap-2">
                      <div className="flex-1 space-y-2">
                        <Label>Height (cm)</Label>
                        <Input
                          type="number"
                          value={deduction.height}
                          onChange={(e) =>
                            updateDeduction(deduction.id, "height", Number(e.target.value))
                          }
                          placeholder="210"
                        />
                      </div>
                      <Button
                        onClick={() => removeDeduction(deduction.id)}
                        variant="destructive"
                        size="icon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={calculateWallpaper} className="w-full">
            Calculate Wallpaper Requirements
          </Button>

          {/* Calculation Results */}
          {results && (
            <>
              <Separator />
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Calculation Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "Total wall area", value: `${results.totalArea.toFixed(2)} m²` },
                    { label: "Deductions area", value: `${results.deductionsArea.toFixed(2)} m²` },
                    { label: "Net area to cover", value: `${results.netArea.toFixed(2)} m²` },
                    { label: "Drop height (with repeat)", value: `${results.dropHeight} cm` },
                    { label: "Drops per roll", value: results.dropsPerRoll.toString() },
                    { label: "Total drops needed", value: results.dropsNeeded.toString() },
                    { label: "Rolls needed (exact)", value: results.rollsNeeded.toString() },
                    { label: "Wastage rolls", value: results.wastageRolls.toString() },
                    {
                      label: "Rolls to order",
                      value: results.rollsWithWastage.toString(),
                      highlight: true,
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center text-sm border-b border-border pb-1 ${
                        item.highlight ? "font-semibold text-primary" : ""
                      }`}
                    >
                      <span className={item.highlight ? "" : "text-muted-foreground"}>
                        {item.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={item.highlight ? "text-lg" : "font-medium"}>
                          {item.value}
                        </span>
                        {!item.highlight && <Info className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 mt-4 border-t border-border">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Cost</span>
                      <span className="text-lg text-primary">£{results.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
