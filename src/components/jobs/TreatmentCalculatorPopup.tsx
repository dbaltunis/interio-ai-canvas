import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, X, Save } from "lucide-react";
import { WindowCoveringCalculator } from "@/components/calculator/WindowCoveringCalculator";

interface TreatmentCalculatorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  window: any;
  onSave: (treatmentData: any) => void;
}

export const TreatmentCalculatorPopup = ({ 
  isOpen, 
  onClose, 
  window, 
  onSave 
}: TreatmentCalculatorPopupProps) => {
  const [treatmentData, setTreatmentData] = useState({
    width: "",
    height: "",
    treatmentType: "",
    fabric: "",
    totalPrice: 0,
    notes: ""
  });

  const [isCompactMode, setIsCompactMode] = useState(true);

  const handleSave = () => {
    if (!treatmentData.width || !treatmentData.height) {
      return;
    }

    onSave({
      ...treatmentData,
      windowName: window?.name || "Window"
    });
    
    // Reset form
    setTreatmentData({
      width: "",
      height: "",
      treatmentType: "",
      fabric: "",
      totalPrice: 0,
      notes: ""
    });
  };

  if (!window) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Configure Treatment - {window.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Form Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{window.name}</Badge>
              <Badge variant="outline">Room: {window.room?.name || "Unknown"}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isCompactMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsCompactMode(true)}
              >
                Quick Entry
              </Button>
              <Button
                variant={!isCompactMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsCompactMode(false)}
              >
                Advanced Calculator
              </Button>
            </div>
          </div>

          {isCompactMode ? (
            /* Quick Entry Form */
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="width">Width (cm) *</Label>
                      <Input
                        id="width"
                        type="number"
                        value={treatmentData.width}
                        onChange={(e) => setTreatmentData(prev => ({ 
                          ...prev, 
                          width: e.target.value 
                        }))}
                        placeholder="Enter width in cm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">Height (cm) *</Label>
                      <Input
                        id="height"
                        type="number"
                        value={treatmentData.height}
                        onChange={(e) => setTreatmentData(prev => ({ 
                          ...prev, 
                          height: e.target.value 
                        }))}
                        placeholder="Enter height in cm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="treatmentType">Treatment Type</Label>
                      <select
                        id="treatmentType"
                        value={treatmentData.treatmentType}
                        onChange={(e) => setTreatmentData(prev => ({ 
                          ...prev, 
                          treatmentType: e.target.value 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      >
                        <option value="">Select type...</option>
                        <option value="curtains">Curtains</option>
                        <option value="blinds">Blinds</option>
                        <option value="roman-blinds">Roman Blinds</option>
                        <option value="roller-blinds">Roller Blinds</option>
                        <option value="venetian-blinds">Venetian Blinds</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="fabric">Fabric/Material</Label>
                      <Input
                        id="fabric"
                        value={treatmentData.fabric}
                        onChange={(e) => setTreatmentData(prev => ({ 
                          ...prev, 
                          fabric: e.target.value 
                        }))}
                        placeholder="Enter fabric or material"
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalPrice">Estimated Price ($)</Label>
                      <Input
                        id="totalPrice"
                        type="number"
                        value={treatmentData.totalPrice}
                        onChange={(e) => setTreatmentData(prev => ({ 
                          ...prev, 
                          totalPrice: parseFloat(e.target.value) || 0
                        }))}
                        placeholder="Enter price"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={treatmentData.notes}
                        onChange={(e) => setTreatmentData(prev => ({ 
                          ...prev, 
                          notes: e.target.value 
                        }))}
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  {treatmentData.width && treatmentData.height && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Preview:</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm">
                          <strong>{window.name}</strong> - {treatmentData.treatmentType || "Treatment"} - 
                          {treatmentData.width}cm × {treatmentData.height}cm
                          {treatmentData.totalPrice > 0 && (
                            <span className="text-green-600 font-medium ml-2">
                              ${treatmentData.totalPrice.toLocaleString()}
                            </span>
                          )}
                        </p>
                        {treatmentData.fabric && (
                          <p className="text-xs text-gray-600">Fabric: {treatmentData.fabric}</p>
                        )}
                        {treatmentData.notes && (
                          <p className="text-xs text-gray-600">Notes: {treatmentData.notes}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={!treatmentData.width || !treatmentData.height}
                      className="bg-brand-primary hover:bg-brand-accent flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Treatment
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Advanced Calculator */
            <div className="border rounded-lg p-4">
              <WindowCoveringCalculator />
              <div className="flex items-center gap-2 pt-4 border-t mt-6">
                <Button
                  onClick={() => {
                    // In a real implementation, this would get data from the calculator
                    handleSave();
                  }}
                  className="bg-brand-primary hover:bg-brand-accent flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};