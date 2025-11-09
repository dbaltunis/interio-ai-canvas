import { useState } from "react";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { formatCurrency } from "@/utils/currency";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StoreCheckoutProps {
  storeData: any;
}

export const StoreCheckout = ({ storeData }: StoreCheckoutProps) => {
  const { items, getTotalPrice, clearCart } = useShoppingCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    message: "",
  });

  const currency = 'GBP';

  const submitOrder = useMutation({
    mutationFn: async () => {
      // Create inquiry for the order
      const { data, error } = await supabase
        .from('store_inquiries')
        .insert({
          store_id: storeData.id,
          inquiry_type: 'quote_request',
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          message: formData.message,
          configuration_data: items.map(item => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            configuration: item.configuration,
            estimatedPrice: item.estimatedPrice,
          })),
          quote_data: {
            total: getTotalPrice(),
            currency,
            items: items.length,
          },
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Order submitted successfully! We'll contact you shortly.");
      clearCart();
      navigate(`/store/${storeData.store_slug}/order-confirmation`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit order");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitOrder.mutate();
  };

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some products before checking out
          </p>
          <Button asChild>
            <Link to={`/store/${storeData.store_slug}/products`}>
              Browse Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container">
        <Button asChild variant="ghost" className="mb-6">
          <Link to={`/store/${storeData.store_slug}/products`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer_name">Full Name *</Label>
                      <Input
                        id="customer_name"
                        required
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer_email">Email *</Label>
                      <Input
                        id="customer_email"
                        type="email"
                        required
                        value={formData.customer_email}
                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_phone">Phone Number</Label>
                    <Input
                      id="customer_phone"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Additional Notes</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      placeholder="Any special requirements or questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={submitOrder.isPending}
                  >
                    {submitOrder.isPending ? "Submitting..." : "Submit Order Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        {item.estimatedPrice && (
                          <p className="text-sm font-semibold mt-1">
                            {formatCurrency(item.estimatedPrice * item.quantity, currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(getTotalPrice(), currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Installation</span>
                    <span className="text-xs text-muted-foreground">To be quoted</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Estimated Total</span>
                  <span>{formatCurrency(getTotalPrice(), currency)}</span>
                </div>

                <p className="text-xs text-muted-foreground">
                  * This is an estimated total. Final pricing will be confirmed after we review your specifications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
