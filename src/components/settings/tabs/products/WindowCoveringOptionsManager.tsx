
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWindowCoveringCategories } from "@/hooks/useWindowCoveringCategories";
import type { WindowCovering } from "@/hooks/useWindowCoverings";
import type { OptionCategory, OptionSubcategory, OptionSubSubcategory, OptionExtra } from "@/hooks/types/windowCoveringTypes";

interface WindowCoveringOptionsManagerProps {
  windowCovering: WindowCovering;
  onBack: () => void;
}

export const WindowCoveringOptionsManager = ({ windowCovering, onBack }: WindowCoveringOptionsManagerProps) => {
  const { categories, isLoading } = useWindowCoveringCategories();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [expandedSubSubcategories, setExpandedSubSubcategories] = useState<Set<string>>(new Set());

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

  if (isLoading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Window Coverings
        </Button>
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">
            Manage Options: {windowCovering.name}
          </h3>
          <p className="text-sm text-brand-neutral">
            Configure hierarchical options for this window covering
          </p>
        </div>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Option Categories Found</CardTitle>
            <CardDescription>
              You need to create option categories first before you can assign them to window coverings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-brand-neutral mb-4">
              Go to Settings → Products → Window Coverings → Option Categories to create your first category.
            </p>
            <Button 
              onClick={onBack}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              Go to Category Management
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium">Available Option Categories</h4>
            <Badge variant="outline">{categories.length} categories</Badge>
          </div>

          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Category Level */}
                <div 
                  className="p-4 border-b bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleExpanded(category.id, 'category')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
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

                {/* Subcategories */}
                {expandedCategories.has(category.id) && category.subcategories && (
                  <div className="ml-4">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id}>
                        <div 
                          className="p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleExpanded(subcategory.id, 'subcategory')}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {expandedSubcategories.has(subcategory.id) ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              )}
                              {subcategory.image_url && (
                                <img 
                                  src={subcategory.image_url} 
                                  alt={subcategory.name}
                                  className="w-6 h-6 object-cover rounded border"
                                />
                              )}
                              <div>
                                <h6 className="font-medium">{subcategory.name}</h6>
                                {subcategory.description && (
                                  <p className="text-xs text-gray-600">{subcategory.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {formatCurrency(subcategory.base_price)} {getPricingLabel(subcategory.pricing_method)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {subcategory.sub_subcategories?.length || 0} options
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Sub-subcategories */}
                        {expandedSubcategories.has(subcategory.id) && subcategory.sub_subcategories && (
                          <div className="ml-6 bg-gray-25">
                            {subcategory.sub_subcategories.map((subSubcategory) => (
                              <div key={subSubcategory.id}>
                                <div 
                                  className="p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                                  onClick={() => toggleExpanded(subSubcategory.id, 'subsubcategory')}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {expandedSubSubcategories.has(subSubcategory.id) ? (
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-500" />
                                      )}
                                      {subSubcategory.image_url && (
                                        <img 
                                          src={subSubcategory.image_url} 
                                          alt={subSubcategory.name}
                                          className="w-5 h-5 object-cover rounded border"
                                        />
                                      )}
                                      <div>
                                        <span className="font-medium text-sm">{subSubcategory.name}</span>
                                        {subSubcategory.description && (
                                          <p className="text-xs text-gray-600">{subSubcategory.description}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {formatCurrency(subSubcategory.base_price)} {getPricingLabel(subSubcategory.pricing_method)}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {subSubcategory.extras?.length || 0} extras
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                {/* Extras */}
                                {expandedSubSubcategories.has(subSubcategory.id) && subSubcategory.extras && (
                                  <div className="ml-8 bg-blue-25">
                                    {subSubcategory.extras.map((extra) => (
                                      <div key={extra.id} className="p-2 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            {extra.image_url && (
                                              <img 
                                                src={extra.image_url} 
                                                alt={extra.name}
                                                className="w-4 h-4 object-cover rounded border"
                                              />
                                            )}
                                            <div>
                                              <span className="text-sm font-medium">{extra.name}</span>
                                              {extra.description && (
                                                <p className="text-xs text-gray-600">{extra.description}</p>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex gap-1">
                                            <Badge variant="secondary" className="text-xs">
                                              {formatCurrency(extra.base_price)} {getPricingLabel(extra.pricing_method)}
                                            </Badge>
                                            {extra.is_required && (
                                              <Badge variant="destructive" className="text-xs">Required</Badge>
                                            )}
                                            {extra.is_default && (
                                              <Badge variant="default" className="text-xs">Default</Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-brand-neutral mb-4">
                This hierarchical structure will be available for selection when customers configure their {windowCovering.name}.
              </p>
              <p className="text-xs text-gray-500">
                Note: The pricing logic for this hierarchical system will be implemented in the calculator and job creation flow.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
