
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { VendorsList } from "./VendorsList";
import { VendorForm } from "./VendorForm";
import { VendorOrdering } from "./VendorOrdering";
import { VendorProductLibrary } from "./VendorProductLibrary";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const VendorDashboard = () => {
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vendor Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your suppliers and handle weekly ordering
          </p>
        </div>
        <Button onClick={() => setIsAddVendorOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      <Tabs defaultValue="vendors" className="w-full">
        <TabsList>
          <TabsTrigger value="vendors">All Vendors</TabsTrigger>
          <TabsTrigger value="products">Product Libraries</TabsTrigger>
          <TabsTrigger value="ordering">Weekly Ordering</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors" className="space-y-4">
          <VendorsList />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <VendorProductLibrary />
        </TabsContent>

        <TabsContent value="ordering" className="space-y-4">
          <VendorOrdering />
        </TabsContent>
      </Tabs>

      <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
          </DialogHeader>
          <VendorForm onClose={() => setIsAddVendorOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
