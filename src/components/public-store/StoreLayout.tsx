import { ReactNode } from "react";
import { StoreHeader } from "./StoreHeader";
import { StoreFooter } from "./StoreFooter";
import { ShoppingCart } from "./ShoppingCart";

interface StoreLayoutProps {
  children: ReactNode;
  storeData: any;
}

export const StoreLayout = ({ children, storeData }: StoreLayoutProps) => {
  // Apply store branding as CSS variables
  const style = {
    '--store-primary': storeData.primary_color,
    '--store-secondary': storeData.secondary_color,
    '--store-accent': storeData.accent_color,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen flex flex-col bg-background" style={style}>
      <StoreHeader storeData={storeData} />
      <main className="flex-1">
        {children}
      </main>
      <StoreFooter storeData={storeData} />
      <ShoppingCart storeData={storeData} />
    </div>
  );
};
