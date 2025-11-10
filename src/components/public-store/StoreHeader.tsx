import { Link } from "react-router-dom";
import { Menu, ShoppingCart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { MegaMenu } from "./shared/MegaMenu";

interface StoreHeaderProps {
  storeData: any;
}

export const StoreHeader = ({ storeData }: StoreHeaderProps) => {
  const { openCart, getTotalItems } = useShoppingCart();
  const itemCount = getTotalItems();

  return (
    <>
      {/* Promotional Top Bar */}
      <div className="w-full bg-primary text-primary-foreground py-2 text-center text-sm font-medium">
        🎉 Free Measuring & Consultation • No Obligation Quote • Expert Installation
      </div>

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to={`/store/${storeData.store_slug}`} className="flex items-center space-x-2 flex-shrink-0">
            {storeData.logo_url ? (
              <img 
                src={storeData.logo_url} 
                alt={storeData.store_name} 
                className="h-10 w-auto"
              />
            ) : (
              <span className="text-xl font-bold">{storeData.store_name}</span>
            )}
          </Link>

          {/* Desktop Navigation with Mega Menu */}
          <div className="hidden lg:flex items-center flex-1 justify-center">
            <MegaMenu storeSlug={storeData.store_slug} />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden md:flex"
            >
              <Link to={`/store/${storeData.store_slug}/appointments`}>
                <Calendar className="h-4 w-4 mr-2" />
                Book Consultation
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={openCart}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col space-y-4 mt-8">
                  <Link to={`/store/${storeData.store_slug}`} className="text-lg font-medium hover:text-primary transition-colors">
                    Home
                  </Link>
                  <Link to={`/store/${storeData.store_slug}/products`} className="text-lg font-medium hover:text-primary transition-colors">
                    Products
                  </Link>
                  <Link to={`/store/${storeData.store_slug}/about`} className="text-lg font-medium hover:text-primary transition-colors">
                    About
                  </Link>
                  <Link to={`/store/${storeData.store_slug}/contact`} className="text-lg font-medium hover:text-primary transition-colors">
                    Contact
                  </Link>
                  <Link to={`/store/${storeData.store_slug}/appointments`} className="text-lg font-medium hover:text-primary transition-colors">
                    Book Consultation
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
};
