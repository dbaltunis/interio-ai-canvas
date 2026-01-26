import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TWCQuestion {
  name: string;
  options: string[];
  isRequired: boolean;
  dependantField?: string;
  dependantOptions?: Array<{
    option: string;
    subOptions: string[];
  }>;
}

interface TWCCustomField {
  name: string;
  value: string;
}

interface TWCProductOptionsProps {
  twcQuestions: TWCQuestion[];
  twcFabricsAndColours?: {
    itemMaterials?: Array<{
      material: string;
      colours?: Array<{ colour: string; code?: string }>;
    }>;
  };
  selectedFields?: TWCCustomField[];
  selectedColour?: string;
  selectedMaterial?: string;
  onFieldsChange: (fields: TWCCustomField[]) => void;
  onColourChange: (colour: string) => void;
  onMaterialChange?: (material: string) => void;
  readOnly?: boolean;
}

export const TWCProductOptions = ({
  twcQuestions = [],
  twcFabricsAndColours,
  selectedFields = [],
  selectedColour = "",
  selectedMaterial = "",
  onFieldsChange,
  onColourChange,
  onMaterialChange,
  readOnly = false,
}: TWCProductOptionsProps) => {
  // Track local selections for dependent field logic
  const [localSelections, setLocalSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    selectedFields.forEach(f => {
      initial[f.name] = f.value;
    });
    return initial;
  });

  // Sync from parent when selectedFields changes
  useEffect(() => {
    const newSelections: Record<string, string> = {};
    selectedFields.forEach(f => {
      newSelections[f.name] = f.value;
    });
    setLocalSelections(newSelections);
  }, [selectedFields]);

  // Extract materials and colours from TWC data
  const { materials, coloursByMaterial } = useMemo(() => {
    const materials: string[] = [];
    const coloursByMaterial: Record<string, string[]> = {};

    if (twcFabricsAndColours?.itemMaterials) {
      for (const mat of twcFabricsAndColours.itemMaterials) {
        if (mat.material) {
          materials.push(mat.material);
          coloursByMaterial[mat.material] = (mat.colours || [])
            .map(c => c.colour)
            .filter(Boolean);
        }
      }
    }

    return { materials, coloursByMaterial };
  }, [twcFabricsAndColours]);

  // Get available colours based on selected material
  const availableColours = useMemo(() => {
    if (selectedMaterial && coloursByMaterial[selectedMaterial]) {
      return coloursByMaterial[selectedMaterial];
    }
    // If no material selected, show all colours
    return Object.values(coloursByMaterial).flat();
  }, [selectedMaterial, coloursByMaterial]);

  // Handle question selection
  const handleQuestionChange = (questionName: string, value: string) => {
    const newSelections = { ...localSelections, [questionName]: value };
    setLocalSelections(newSelections);

    // Convert to TWCCustomField array
    const fields: TWCCustomField[] = Object.entries(newSelections)
      .filter(([_, v]) => v)
      .map(([name, value]) => ({ name, value }));

    onFieldsChange(fields);
  };

  // Get options for a question (handles dependent fields)
  const getQuestionOptions = (question: TWCQuestion): string[] => {
    // Check if this question has dependent options
    if (question.dependantField && question.dependantOptions) {
      const parentValue = localSelections[question.dependantField];
      if (parentValue) {
        const dependentMatch = question.dependantOptions.find(
          d => d.option === parentValue
        );
        if (dependentMatch?.subOptions) {
          return dependentMatch.subOptions;
        }
      }
    }
    return question.options || [];
  };

  // Check if a question should be visible (based on parent selection)
  const isQuestionVisible = (question: TWCQuestion): boolean => {
    if (!question.dependantField) return true;
    // Only show if parent field has a value
    return !!localSelections[question.dependantField];
  };

  if (twcQuestions.length === 0 && materials.length === 0) {
    return null;
  }

  const requiredQuestions = twcQuestions.filter(q => q.isRequired);
  const optionalQuestions = twcQuestions.filter(q => !q.isRequired);
  const missingRequired = requiredQuestions.filter(
    q => isQuestionVisible(q) && !localSelections[q.name]
  );

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-base">TWC Manufacturing Options</CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            {twcQuestions.length} options
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Material Selection (if available) */}
        {materials.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Material
              <Badge variant="destructive" className="ml-2 text-[10px] h-4">Required</Badge>
            </Label>
            <Select
              value={selectedMaterial}
              onValueChange={(val) => onMaterialChange?.(val)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select material..." />
              </SelectTrigger>
              <SelectContent>
                {materials.map((mat) => (
                  <SelectItem key={mat} value={mat}>
                    {mat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Colour Selection */}
        {availableColours.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Colour
              <Badge variant="destructive" className="ml-2 text-[10px] h-4">Required</Badge>
            </Label>
            <Select
              value={selectedColour}
              onValueChange={onColourChange}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select colour..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {availableColours.map((colour) => (
                  <SelectItem key={colour} value={colour}>
                    {colour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Required Questions */}
        {requiredQuestions.length > 0 && (
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Required Options
            </Label>
            {requiredQuestions.map((question) => {
              if (!isQuestionVisible(question)) return null;
              const options = getQuestionOptions(question);
              
              return (
                <div key={question.name} className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    {question.name}
                    <Badge variant="destructive" className="text-[10px] h-4">Required</Badge>
                  </Label>
                  <Select
                    value={localSelections[question.name] || ""}
                    onValueChange={(val) => handleQuestionChange(question.name, val)}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${question.name}...`} />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        )}

        {/* Optional Questions */}
        {optionalQuestions.length > 0 && (
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Optional Options
            </Label>
            {optionalQuestions.map((question) => {
              if (!isQuestionVisible(question)) return null;
              const options = getQuestionOptions(question);
              
              return (
                <div key={question.name} className="space-y-1.5">
                  <Label className="text-sm font-medium">{question.name}</Label>
                  <Select
                    value={localSelections[question.name] || ""}
                    onValueChange={(val) => handleQuestionChange(question.name, val)}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${question.name}...`} />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        )}

        {/* Validation Warning */}
        {missingRequired.length > 0 && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Missing required options: {missingRequired.map(q => q.name).join(", ")}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
