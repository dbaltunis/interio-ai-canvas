import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateQuoteFromTreatments } from "@/hooks/useCreateQuoteFromTreatments";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { formatCurrency } from "@/utils/currency";
import { Plus, FileText, Wrench, Calendar, DollarSign } from "lucide-react";

interface CreateQuoteFromTreatmentsProps {
  projectId: string;
  children?: React.ReactNode;
}

export const CreateQuoteFromTreatments: React.FC<CreateQuoteFromTreatmentsProps> = ({ 
  projectId, 
  children 
}) => {
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [quoteConfig, setQuoteConfig] = useState({
    status: "draft",
    markupPercentage: 15,
    taxRate: 8.25,
    notes: "",
    valid_until: "",
  });

  const { data: treatments = [] } = useTreatments(projectId);
  const { data: rooms = [] } = useRooms(projectId);
  const createQuoteFromTreatments = useCreateQuoteFromTreatments();

  const roomMap = new Map(rooms.map(room => [room.id, room.name]));

  const calculateTotals = () => {
    const selectedTreatmentData = treatments.filter(t => 
      selectedTreatments.length === 0 || selectedTreatments.includes(t.id)
    );

    const subtotal = selectedTreatmentData.reduce((sum, treatment) => {
      const unitPrice = treatment.unit_price || 0;
      const laborCost = treatment.labor_cost || 0;
      const materialCost = treatment.material_cost || 0;
      const quantity = treatment.quantity || 1;
      const totalItemPrice = treatment.total_price || ((unitPrice + laborCost + materialCost) * quantity);
      return sum + totalItemPrice;
    }, 0);

    const markupAmount = subtotal * (quoteConfig.markupPercentage / 100);
    const taxableAmount = subtotal + markupAmount;
    const taxAmount = taxableAmount * (quoteConfig.taxRate / 100);
    const totalAmount = taxableAmount + taxAmount;

    return { subtotal, markupAmount, taxAmount, totalAmount };
  };

  const { subtotal, markupAmount, taxAmount, totalAmount } = calculateTotals();

  const handleTreatmentToggle = (treatmentId: string) => {
    setSelectedTreatments(prev => 
      prev.includes(treatmentId)
        ? prev.filter(id => id !== treatmentId)
        : [...prev, treatmentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTreatments.length === treatments.length) {
      setSelectedTreatments([]);
    } else {
      setSelectedTreatments(treatments.map(t => t.id));
    }
  };

  const handleCreateQuote = () => {
    createQuoteFromTreatments.mutate({
      projectId,
      treatmentIds: selectedTreatments,
      quoteConfig: {
        ...quoteConfig,
        valid_until: quoteConfig.valid_until || null,
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Quote from Treatments
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Quote from Treatments
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Treatment Selection */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Select Treatments
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedTreatments.length === treatments.length ? 'Deselect All' : 'Select All'}
              </Button>
            </CardHeader>
            <CardContent>
              {treatments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No treatments found for this project. Add treatments first.
                </p>
              ) : (
                <div className="space-y-4">
                  {treatments.map((treatment) => (
                    <div key={treatment.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedTreatments.includes(treatment.id)}
                        onCheckedChange={() => handleTreatmentToggle(treatment.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">
                              {roomMap.get(treatment.room_id) || 'Unknown Room'} - Treatment
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Qty: {treatment.quantity || 1} | 
                              Unit: {formatCurrency(treatment.unit_price || 0)} | 
                              Labor: {formatCurrency(treatment.labor_cost || 0)} | 
                              Material: {formatCurrency(treatment.material_cost || 0)}
                            </p>
                            {treatment.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{treatment.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatCurrency(
                                treatment.total_price || 
                                (((treatment.unit_price || 0) + 
                                  (treatment.labor_cost || 0) + 
                                  (treatment.material_cost || 0)) * 
                                 (treatment.quantity || 1))
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quote Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Quote Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={quoteConfig.status}
                    onValueChange={(value) => setQuoteConfig({ ...quoteConfig, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Ready to Send</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Markup (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={quoteConfig.markupPercentage}
                    onChange={(e) => setQuoteConfig({ 
                      ...quoteConfig, 
                      markupPercentage: parseFloat(e.target.value) || 0 
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tax Rate (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={quoteConfig.taxRate}
                    onChange={(e) => setQuoteConfig({ 
                      ...quoteConfig, 
                      taxRate: parseFloat(e.target.value) || 0 
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Valid Until</label>
                  <Input
                    type="date"
                    value={quoteConfig.valid_until}
                    onChange={(e) => setQuoteConfig({ ...quoteConfig, valid_until: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={quoteConfig.notes}
                  onChange={(e) => setQuoteConfig({ ...quoteConfig, notes: e.target.value })}
                  placeholder="Add any notes for this quote..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quote Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal ({selectedTreatments.length || treatments.length} items):</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Markup ({quoteConfig.markupPercentage}%):</span>
                  <span className="font-medium">{formatCurrency(markupAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({quoteConfig.taxRate}%):</span>
                  <span className="font-medium">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-primary">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button 
              onClick={handleCreateQuote}
              disabled={createQuoteFromTreatments.isPending || treatments.length === 0}
            >
              {createQuoteFromTreatments.isPending ? 'Creating...' : 'Create Quote'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};