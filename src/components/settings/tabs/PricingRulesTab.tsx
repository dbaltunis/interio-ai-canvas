
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calculator, Percent } from "lucide-react";
import { PricingRulesSection } from "../pricing/PricingRulesSection";

export const PricingRulesTab = () => {
  return (
    <div className="space-y-6">
      {/* Global Pricing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand-primary" />
            Global Pricing Settings
          </CardTitle>
          <CardDescription>Base settings that apply to all calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
              <Input id="defaultMarkup" type="number" step="0.1" defaultValue="40.0" />
            </div>
            <div>
              <Label htmlFor="laborMarkup">Labor Markup (%)</Label>
              <Input id="laborMarkup" type="number" step="0.1" defaultValue="25.0" />
            </div>
            <div>
              <Label htmlFor="materialMarkup">Material Markup (%)</Label>
              <Input id="materialMarkup" type="number" step="0.1" defaultValue="50.0" />
            </div>
            <div>
              <Label htmlFor="minimumMargin">Minimum Margin (%)</Label>
              <Input id="minimumMargin" type="number" step="0.1" defaultValue="20.0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Dynamic Pricing</h4>
                <p className="text-sm text-brand-neutral">Adjust prices based on market conditions</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Quantity Discounts</h4>
                <p className="text-sm text-brand-neutral">Apply automatic bulk discounts</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">Save Global Settings</Button>
        </CardContent>
      </Card>

      {/* Pricing Rules Management */}
      <PricingRulesSection />

      {/* Category-Specific Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-brand-primary" />
            Category-Specific Markup
          </CardTitle>
          <CardDescription>Set different markup rates for product categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="curtainMarkup">Curtains & Drapes (%)</Label>
              <Input id="curtainMarkup" type="number" step="0.1" defaultValue="45.0" />
            </div>
            <div>
              <Label htmlFor="blindMarkup">Blinds (%)</Label>
              <Input id="blindMarkup" type="number" step="0.1" defaultValue="40.0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shutterMarkup">Shutters (%)</Label>
              <Input id="shutterMarkup" type="number" step="0.1" defaultValue="55.0" />
            </div>
            <div>
              <Label htmlFor="hardwareMarkup">Hardware (%)</Label>
              <Input id="hardwareMarkup" type="number" step="0.1" defaultValue="35.0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fabricMarkup">Fabrics (%)</Label>
              <Input id="fabricMarkup" type="number" step="0.1" defaultValue="50.0" />
            </div>
            <div>
              <Label htmlFor="installationMarkup">Installation (%)</Label>
              <Input id="installationMarkup" type="number" step="0.1" defaultValue="25.0" />
            </div>
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">Save Category Pricing</Button>
        </CardContent>
      </Card>
    </div>
  );
};
