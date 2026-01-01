import { useMemo } from "react";
import { Package, AlertTriangle, Settings2 } from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useUserRole } from "@/hooks/useUserRole";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { getCurrencySymbol } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";

// Admin sub-components
import { FinancialSummaryBar } from "./admin/FinancialSummaryBar";
import { CategoryDrillDown } from "./admin/CategoryDrillDown";
import { CFOValuationTable, ValuationItem } from "./admin/CFOValuationTable";
import { AdminAccessManager } from "./admin/AdminAccessManager";
import { CompactImportExport } from "./admin/CompactImportExport";
import { BulkInventoryImport } from "@/components/settings/tabs/inventory/BulkInventoryImport";

export const InventoryAdminPanel = () => {
  const { user } = useAuth();
  const { data: inventory, isLoading } = useEnhancedInventory();
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const { units } = useMeasurementUnits();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions-admin-panel', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[InventoryAdminPanel] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });

  // Check if manage_inventory_admin is explicitly in user_permissions table
  const hasManageInventoryAdminPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'manage_inventory_admin'
  ) ?? false;

  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;

  // Only allow admin access if user is System Owner OR (Owner/Admin *without* explicit permissions) OR (explicit permissions include manage_inventory_admin)
  const canManageInventoryAdmin =
    userRoleData?.isSystemOwner
      ? true
      : (isOwner || isAdmin)
          ? !hasAnyExplicitPermissions || hasManageInventoryAdminPermission
          : hasManageInventoryAdminPermission;

  const currencySymbol = getCurrencySymbol(units.currency);

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

  // Category breakdown with subcategories
  const categoryBreakdown = useMemo(() => {
    if (!inventory) return [];

    const breakdown: Record<string, { 
      count: number; 
      costValue: number; 
      retailValue: number;
      subcategories: Record<string, { count: number; costValue: number; retailValue: number }>;
    }> = {};

    inventory.forEach(item => {
      const cat = item.category || 'uncategorized';
      const subcat = item.subcategory || 'other';
      
      if (!breakdown[cat]) {
        breakdown[cat] = { count: 0, costValue: 0, retailValue: 0, subcategories: {} };
      }
      if (!breakdown[cat].subcategories[subcat]) {
        breakdown[cat].subcategories[subcat] = { count: 0, costValue: 0, retailValue: 0 };
      }
      
      const qty = item.quantity || 0;
      const cost = qty * (item.cost_price || 0);
      const retail = qty * (item.selling_price || item.cost_price || 0);
      
      breakdown[cat].count += 1;
      breakdown[cat].costValue += cost;
      breakdown[cat].retailValue += retail;
      breakdown[cat].subcategories[subcat].count += 1;
      breakdown[cat].subcategories[subcat].costValue += cost;
      breakdown[cat].subcategories[subcat].retailValue += retail;
    });

    return Object.entries(breakdown)
      .map(([category, data]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        count: data.count,
        costValue: data.costValue,
        retailValue: data.retailValue,
        subcategories: Object.entries(data.subcategories)
          .map(([name, subData]) => ({ name, ...subData }))
          .sort((a, b) => b.retailValue - a.retailValue)
      }))
      .sort((a, b) => b.retailValue - a.retailValue);
  }, [inventory]);

  // Valuation data for CFO table
  const valuationData: ValuationItem[] = useMemo(() => {
    if (!inventory) return [];

    return inventory.map(item => {
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
    });
  }, [inventory]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'SKU', 'Name', 'Category', 'Subcategory', 'Supplier', 
      'Quantity', 'Unit', 'Cost Price', 'Total Cost Value', 
      'Retail Price', 'Total Retail Value', 'Margin %', 'Location', 'Last Updated'
    ];

    const rows = valuationData.map(item => [
      item.sku, item.name, item.category, item.subcategory, item.supplier,
      item.quantity, item.unit, item.costPrice.toFixed(2), item.totalCostValue.toFixed(2),
      item.retailPrice.toFixed(2), item.totalRetailValue.toFixed(2), item.marginPercent.toFixed(1),
      item.location, item.lastUpdated
    ]);

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

  const handlePrint = () => window.print();

  // Show loading state while permissions are being checked
  if (permissionsLoading || roleLoading || explicitPermissions === undefined) {
    return (
      <div className="flex items-center justify-center p-8 md:p-12">
        <div className="text-center space-y-4">
          <Package className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied if user doesn't have permission
  if (!canManageInventoryAdmin) {
    return (
      <div className="flex items-center justify-center p-8 md:p-12">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">Access Restricted</h3>
          <p className="text-muted-foreground">
            This section is only available to account owners, administrators, and users with inventory admin permissions.
          </p>
        </div>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Inventory Administration
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Financial overview, valuation reports, and accounting exports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdminAccessManager />
          <CompactImportExport onExportCSV={exportToCSV} onPrint={handlePrint} />
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Valuation Report</h1>
        <p className="text-sm text-muted-foreground">Generated: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Financial Summary Bar */}
      <FinancialSummaryBar
        totalCost={financialSummary.totalCost}
        totalRetail={financialSummary.totalRetail}
        expectedProfit={financialSummary.expectedProfit}
        itemCount={financialSummary.itemCount}
        lowStockCount={financialSummary.lowStockCount}
        currencySymbol={currencySymbol}
      />

      {/* Category Drill-Down */}
      <div className="bg-card border rounded-xl p-4 md:p-6">
        <CategoryDrillDown
          categories={categoryBreakdown}
          currencySymbol={currencySymbol}
          totalRetail={financialSummary.totalRetail}
        />
      </div>

      {/* CFO Valuation Table */}
      <div className="bg-card border rounded-xl p-4 md:p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold">Inventory Valuation Report</h3>
          <p className="text-sm text-muted-foreground">
            Detailed inventory listing for accounting and stocktaking
          </p>
        </div>
        <CFOValuationTable
          data={valuationData}
          currencySymbol={currencySymbol}
          totalCost={financialSummary.totalCost}
          totalRetail={financialSummary.totalRetail}
          expectedProfit={financialSummary.expectedProfit}
        />
      </div>

      {/* Bulk Import */}
      <BulkInventoryImport />
    </div>
  );
};
