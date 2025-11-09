import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

interface ProductFiltersProps {
  categories: string[];
  colors: string[];
  priceRange: [number, number];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  selectedCategories: string[];
  selectedColors: string[];
  priceRange: [number, number];
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'newest';
}

export const ProductFilters = ({
  categories,
  colors,
  priceRange,
  onFilterChange,
}: ProductFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    selectedCategories: [],
    selectedColors: [],
    priceRange: priceRange,
    sortBy: 'name',
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    const cleared: FilterState = {
      selectedCategories: [],
      selectedColors: [],
      priceRange: priceRange,
      sortBy: 'name',
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = 
    filters.selectedCategories.length > 0 ||
    filters.selectedColors.length > 0 ||
    filters.priceRange[0] !== priceRange[0] ||
    filters.priceRange[1] !== priceRange[1];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Filters</CardTitle>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 gap-1"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Product Type</Label>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.selectedCategories.includes(category)}
                    onCheckedChange={(checked) => {
                      const newCategories = checked
                        ? [...filters.selectedCategories, category]
                        : filters.selectedCategories.filter((c) => c !== category);
                      updateFilters({ selectedCategories: newCategories });
                    }}
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Colors */}
        {colors.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Color</Label>
            <div className="space-y-2">
              {colors.map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color}`}
                    checked={filters.selectedColors.includes(color)}
                    onCheckedChange={(checked) => {
                      const newColors = checked
                        ? [...filters.selectedColors, color]
                        : filters.selectedColors.filter((c) => c !== color);
                      updateFilters({ selectedColors: newColors });
                    }}
                  />
                  <label
                    htmlFor={`color-${color}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize"
                  >
                    {color}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Price Range</Label>
          <div className="space-y-4 pt-2">
            <Slider
              min={priceRange[0]}
              max={priceRange[1]}
              step={10}
              value={filters.priceRange}
              onValueChange={(value) => 
                updateFilters({ priceRange: value as [number, number] })
              }
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Sort By */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Sort By</Label>
          <div className="space-y-2">
            {[
              { value: 'name', label: 'Name (A-Z)' },
              { value: 'price-asc', label: 'Price: Low to High' },
              { value: 'price-desc', label: 'Price: High to Low' },
              { value: 'newest', label: 'Newest First' },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`sort-${option.value}`}
                  checked={filters.sortBy === option.value}
                  onCheckedChange={() => 
                    updateFilters({ sortBy: option.value as FilterState['sortBy'] })
                  }
                />
                <label
                  htmlFor={`sort-${option.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
