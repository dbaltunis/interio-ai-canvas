import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useOptionCategories } from "@/hooks/useOptionCategories";
import { useDeleteOptionCategory } from "@/hooks/useOptionCategories";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { OptionCategoryForm } from "./option-categories/OptionCategoryForm";
import { RollerBlindOptionsSeeder } from "./RollerBlindOptionsSeeder";

export const OptionCategoriesManager = () => {
  const { data: optionCategories, isLoading } = useOptionCategories();
  const deleteOptionCategory = useDeleteOptionCategory();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      try {
        await deleteOptionCategory.mutateAsync(categoryId);
      } catch (error) {
        toast.error("Failed to delete option category");
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading option categories...</div>;
  }

  return (
    <div className="space-y-6">
      <RollerBlindOptionsSeeder />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Option Categories</CardTitle>
              <CardDescription>
                Create and manage dynamic option categories for linings, hardware, and other window covering options
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                console.log("Create Category button clicked");
                setIsFormOpen(true);
              }}
              className="pointer-events-auto z-50"
              type="button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!optionCategories || optionCategories.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">No option categories created yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first option category to define dynamic options like lining types, hardware selections, or fabric categories
              </p>
              <Button
                onClick={() => {
                  console.log("Create Your First Category button clicked");
                  setIsFormOpen(true);
                }}
                className="pointer-events-auto z-50"
                type="button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Category
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {optionCategories.map((category) => (
                <Card key={category.id} className="border border-border/50">
                  <Collapsible 
                    open={expandedCategories.has(category.id)}
                    onOpenChange={() => toggleCategory(category.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {expandedCategories.has(category.id) ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                            <div>
                              <CardTitle className="text-lg">{category.name}</CardTitle>
                              <CardDescription>{category.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {category.subcategories?.length || 0} subcategories
                            </Badge>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(category.id, category.name);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="pl-7 space-y-3">
                          {category.subcategories?.map((subcategory) => (
                            <div key={subcategory.id} className="border rounded p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{subcategory.name}</h4>
                                <Badge variant="secondary">
                                  ${subcategory.base_price} {subcategory.pricing_method}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {subcategory.description}
                              </p>
                              {subcategory.sub_subcategories && subcategory.sub_subcategories.length > 0 && (
                                <div className="mt-2 ml-4 space-y-1">
                                  {subcategory.sub_subcategories.map((subSub) => (
                                    <div key={subSub.id} className="text-sm flex items-center justify-between">
                                      <span>{subSub.name}</span>
                                      <span className="text-muted-foreground">
                                        ${subSub.base_price}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          {(!category.subcategories || category.subcategories.length === 0) && (
                            <p className="text-sm text-muted-foreground italic">
                              No subcategories defined yet
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <OptionCategoryForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
      />
    </div>
  );
};