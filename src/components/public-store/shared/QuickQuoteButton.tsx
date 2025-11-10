import { useState, useEffect } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface QuickQuoteButtonProps {
  storeSlug: string;
}

export const QuickQuoteButton = ({ storeSlug }: QuickQuoteButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4">
      <Button
        asChild
        size="lg"
        className="shadow-lg hover:shadow-xl transition-shadow rounded-full px-6"
        style={{ backgroundColor: 'var(--store-primary)' }}
      >
        <Link to={`/store/${storeSlug}/products`}>
          <Calculator className="mr-2 h-5 w-5" />
          Get Free Quote
        </Link>
      </Button>
    </div>
  );
};
