
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectJobsContent } from "./ProjectJobsContent";
import { Home, Package, Building, Scissors, Ruler, ShoppingCart, Wrench } from "lucide-react";

interface ProjectTypeHandlerProps {
  project: any;
  rooms: any[];
  onCreateRoom: () => void;
  isCreatingRoom: boolean;
  onProjectUpdate?: (updatedProject: any) => void;
}

export const ProjectTypeHandler = ({ 
  project, 
  rooms, 
  onCreateRoom, 
  isCreatingRoom,
  onProjectUpdate 
}: ProjectTypeHandlerProps) => {
  const [projectTypeConfig, setProjectTypeConfig] = useState<any>(null);

  useEffect(() => {
    // Parse project type from project description or a dedicated field
    const projectType = project?.project_type || 'residential-custom';
    
    const typeConfigs = {
      'residential-custom': {
        name: 'Residential Custom',
        icon: Home,
        color: 'blue',
        requiresRooms: true,
        requiresWindows: true,
        features: ['Rooms Management', 'Window Measurements', 'Fabric Selection', 'Installation'],
        workflow: ['Client Info', 'Room Setup', 'Window Measurements', 'Product Selection', 'Quote', 'Production']
      },
      'commercial-hospitality': {
        name: 'Commercial/Hospitality',
        icon: Building,
        color: 'purple',
        requiresRooms: true,
        requiresWindows: true,
        features: ['Bulk Room Creation', 'Standardized Measurements', 'Volume Pricing', 'Project Management'],
        workflow: ['Client Info', 'Property Assessment', 'Bulk Configuration', 'Volume Quote', 'Production Planning']
      },
      'ready-made-retail': {
        name: 'Ready-Made Retail',
        icon: ShoppingCart,
        color: 'green',
        requiresRooms: false,
        requiresWindows: false,
        features: ['Product Catalog', 'Simple Ordering', 'Inventory Management', 'Quick Checkout'],
        workflow: ['Client Info', 'Product Selection', 'Quantity & Sizing', 'Quote/Order', 'Fulfillment']
      },
      'hardware-supplies': {
        name: 'Hardware & Supplies',
        icon: Wrench,
        color: 'orange',
        requiresRooms: false,
        requiresWindows: false,
        features: ['Hardware Catalog', 'Bulk Ordering', 'Technical Specs', 'Installation Guides'],
        workflow: ['Client Info', 'Hardware Selection', 'Quantity Planning', 'Quote', 'Supply']
      },
      'alteration-repair': {
        name: 'Alteration & Repair',
        icon: Scissors,
        color: 'yellow',
        requiresRooms: false,
        requiresWindows: false,
        features: ['Service Types', 'Condition Assessment', 'Before/After Photos', 'Service Pricing'],
        workflow: ['Client Info', 'Item Assessment', 'Service Selection', 'Quote', 'Service Delivery']
      },
      'measurement-only': {
        name: 'Measurement Service',
        icon: Ruler,
        color: 'indigo',
        requiresRooms: true,
        requiresWindows: true,
        features: ['Room Mapping', 'Precise Measurements', 'Photo Documentation', 'Reports'],
        workflow: ['Client Info', 'Site Visit', 'Measurements', 'Documentation', 'Report Delivery']
      }
    };

    setProjectTypeConfig(typeConfigs[projectType as keyof typeof typeConfigs] || typeConfigs['residential-custom']);
  }, [project]);

  if (!projectTypeConfig) {
    return <div>Loading project configuration...</div>;
  }

  const Icon = projectTypeConfig.icon;

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "border-blue-200 bg-blue-50",
      purple: "border-purple-200 bg-purple-50",
      green: "border-green-200 bg-green-50",
      orange: "border-orange-200 bg-orange-50",
      yellow: "border-yellow-200 bg-yellow-50",
      indigo: "border-indigo-200 bg-indigo-50",
    };
    return colorMap[color] || "border-gray-200 bg-gray-50";
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
      {/* Project Type Overview */}
      <Card className={`${getColorClasses(projectTypeConfig.color)} border-2`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon className={`h-8 w-8 ${getIconColor(projectTypeConfig.color)}`} />
              <div>
                <CardTitle className="text-xl">{projectTypeConfig.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Optimized workflow for {projectTypeConfig.name.toLowerCase()} projects
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {projectTypeConfig.features.slice(0, 3).map((feature: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Key Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {projectTypeConfig.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-current rounded-full opacity-60" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Workflow Steps:</h4>
              <div className="flex flex-wrap gap-1">
                {projectTypeConfig.workflow.map((step: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {index + 1}. {step}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Content based on type */}
      {projectTypeConfig.requiresRooms ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {projectTypeConfig.name === 'Measurement Service' ? 'Measurement Areas' : 'Rooms'}
            </h3>
            <Button onClick={onCreateRoom} disabled={isCreatingRoom}>
              Add {projectTypeConfig.name === 'Measurement Service' ? 'Area' : 'Room'}
            </Button>
          </div>
          
          <ProjectJobsContent 
            rooms={rooms || []} 
            project={project}
            onCreateRoom={onCreateRoom}
            isCreatingRoom={isCreatingRoom}
          />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Project Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {projectTypeConfig.name === 'Ready-Made Retail' ? 'Add Products' : 
                 projectTypeConfig.name === 'Hardware & Supplies' ? 'Add Hardware Items' :
                 'Add Service Items'}
              </h3>
              <p className="text-gray-500 mb-4">
                {projectTypeConfig.name === 'Ready-Made Retail' ? 'Browse and add ready-made products to this order' :
                 projectTypeConfig.name === 'Hardware & Supplies' ? 'Add curtain rods, tracks, and accessories' :
                 'Add services and items for this project'}
              </p>
              <Button>
                {projectTypeConfig.name === 'Ready-Made Retail' ? 'Browse Products' :
                 projectTypeConfig.name === 'Hardware & Supplies' ? 'Add Hardware' :
                 'Add Services'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
