import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { 
  ShoppingCart, 
  MessageSquare, 
  Check, 
  Star,
  Ruler,
  Package,
  Shield,
  Clock
} from "lucide-react";

const quoteFormSchema = z.object({
  customer_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  customer_email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  customer_phone: z.string().trim().max(20, "Phone number must be less than 20 characters").optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Message must be less than 1000 characters").optional().or(z.literal(""))
});

interface SimpleProductDetailProps {
  product: any;
  storeData: any;
  onSubmitQuote: (quoteData: any) => void;
  onAddToCart?: (configuration: Record<string, any>, estimatedPrice: number) => void;
}

export const SimpleProductDetail = ({
  product,
  storeData,
  onSubmitQuote,
  onAddToCart
}: SimpleProductDetailProps) => {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    message: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validate form data
    const result = quoteFormSchema.safeParse(formData);
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    // Submit validated data
    onSubmitQuote({
      ...result.data,
      configuration_data: { product_name: product.inventory_item?.name },
      quote_data: { requested_via: "product_page" }
    });
    
    setShowQuoteForm(false);
    setFormData({ customer_name: "", customer_email: "", customer_phone: "", message: "" });
    setFormErrors({});
  };

  const handleQuickAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(
        { product_name: product.inventory_item?.name },
        product.inventory_item?.selling_price || 0
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Features */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Product Features</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Custom-made to your exact measurements</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Premium quality materials and craftsmanship</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Professional installation available</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Comprehensive warranty included</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Free in-home consultation and measurement</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Specifications */}
      {product.inventory_item && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Specifications</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Category</p>
                <p className="font-medium">{product.inventory_item.category || 'Window Treatment'}</p>
              </div>
              {product.inventory_item.color && (
                <div>
                  <p className="text-muted-foreground mb-1">Color</p>
                  <p className="font-medium">{product.inventory_item.color}</p>
                </div>
              )}
              {product.inventory_item.material && (
                <div>
                  <p className="text-muted-foreground mb-1">Material</p>
                  <p className="font-medium">{product.inventory_item.material}</p>
                </div>
              )}
              {product.inventory_item.width && (
                <div>
                  <p className="text-muted-foreground mb-1">Width</p>
                  <p className="font-medium">{product.inventory_item.width}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Why Choose Us */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Why Choose Us</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-background p-2 shadow-sm">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Quality Guaranteed</p>
                <p className="text-xs text-muted-foreground">Premium materials</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-background p-2 shadow-sm">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Fast Delivery</p>
                <p className="text-xs text-muted-foreground">2-3 weeks</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-background p-2 shadow-sm">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Warranty</p>
                <p className="text-xs text-muted-foreground">Comprehensive</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-background p-2 shadow-sm">
                <Ruler className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Custom Made</p>
                <p className="text-xs text-muted-foreground">To your specs</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          size="lg"
          className="flex-1 h-14 text-base shadow-lg"
          style={{ backgroundColor: 'var(--store-primary)' }}
          onClick={() => setShowQuoteForm(!showQuoteForm)}
        >
          <MessageSquare className="mr-2 h-5 w-5" />
          Request a Quote
        </Button>
        
        {onAddToCart && (
          <Button
            size="lg"
            variant="outline"
            className="flex-1 h-14 text-base"
            onClick={handleQuickAddToCart}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
        )}
      </div>

      {/* Quote Request Form */}
      {showQuoteForm && (
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Request a Quote
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Fill out the form below and we'll get back to you within 24 hours with a detailed quote.
            </p>
            
            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.customer_name}
                    onChange={(e) => {
                      setFormData({ ...formData, customer_name: e.target.value });
                      if (formErrors.customer_name) {
                        setFormErrors({ ...formErrors, customer_name: "" });
                      }
                    }}
                    className={formErrors.customer_name ? "border-destructive" : ""}
                  />
                  {formErrors.customer_name && (
                    <p className="text-sm text-destructive">{formErrors.customer_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.customer_email}
                    onChange={(e) => {
                      setFormData({ ...formData, customer_email: e.target.value });
                      if (formErrors.customer_email) {
                        setFormErrors({ ...formErrors, customer_email: "" });
                      }
                    }}
                    className={formErrors.customer_email ? "border-destructive" : ""}
                  />
                  {formErrors.customer_email && (
                    <p className="text-sm text-destructive">{formErrors.customer_email}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.customer_phone}
                  onChange={(e) => {
                    setFormData({ ...formData, customer_phone: e.target.value });
                    if (formErrors.customer_phone) {
                      setFormErrors({ ...formErrors, customer_phone: "" });
                    }
                  }}
                  className={formErrors.customer_phone ? "border-destructive" : ""}
                />
                {formErrors.customer_phone && (
                  <p className="text-sm text-destructive">{formErrors.customer_phone}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your requirements, window dimensions, preferred colors, etc."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (formErrors.message) {
                      setFormErrors({ ...formErrors, message: "" });
                    }
                  }}
                  className={formErrors.message ? "border-destructive" : ""}
                />
                {formErrors.message && (
                  <p className="text-sm text-destructive">{formErrors.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1" style={{ backgroundColor: 'var(--store-primary)' }}>
                  Submit Quote Request
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowQuoteForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-3">How It Works</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">1</span>
              <span><strong className="text-foreground">Request a Quote:</strong> Submit your requirements and measurements</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">2</span>
              <span><strong className="text-foreground">Get Estimate:</strong> Receive a detailed quote within 24 hours</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">3</span>
              <span><strong className="text-foreground">Free Consultation:</strong> Schedule an in-home measurement and design consultation</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">4</span>
              <span><strong className="text-foreground">Manufacturing:</strong> Your custom treatment is crafted to perfection</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">5</span>
              <span><strong className="text-foreground">Installation:</strong> Professional installation at your convenience</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};
