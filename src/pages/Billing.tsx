import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CreditCard, Package, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Billing = () => {
  const { data: userRole, isLoading } = useUserRole();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!userRole?.isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 mb-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Owner Access Required</CardTitle>
            </div>
            <CardDescription>
              Only the account owner can access billing settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                If you need to update billing information or manage subscriptions, please contact your account owner.
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
        <h1 className="text-3xl font-bold">Billing & Subscriptions</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <Package className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Professional</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">$99/mo</div>
            <p className="text-sm text-muted-foreground">
              Unlimited team members and features
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CreditCard className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Primary card</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold mb-2">•••• 4242</div>
            <p className="text-sm text-muted-foreground">Expires 12/2025</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle>Next Billing</CardTitle>
            <CardDescription>Upcoming charge</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold mb-2">Dec 1, 2024</div>
            <p className="text-sm text-muted-foreground">$99.00 USD</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              Billing integration coming soon. For now, contact support@curtainscalculator.com for billing inquiries.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;