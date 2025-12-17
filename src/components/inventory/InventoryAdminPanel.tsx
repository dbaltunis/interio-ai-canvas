import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  Download, 
  FileSpreadsheet,
  Search,
  ArrowUpDown,
  Printer,
  AlertTriangle
} from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useUserRole } from "@/hooks/useUserRole";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getCurrencySymbol } from "@/utils/formatCurrency";
import { InventoryImportExport } from "./InventoryImportExport";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface InventoryValuationItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  supplier: string;
  quantity: number;
  unit: string;
  costPrice: number;
  totalCostValue: number;
  retailPrice: number;
  totalRetailValue: number;
  marginPercent: number;
  location: string;
  lastUpdated: string;
}

export const InventoryAdminPanel = () => {
  const { data: inventory, isLoading } = useEnhancedInventory();
  const { data: userRole } = useUserRole();
  const { units } = useMeasurementUnits();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof InventoryValuationItem>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const currencySymbol = getCurrencySymbol(units.currency);

  // Permission check - Owner/Admin only (including System Owner)
  const isOwnerOrAdmin = 
    userRole?.role === 'Owner' || 
    userRole?.role === 'Admin' || 
    userRole?.role === 'System Owner' ||
    userRole?.isAdmin === true || 
    userRole?.isOwner === true ||
    userRole?.isSystemOwner === true;

  // Calculate financial summaries
  const financialSummary = useMemo(() => {
    if (!inventory) return { totalCost: 0, totalRetail: 0, expectedProfit: 0, itemCount: 0, lowStockCount: 0 };

    let totalCost = 0;
    let totalRetail = 0;
    let lowStockCount = 0;

    inventory.forEach(item => {
      const qty = item.quantity || 0;
      const cost = item.cost_price || 0;
      const retail = item.selling_price || cost;
      
      totalCost += qty * cost;
      totalRetail += qty * retail;
      
      if (item.reorder_point && qty <= item.reorder_point) {
        lowStockCount++;
      }
    });

    return {
      totalCost,
      totalRetail,
      expectedProfit: totalRetail - totalCost,
      itemCount: inventory.length,
      lowStockCount
    };
  }, [inventory]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    if (!inventory) return [];

    const breakdown: Record<string, { count: number; costValue: number; retailValue: number }> = {};

    inventory.forEach(item => {
      const cat = item.category || 'uncategorized';
      if (!breakdown[cat]) {
        breakdown[cat] = { count: 0, costValue: 0, retailValue: 0 };
      }
      const qty = item.quantity || 0;
      breakdown[cat].count += 1;
      breakdown[cat].costValue += qty * (item.cost_price || 0);
      breakdown[cat].retailValue += qty * (item.selling_price || item.cost_price || 0);
    });

    return Object.entries(breakdown).map(([category, data]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      ...data
    })).sort((a, b) => b.retailValue - a.retailValue);
  }, [inventory]);

  // Valuation data for the table
  const valuationData: InventoryValuationItem[] = useMemo(() => {
    if (!inventory) return [];

    return inventory
      .filter(item => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.name?.toLowerCase().includes(q) ||
          item.sku?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          item.supplier?.toLowerCase().includes(q)
        );
      })
      .map(item => {
        const qty = item.quantity || 0;
        const cost = item.cost_price || 0;
        const retail = item.selling_price || cost;
        const margin = retail > 0 ? ((retail - cost) / retail) * 100 : 0;

        return {
          id: item.id,
          sku: item.sku || '-',
          name: item.name || 'Unnamed',
          category: item.category || '-',
          subcategory: item.subcategory || '-',
          supplier: item.vendor?.name || item.supplier || '-',
          quantity: qty,
          unit: item.unit || 'unit',
          costPrice: cost,
          totalCostValue: qty * cost,
          retailPrice: retail,
          totalRetailValue: qty * retail,
          marginPercent: margin,
          location: item.location || '-',
          lastUpdated: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '-'
        };
      })
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
  }, [inventory, searchQuery, sortField, sortDirection]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'SKU', 'Name', 'Category', 'Subcategory', 'Supplier', 
      'Quantity', 'Unit', 'Cost Price', 'Total Cost Value', 
      'Retail Price', 'Total Retail Value', 'Margin %', 'Location', 'Last Updated'
    ];

    const rows = valuationData.map(item => [
      item.sku,
      item.name,
      item.category,
      item.subcategory,
      item.supplier,
      item.quantity,
      item.unit,
      item.costPrice.toFixed(2),
      item.totalCostValue.toFixed(2),
      item.retailPrice.toFixed(2),
      item.totalRetailValue.toFixed(2),
      item.marginPercent.toFixed(1),
      item.location,
      item.lastUpdated
    ]);

    // Add summary row
    rows.push([]);
    rows.push(['SUMMARY']);
    rows.push(['Total Items', financialSummary.itemCount.toString()]);
    rows.push(['Total Cost Value', financialSummary.totalCost.toFixed(2)]);
    rows.push(['Total Retail Value', financialSummary.totalRetail.toFixed(2)]);
    rows.push(['Expected Profit', financialSummary.expectedProfit.toFixed(2)]);
    rows.push(['Export Date', new Date().toISOString()]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_valuation_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  const handleSort = (field: keyof InventoryValuationItem) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (!isOwnerOrAdmin) {
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              This section is only available to account owners and administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Package className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-xl font-semibold">Inventory Administration</h2>
          <p className="text-sm text-muted-foreground">Financial overview and accounting exports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Valuation Report</h1>
        <p className="text-sm text-muted-foreground">Generated: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock on Hand (Cost)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencySymbol}{financialSummary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Total cost value of inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock on Hand (Retail)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencySymbol}{financialSummary.totalRetail.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Total retail value of inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currencySymbol}{financialSummary.expectedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialSummary.totalRetail > 0 
                ? `${((financialSummary.expectedProfit / financialSummary.totalRetail) * 100).toFixed(1)}% overall margin`
                : 'No retail value'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialSummary.itemCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {financialSummary.lowStockCount > 0 && (
                <span className="text-amber-600">{financialSummary.lowStockCount} items low stock</span>
              )}
              {financialSummary.lowStockCount === 0 && 'All items in stock'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inventory by Category</CardTitle>
          <CardDescription>Value breakdown by inventory category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {categoryBreakdown.map(cat => (
              <div key={cat.category} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{cat.category}</span>
                  <Badge variant="secondary" className="text-xs">{cat.count}</Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span>{currencySymbol}{cat.costValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retail:</span>
                    <span>{currencySymbol}{cat.retailValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import/Export Section */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Import / Export
          </CardTitle>
          <CardDescription>Bulk import inventory or export data</CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryImportExport />
        </CardContent>
      </Card>

      {/* Valuation Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Inventory Valuation Report</CardTitle>
              <CardDescription>Detailed inventory listing for accounting (Stocktaking)</CardDescription>
            </div>
            <div className="relative print:hidden">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('sku')}>
                    <div className="flex items-center gap-1">
                      SKU
                      {sortField === 'sku' && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </th>
                  <th className="text-left p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      Name
                      {sortField === 'name' && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </th>
                  <th className="text-left p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('category')}>
                    <div className="flex items-center gap-1">
                      Category
                      {sortField === 'category' && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </th>
                  <th className="text-left p-2">Supplier</th>
                  <th className="text-right p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('quantity')}>
                    <div className="flex items-center gap-1 justify-end">
                      Qty
                      {sortField === 'quantity' && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('costPrice')}>
                    <div className="flex items-center gap-1 justify-end">
                      Cost
                      {sortField === 'costPrice' && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('totalCostValue')}>
                    <div className="flex items-center gap-1 justify-end">
                      Total Cost
                      {sortField === 'totalCostValue' && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('retailPrice')}>
                    <div className="flex items-center gap-1 justify-end">
                      Retail
                      {sortField === 'retailPrice' && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('totalRetailValue')}>
                    <div className="flex items-center gap-1 justify-end">
                      Total Retail
                      {sortField === 'totalRetailValue' && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('marginPercent')}>
                    <div className="flex items-center gap-1 justify-end">
                      Margin
                      {sortField === 'marginPercent' && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </th>
                  <th className="text-left p-2 print:hidden">Location</th>
                </tr>
              </thead>
              <tbody>
                {valuationData.slice(0, 100).map((item, index) => (
                  <tr key={item.id} className={cn("border-b hover:bg-muted/50", index % 2 === 0 && "bg-muted/20")}>
                    <td className="p-2 font-mono text-xs">{item.sku}</td>
                    <td className="p-2 max-w-[200px] truncate" title={item.name}>{item.name}</td>
                    <td className="p-2 capitalize">{item.category}</td>
                    <td className="p-2">{item.supplier}</td>
                    <td className="p-2 text-right">{item.quantity} {item.unit}</td>
                    <td className="p-2 text-right">{currencySymbol}{item.costPrice.toFixed(2)}</td>
                    <td className="p-2 text-right font-medium">{currencySymbol}{item.totalCostValue.toFixed(2)}</td>
                    <td className="p-2 text-right">{currencySymbol}{item.retailPrice.toFixed(2)}</td>
                    <td className="p-2 text-right font-medium">{currencySymbol}{item.totalRetailValue.toFixed(2)}</td>
                    <td className="p-2 text-right">
                      <Badge variant={item.marginPercent >= 30 ? "default" : item.marginPercent >= 15 ? "secondary" : "outline"} className="text-xs">
                        {item.marginPercent.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="p-2 print:hidden">{item.location}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50 font-medium">
                <tr>
                  <td colSpan={6} className="p-2 text-right">Totals:</td>
                  <td className="p-2 text-right">{currencySymbol}{financialSummary.totalCost.toFixed(2)}</td>
                  <td className="p-2 text-right"></td>
                  <td className="p-2 text-right">{currencySymbol}{financialSummary.totalRetail.toFixed(2)}</td>
                  <td className="p-2 text-right">
                    {financialSummary.totalRetail > 0 
                      ? `${((financialSummary.expectedProfit / financialSummary.totalRetail) * 100).toFixed(1)}%`
                      : '-'
                    }
                  </td>
                  <td className="print:hidden"></td>
                </tr>
              </tfoot>
            </table>
            {valuationData.length > 100 && (
              <p className="text-sm text-muted-foreground mt-4 text-center print:hidden">
                Showing first 100 of {valuationData.length} items. Export to CSV for complete data.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
