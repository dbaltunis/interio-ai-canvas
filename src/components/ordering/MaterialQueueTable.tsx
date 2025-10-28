import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Edit, Lock } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteMaterialQueueItem } from "@/hooks/useMaterialQueue";
import { format } from "date-fns";

interface MaterialQueueTableProps {
  items: any[];
  isLoading: boolean;
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
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

export const MaterialQueueTable = ({ items, isLoading, selectedItems, onSelectionChange }: MaterialQueueTableProps) => {
  const deleteMaterial = useDeleteMaterialQueueItem();
  const { data: userRole } = useUserRole();
  const canViewCosts = userRole?.canViewVendorCosts ?? false;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(items.map(item => item.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, itemId]);
    } else {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading materials...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No materials in queue</p>
        <p className="text-sm mt-2">Materials from jobs will appear here when they need to be ordered</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedItems.length === items.length}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Job #</TableHead>
            <TableHead>Job Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Material</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            {canViewCosts && <TableHead className="text-right">Unit Cost</TableHead>}
            {canViewCosts && <TableHead className="text-right">Total Cost</TableHead>}
            <TableHead>Supplier</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                />
              </TableCell>
              <TableCell className="font-mono text-sm">
                {item.projects?.job_number || '—'}
              </TableCell>
              <TableCell className="font-medium">
                <div className="max-w-[200px] truncate">
                  {item.projects?.name || item.quotes?.project_name || '—'}
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-[150px] truncate">
                  {item.clients?.name || '—'}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                <div className="max-w-[200px]">
                  <div className="truncate">{item.material_name}</div>
                  {item.metadata?.treatment_name && (
                    <div className="text-xs text-muted-foreground truncate">{item.metadata.treatment_name}</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="whitespace-nowrap">
                  {item.quantity} {item.unit}
                </div>
                {item.metadata?.current_stock > 0 && (
                  <div className="text-xs text-muted-foreground">
                    ({item.metadata.current_stock} in stock)
                  </div>
                )}
              </TableCell>
              {canViewCosts && (
                <TableCell className="text-right text-muted-foreground">
                  ${item.unit_cost?.toFixed(2) || '0.00'}
                </TableCell>
              )}
              {canViewCosts && (
                <TableCell className="text-right font-medium">
                  ${item.total_cost?.toFixed(2) || '0.00'}
                </TableCell>
              )}
              <TableCell>
                <div className="max-w-[150px] truncate">
                  {item.vendors?.name || <span className="text-muted-foreground">Unassigned</span>}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={statusColors[item.status as keyof typeof statusColors] || "secondary"}>
                  {statusLabels[item.status as keyof typeof statusLabels] || item.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={priorityColors[item.priority as keyof typeof priorityColors] || "secondary"}>
                  {priorityLabels[item.priority as keyof typeof priorityLabels] || item.priority}
                </Badge>
              </TableCell>
              <TableCell>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
