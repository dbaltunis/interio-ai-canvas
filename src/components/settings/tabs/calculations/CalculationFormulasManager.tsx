
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calculator } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCalculationFormulas } from "@/hooks/useCalculationFormulas";
import { CalculationFormulaForm } from "./CalculationFormulaForm";
import { CalculationFormulasList } from "./CalculationFormulasList";
import { DefaultFormulasLoader } from "./DefaultFormulasLoader";
import { FormulaCalculator } from "./FormulaCalculator";

export const CalculationFormulasManager = () => {
  const { data: formulas, isLoading, createFormula, updateFormula, deleteFormula } = useCalculationFormulas();
  const [isCreating, setIsCreating] = useState(false);
  const [editingFormula, setEditingFormula] = useState(null);

  const handleSave = async (formulaData: any) => {
    try {
      if (editingFormula) {
        await updateFormula.mutateAsync({ ...formulaData, id: editingFormula.id });
        setEditingFormula(null);
      } else {
        await createFormula.mutateAsync(formulaData);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error saving formula:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading calculation formulas...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calculation Formulas</CardTitle>
          <CardDescription>
            Create complex IF/THEN formulas for fabric usage, pricing calculations, and business logic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manage" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manage">Manage Formulas</TabsTrigger>
              <TabsTrigger value="calculator">
                <Calculator className="h-4 w-4 mr-2" />
                Test Calculator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manage" className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-brand-neutral">
                  Build formulas for fabric usage, fullness calculations, hems, linings, and pricing rules
                </p>
                <Button 
                  onClick={() => setIsCreating(true)}
                  className="bg-brand-primary hover:bg-brand-accent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Formula
                </Button>
              </div>

              {/* Create/Edit Form */}
              {(isCreating || editingFormula) && (
                <div className="mb-6">
                  <CalculationFormulaForm
                    formula={editingFormula}
                    onSave={handleSave}
                    onCancel={() => {
                      setIsCreating(false);
                      setEditingFormula(null);
                    }}
                  />
                </div>
              )}

              {/* Default Formulas Loader */}
              {!isCreating && !editingFormula && (
                <div className="mb-6">
                  <DefaultFormulasLoader />
                </div>
              )}

              {/* Formulas List */}
              <CalculationFormulasList
                formulas={formulas || []}
                onEdit={setEditingFormula}
                onDelete={deleteFormula.mutateAsync}
              />
            </TabsContent>

            <TabsContent value="calculator">
              <FormulaCalculator />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
