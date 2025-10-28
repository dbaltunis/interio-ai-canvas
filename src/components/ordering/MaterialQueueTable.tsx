import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
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

export const MaterialQueueTable = ({ items, isLoading, selectedItems, onSelectionChange }: MaterialQueueTableProps) => {
  const deleteMaterial = useDeleteMaterialQueueItem();

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
            <TableHead>Material</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Job/Client</TableHead>
            <TableHead>Needed By</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Cost</TableHead>
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
              <TableCell className="font-medium">{item.material_name}</TableCell>
              <TableCell className="capitalize">{item.material_type?.replace('_', ' ')}</TableCell>
              <TableCell>
                {item.quantity} {item.unit}
              </TableCell>
              <TableCell>
                {item.vendors?.name || <span className="text-muted-foreground">Unassigned</span>}
              </TableCell>
              <TableCell>
                {item.quotes?.project_name || item.clients?.name || '—'}
              </TableCell>
              <TableCell>
                {item.needed_by_date ? format(new Date(item.needed_by_date), 'MMM dd, yyyy') : '—'}
              </TableCell>
              <TableCell>
                <Badge variant={priorityColors[item.priority as keyof typeof priorityColors] || "secondary"}>
                  {priorityLabels[item.priority as keyof typeof priorityLabels] || item.priority}
                </Badge>
              </TableCell>
              <TableCell>${item.total_cost?.toFixed(2) || '0.00'}</TableCell>
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
