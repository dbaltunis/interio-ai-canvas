import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Trash2, Edit, FileSpreadsheet, Filter, Clock, DollarSign } from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { CategoryImportExport } from "./CategoryImportExport";
import { EditInventoryDialog } from "./EditInventoryDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { JobsPagination } from "../jobs/JobsPagination";
import { useBulkInventorySelection } from "@/hooks/useBulkInventorySelection";
import { InventoryBulkActionsBar } from "./InventoryBulkActionsBar";
import { InventoryQuickView } from "./InventoryQuickView";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ServicesInventoryViewProps {
  searchQuery: string;
  viewMode: "grid" | "list";
  selectedVendor?: string;
  selectedCollection?: string;
  selectedStorageLocation?: string;
}

const SERVICE_CATEGORIES = [
  { key: "all", label: "All Services" },
  { key: "installation", label: "Installation" },
  { key: "fitting", label: "Fitting" },
  { key: "consultation", label: "Consultation" },
  { key: "measurement", label: "Measurement" },
  { key: "repair", label: "Repair" },
  { key: "delivery", label: "Delivery" },
  { key: "other_service", label: "Other Services" }
];

const ITEMS_PER_PAGE = 24;

export const ServicesInventoryView = ({ 
  searchQuery, 
  viewMode, 
  selectedVendor, 
  selectedCollection, 
  selectedStorageLocation 
}: ServicesInventoryViewProps) => {
  const { data: inventory, refetch } = useEnhancedInventory();
  const { toast } = useToast();
  const { formatCurrency } = useFormattedCurrency();
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewItem, setQuickViewItem] = useState<any>(null);
  const [showQuickView, setShowQuickView] = useState(false);

  const serviceItems = inventory?.filter(item => 
    item.category === 'service'
  ) || [];

  const {
    selectedItems,
    selectItem,
    selectAll,
    clearSelection,
    selectionStats,
  } = useBulkInventorySelection(serviceItems);

  const filteredItems = serviceItems.filter(item => {
    const matchesGlobalSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || 
      item.subcategory === activeCategory;

    const matchesVendor = !selectedVendor || item.vendor_id === selectedVendor;

    return matchesGlobalSearch && matchesCategory && matchesVendor;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    const { error } = await supabase
      .from('enhanced_inventory_items')
      .update({ active: false })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete service", variant: "destructive" });
    } else {
      toast({ title: "Service deleted successfully" });
      refetch();
    }
  };

  const handleCardClick = (item: any) => {
    setQuickViewItem(item);
    setShowQuickView(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      paginatedItems.forEach(item => selectItem(item.id, true));
    } else {
      clearSelection();
    }
  };

  const getUnitLabel = (unit: string | null) => {
    switch (unit) {
      case 'hour': return '/hr';
      case 'day': return '/day';
      case 'visit': return '/visit';
      case 'job': return '/job';
      case 'sqm': return '/sqm';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header row with count and import */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {filteredItems.length} service{filteredItems.length !== 1 ? 's' : ''} found
          </span>
        </div>
        <Button variant="outline" size="sm" disabled>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Import/Export
        </Button>
      </div>

      {selectionStats.selected > 0 && (
        <InventoryBulkActionsBar
          selectedCount={selectionStats.selected}
          onClearSelection={clearSelection}
          onBulkDelete={async () => {
            if (!confirm(`Delete ${selectionStats.selected} selected services?`)) return;
            
            const { error } = await supabase
              .from('enhanced_inventory_items')
              .update({ active: false })
              .in('id', selectedItems);

            if (error) {
              toast({ title: "Error", description: "Failed to delete services", variant: "destructive" });
            } else {
              toast({ title: `${selectionStats.selected} services deleted` });
              clearSelection();
              refetch();
            }
          }}
          selectedItems={filteredItems.filter(item => selectedItems.includes(item.id))}
          onRefetch={refetch}
        />
      )}

      <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
        <TabsList className="bg-background border-b border-border/50 rounded-none p-0 h-auto flex w-full justify-start gap-0 overflow-x-auto">
          {SERVICE_CATEGORIES.map(cat => (
            <TabsTrigger 
              key={cat.key} 
              value={cat.key} 
              className="px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold rounded-none text-muted-foreground hover:text-foreground whitespace-nowrap"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SERVICE_CATEGORIES.map(cat => (
          <TabsContent key={cat.key} value={cat.key} className="mt-4">
            <div className="rounded-md border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/20 border-b">
                    <tr>
                      <th className="px-2 py-2 text-left w-10">
                        <Checkbox 
                          checked={paginatedItems.length > 0 && paginatedItems.every(item => selectedItems.includes(item.id))}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-2 py-2 text-left w-12">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Service Name</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Unit</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Cost</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Price</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-muted-foreground w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Wrench className="h-8 w-8 text-muted-foreground/50" />
                            <p>No services found</p>
                            <p className="text-xs">Add services like installation, fitting, or consultation</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedItems.map(item => (
                        <tr 
                          key={item.id} 
                          className="border-b hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => handleCardClick(item)}
                        >
                          <td className="px-2 py-2">
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={(checked) => selectItem(item.id, checked === true)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                              <Wrench className="h-4 w-4 text-primary" />
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <span className="text-sm font-medium">{item.name}</span>
                          </td>
                          <td className="px-2 py-2">
                            <Badge variant="outline" className="text-[10px]">
                              {item.subcategory?.replace('_', ' ') || 'Service'}
                            </Badge>
                          </td>
                          <td className="px-2 py-2 text-xs text-muted-foreground max-w-[200px] truncate">
                            {item.description || '-'}
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex items-center gap-1 text-xs">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {item.unit || 'per job'}
                            </div>
                          </td>
                          <td className="px-2 py-2 text-xs text-muted-foreground">
                            {formatCurrency(item.cost_price || 0)}
                          </td>
                          <td className="px-2 py-2">
                            <span className="text-sm font-medium text-primary">
                              {formatCurrency(item.selling_price || 0)}{getUnitLabel(item.unit)}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <EditInventoryDialog
                                item={item}
                                trigger={
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                }
                                onSuccess={refetch}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {totalPages > 1 && (
              <div className="mt-4">
                <JobsPagination
                  currentPage={currentPage}
                  totalItems={filteredItems.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {quickViewItem && (
        <InventoryQuickView
          item={quickViewItem}
          open={showQuickView}
          onOpenChange={setShowQuickView}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};
