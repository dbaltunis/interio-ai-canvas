
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChevronDown, ChevronRight, Plus, Trash2, Edit } from "lucide-react";
import { type OptionCategory, type OptionSubcategory, type OptionSubSubcategory, type OptionExtra } from "@/hooks/types/windowCoveringTypes";
import { SubcategoryForm } from "./SubcategoryForm";
import { SubSubcategoryForm } from "./SubSubcategoryForm";
import { ExtraForm } from "./ExtraForm";

interface CategoryListProps {
  categories: OptionCategory[];
  onDeleteCategory: (id: string) => void;
  onDeleteSubcategory: (id: string, categoryId: string) => void;
  onDeleteSubSubcategory?: (id: string, subcategoryId: string) => void;
  onDeleteExtra?: (id: string, subSubcategoryId: string) => void;
  onCreateSubcategory: (subcategory: any) => void;
  onCreateSubSubcategory?: (subSubcategory: any) => void;
  onCreateExtra?: (extra: any) => void;
  onUpdateCategory: (id: string, updates: any) => void;
  onUpdateSubcategory: (id: string, updates: any) => void;
  onUpdateSubSubcategory?: (id: string, updates: any) => void;
  onUpdateExtra?: (id: string, updates: any) => void;
}

export const CategoryList = ({ 
  categories, 
  onDeleteCategory,
  onDeleteSubcategory,
  onDeleteSubSubcategory,
  onDeleteExtra,
  onCreateSubcategory,
  onCreateSubSubcategory,
  onCreateExtra,
  onUpdateCategory,
  onUpdateSubcategory,
  onUpdateSubSubcategory,
  onUpdateExtra
}: CategoryListProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [expandedSubSubcategories, setExpandedSubSubcategories] = useState<Set<string>>(new Set());
  const [creatingSubcategory, setCreatingSubcategory] = useState<string | null>(null);
  const [creatingSubSubcategory, setCreatingSubSubcategory] = useState<string | null>(null);
  const [creatingExtra, setCreatingExtra] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategory = (subcategoryId: string) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(subcategoryId)) {
      newExpanded.delete(subcategoryId);
    } else {
      newExpanded.add(subcategoryId);
    }
    setExpandedSubcategories(newExpanded);
  };

  const toggleSubSubcategory = (subSubcategoryId: string) => {
    const newExpanded = new Set(expandedSubSubcategories);
    if (newExpanded.has(subSubcategoryId)) {
      newExpanded.delete(subSubcategoryId);
    } else {
      newExpanded.add(subSubcategoryId);
    }
    setExpandedSubSubcategories(newExpanded);
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No categories found. Create your first category to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.id} className="border-l-4 border-l-brand-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {category.image_url && (
                  <img 
                    src={category.image_url} 
                    alt={category.name}
                    className="w-8 h-8 object-cover rounded border"
                  />
                )}
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {category.is_required && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreatingSubcategory(category.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Subcategory
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Category</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{category.name}"? This will also delete all subcategories, options, and extras within this category. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDeleteCategory(category.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>

          {expandedCategories.has(category.id) && (
            <CardContent className="pt-0">
              {/* Add Subcategory Form */}
              {creatingSubcategory === category.id && (
                <div className="mb-4">
                  <SubcategoryForm
                    categoryId={category.id}
                    onSave={async (subcategoryData) => {
                      await onCreateSubcategory(subcategoryData);
                      setCreatingSubcategory(null);
                    }}
                    onCancel={() => setCreatingSubcategory(null)}
                    isEditing={false}
                  />
                </div>
              )}

              {/* Subcategories */}
              <div className="space-y-3">
                {category.subcategories?.map((subcategory) => (
                  <div key={subcategory.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleSubcategory(subcategory.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {expandedSubcategories.has(subcategory.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        {subcategory.image_url && (
                          <img 
                            src={subcategory.image_url} 
                            alt={subcategory.name}
                            className="w-6 h-6 object-cover rounded border"
                          />
                        )}
                        <div>
                          <h4 className="font-medium">{subcategory.name}</h4>
                          {subcategory.description && (
                            <p className="text-sm text-gray-600">{subcategory.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          ${subcategory.base_price} {subcategory.pricing_method}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCreatingSubSubcategory(subcategory.id);
                            if (!expandedSubcategories.has(subcategory.id)) {
                              toggleSubcategory(subcategory.id);
                            }
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Option
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{subcategory.name}"? This will also delete all options and extras within this subcategory. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => onDeleteSubcategory(subcategory.id, category.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {expandedSubcategories.has(subcategory.id) && (
                      <div className="mt-4 ml-6">
                        {/* Add Sub-Subcategory Form */}
                        {creatingSubSubcategory === subcategory.id && onCreateSubSubcategory && (
                          <div className="mb-4">
                            <SubSubcategoryForm
                              subcategoryId={subcategory.id}
                              onSave={async (subSubcategoryData) => {
                                await onCreateSubSubcategory(subSubcategoryData);
                                setCreatingSubSubcategory(null);
                              }}
                              onCancel={() => setCreatingSubSubcategory(null)}
                              isEditing={false}
                            />
                          </div>
                        )}

                        {/* Sub-Subcategories */}
                        <div className="space-y-3">
                          {subcategory.sub_subcategories?.map((subSubcategory) => (
                            <div key={subSubcategory.id} className="border rounded-lg p-3 bg-white">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => toggleSubSubcategory(subSubcategory.id)}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    {expandedSubSubcategories.has(subSubcategory.id) ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                  </button>
                                  {subSubcategory.image_url && (
                                    <img 
                                      src={subSubcategory.image_url} 
                                      alt={subSubcategory.name}
                                      className="w-5 h-5 object-cover rounded border"
                                    />
                                  )}
                                  <div>
                                    <h5 className="font-medium text-sm">{subSubcategory.name}</h5>
                                    {subSubcategory.description && (
                                      <p className="text-xs text-gray-600">{subSubcategory.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    ${subSubcategory.base_price} {subSubcategory.pricing_method}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setCreatingExtra(subSubcategory.id);
                                      if (!expandedSubSubcategories.has(subSubcategory.id)) {
                                        toggleSubSubcategory(subSubcategory.id);
                                      }
                                    }}
                                  >
                                    <Plus className="h-2 w-2 mr-1" />
                                    Add Extra
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                      >
                                        <Trash2 className="h-2 w-2" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Option</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{subSubcategory.name}"? This will also delete all extras within this option. This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => onDeleteSubSubcategory?.(subSubcategory.id, subcategory.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>

                              {expandedSubSubcategories.has(subSubcategory.id) && (
                                <div className="mt-3 ml-4">
                                  {/* Add Extra Form */}
                                  {creatingExtra === subSubcategory.id && onCreateExtra && (
                                    <div className="mb-3">
                                      <ExtraForm
                                        subSubcategoryId={subSubcategory.id}
                                        onSave={async (extraData) => {
                                          await onCreateExtra(extraData);
                                          setCreatingExtra(null);
                                        }}
                                        onCancel={() => setCreatingExtra(null)}
                                        isEditing={false}
                                      />
                                    </div>
                                  )}

                                  {/* Extras */}
                                  <div className="space-y-2">
                                    {subSubcategory.extras?.map((extra) => (
                                      <div key={extra.id} className="flex items-center justify-between p-2 border rounded bg-gray-50">
                                        <div className="flex items-center space-x-2">
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
                                        <div className="flex items-center space-x-2">
                                          <Badge variant="outline" className="text-xs">
                                            ${extra.base_price} {extra.pricing_method}
                                          </Badge>
                                          {extra.is_required && (
                                            <Badge variant="destructive" className="text-xs">Required</Badge>
                                          )}
                                          {extra.is_default && (
                                            <Badge variant="default" className="text-xs">Default</Badge>
                                          )}
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button
                                                variant="destructive"
                                                size="sm"
                                              >
                                                <Trash2 className="h-2 w-2" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Extra</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  Are you sure you want to delete "{extra.name}"? This action cannot be undone.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction 
                                                  onClick={() => onDeleteExtra?.(extra.id, subSubcategory.id)}
                                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                  Delete
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
