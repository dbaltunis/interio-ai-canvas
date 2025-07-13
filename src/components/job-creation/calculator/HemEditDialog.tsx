import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface HemConfiguration {
  header_hem: string;
  bottom_hem: string;
  side_hem: string;
  seam_hem: string;
}

interface HemEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hemConfig: HemConfiguration) => void;
  initialValues?: HemConfiguration;
  treatmentType: string;
}

export const HemEditDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialValues,
  treatmentType 
}: HemEditDialogProps) => {
  const [hemConfig, setHemConfig] = useState<HemConfiguration>(
    initialValues || {
      header_hem: "15",
      bottom_hem: "10", 
      side_hem: "5",
      seam_hem: "3"
    }
  );

  const handleInputChange = (field: keyof HemConfiguration, value: string) => {
    setHemConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(hemConfig);
    onClose();
  };

  const calculateTotalHemAllowance = () => {
    const header = parseFloat(hemConfig.header_hem) || 0;
    const bottom = parseFloat(hemConfig.bottom_hem) || 0;
    const side = parseFloat(hemConfig.side_hem) || 0;
    return header + bottom + (side * 2); // Side hem on both sides
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Edit Treatment Hems - {treatmentType}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Hem allowances are added to fabric calculations for proper finishing.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Hem Allowances (cm)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="header_hem">Header Hem</Label>
                  <Input
                    id="header_hem"
                    type="number"
                    step="0.5"
                    min="0"
                    value={hemConfig.header_hem}
                    onChange={(e) => handleInputChange("header_hem", e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Top fold allowance</p>
                </div>

                <div>
                  <Label htmlFor="bottom_hem">Bottom Hem</Label>
                  <Input
                    id="bottom_hem"
                    type="number"
                    step="0.5"
                    min="0"
                    value={hemConfig.bottom_hem}
                    onChange={(e) => handleInputChange("bottom_hem", e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Bottom fold allowance</p>
                </div>

                <div>
                  <Label htmlFor="side_hem">Side Hem (each side)</Label>
                  <Input
                    id="side_hem"
                    type="number"
                    step="0.5"
                    min="0"
                    value={hemConfig.side_hem}
                    onChange={(e) => handleInputChange("side_hem", e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Left & right edges</p>
                </div>

                <div>
                  <Label htmlFor="seam_hem">Seam Hem (per join)</Label>
                  <Input
                    id="seam_hem"
                    type="number"
                    step="0.5"
                    min="0"  
                    value={hemConfig.seam_hem}
                    onChange={(e) => handleInputChange("seam_hem", e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">For fabric joins</p>
                </div>
              </div>

              <Separator />

              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Hem Allowance:</span>
                  <span className="text-sm font-bold">{calculateTotalHemAllowance().toFixed(1)} cm</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This is added to fabric length calculations
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Hem Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};