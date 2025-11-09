import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Mail, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useStorePayment } from "@/hooks/useStorePayment";
import { useShoppingCart } from "@/hooks/useShoppingCart";

interface StoreOrderConfirmationProps {
  storeData: any;
}

export const StoreOrderConfirmation = ({ storeData }: StoreOrderConfirmationProps) => {
  const [searchParams] = useSearchParams();
  const { verifyPayment } = useStorePayment();
  const { clearCart } = useShoppingCart();
  const [isVerifying, setIsVerifying] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      verifyPayment.mutate(
        { sessionId },
        {
          onSuccess: (data) => {
            setOrderDetails(data);
            setIsVerifying(false);
            clearCart();
          },
          onError: () => {
            setIsVerifying(false);
          },
        }
      );
    } else {
      setIsVerifying(false);
    }
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className="py-12">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Verifying your payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your order.</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="py-12">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              
              <h1 className="text-3xl font-bold mb-4">
                Thank You for Your Order!
              </h1>
              
              <p className="text-muted-foreground mb-8">
                {orderDetails?.status === "paid"
                  ? "Your payment has been confirmed! We'll process your order and be in touch shortly with installation scheduling."
                  : "We've received your quote request and will get back to you within 24 hours with detailed pricing and next steps."}
              </p>

              {orderDetails && orderDetails.status === "paid" && (
                <Card className="mb-8 bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Order Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-mono text-sm">{orderDetails.order_id.slice(0, 8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-semibold text-green-600 capitalize">{orderDetails.status}</span>
                    </div>
                    {orderDetails.amount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Paid:</span>
                        <span className="font-semibold">£{orderDetails.amount.toFixed(2)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="bg-muted rounded-lg p-6 mb-8 text-left">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">What happens next?</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• You'll receive a confirmation email shortly</li>
                      <li>• Our team will review your specifications</li>
                      <li>• We'll prepare a detailed quote including installation</li>
                      <li>• You'll receive your personalized quote within 24 hours</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button asChild className="w-full" size="lg">
                  <Link to={`/store/${storeData.store_slug}/products`}>
                    Continue Shopping
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/store/${storeData.store_slug}`}>
                    Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
