
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Ruler } from "lucide-react";
import { type WindowCovering } from "@/hooks/useWindowCoverings";

interface Fabric {
  id: string;
  name: string;
  width: number;
  price_per_meter: number;
}

interface WindowCoveringSelectorProps {
  windowCoverings: WindowCovering[];
  onWindowCoveringChange: (windowCoveringId: string) => void;
  onFabricChange: (fabric: Fabric | null) => void;
}

export const WindowCoveringSelector = ({ 
  windowCoverings, 
  onWindowCoveringChange, 
  onFabricChange 
}: WindowCoveringSelectorProps) => {
  // Mock fabrics - replace with actual data fetching when fabric management is implemented
  const mockFabrics: Fabric[] = [
    {
      id: "1",
      name: "Cotton Canvas",
      width: 1.37,
      price_per_meter: 25.50
    },
    {
      id: "2",
      name: "Linen Blend",
      width: 1.50,
      price_per_meter: 35.00
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-5 w-5" />
          Product Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Window Covering Type</Label>
          <Select onValueChange={onWindowCoveringChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select window covering" />
            </SelectTrigger>
            <SelectContent>
              {windowCoverings
                .filter(wc => wc.active)
                .map(wc => (
                  <SelectItem key={wc.id} value={wc.id}>
                    {wc.name} - {wc.fabrication_pricing_method?.replace('-', ' ') || 'No pricing method'}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Fabric</Label>
          <Select onValueChange={(value) => {
            const fabric = mockFabrics.find(f => f.id === value);
            onFabricChange(fabric || null);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select fabric" />
            </SelectTrigger>
            <SelectContent>
              {mockFabrics.map(fabric => (
                <SelectItem key={fabric.id} value={fabric.id}>
                  {fabric.name} - £{fabric.price_per_meter}/m
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
