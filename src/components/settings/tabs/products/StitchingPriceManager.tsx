import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Scissors, Link2 } from "lucide-react";
import { useHeadingInventory } from "@/hooks/useHeadingInventory";
import { 
  useStitchingPrices, 
  useCreateStitchingPrice, 
  useUpdateStitchingPrice, 
  useDeleteStitchingPrice,
  type StitchingPrice 
} from "@/hooks/useStitchingPrices";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface FormData {
  name: string;
  description: string;
  price: number;
  pricing_method: 'per_meter' | 'per_unit' | 'per_curtain';
  heading_ids: string[];
}

const INITIAL_FORM: FormData = {
  name: '',
  description: '',
  price: 0,
  pricing_method: 'per_meter',
  heading_ids: []
};

export const StitchingPriceManager = () => {
  const { data: stitchingPrices, isLoading } = useStitchingPrices();
  const { data: headingStyles, isLoading: headingsLoading } = useHeadingInventory();
  const createMutation = useCreateStitchingPrice();
  const updateMutation = useUpdateStitchingPrice();
  const deleteMutation = useDeleteStitchingPrice();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      price_per_meter: formData.pricing_method === 'per_meter' ? formData.price : undefined,
      price_per_unit: formData.pricing_method !== 'per_meter' ? formData.price : undefined,
      pricing_method: formData.pricing_method,
      heading_ids: formData.heading_ids
    };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    resetForm();
  };

  const handleEdit = (price: StitchingPrice) => {
    setFormData({
      name: price.name,
      description: price.description || '',
      price: price.price_per_meter || price.price_per_unit || 0,
      pricing_method: price.pricing_method,
      heading_ids: price.heading_ids
    });
    setEditingId(price.id);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const toggleHeading = (headingId: string) => {
    setFormData(prev => ({
      ...prev,
      heading_ids: prev.heading_ids.includes(headingId)
        ? prev.heading_ids.filter(id => id !== headingId)
        : [...prev.heading_ids, headingId]
    }));
  };

  const getHeadingName = (headingId: string) => {
    return headingStyles?.find(h => h.id === headingId)?.name || 'Unknown';
  };

  if (isLoading || headingsLoading) {
    return <div className="text-muted-foreground p-4">Loading stitching prices...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            Stitching / Making Charges
          </h3>
          <p className="text-sm text-muted-foreground">
            Define stitching prices and link them to specific heading types
          </p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Stitching Price
          </Button>
        )}
      </div>

      {/* Stitching Prices List */}
      {!isCreating && (
        <div className="grid gap-3">
          {(stitchingPrices || []).length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Scissors className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No stitching prices configured</p>
                <p className="text-sm text-muted-foreground">Add prices and link them to headings</p>
              </CardContent>
            </Card>
          ) : (
            (stitchingPrices || []).map((price) => (
              <Card key={price.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{price.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          ₹{(price.price_per_meter || price.price_per_unit || 0).toFixed(0)}/{price.pricing_method.replace('per_', '')}
                        </Badge>
                      </div>
                      {price.description && (
                        <p className="text-sm text-muted-foreground">{price.description}</p>
                      )}
                      {price.heading_ids.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {price.heading_ids.map(id => (
                            <Badge key={id} variant="outline" className="text-xs">
                              {getHeadingName(id)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(price)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Stitching Price</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{price.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(price.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Stitching Price' : 'Add Stitching Price'}</CardTitle>
            <CardDescription>
              Define the price and link it to one or more heading types
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stitchingName">Name *</Label>
                <Input
                  id="stitchingName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Tailor Eyelet, Factory Pleated"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricingMethod">Pricing Method</Label>
                <Select
                  value={formData.pricing_method}
                  onValueChange={(value: FormData['pricing_method']) => 
                    setFormData(prev => ({ ...prev, pricing_method: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_meter">Per Meter</SelectItem>
                    <SelectItem value="per_unit">Per Unit</SelectItem>
                    <SelectItem value="per_curtain">Per Curtain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Standard tailor rate"
                />
              </div>
            </div>

            {/* Heading Selector */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Link to Headings
              </Label>
              <p className="text-sm text-muted-foreground">
                Select which heading types this price applies to. When a linked heading is selected in a curtain quote, this price will be available.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border rounded-lg p-3 bg-muted/30">
                {(headingStyles || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-full">No headings configured</p>
                ) : (
                  (headingStyles || []).map((heading) => (
                    <div
                      key={heading.id}
                      className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                        formData.heading_ids.includes(heading.id) 
                          ? 'bg-primary/10 border-primary' 
                          : 'bg-background hover:bg-muted'
                      }`}
                      onClick={() => toggleHeading(heading.id)}
                    >
                      <Checkbox
                        checked={formData.heading_ids.includes(heading.id)}
                        onCheckedChange={() => toggleHeading(heading.id)}
                      />
                      <span className="text-sm font-medium">{heading.name}</span>
                      {heading.fullness_ratio && (
                        <Badge variant="outline" className="text-xs ml-auto">
                          {heading.fullness_ratio}x
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
              {formData.heading_ids.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formData.heading_ids.length} heading(s) selected
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={handleSave} 
                disabled={createMutation.isPending || updateMutation.isPending || !formData.name.trim()}
              >
                {editingId ? 'Update' : 'Create'} Stitching Price
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
