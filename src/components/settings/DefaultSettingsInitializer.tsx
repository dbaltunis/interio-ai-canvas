
import { useEffect } from "react";
import { useCheckUserInitialization, useInitializeUserDefaults } from "@/hooks/useDefaultSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Package, Users, Calculator, Wrench, DollarSign } from "lucide-react";

export const DefaultSettingsInitializer = () => {
  const { data: initStatus, isLoading: checkingStatus } = useCheckUserInitialization();
  const initializeDefaults = useInitializeUserDefaults();

  // Auto-initialize for new users
  useEffect(() => {
    if (initStatus && !initStatus.initialized && initStatus.user && !initializeDefaults.isPending) {
      console.log("Auto-initializing default settings for new user");
      initializeDefaults.mutate();
    }
  }, [initStatus, initializeDefaults]);

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!initStatus || initStatus.initialized) {
    return null; // Settings already initialized, no need to show this component
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Welcome to InterioApp!
        </CardTitle>
        <CardDescription>
          Let's set up your account with industry-standard defaults to get you started quickly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Package className="h-8 w-8 text-brand-primary" />
            <div>
              <h4 className="font-medium">Product Categories</h4>
              <p className="text-sm text-gray-600">Curtains, Blinds, Shutters, Hardware</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Wrench className="h-8 w-8 text-brand-primary" />
            <div>
              <h4 className="font-medium">Treatment Types</h4>
              <p className="text-sm text-gray-600">Standard & Motorized options</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <DollarSign className="h-8 w-8 text-brand-primary" />
            <div>
              <h4 className="font-medium">Pricing Rules</h4>
              <p className="text-sm text-gray-600">Bulk discounts & surcharges</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Users className="h-8 w-8 text-brand-primary" />
            <div>
              <h4 className="font-medium">Sample Vendors</h4>
              <p className="text-sm text-gray-600">Fabric & hardware suppliers</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">What will be set up:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Business settings with industry-standard rates (10% tax, 40% markup, $85/hr labor)</li>
            <li>• 6 product categories with appropriate markup percentages</li>
            <li>• 7 common treatment types with time estimates</li>
            <li>• 5 pricing rules for bulk discounts and surcharges</li>
            <li>• 4 sample vendors with contact information</li>
            <li>• Email templates for quotes and installation reminders</li>
          </ul>
        </div>

        <Button 
          onClick={() => initializeDefaults.mutate()}
          disabled={initializeDefaults.isPending}
          className="w-full"
          size="lg"
        >
          {initializeDefaults.isPending ? "Setting up your account..." : "Initialize Default Settings"}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Don't worry - you can customize all these settings later in the Settings tab.
        </p>
      </CardContent>
    </Card>
  );
};
