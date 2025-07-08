
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Package, 
  Building, 
  Scissors, 
  Ruler, 
  ShoppingCart,
  Wrench,
  FileText
} from "lucide-react";

interface ProjectType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  workflow: string[];
  color: string;
}

const projectTypes: ProjectType[] = [
  {
    id: "residential-custom",
    name: "Residential Custom",
    description: "Full-service residential curtains & blinds with rooms and windows",
    icon: Home,
    features: ["Rooms Management", "Window Measurements", "Fabric Selection", "Installation"],
    workflow: ["Client Info", "Room Setup", "Window Measurements", "Product Selection", "Quote", "Production"],
    color: "blue"
  },
  {
    id: "commercial-hospitality",
    name: "Commercial/Hospitality",
    description: "Large-scale commercial projects with multiple rooms and bulk orders",
    icon: Building,
    features: ["Bulk Room Creation", "Standardized Measurements", "Volume Pricing", "Project Management"],
    workflow: ["Client Info", "Property Assessment", "Bulk Configuration", "Volume Quote", "Production Planning"],
    color: "purple"
  },
  {
    id: "ready-made-retail",
    name: "Ready-Made Retail",
    description: "Pre-made products, simple ordering without room/window setup",
    icon: ShoppingCart,
    features: ["Product Catalog", "Simple Ordering", "Inventory Management", "Quick Checkout"],
    workflow: ["Client Info", "Product Selection", "Quantity & Sizing", "Quote/Order", "Fulfillment"],
    color: "green"
  },
  {
    id: "hardware-supplies",
    name: "Hardware & Supplies",
    description: "Curtain rods, tracks, accessories without window treatments",
    icon: Wrench,
    features: ["Hardware Catalog", "Bulk Ordering", "Technical Specs", "Installation Guides"],
    workflow: ["Client Info", "Hardware Selection", "Quantity Planning", "Quote", "Supply"],
    color: "orange"
  },
  {
    id: "alteration-repair",
    name: "Alteration & Repair",
    description: "Existing curtain alterations and repair services",
    icon: Scissors,
    features: ["Service Types", "Condition Assessment", "Before/After Photos", "Service Pricing"],
    workflow: ["Client Info", "Item Assessment", "Service Selection", "Quote", "Service Delivery"],
    color: "yellow"
  },
  {
    id: "measurement-only",
    name: "Measurement Service",
    description: "Professional measuring service for other retailers",
    icon: Ruler,
    features: ["Room Mapping", "Precise Measurements", "Photo Documentation", "Reports"],
    workflow: ["Client Info", "Site Visit", "Measurements", "Documentation", "Report Delivery"],
    color: "indigo"
  }
];

interface ProjectTypeSelectorProps {
  onSelectType: (type: ProjectType) => void;
  onCancel: () => void;
}

export const ProjectTypeSelector = ({ onSelectType, onCancel }: ProjectTypeSelectorProps) => {
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "border-blue-200 hover:border-blue-300 hover:bg-blue-50",
      purple: "border-purple-200 hover:border-purple-300 hover:bg-purple-50",
      green: "border-green-200 hover:border-green-300 hover:bg-green-50",
      orange: "border-orange-200 hover:border-orange-300 hover:bg-orange-50",
      yellow: "border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50",
      indigo: "border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50",
    };
    return colorMap[color] || "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
  };

  const getIconColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "text-blue-600",
      purple: "text-purple-600",
      green: "text-green-600",
      orange: "text-orange-600",
      yellow: "text-yellow-600",
      indigo: "text-indigo-600",
    };
    return colorMap[color] || "text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">What Type of Project?</h2>
        <p className="text-muted-foreground">
          Choose the project type that best matches your business model and workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projectTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card 
              key={type.id} 
              className={`cursor-pointer transition-all duration-200 ${getColorClasses(type.color)}`}
              onClick={() => onSelectType(type)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-6 w-6 ${getIconColor(type.color)}`} />
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {type.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Workflow:</h4>
                  <ol className="text-xs text-muted-foreground space-y-1">
                    {type.workflow.map((step, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
