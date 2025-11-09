import { Link } from "react-router-dom";

interface StoreFooterProps {
  storeData: any;
}

export const StoreFooter = ({ storeData }: StoreFooterProps) => {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Store Info */}
          <div>
            <h3 className="font-semibold mb-4">{storeData.store_name}</h3>
            <p className="text-sm text-muted-foreground">
              Premium window treatments and interior décor
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={`/store/${storeData.store_slug}/products`} className="text-muted-foreground hover:text-foreground">
                  All Products
                </Link>
              </li>
              <li>
                <Link to={`/store/${storeData.store_slug}/products?category=curtains`} className="text-muted-foreground hover:text-foreground">
                  Curtains & Drapes
                </Link>
              </li>
              <li>
                <Link to={`/store/${storeData.store_slug}/products?category=blinds`} className="text-muted-foreground hover:text-foreground">
                  Window Blinds
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={`/store/${storeData.store_slug}/contact`} className="text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to={`/store/${storeData.store_slug}/about`} className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link to={`/book/${storeData.store_slug}`} className="text-muted-foreground hover:text-foreground">
                  Book Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={`/store/${storeData.store_slug}/terms`} className="text-muted-foreground hover:text-foreground">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to={`/store/${storeData.store_slug}/privacy`} className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {storeData.store_name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
