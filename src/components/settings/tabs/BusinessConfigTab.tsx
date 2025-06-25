
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Building, Mail, Phone, MapPin, Clock, Percent } from "lucide-react";

export const BusinessConfigTab = () => {
  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-brand-primary" />
            Company Information
          </CardTitle>
          <CardDescription>Basic business details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" placeholder="Your Company Ltd" />
            </div>
            <div>
              <Label htmlFor="abn">ABN/Tax Number</Label>
              <Input id="abn" placeholder="12 345 678 901" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Business Email</Label>
              <Input id="email" type="email" placeholder="info@company.com" />
            </div>
            <div>
              <Label htmlFor="phone">Business Phone</Label>
              <Input id="phone" type="tel" placeholder="+61 2 1234 5678" />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Business Address</Label>
            <Textarea id="address" placeholder="123 Business St, City, State, Postcode" />
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">Save Company Details</Button>
        </CardContent>
      </Card>

      {/* Default Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-brand-primary" />
            Default Business Rules
          </CardTitle>
          <CardDescription>Set default values for calculations and quotes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="defaultTax">Default Tax Rate (%)</Label>
              <Input id="defaultTax" type="number" step="0.01" placeholder="10.00" />
            </div>
            <div>
              <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
              <Input id="defaultMarkup" type="number" step="0.01" placeholder="40.00" />
            </div>
            <div>
              <Label htmlFor="laborRate">Labor Rate ($/hour)</Label>
              <Input id="laborRate" type="number" step="0.01" placeholder="85.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quoteValidity">Quote Validity (days)</Label>
              <Input id="quoteValidity" type="number" placeholder="30" />
            </div>
            <div>
              <Label htmlFor="installationLead">Installation Lead Time (days)</Label>
              <Input id="installationLead" type="number" placeholder="14" />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium text-brand-primary">Business Hours</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="openTime">Opening Time</Label>
                <Input id="openTime" type="time" defaultValue="09:00" />
              </div>
              <div>
                <Label htmlFor="closeTime">Closing Time</Label>
                <Input id="closeTime" type="time" defaultValue="17:00" />
              </div>
            </div>
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">Save Default Settings</Button>
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-primary" />
            Automation Settings
          </CardTitle>
          <CardDescription>Configure automatic processes and notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-generate Work Orders</h4>
              <p className="text-sm text-brand-neutral">Automatically create work orders when quotes are accepted</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-calculate Fabric Requirements</h4>
              <p className="text-sm text-brand-neutral">Automatically calculate fabric quantities based on measurements</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Quote Notifications</h4>
              <p className="text-sm text-brand-neutral">Send automatic emails when quotes are generated</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Low Stock Alerts</h4>
              <p className="text-sm text-brand-neutral">Notify when inventory levels are low</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">Save Automation Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
};
