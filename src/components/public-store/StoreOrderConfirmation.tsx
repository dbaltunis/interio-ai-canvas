import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";

interface StoreOrderConfirmationProps {
  storeData: any;
}

export const StoreOrderConfirmation = ({ storeData }: StoreOrderConfirmationProps) => {
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
                We've received your quote request and will get back to you within 24 hours with detailed pricing and next steps.
              </p>

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
