import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Trash2, Edit, ChevronDown, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteMaterialQueueItem } from "@/hooks/useMaterialQueue";
import { cn } from "@/lib/utils";

interface MaterialQueueRowProps {
  item: any;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  canViewCosts: boolean;
}

const priorityColors = {
  urgent: "destructive",
  high: "default",
  normal: "secondary",
  low: "outline",
} as const;

const priorityLabels = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
};

const statusColors = {
  pending: "default",
  in_batch: "secondary",
  ordered: "default",
  received: "default",
  cancelled: "destructive",
} as const;

const statusLabels = {
  pending: "Pending",
  in_batch: "In Batch",
  ordered: "Ordered",
  received: "Received",
  cancelled: "Cancelled",
};

export const MaterialQueueRow = ({ item, isSelected, onSelect, canViewCosts }: MaterialQueueRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const deleteMaterial = useDeleteMaterialQueueItem();

  return (
    <>
      {/* Mobile Card View */}
      <div className="block lg:hidden border rounded-lg p-4 space-y-3 bg-card">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1"
            />
            <div className="flex-1 min-w-0 space-y-1">
              <div className="font-medium truncate">{item.material_name}</div>
              {item.metadata?.treatment_name && (
                <div className="text-xs text-muted-foreground truncate">{item.metadata.treatment_name}</div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={statusColors[item.status as keyof typeof statusColors] || "secondary"} className="text-xs">
                  {statusLabels[item.status as keyof typeof statusLabels] || item.status}
                </Badge>
                <Badge variant={priorityColors[item.priority as keyof typeof priorityColors] || "secondary"} className="text-xs">
                  {priorityLabels[item.priority as keyof typeof priorityLabels] || item.priority}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => deleteMaterial.mutate(item.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="space-y-2 pt-3 border-t text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Job #:</span>
                <div className="font-mono text-xs">{item.projects?.job_number || '—'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Client:</span>
                <div className="truncate">{item.clients?.name || '—'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Quantity:</span>
                <div>{item.quantity} {item.unit}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Supplier:</span>
                <div className="truncate">{item.vendors?.name || 'Unassigned'}</div>
              </div>
              {canViewCosts && (
                <>
                  <div>
                    <span className="text-muted-foreground">Unit Cost:</span>
                    <div>${item.unit_cost?.toFixed(2) || '0.00'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <div className="font-medium">${item.total_cost?.toFixed(2) || '0.00'}</div>
                  </div>
                </>
              )}
            </div>
            {item.projects?.name && (
              <div>
                <span className="text-muted-foreground">Job Name:</span>
                <div className="text-xs">{item.projects.name}</div>
              </div>
            )}
            {item.metadata?.current_stock > 0 && (
              <div className="text-xs text-muted-foreground">
                {item.metadata.current_stock} in stock
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Table Row */}
      <tr className="hidden lg:table-row">
        <td className="p-4">
          <Checkbox checked={isSelected} onCheckedChange={onSelect} />
        </td>
        <td className="p-4 font-mono text-sm whitespace-nowrap">
          {item.projects?.job_number || '—'}
        </td>
        <td className="p-4 font-medium">
          <div className="max-w-[200px] truncate">
            {item.projects?.name || item.quotes?.project_name || '—'}
          </div>
        </td>
        <td className="p-4">
          <div className="max-w-[150px] truncate">
            {item.clients?.name || '—'}
          </div>
        </td>
        <td className="p-4 font-medium">
          <div className="max-w-[200px]">
            <div className="truncate">{item.material_name}</div>
            {item.metadata?.treatment_name && (
              <div className="text-xs text-muted-foreground truncate">{item.metadata.treatment_name}</div>
            )}
          </div>
        </td>
        <td className="p-4 text-right">
          <div className="whitespace-nowrap">
            {item.quantity} {item.unit}
          </div>
          {item.metadata?.current_stock > 0 && (
            <div className="text-xs text-muted-foreground">
              ({item.metadata.current_stock} in stock)
            </div>
          )}
        </td>
        {canViewCosts && (
          <td className="p-4 text-right text-muted-foreground whitespace-nowrap">
            ${item.unit_cost?.toFixed(2) || '0.00'}
          </td>
        )}
        {canViewCosts && (
          <td className="p-4 text-right font-medium whitespace-nowrap">
            ${item.total_cost?.toFixed(2) || '0.00'}
          </td>
        )}
        <td className="p-4">
          <div className="max-w-[150px] truncate">
            {item.vendors?.name || <span className="text-muted-foreground">Unassigned</span>}
          </div>
        </td>
        <td className="p-4">
          <Badge variant={statusColors[item.status as keyof typeof statusColors] || "secondary"}>
            {statusLabels[item.status as keyof typeof statusLabels] || item.status}
          </Badge>
        </td>
        <td className="p-4">
          <Badge variant={priorityColors[item.priority as keyof typeof priorityColors] || "secondary"}>
            {priorityLabels[item.priority as keyof typeof priorityLabels] || item.priority}
          </Badge>
        </td>
        <td className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => deleteMaterial.mutate(item.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
    </>
  );
};
