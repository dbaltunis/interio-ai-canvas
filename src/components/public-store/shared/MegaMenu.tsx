import { Link } from "react-router-dom";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Blinds, Home, ShowerHead, Wallpaper, Palette, Phone, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MegaMenuProps {
  storeSlug: string;
}

const categories = [
  {
    name: "Curtains",
    icon: Home,
    description: "Elegant made-to-measure curtains",
    subcategories: ["Eyelet Curtains", "Pencil Pleat", "Wave Curtains", "Tab Top"]
  },
  {
    name: "Blinds",
    icon: Blinds,
    description: "Roller, Roman, Venetian & more",
    subcategories: ["Roller Blinds", "Roman Blinds", "Venetian Blinds", "Vertical Blinds"]
  },
  {
    name: "Shutters",
    icon: ShowerHead,
    description: "Premium plantation shutters",
    subcategories: ["Full Height", "Cafe Style", "Tier-on-Tier", "Solid Shutters"]
  },
  {
    name: "Wallpaper",
    icon: Wallpaper,
    description: "Designer wallpaper collection",
    subcategories: ["Modern", "Classic", "Textured", "Patterned"]
  },
];

export const MegaMenu = ({ storeSlug }: MegaMenuProps) => {
  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to={`/store/${storeSlug}`} className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[600px] p-4">
              <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Link
                      key={category.name}
                      to={`/store/${storeSlug}/products`}
                      className="group block p-4 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {category.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {category.subcategories.slice(0, 2).map((sub) => (
                              <span key={sub} className="text-xs text-muted-foreground">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link to={`/store/${storeSlug}/products`}>
                  <Button variant="outline" className="w-full">
                    View All Products
                  </Button>
                </Link>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to={`/store/${storeSlug}/calculator`} className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
              <Calculator className="inline h-4 w-4 mr-2" />
              Calculator
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to={`/store/${storeSlug}/about`} className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to={`/store/${storeSlug}/contact`} className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
