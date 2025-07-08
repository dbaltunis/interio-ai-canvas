import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectCreationWizard } from "../project-wizard/ProjectCreationWizard";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  FolderOpen, 
  Home, 
  Square, 
  Shirt, 
  Calculator, 
  CheckCircle,
  ArrowRight
} from "lucide-react";

export const QuickStartGuide = () => {
  const [showWizard, setShowWizard] = useState(false);
  const navigate = useNavigate();

  const handleProjectCreated = (projectId: string) => {
    // Navigate to the project jobs page
    navigate(`/projects/${projectId}/jobs`);
  };

  const steps = [
    {
      title: "Create a Project",
      description: "Start by creating a new project and selecting your client",
      icon: <FolderOpen className="h-6 w-6" />,
      action: () => setShowWizard(true),
      actionText: "Create Project",
      completed: false
    },
    {
      title: "Add Rooms",
      description: "Create rooms where window treatments will be installed",
      icon: <Home className="h-6 w-6" />,
      completed: false
    },
    {
      title: "Add Windows & Surfaces",
      description: "Add windows and walls to each room with measurements",
      icon: <Square className="h-6 w-6" />,
      completed: false
    },
    {
      title: "Select Treatments",
      description: "Choose window coverings from your product templates",
      icon: <Shirt className="h-6 w-6" />,
      completed: false
    },
    {
      title: "Configure & Calculate",
      description: "Set measurements, options, and calculate costs",
      icon: <Calculator className="h-6 w-6" />,
      completed: false
    }
  ];

  return (
    <>
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-blue-900">Quick Start Guide</CardTitle>
              <CardDescription className="text-blue-700">
                Create your first project with rooms, windows, and treatments
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="flex items-center space-x-4 p-3 bg-white rounded-lg border border-blue-200"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {step.completed ? <CheckCircle className="h-5 w-5" /> : step.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      Step {index + 1}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                </div>
                
                {step.action && (
                  <Button
                    size="sm"
                    onClick={step.action}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <span>{step.actionText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Complete Workflow</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Follow these steps to create professional quotes with accurate measurements and pricing
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">5</div>
                <div className="text-xs text-gray-500">Simple Steps</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProjectCreationWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onProjectCreated={handleProjectCreated}
      />
    </>
  );
};