import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, Store, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OnlineStoreComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OnlineStoreComparisonDialog = ({ open, onOpenChange }: OnlineStoreComparisonDialogProps) => {
  const navigate = useNavigate();

  const features = [
    {
      name: "Setup Time",
      custom: "5 minutes",
      shopify: "1-2 hours",
    },
    {
      name: "Transaction Fees",
      custom: "0%",
      shopify: "0.5% - 2%",
    },
    {
      name: "Monthly Cost",
      custom: "Included in plan",
      shopify: "$39 - $399/month",
    },
    {
      name: "Custom Domain",
      custom: true,
      shopify: true,
    },
    {
      name: "Product Calculator",
      custom: true,
      shopify: false,
    },
    {
      name: "Built-in Booking",
      custom: true,
      shopify: "Requires app ($)",
    },
    {
      name: "Quote Management",
      custom: true,
      shopify: "Limited",
    },
    {
      name: "Email Marketing",
      custom: "Coming soon",
      shopify: true,
    },
    {
      name: "App Store",
      custom: false,
      shopify: true,
    },
    {
      name: "Payment Processing",
      custom: "Stripe integration",
      shopify: "Shopify Payments",
    },
  ];

  const renderValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground mx-auto" />
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Store Options</DialogTitle>
          <DialogDescription>
            Choose the best solution for your business needs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Comparison Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left font-semibold">Feature</th>
                  <th className="p-3 text-center font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Store className="h-4 w-4" />
                      Custom Store
                    </div>
                  </th>
                  <th className="p-3 text-center font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Shopify
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {features.map((feature, index) => (
                  <tr key={index} className="hover:bg-muted/50">
                    <td className="p-3 font-medium">{feature.name}</td>
                    <td className="p-3 text-center">{renderValue(feature.custom)}</td>
                    <td className="p-3 text-center">{renderValue(feature.shopify)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendations */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-primary">Best for: Quick Start</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Launch your custom store in minutes. Perfect for businesses that want to start selling
                online quickly without complex setup or ongoing fees.
              </p>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  navigate('/?tab=online-store');
                }}
                className="w-full"
              >
                <Store className="mr-2 h-4 w-4" />
                Launch Custom Store
              </Button>
            </div>

            <div className="bg-muted/50 border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Best for: Established Brands</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Connect your existing Shopify store to sync inventory and streamline operations.
                Keep your brand identity and customer base.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  navigate('/?tab=inventory');
                }}
                className="w-full"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Connect Shopify
              </Button>
            </div>
          </div>

          {/* Pricing Note */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>💡 Pro Tip:</strong> You can use both! Launch your custom store for direct sales
              and connect Shopify to reach additional customers. Both integrate seamlessly with your
              InterioApp workflow.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
