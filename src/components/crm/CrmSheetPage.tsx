import { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi, GridReadyEvent, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button } from "@/components/ui/button";
import { Plus, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCrmV2Accounts, useCreateCrmV2Account, useUpdateCrmV2Account, CrmAccountV2 } from "@/hooks/useCrmV2";
import { GoogleSheetsIntegration } from "./GoogleSheetsIntegration";
import { usePushToSheet } from "@/hooks/usePushToSheet";
import { toast } from "sonner";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

export const CrmSheetPage = () => {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const { data: accounts = [], isLoading, error } = useCrmV2Accounts();
  
  // Add console logs for debugging
  console.log('CrmSheetPage: accounts =', accounts, 'isLoading =', isLoading, 'error =', error);
  const createAccount = useCreateCrmV2Account();
  const updateAccount = useUpdateCrmV2Account();
  const pushToSheet = usePushToSheet();

  const columnDefs: ColDef[] = [
    {
      field: "name",
      headerName: "Name",
      editable: true,
      flex: 1,
      minWidth: 150
    },
    {
      field: "status",
      headerName: "Status",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["lead", "trial", "active", "churn_risk", "churned"]
      },
      width: 120,
      cellStyle: (params) => {
        if (params.value === "churn_risk") {
          return { backgroundColor: "#fef2f2", color: "#991b1b" };
        }
        return null;
      }
    },
    {
      field: "owner",
      headerName: "Owner",
      editable: true,
      width: 120
    },
    {
      field: "plugin_payments_eur",
      headerName: "Plugin (€)",
      editable: true,
      type: "numericColumn",
      width: 120,
      valueFormatter: (params) => params.value ? `€${params.value.toFixed(2)}` : "€0.00",
      cellStyle: (params) => {
        const row = params.data as CrmAccountV2;
        if ((row.plugin_payments_eur + row.stripe_subs_eur) === 0 && row.status === "active") {
          return { backgroundColor: "#fef3c7", color: "#92400e" };
        }
        return null;
      }
    },
    {
      field: "invoice_payments_eur",
      headerName: "Invoice (€)",
      editable: true,
      type: "numericColumn",
      width: 120,
      valueFormatter: (params) => params.value ? `€${params.value.toFixed(2)}` : "€0.00"
    },
    {
      field: "stripe_subs_eur",
      headerName: "Stripe (€)",
      editable: true,
      type: "numericColumn",
      width: 120,
      valueFormatter: (params) => params.value ? `€${params.value.toFixed(2)}` : "€0.00",
      cellStyle: (params) => {
        const row = params.data as CrmAccountV2;
        if ((row.plugin_payments_eur + row.stripe_subs_eur) === 0 && row.status === "active") {
          return { backgroundColor: "#fef3c7", color: "#92400e" };
        }
        return null;
      }
    },
    {
      field: "mrr_eur",
      headerName: "MRR (€)",
      editable: false,
      type: "numericColumn",
      width: 120,
      valueFormatter: (params) => params.value ? `€${params.value.toFixed(2)}` : "€0.00",
      cellStyle: (params) => {
        const row = params.data as CrmAccountV2;
        if (row.mrr_eur > 0 && row.status === "active") {
          return { backgroundColor: "#f0f9ff", color: "#166534" };
        }
        return null;
      }
    },
    {
      field: "next_action",
      headerName: "Next Action",
      editable: true,
      flex: 1,
      minWidth: 150
    },
    {
      field: "next_action_date",
      headerName: "Action Date",
      editable: true,
      cellEditor: "agDateCellEditor",
      width: 130
    },
    {
      field: "notes",
      headerName: "Notes",
      editable: true,
      flex: 1,
      minWidth: 200
    },
    {
      field: "updated_source",
      headerName: "Source",
      editable: false,
      width: 80
    },
    {
      field: "updated_at",
      headerName: "Updated",
      editable: false,
      width: 120,
      valueFormatter: (params) => {
        if (!params.value) return "";
        return new Date(params.value).toLocaleDateString();
      }
    }
  ];

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  const onCellValueChanged = async (params: any) => {
    const { data, colDef, newValue, oldValue } = params;
    
    if (newValue === oldValue) return;
    
    try {
      await updateAccount.mutateAsync({
        rowId: data.row_id,
        accountData: {
          [colDef.field]: newValue
        }
      });
      toast.success("Account updated successfully");
      
      // Queue for push to sheet
      pushToSheet.mutate(data.row_id);
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error("Failed to update account");
      // Revert the change
      params.node.setDataValue(colDef.field, oldValue);
    }
  };

  const handleAddRow = async () => {
    try {
      const newAccount = await createAccount.mutateAsync({
        name: "New Account",
        status: "lead",
        plugin_payments_eur: 0,
        invoice_payments_eur: 0,
        stripe_subs_eur: 0
      });
      
      toast.success("New account created");
      
      // Select the new row for editing
      setTimeout(() => {
        if (gridApi) {
          gridApi.forEachNode((node) => {
            if (node.data.row_id === newAccount.row_id) {
              gridApi.setFocusedCell(node.rowIndex!, "name");
              gridApi.startEditingCell({
                rowIndex: node.rowIndex!,
                colKey: "name"
              });
            }
          });
        }
      }, 100);
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account");
    }
  };

  const getRowStyle = (params: any) => {
    const row = params.data as CrmAccountV2;
    if (row.status === "churn_risk") {
      return { backgroundColor: "#fef2f2" };
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading CRM data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-destructive">
          <p>Error loading data: {error.message}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">CRM Sheet View</h1>
          <p className="text-muted-foreground">Spreadsheet-style CRM management</p>
        </div>
        <div className="flex gap-2">
          <GoogleSheetsIntegration />
          
            <Button onClick={handleAddRow} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Row
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="flex-1 ag-theme-alpine">
        <AgGridReact
          rowData={accounts}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          onCellValueChanged={onCellValueChanged}
          getRowStyle={getRowStyle}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true
          }}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          animateRows={true}
          rowSelection="multiple"
        />
      </div>

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share CRM Sheet</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-muted-foreground">
              Sharing via Google Sheets will be enabled in Step 3.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This feature will allow real-time collaboration through Google Sheets integration.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};