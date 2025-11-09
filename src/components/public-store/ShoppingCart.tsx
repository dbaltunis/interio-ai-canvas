import { useShoppingCart } from "@/hooks/useShoppingCart";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Minus, Plus, Trash2, X, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/utils/currency";

interface ShoppingCartProps {
  storeData: any;
}

export const ShoppingCart = ({ storeData }: ShoppingCartProps) => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice } = useShoppingCart();

  const currency = 'GBP'; // Can be made dynamic based on storeData

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Shopping Cart ({items.length})</span>
            <Button variant="ghost" size="icon" onClick={closeCart}>
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Add some products to get started
            </p>
            <Button asChild onClick={closeCart}>
              <Link to={`/store/${storeData.store_slug}/products`}>
                Continue Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1 truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                      
                      {item.estimatedPrice && (
                        <p className="text-sm font-semibold">
                          {formatCurrency(item.estimatedPrice * item.quantity, currency)}
                        </p>
                      )}
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Footer */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(getTotalPrice(), currency)}</span>
              </div>
              
              <Button asChild className="w-full" size="lg">
                <Link 
                  to={`/store/${storeData.store_slug}/checkout`}
                  onClick={closeCart}
                >
                  Proceed to Checkout
                </Link>
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                asChild
                onClick={closeCart}
              >
                <Link to={`/store/${storeData.store_slug}/products`}>
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
