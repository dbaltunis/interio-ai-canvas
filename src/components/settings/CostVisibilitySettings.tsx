import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertTriangle } from "lucide-react";
import { useBusinessSettings, useUpdateBusinessSettings } from "@/hooks/useBusinessSettings";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

export const CostVisibilitySettings = () => {
  const { data: businessSettings } = useBusinessSettings();
  const { data: userRole } = useUserRole();
  const updateSettings = useUpdateBusinessSettings();

  // Only owners can access this section
  if (!userRole?.isOwner && !userRole?.isAdmin) {
    return null;
  }

  const handleToggle = async (field: string, value: boolean) => {
    if (!businessSettings?.id) {
      toast.error("Please set up your business settings first");
      return;
    }

    try {
      await updateSettings.mutateAsync({
        id: businessSettings.id,
        [field]: value,
      });
      toast.success("Cost visibility settings updated");
    } catch (error) {
      toast.error("Failed to update settings");
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          <div>
            <CardTitle>Vendor Cost Visibility</CardTitle>
            <CardDescription>
              Control who can see vendor pricing information
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-900 dark:text-amber-100">
            <div className="font-medium mb-1">Sensitive Business Information</div>
            <div className="text-sm">
              Vendor cost prices are sensitive business data. Only share with trusted team members.
              By default, only owners and admins can see costs.
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Managers Permission */}
          <div className="flex items-center justify-between space-x-4 border-b pb-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="show-costs-managers" className="text-base font-medium">
                Show costs to Managers
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow users with Manager role to view vendor cost prices in the Material Queue and Batch Orders
              </p>
            </div>
            <Switch
              id="show-costs-managers"
              checked={businessSettings?.show_vendor_costs_to_managers || false}
              onCheckedChange={(checked) => handleToggle('show_vendor_costs_to_managers', checked)}
              disabled={updateSettings.isPending}
            />
          </div>

          {/* Staff Permission */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="show-costs-staff" className="text-base font-medium">
                Show costs to Staff
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow users with Staff/User role to view vendor cost prices in the Material Queue and Batch Orders
              </p>
            </div>
            <Switch
              id="show-costs-staff"
              checked={businessSettings?.show_vendor_costs_to_staff || false}
              onCheckedChange={(checked) => handleToggle('show_vendor_costs_to_staff', checked)}
              disabled={updateSettings.isPending}
            />
          </div>
        </div>

        {/* Current Status */}
        <div className="rounded-md bg-muted p-4 space-y-2">
          <div className="font-medium text-sm">Current Access:</div>
          <ul className="text-sm space-y-1 ml-4">
            <li className="text-green-600 dark:text-green-400">✓ Owners (always)</li>
            <li className="text-green-600 dark:text-green-400">✓ Admins (always)</li>
            <li className={businessSettings?.show_vendor_costs_to_managers ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
              {businessSettings?.show_vendor_costs_to_managers ? "✓" : "✗"} Managers
            </li>
            <li className={businessSettings?.show_vendor_costs_to_staff ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
              {businessSettings?.show_vendor_costs_to_staff ? "✓" : "✗"} Staff/Users
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
