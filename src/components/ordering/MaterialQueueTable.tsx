import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Edit, Lock } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { MaterialQueueRow } from "./MaterialQueueRow";
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
    <div className="space-y-4">
      {/* Mobile View - Cards */}
      <div className="lg:hidden space-y-3">
        {items.map((item) => (
          <MaterialQueueRow
            key={item.id}
            item={item}
            isSelected={selectedItems.includes(item.id)}
            onSelect={(checked) => handleSelectItem(item.id, !!checked)}
            canViewCosts={canViewCosts}
          />
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden lg:block border rounded-md overflow-x-auto">
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
              <MaterialQueueRow
                key={item.id}
                item={item}
                isSelected={selectedItems.includes(item.id)}
                onSelect={(checked) => handleSelectItem(item.id, !!checked)}
                canViewCosts={canViewCosts}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
