
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OptionCategoryCard } from "./OptionCategoryCard";
import type { OptionCategory } from "@/hooks/types/windowCoveringTypes";

interface OptionsHierarchyDisplayProps {
  categories: OptionCategory[];
  windowCoveringId?: string;
}

export const OptionsHierarchyDisplay = ({ categories, windowCoveringId }: OptionsHierarchyDisplayProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [expandedSubSubcategories, setExpandedSubSubcategories] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [isAttaching, setIsAttaching] = useState(false);
  const { toast } = useToast();

  const toggleExpanded = (id: string, type: 'category' | 'subcategory' | 'subsubcategory') => {
    const setterMap = {
      category: setExpandedCategories,
      subcategory: setExpandedSubcategories,
      subsubcategory: setExpandedSubSubcategories
    };
    
    const setter = setterMap[type];
    setter(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCategorySelection = (categoryId: string, selected: boolean) => {
    const newSelected = new Set(selectedCategories);
    if (selected) {
      newSelected.add(categoryId);
    } else {
      newSelected.delete(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const handleAttachSelected = async () => {
    if (!windowCoveringId || selectedCategories.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one category to attach.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAttaching(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      console.log('Attaching categories:', Array.from(selectedCategories), 'to window covering:', windowCoveringId);

      // First, check if any assignments already exist to avoid duplicates
      const { data: existingAssignments, error: checkError } = await supabase
        .from('window_covering_option_assignments')
        .select('category_id')
        .eq('window_covering_id', windowCoveringId)
        .in('category_id', Array.from(selectedCategories));

      if (checkError) {
        console.error('Error checking existing assignments:', checkError);
        throw checkError;
      }

      // Filter out categories that are already assigned
      const existingCategoryIds = new Set(existingAssignments?.map(a => a.category_id) || []);
      const categoriesToAttach = Array.from(selectedCategories).filter(id => !existingCategoryIds.has(id));

      if (categoriesToAttach.length === 0) {
        toast({
          title: "Info",
          description: "All selected categories are already attached to this window covering.",
          variant: "default"
        });
        setSelectedCategories(new Set());
        return;
      }

      // Create assignments for new categories only
      const assignments = categoriesToAttach.map(categoryId => ({
        window_covering_id: windowCoveringId,
        category_id: categoryId,
        user_id: user.id
      }));

      console.log('Creating assignments:', assignments);

      const { error: insertError } = await supabase
        .from('window_covering_option_assignments')
        .insert(assignments);

      if (insertError) {
        console.error('Error creating assignments:', insertError);
        throw insertError;
      }

      const totalAttached = categoriesToAttach.length;
      const alreadyAttached = selectedCategories.size - totalAttached;

      let message = `Successfully attached ${totalAttached} categories to this window covering!`;
      if (alreadyAttached > 0) {
        message += ` (${alreadyAttached} were already attached)`;
      }

      toast({
        title: "Success",
        description: message
      });
      
      setSelectedCategories(new Set());
    } catch (error) {
      console.error('Error attaching categories:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to attach categories. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAttaching(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getPricingLabel = (method: string) => {
    const labels: Record<string, string> = {
      'per-unit': 'per unit',
      'per-meter': 'per meter',
      'per-sqm': 'per sqm',
      'fixed': 'fixed',
      'percentage': '%',
      'per-item': 'per item'
    };
    return labels[method] || method;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium">Available Option Categories</h4>
        <div className="flex items-center gap-4">
          <Badge variant="outline">{categories.length} categories</Badge>
          {windowCoveringId && selectedCategories.size > 0 && (
            <Button 
              onClick={handleAttachSelected}
              disabled={isAttaching}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              {isAttaching ? 'Attaching...' : `Attach Selected (${selectedCategories.size})`}
            </Button>
          )}
        </div>
      </div>

      {categories.map((category) => (
        <Card key={category.id} className="overflow-hidden">
          <CardContent className="p-0">
            {/* Category Level with Selection */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {windowCoveringId && (
                    <Checkbox
                      checked={selectedCategories.has(category.id)}
                      onCheckedChange={(checked) => handleCategorySelection(category.id, checked as boolean)}
                    />
                  )}
                  <button
                    onClick={() => toggleExpanded(category.id, 'category')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedCategories.has(category.id) ? '▼' : '▶'}
                  </button>
                  {category.image_url && (
                    <img 
                      src={category.image_url} 
                      alt={category.name}
                      className="w-8 h-8 object-cover rounded border"
                    />
                  )}
                  <div>
                    <h5 className="font-semibold text-brand-primary">{category.name}</h5>
                    {category.description && (
                      <p className="text-sm text-gray-600">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {category.is_required && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {category.subcategories?.length || 0} subcategories
                  </Badge>
                </div>
              </div>
            </div>

            {/* Expanded Category Content */}
            {expandedCategories.has(category.id) && category.subcategories && (
              <OptionCategoryCard
                category={category}
                formatCurrency={formatCurrency}
                getPricingLabel={getPricingLabel}
                isExpanded={true}
                onToggleExpanded={() => {}}
                expandedSubcategories={expandedSubcategories}
                onToggleSubcategory={(id) => toggleExpanded(id, 'subcategory')}
                expandedSubSubcategories={expandedSubSubcategories}
                onToggleSubSubcategory={(id) => toggleExpanded(id, 'subsubcategory')}
              />
            )}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-brand-neutral mb-4">
            {windowCoveringId 
              ? "Select the option categories you want to attach to this window covering, then click 'Attach Selected'."
              : "This hierarchical structure will be available for selection when customers configure their window coverings."
            }
          </p>
          <p className="text-xs text-gray-500">
            Note: Once attached, these categories will appear in the pricing forms and calculator for this window covering.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
