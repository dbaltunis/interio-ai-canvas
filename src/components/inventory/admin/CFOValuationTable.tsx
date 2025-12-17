import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Copy,
  Filter,
  Columns,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ValuationItem {
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
  daysOnHand?: number;
  abcClass?: 'A' | 'B' | 'C';
}

interface CFOValuationTableProps {
  data: ValuationItem[];
  currencySymbol: string;
  totalCost: number;
  totalRetail: number;
  expectedProfit: number;
}

type SortField = keyof ValuationItem;
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE_OPTIONS = [25, 50, 100, 250];

export const CFOValuationTable = ({
  data,
  currencySymbol,
  totalCost,
  totalRetail,
  expectedProfit
}: CFOValuationTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("totalRetailValue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [visibleColumns, setVisibleColumns] = useState({
    sku: true,
    name: true,
    category: true,
    supplier: true,
    quantity: true,
    costPrice: true,
    totalCostValue: true,
    retailPrice: true,
    totalRetailValue: true,
    marginPercent: true,
    location: true,
    lastUpdated: false,
    abcClass: false
  });

  // Get unique categories and locations for filters
  const { categories, locations } = useMemo(() => {
    const cats = new Set<string>();
    const locs = new Set<string>();
    data.forEach(item => {
      if (item.category) cats.add(item.category);
      if (item.location && item.location !== '-') locs.add(item.location);
    });
    return {
      categories: Array.from(cats).sort(),
      locations: Array.from(locs).sort()
    };
  }, [data]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name?.toLowerCase().includes(q) ||
        item.sku?.toLowerCase().includes(q) ||
        item.supplier?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter(item => item.category?.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Location filter
    if (locationFilter !== "all") {
      result = result.filter(item => item.location === locationFilter);
    }

    // Sort
    result.sort((a, b) => {
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

    return result;
  }, [data, searchQuery, categoryFilter, locationFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate subtotals for current page
  const pageSubtotals = useMemo(() => {
    return paginatedData.reduce((acc, item) => ({
      costValue: acc.costValue + item.totalCostValue,
      retailValue: acc.retailValue + item.totalRetailValue
    }), { costValue: 0, retailValue: 0 });
  }, [paginatedData]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const copySku = (sku: string) => {
    navigator.clipboard.writeText(sku);
    toast.success("SKU copied to clipboard");
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-3 w-3 text-primary" /> : 
      <ArrowDown className="h-3 w-3 text-primary" />;
  };

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search SKU, name, supplier..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 w-[200px] md:w-[260px] h-9"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[140px] h-9">
              <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Location Filter */}
          {locations.length > 0 && (
            <Select value={locationFilter} onValueChange={(v) => { setLocationFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Column Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Columns className="h-3.5 w-3.5 mr-2" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(visibleColumns).map(([key, visible]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={visible}
                onCheckedChange={(checked) => 
                  setVisibleColumns(prev => ({ ...prev, [key]: checked }))
                }
                className="capitalize"
              >
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredData.length === data.length 
            ? `${data.length} items`
            : `${filteredData.length} of ${data.length} items`
          }
        </span>
        <div className="flex items-center gap-2">
          <span>Show:</span>
          <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map(n => (
                <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                {visibleColumns.sku && (
                  <th className="text-left p-3 cursor-pointer hover:bg-muted sticky left-0 bg-muted/50" onClick={() => handleSort('sku')}>
                    <div className="flex items-center gap-1 font-semibold">
                      SKU <SortIcon field="sku" />
                    </div>
                  </th>
                )}
                {visibleColumns.name && (
                  <th className="text-left p-3 cursor-pointer hover:bg-muted" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1 font-semibold">
                      Product Name <SortIcon field="name" />
                    </div>
                  </th>
                )}
                {visibleColumns.category && (
                  <th className="text-left p-3 cursor-pointer hover:bg-muted" onClick={() => handleSort('category')}>
                    <div className="flex items-center gap-1 font-semibold">
                      Category <SortIcon field="category" />
                    </div>
                  </th>
                )}
                {visibleColumns.supplier && (
                  <th className="text-left p-3 font-semibold">Supplier</th>
                )}
                {visibleColumns.location && (
                  <th className="text-left p-3 font-semibold">Location</th>
                )}
                {visibleColumns.quantity && (
                  <th className="text-right p-3 cursor-pointer hover:bg-muted" onClick={() => handleSort('quantity')}>
                    <div className="flex items-center gap-1 justify-end font-semibold">
                      Qty <SortIcon field="quantity" />
                    </div>
                  </th>
                )}
                {visibleColumns.costPrice && (
                  <th className="text-right p-3 cursor-pointer hover:bg-muted" onClick={() => handleSort('costPrice')}>
                    <div className="flex items-center gap-1 justify-end font-semibold">
                      Unit Cost <SortIcon field="costPrice" />
                    </div>
                  </th>
                )}
                {visibleColumns.totalCostValue && (
                  <th className="text-right p-3 cursor-pointer hover:bg-muted" onClick={() => handleSort('totalCostValue')}>
                    <div className="flex items-center gap-1 justify-end font-semibold">
                      Total Cost <SortIcon field="totalCostValue" />
                    </div>
                  </th>
                )}
                {visibleColumns.retailPrice && (
                  <th className="text-right p-3 cursor-pointer hover:bg-muted" onClick={() => handleSort('retailPrice')}>
                    <div className="flex items-center gap-1 justify-end font-semibold">
                      Unit Retail <SortIcon field="retailPrice" />
                    </div>
                  </th>
                )}
                {visibleColumns.totalRetailValue && (
                  <th className="text-right p-3 cursor-pointer hover:bg-muted" onClick={() => handleSort('totalRetailValue')}>
                    <div className="flex items-center gap-1 justify-end font-semibold">
                      Total Retail <SortIcon field="totalRetailValue" />
                    </div>
                  </th>
                )}
                {visibleColumns.marginPercent && (
                  <th className="text-right p-3 cursor-pointer hover:bg-muted" onClick={() => handleSort('marginPercent')}>
                    <div className="flex items-center gap-1 justify-end font-semibold">
                      GP% <SortIcon field="marginPercent" />
                    </div>
                  </th>
                )}
                {visibleColumns.lastUpdated && (
                  <th className="text-left p-3 font-semibold">Last Updated</th>
                )}
                {visibleColumns.abcClass && (
                  <th className="text-center p-3 font-semibold">ABC</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={cn(
                    "border-b hover:bg-muted/30 transition-colors",
                    index % 2 === 0 && "bg-muted/10"
                  )}
                >
                  {visibleColumns.sku && (
                    <td className="p-3 sticky left-0 bg-inherit">
                      <div className="flex items-center gap-1 group">
                        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                          {item.sku}
                        </code>
                        <button 
                          onClick={() => copySku(item.sku)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      </div>
                    </td>
                  )}
                  {visibleColumns.name && (
                    <td className="p-3 max-w-[200px]">
                      <p className="truncate font-medium" title={item.name}>{item.name}</p>
                      {item.subcategory && item.subcategory !== '-' && (
                        <p className="text-xs text-muted-foreground capitalize">{item.subcategory}</p>
                      )}
                    </td>
                  )}
                  {visibleColumns.category && (
                    <td className="p-3 capitalize">{item.category}</td>
                  )}
                  {visibleColumns.supplier && (
                    <td className="p-3 text-muted-foreground">{item.supplier}</td>
                  )}
                  {visibleColumns.location && (
                    <td className="p-3">
                      {item.location !== '-' ? (
                        <Badge variant="outline" className="text-xs">{item.location}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  )}
                  {visibleColumns.quantity && (
                    <td className="p-3 text-right tabular-nums">
                      {item.quantity} <span className="text-muted-foreground text-xs">{item.unit}</span>
                    </td>
                  )}
                  {visibleColumns.costPrice && (
                    <td className="p-3 text-right tabular-nums text-muted-foreground">
                      {currencySymbol}{item.costPrice.toFixed(2)}
                    </td>
                  )}
                  {visibleColumns.totalCostValue && (
                    <td className="p-3 text-right tabular-nums font-medium">
                      {currencySymbol}{item.totalCostValue.toFixed(2)}
                    </td>
                  )}
                  {visibleColumns.retailPrice && (
                    <td className="p-3 text-right tabular-nums text-muted-foreground">
                      {currencySymbol}{item.retailPrice.toFixed(2)}
                    </td>
                  )}
                  {visibleColumns.totalRetailValue && (
                    <td className="p-3 text-right tabular-nums font-medium">
                      {currencySymbol}{item.totalRetailValue.toFixed(2)}
                    </td>
                  )}
                  {visibleColumns.marginPercent && (
                    <td className="p-3 text-right">
                      <Badge 
                        variant={item.marginPercent >= 40 ? "default" : item.marginPercent >= 25 ? "secondary" : "outline"}
                        className={cn(
                          "text-xs tabular-nums",
                          item.marginPercent >= 40 && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                          item.marginPercent < 25 && "text-amber-600 border-amber-500/30"
                        )}
                      >
                        {item.marginPercent.toFixed(1)}%
                      </Badge>
                    </td>
                  )}
                  {visibleColumns.lastUpdated && (
                    <td className="p-3 text-muted-foreground text-xs">{item.lastUpdated}</td>
                  )}
                  {visibleColumns.abcClass && (
                    <td className="p-3 text-center">
                      {item.abcClass && (
                        <Badge variant={item.abcClass === 'A' ? 'default' : item.abcClass === 'B' ? 'secondary' : 'outline'}>
                          {item.abcClass}
                        </Badge>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            
            {/* Footer Totals */}
            <tfoot className="bg-muted/50 font-semibold">
              <tr className="border-t-2">
                <td colSpan={visibleColumns.quantity ? 6 : 5} className="p-3 text-right">
                  Page Subtotal:
                </td>
                {visibleColumns.totalCostValue && (
                  <td className="p-3 text-right tabular-nums">
                    {currencySymbol}{pageSubtotals.costValue.toFixed(2)}
                  </td>
                )}
                {visibleColumns.retailPrice && <td></td>}
                {visibleColumns.totalRetailValue && (
                  <td className="p-3 text-right tabular-nums">
                    {currencySymbol}{pageSubtotals.retailValue.toFixed(2)}
                  </td>
                )}
                <td colSpan={3}></td>
              </tr>
              <tr className="bg-primary/5">
                <td colSpan={visibleColumns.quantity ? 6 : 5} className="p-3 text-right font-bold">
                  Grand Total ({filteredData.length} items):
                </td>
                {visibleColumns.totalCostValue && (
                  <td className="p-3 text-right tabular-nums font-bold">
                    {currencySymbol}{totalCost.toFixed(2)}
                  </td>
                )}
                {visibleColumns.retailPrice && <td></td>}
                {visibleColumns.totalRetailValue && (
                  <td className="p-3 text-right tabular-nums font-bold">
                    {currencySymbol}{totalRetail.toFixed(2)}
                  </td>
                )}
                {visibleColumns.marginPercent && (
                  <td className="p-3 text-right">
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      {totalRetail > 0 ? ((expectedProfit / totalRetail) * 100).toFixed(1) : 0}%
                    </Badge>
                  </td>
                )}
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
