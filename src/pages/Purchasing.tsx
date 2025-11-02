import { useHasPermission } from "@/hooks/usePermissions";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VendorOrderingView } from "@/components/inventory/VendorOrderingView";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Purchasing = () => {
  const canViewPurchasing = useHasPermission('view_purchasing');
  const canManagePurchasing = useHasPermission('manage_purchasing');
  const { data: userRole, isLoading } = useUserRole();
  const navigate = useNavigate();

  if (isLoading || canViewPurchasing === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!canViewPurchasing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 mb-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Access Restricted</CardTitle>
            </div>
            <CardDescription>
              You don't have permission to access purchasing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Only Owners, Admins, and Managers can view purchasing information. Contact your account owner to request access.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate(-1)} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Purchasing & Vendor Orders</h1>
        <p className="text-muted-foreground mt-2">
          {canManagePurchasing
            ? "Create and manage purchase orders with vendors"
            : "View purchase orders and vendor information"}
        </p>
      </div>

      {!canManagePurchasing && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            You have view-only access. Contact your account owner to request purchasing management permissions.
          </AlertDescription>
        </Alert>
      )}

      <VendorOrderingView />
    </div>
  );
};

export default Purchasing;