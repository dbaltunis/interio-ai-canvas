import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Edit, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, Package } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { OptionValue, TreatmentOption } from "@/hooks/useTreatmentOptions";
import { InventoryStockBadge } from "./InventoryStockBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getPricingMethodSuffix } from "@/utils/pricingMethodLabels";

interface SortableOptionItemProps {
  value: OptionValue;
  relevantOptions: TreatmentOption[];
  onEdit: (value: OptionValue) => void;
  onDelete: (value: OptionValue) => void;
  onToggleVisibility: (value: OptionValue) => void;
  expandedOptions: Set<string>;
  setExpandedOptions: (expanded: Set<string>) => void;
  inventoryItems: any[];
}

export const SortableOptionItem = ({
  value,
  relevantOptions,
  onEdit,
  onDelete,
  onToggleVisibility,
  expandedOptions,
  setExpandedOptions,
  inventoryItems
}: SortableOptionItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: value.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasSubOptions = value.extra_data?.sub_options?.length > 0;
  const isExpanded = expandedOptions.has(value.id);

  return (
    <div ref={setNodeRef} style={style} className={`border rounded-lg ${value.hidden_by_user ? 'opacity-60 bg-muted/30' : ''}`}>
      <div className="flex items-center justify-between p-3 hover:bg-muted/50">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mr-2 touch-none"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {hasSubOptions && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  const newExpanded = new Set(expandedOptions);
                  if (isExpanded) {
                    newExpanded.delete(value.id);
                  } else {
                    newExpanded.add(value.id);
                  }
                  setExpandedOptions(newExpanded);
                }}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
            <div className="font-medium uppercase">{value.label}</div>
            
            {/* Visibility Indicator */}
            {value.hidden_by_user ? (
              <Badge variant="outline" className="flex items-center gap-1 text-xs bg-muted text-muted-foreground">
                <EyeOff className="h-3 w-3" />
                Hidden
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1 text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                <Eye className="h-3 w-3" />
                Visible
              </Badge>
            )}
            
            {/* Pricing Method Badge - Always show if exists */}
            {value.extra_data?.pricing_method && value.extra_data.pricing_method !== 'fixed' && (
              <Badge variant="outline" className="text-xs">
                {value.extra_data.pricing_method === 'per-unit' ? 'Per Unit' :
                 value.extra_data.pricing_method === 'per-meter' ? 'Per Meter' :
                 value.extra_data.pricing_method === 'per-sqm' ? 'Per m²' :
                 value.extra_data.pricing_method === 'per-panel' ? 'Per Panel' :
                 value.extra_data.pricing_method === 'per-drop' ? 'Per Drop' :
                 value.extra_data.pricing_method === 'percentage' ? 'Percentage' :
                 value.extra_data.pricing_method === 'pricing-grid' ? 'Price Table' :
                 value.extra_data.pricing_method}
              </Badge>
            )}
            
            {/* Price Badge - Show separately */}
            {value.extra_data?.pricing_method === 'pricing-grid' ? (
              <Badge variant="secondary" className="text-xs">
                Price Table
              </Badge>
            ) : value.extra_data?.price && value.extra_data.price > 0 ? (
              <Badge variant="secondary" className="text-xs">
                {value.extra_data?.pricing_method === 'percentage' 
                  ? `${value.extra_data.price}%`
                  : `+$${value.extra_data.price.toFixed(2)}`}
              </Badge>
            ) : null}
            {value.inventory_item_id && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Package className="h-3 w-3" />
                Linked
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Value: {value.code}
            {value.extra_data?.pricing_method === 'pricing-grid' 
              ? ` • ${value.extra_data.pricing_grid_data?.length || 0} price tiers`
              : value.extra_data?.price !== undefined 
                ? ` • ${value.extra_data.price === 0 ? 'Included' : 
                    value.extra_data?.pricing_method === 'percentage' 
                      ? `${value.extra_data.price}%`
                      : `+$${value.extra_data.price.toFixed(2)}`}`
                : ''}
            {hasSubOptions && ` • ${value.extra_data.sub_options.length} sub-categories`}
          </div>
        </div>
        <div className="flex items-center gap-4 ml-auto" onClick={(e) => e.stopPropagation()}>
          {value.inventory_item_id && (
            <InventoryStockBadge itemId={value.inventory_item_id} />
          )}
          <div className="flex gap-3">
            {/* Edit Button - Primary action */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                    onClick={() => onEdit(value)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Edit option details
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Toggle Visibility Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3"
                    onClick={() => onToggleVisibility(value)}
                  >
                    {value.hidden_by_user ? (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Show
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {value.hidden_by_user ? "Show in setup" : "Hide from setup"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Delete Button - Destructive action, separated */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-9 px-3"
                      onClick={() => onDelete(value)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Delete option permanently
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      {/* Sub-Options Display */}
      {isExpanded && hasSubOptions && (
        <div className="px-3 pb-3 pt-0 space-y-2 border-t bg-muted/20">
          {value.extra_data.sub_options.map((subOption: any) => (
            <div key={subOption.id} className="p-2 bg-background rounded border">
              <div className="font-medium text-sm mb-1">{subOption.label}</div>
              <div className="flex flex-wrap gap-1">
                {subOption.choices?.map((choice: any) => {
                  const suffix = getPricingMethodSuffix(choice.pricing_method);
                  return (
                    <Badge key={choice.id} variant="outline" className="text-xs">
                      {choice.label}
                      {choice.price > 0 && ` $${choice.price.toFixed(2)}${suffix}`}
                    </Badge>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
