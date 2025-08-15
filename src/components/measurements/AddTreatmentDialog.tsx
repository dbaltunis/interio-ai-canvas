import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TreatmentTypeIndicator } from "./TreatmentTypeIndicator";
import { Layers, Blinds, Square, Plus } from "lucide-react";

interface AddTreatmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTreatment: (treatmentData: any) => void;
  windowName: string;
  existingTreatmentCount: number;
}

const TREATMENT_OPTIONS = [
  {
    type: "curtains",
    name: "Curtains",
    icon: Layers,
    description: "Fabric window treatments with various heading styles"
  },
  {
    type: "blinds", 
    name: "Blinds",
    icon: Blinds,
    description: "Horizontal or vertical slat window coverings"
  },
  {
    type: "shutters",
    name: "Shutters", 
    icon: Square,
    description: "Solid panel window coverings"
  },
  {
    type: "valance",
    name: "Valance",
    icon: Layers,
    description: "Decorative top treatment"
  },
  {
    type: "pelmet",
    name: "Pelmet",
    icon: Square,
    description: "Hard top treatment to conceal hardware"
  }
];

export const AddTreatmentDialog = ({
  isOpen,
  onClose,
  onAddTreatment,
  windowName,
  existingTreatmentCount
}: AddTreatmentDialogProps) => {
  const [selectedType, setSelectedType] = useState("");
  const [treatmentName, setTreatmentName] = useState("");

  const handleAddTreatment = () => {
    if (!selectedType) return;

    const treatmentData = {
      type: selectedType,
      name: treatmentName || `${windowName} - ${TREATMENT_OPTIONS.find(opt => opt.type === selectedType)?.name}`,
      treatmentNumber: existingTreatmentCount + 1
    };

    onAddTreatment(treatmentData);
    onClose();
    setSelectedType("");
    setTreatmentName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Treatment to {windowName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Treatment Type</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {TREATMENT_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.type}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedType === option.type
                        ? 'ring-2 ring-primary border-primary/50 bg-primary/5'
                        : 'hover:border-primary/30'
                    }`}
                    onClick={() => setSelectedType(option.type)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm">{option.name}</h3>
                            <TreatmentTypeIndicator 
                              treatmentType={option.type} 
                              size="sm" 
                              showIcon={false}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {selectedType && (
            <div className="space-y-3">
              <Label htmlFor="treatment-name" className="text-base font-semibold">
                Treatment Name (Optional)
              </Label>
              <Input
                id="treatment-name"
                value={treatmentName}
                onChange={(e) => setTreatmentName(e.target.value)}
                placeholder={`${windowName} - ${TREATMENT_OPTIONS.find(opt => opt.type === selectedType)?.name}`}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                If left blank, will use default naming: "{windowName} - {TREATMENT_OPTIONS.find(opt => opt.type === selectedType)?.name}"
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddTreatment} 
              disabled={!selectedType}
              className="min-w-[120px]"
            >
              Add Treatment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};