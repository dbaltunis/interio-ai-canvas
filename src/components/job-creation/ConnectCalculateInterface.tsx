
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Link, Settings } from "lucide-react";

interface ConnectCalculateInterfaceProps {
  projectId: string;
  onCalculate?: () => void;
}

export const ConnectCalculateInterface = ({ projectId, onCalculate }: ConnectCalculateInterfaceProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Calculate & Connect</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="flex items-center justify-center space-x-2 h-20 flex-col">
            <Calculator className="h-6 w-6" />
            <span>Calculate Fabric Usage</span>
          </Button>
          
          <Button variant="outline" className="flex items-center justify-center space-x-2 h-20 flex-col">
            <Link className="h-6 w-6" />
            <span>Connect Inventory</span>
          </Button>
          
          <Button variant="outline" className="flex items-center justify-center space-x-2 h-20 flex-col">
            <Settings className="h-6 w-6" />
            <span>Pricing Setup</span>
          </Button>
        </div>
        
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Quick Actions:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Calculate fabric requirements based on measurements</li>
            <li>Connect treatments to inventory items</li>
            <li>Set up pricing rules and calculations</li>
            <li>Generate material orders</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
