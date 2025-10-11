import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComprehensiveCalculator } from "@/components/calculator/ComprehensiveCalculator";
import { WallpaperCalculator } from "@/components/calculator/WallpaperCalculator";
import { Wallpaper, Sparkles } from "lucide-react";

export const CalculatorPage = () => {
  const [activeTab, setActiveTab] = useState("curtains");

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Product Calculators</h1>
        <p className="text-muted-foreground">
          Calculate requirements and pricing for different product types
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="curtains" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Curtains & Blinds
          </TabsTrigger>
          <TabsTrigger value="wallpaper" className="flex items-center gap-2">
            <Wallpaper className="h-4 w-4" />
            Wallpaper
          </TabsTrigger>
        </TabsList>

        <TabsContent value="curtains">
          <ComprehensiveCalculator />
        </TabsContent>

        <TabsContent value="wallpaper">
          <WallpaperCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalculatorPage;
