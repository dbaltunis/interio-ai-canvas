import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HotLeadsList } from "./HotLeadsList";
import { LeadSourceAnalytics } from "./LeadSourceAnalytics";
import { SalesPipelineBoard } from "./SalesPipelineBoard";
import { DealForm } from "./DealForm";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Download, Target } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const CRMDashboard = () => {
  const [showCreateDeal, setShowCreateDeal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your leads, track performance, and optimize your sales process
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
          <Button size="sm" onClick={() => setShowCreateDeal(true)}>
            <Target className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Sales Pipeline</TabsTrigger>
          <TabsTrigger value="hot-leads">Hot Leads</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HotLeadsList />
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <SalesPipelineBoard />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <SalesPipelineBoard />
        </TabsContent>

        <TabsContent value="hot-leads" className="space-y-6">
          <HotLeadsList />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <LeadSourceAnalytics />
        </TabsContent>
      </Tabs>

      {/* Create Deal Dialog */}
      <Dialog open={showCreateDeal} onOpenChange={setShowCreateDeal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Deal</DialogTitle>
          </DialogHeader>
          <DealForm 
            onCancel={() => setShowCreateDeal(false)}
            onSuccess={() => setShowCreateDeal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};