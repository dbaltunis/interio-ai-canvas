import { useUserRole } from "@/hooks/useUserRole";
import { useHasPermission } from "@/hooks/usePermissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SubscriptionCard } from "@/components/billing/SubscriptionCard";
import { InvoicesTable } from "@/components/billing/InvoicesTable";
import { Skeleton } from "@/components/ui/skeleton";

export const Billing = () => {
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const hasBillingPermission = useHasPermission('view_billing');
  const navigate = useNavigate();
  
  const isLoading = roleLoading || hasBillingPermission === undefined;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-5xl">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!hasBillingPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 mb-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Access Restricted</CardTitle>
            </div>
            <CardDescription>
              Only account owners and authorized administrators can access billing settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                If you need to view billing information or manage subscriptions, please contact your account owner to grant you the appropriate permissions.
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
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscriptions</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription, view invoices, and download receipts
          </p>
        </div>
      </div>

      <SubscriptionCard />

      <InvoicesTable />

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Need help with billing? Contact us at{" "}
            <a 
              href="mailto:support@interioapp.com" 
              className="text-primary hover:underline font-medium"
            >
              support@interioapp.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
