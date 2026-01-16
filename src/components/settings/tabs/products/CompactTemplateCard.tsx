import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash2, 
  Store, 
  ChevronDown,
  Layers,
  AlignJustify,
  LayoutList,
  List,
  Grid3X3,
  PanelLeft,
  Blinds,
  SunMedium
} from "lucide-react";
import { CurtainTemplate } from "@/hooks/useCurtainTemplates";
import { EnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { getDisplayName } from "@/types/treatmentCategories";
import { cn } from "@/lib/utils";

interface CompactTemplateCardProps {
  template: CurtainTemplate;
  isSelected: boolean;
  isHighlighted: boolean;
  canManage: boolean;
  headingStyles: EnhancedInventoryItem[];
  onSelect: (id: string) => void;
  onEdit: (template: CurtainTemplate) => void;
  onDuplicate: (template: CurtainTemplate) => void;
  onDelete: (id: string) => void;
  onToggleStoreVisibility: (id: string, current: boolean) => void;
  isDeleting?: boolean;
  isDuplicating?: boolean;
}

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'curtains':
      return Layers;
    case 'roller_blinds':
      return AlignJustify;
    case 'roman_blinds':
      return LayoutList;
    case 'venetian_blinds':
    case 'vertical_blinds':
      return List;
    case 'shutters':
    case 'plantation_shutters':
      return Grid3X3;
    case 'panel_glide':
      return PanelLeft;
    case 'cellular_shades':
      return Blinds;
    case 'awning':
      return SunMedium;
    default:
      return Layers;
  }
};

export const CompactTemplateCard = ({
  template,
  isSelected,
  isHighlighted,
  canManage,
  headingStyles,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleStoreVisibility,
  isDeleting = false,
  isDuplicating = false,
}: CompactTemplateCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Build tags with priority
  const buildTags = () => {
    const tags: { label: string; priority: number; variant?: 'secondary' | 'outline' }[] = [];
    
    // Category (highest priority)
    tags.push({ 
      label: getDisplayName(template.treatment_category || 'curtains'), 
      priority: 1, 
      variant: 'secondary' 
    });
    
    // Panel config
    if ((template as any).panel_configuration) {
      tags.push({ 
        label: (template as any).panel_configuration, 
        priority: 2, 
        variant: 'outline' 
      });
    }
    
    // Manufacturing type
    if (template.manufacturing_type) {
      tags.push({ 
        label: template.manufacturing_type, 
        priority: 3, 
        variant: 'outline' 
      });
    }
    
    // Pricing type
    tags.push({ 
      label: template.pricing_type.replace(/_/g, ' '), 
      priority: 4, 
      variant: 'outline' 
    });
    
    // Heading styles
    if (template.selected_heading_ids && template.selected_heading_ids.length > 0) {
      template.selected_heading_ids.forEach((headingId, idx) => {
        const heading = headingStyles.find(h => h.id === headingId);
        if (heading) {
          tags.push({ 
            label: heading.name, 
            priority: 5 + idx, 
            variant: 'outline' 
          });
        }
      });
    } else if (template.heading_name) {
      tags.push({ 
        label: template.heading_name, 
        priority: 5, 
        variant: 'outline' 
      });
    }
    
    // Additional curtain tags
    if (template.treatment_category === 'curtains') {
      if (template.is_railroadable) {
        tags.push({ label: 'Railroadable', priority: 10, variant: 'outline' });
      }
    }
    
    return tags.sort((a, b) => a.priority - b.priority);
  };

  const allTags = buildTags();
  const visibleTags = allTags.slice(0, 4);
  const overflowTags = allTags.slice(4);

  const CategoryIcon = getCategoryIcon(template.treatment_category);
  const isStoreVisible = template.is_store_visible ?? true;

  return (
    <>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div
          className={cn(
            "group relative flex items-center gap-3 p-3 rounded-lg border bg-card transition-all duration-200",
            "hover:shadow-md hover:border-primary/20",
            isHighlighted && "ring-2 ring-primary ring-offset-2 animate-pulse",
            isSelected && "bg-primary/5 border-primary/30"
          )}
        >
          {/* Checkbox */}
          {canManage && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(template.id)}
              className="shrink-0"
            />
          )}

          {/* Image/Icon Thumbnail */}
          <div className="shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted flex items-center justify-center border">
            {template.image_url ? (
              <img
                src={template.image_url}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <CategoryIcon className="w-6 h-6 text-muted-foreground" />
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-semibold text-sm truncate">{template.name}</h4>
                {template.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {template.description}
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {visibleTags.map((tag, idx) => (
                <Badge 
                  key={idx} 
                  variant={tag.variant} 
                  className="text-xs py-0 px-1.5 font-normal"
                >
                  {tag.label}
                </Badge>
              ))}
              
              {overflowTags.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className="text-xs py-0 px-1.5 cursor-pointer hover:bg-muted"
                      >
                        +{overflowTags.length} more
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {overflowTags.map((tag, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className="text-xs py-0 px-1.5"
                          >
                            {tag.label}
                          </Badge>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {/* Store Visibility Icon */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "shrink-0 h-8 w-8",
                    isStoreVisible ? "text-green-600 hover:text-green-700" : "text-muted-foreground"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canManage) {
                      onToggleStoreVisibility(template.id, isStoreVisible);
                    }
                  }}
                  disabled={!canManage}
                >
                  <Store className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isStoreVisible ? "Visible in online store" : "Hidden from store"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Expand/Collapse Button */}
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0 h-8 w-8"
            >
              <ChevronDown 
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )} 
              />
            </Button>
          </CollapsibleTrigger>

          {/* Action Menu */}
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="shrink-0 h-8 w-8"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(template)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDuplicate(template)}
                  disabled={isDuplicating}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Expanded Details */}
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="mt-1 ml-[calc(1rem+16px+0.75rem)] mr-3 p-3 rounded-md bg-muted/40 border text-sm space-y-3">
            {/* All Headings */}
            {template.selected_heading_ids && template.selected_heading_ids.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Headings
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {template.selected_heading_ids.map((headingId) => {
                    const heading = headingStyles.find(h => h.id === headingId);
                    return heading ? (
                      <Badge key={headingId} variant="secondary" className="text-xs">
                        {heading.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Manufacturing Details (Curtains) */}
            {template.treatment_category === 'curtains' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">Returns</span>
                  <p className="text-xs font-medium">L:{template.return_left}cm R:{template.return_right}cm</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Overlap</span>
                  <p className="text-xs font-medium">{template.overlap}cm</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Header</span>
                  <p className="text-xs font-medium">{template.header_allowance}cm</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Waste</span>
                  <p className="text-xs font-medium">{template.waste_percent}%</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Fullness</span>
                  <p className="text-xs font-medium">{template.fullness_ratio}×</p>
                </div>
                {template.is_railroadable && (
                  <div>
                    <span className="text-xs text-muted-foreground">Railroadable</span>
                    <p className="text-xs font-medium">Yes</p>
                  </div>
                )}
              </div>
            )}

            {/* Blind-specific details */}
            {template.treatment_category !== 'curtains' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                {(template as any).bracket_deduction && (
                  <div>
                    <span className="text-xs text-muted-foreground">Bracket Deduction</span>
                    <p className="text-xs font-medium">{(template as any).bracket_deduction}cm</p>
                  </div>
                )}
                {(template as any).stack_allowance && (
                  <div>
                    <span className="text-xs text-muted-foreground">Stack Allowance</span>
                    <p className="text-xs font-medium">{(template as any).stack_allowance}cm</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{template.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDelete(template.id);
                setShowDeleteDialog(false);
              }}
              disabled={isDeleting}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
