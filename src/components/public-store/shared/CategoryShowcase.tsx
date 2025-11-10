import { Link } from "react-router-dom";
import { ArrowRight, Blinds, Home, ShowerHead, Wallpaper } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryShowcaseProps {
  storeSlug: string;
}

const categories = [
  {
    name: "Curtains",
    icon: Home,
    description: "Bespoke curtains made to your exact measurements",
    image: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=600&h=400&fit=crop",
    from: "£125"
  },
  {
    name: "Blinds",
    icon: Blinds,
    description: "Roller, Roman, Venetian and vertical blinds",
    image: "https://images.unsplash.com/photo-1615873968403-89e068629265?w=600&h=400&fit=crop",
    from: "£89"
  },
  {
    name: "Shutters",
    icon: ShowerHead,
    description: "Premium plantation shutters for any window",
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&h=400&fit=crop",
    from: "£299"
  },
  {
    name: "Wallpaper",
    icon: Wallpaper,
    description: "Designer wallpaper from leading brands",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=400&fit=crop",
    from: "£45"
  },
];

export const CategoryShowcase = ({ storeSlug }: CategoryShowcaseProps) => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our comprehensive range of made-to-measure window treatments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to={`/store/${storeSlug}/products`}
                className="group"
              >
                <div className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white mb-1">
                        <Icon className="h-5 w-5" />
                        <h3 className="text-xl font-bold">{category.name}</h3>
                      </div>
                      <p className="text-white/90 text-sm">From {category.from}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      {category.description}
                    </p>
                    <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
