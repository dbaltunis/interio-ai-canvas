
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { OptionCategory } from "@/hooks/useWindowCoveringCategories";

interface CategoryFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (category: Omit<OptionCategory, 'id' | 'subcategories'>) => void;
  categoriesLength: number;
}

export const CategoryForm = ({ isVisible, onClose, onSubmit, categoriesLength }: CategoryFormProps) => {
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    is_required: false,
    sort_order: 0
  });

  const handleSubmit = async () => {
    await onSubmit({
      ...categoryForm,
      sort_order: categoriesLength
    });
    setCategoryForm({
      name: '',
      description: '',
      is_required: false,
      sort_order: 0
    });
    onClose();
  };

  if (!isVisible) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Category</CardTitle>
        <CardDescription>Add a new option category for window coverings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="category_name">Category Name</Label>
          <Input
            id="category_name"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Headings, Linings, Borders"
          />
        </div>
        <div>
          <Label htmlFor="category_description">Description</Label>
          <Textarea
            id="category_description"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="category_required"
            checked={categoryForm.is_required}
            onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, is_required: !!checked }))}
          />
          <Label htmlFor="category_required">Required for all window coverings</Label>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} className="bg-brand-primary hover:bg-brand-accent">
            Create Category
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
