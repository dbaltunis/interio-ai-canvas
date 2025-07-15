
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calculator } from "lucide-react";

interface CalculationFormulasListProps {
  formulas: any[];
  onEdit: (formula: any) => void;
  onDelete: any;
}

export const CalculationFormulasList = ({ formulas, onEdit, onDelete }: CalculationFormulasListProps) => {
  if (!formulas || formulas.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calculator className="h-12 w-12 text-brand-neutral mx-auto mb-4" />
          <p className="text-brand-neutral">No calculation formulas created yet. Add your first formula!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {formulas.map((formula) => (
        <Card key={formula.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{formula.name}</CardTitle>
                {formula.description && (
                  <p className="text-sm text-brand-neutral mt-1">{formula.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(formula)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete.mutate(formula.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-gray-50 p-3 rounded-md mb-3">
              <code className="text-sm font-mono">{formula.formula_expression}</code>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
              <div>
                <span className="font-medium">Category:</span> {formula.category?.replace('_', ' ') || 'Not set'}
              </div>
              <div>
                <span className="font-medium">Type:</span> {formula.formula_type?.replace('_', ' ') || 'Not set'}
              </div>
              <div>
                <span className="font-medium">Output:</span> {formula.output_unit || 'Not set'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{formula.category?.replace('_', ' ')}</Badge>
              <Badge variant="secondary">{formula.output_unit}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
