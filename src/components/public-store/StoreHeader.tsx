import { Link } from "react-router-dom";
import { ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { Badge } from "@/components/ui/badge";

interface StoreHeaderProps {
  storeData: any;
}

export const StoreHeader = ({ storeData }: StoreHeaderProps) => {
  const { openCart, getTotalItems } = useShoppingCart();
  const cartItemsCount = getTotalItems();
  
  const navigation = [
    { name: 'Home', href: `/store/${storeData.store_slug}` },
    { name: 'Products', href: `/store/${storeData.store_slug}/products` },
    { name: 'About', href: `/store/${storeData.store_slug}/about` },
    { name: 'Contact', href: `/store/${storeData.store_slug}/contact` },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to={`/store/${storeData.store_slug}`} className="flex items-center space-x-2">
          {storeData.logo_url ? (
            <img src={storeData.logo_url} alt={storeData.store_name} className="h-8 w-auto" />
          ) : (
            <span className="text-xl font-bold" style={{ color: 'var(--store-primary)' }}>
              {storeData.store_name}
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                variant="default"
              >
                {cartItemsCount}
              </Badge>
            )}
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-lg font-medium transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
