
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  Building, 
  Users, 
  Package, 
  DollarSign,
  FileText,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  required: boolean;
}

export const OnboardingAssistant = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [showChat, setShowChat] = useState(false);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: "company-setup",
      title: "Company Information",
      description: "Set up your company details, logo, and branding",
      icon: Building,
      completed: false,
      required: true
    },
    {
      id: "team-setup",
      title: "Team Members",
      description: "Invite your team and set up permissions",
      icon: Users,
      completed: false,
      required: false
    },
    {
      id: "products-setup",
      title: "Product Catalog",
      description: "Add your window treatments, fabrics, and hardware",
      icon: Package,
      completed: false,
      required: true
    },
    {
      id: "pricing-setup",
      title: "Pricing Configuration",
      description: "Set up your pricing grids and markup rules",
      icon: DollarSign,
      completed: false,
      required: true
    },
    {
      id: "templates-setup",
      title: "Quote Templates",
      description: "Customize your quote and invoice templates",
      icon: FileText,
      completed: false,
      required: false
    },
    {
      id: "integrations-setup",
      title: "System Integrations",
      description: "Connect to ERP, Shopify, and other systems",
      icon: Settings,
      completed: false,
      required: false
    }
  ];

  const progress = (onboardingSteps.filter(step => step.completed).length / onboardingSteps.length) * 100;

  const quickStartTips = [
    {
      title: "Start with a Simple Quote",
      description: "Create your first quote for curtains or blinds to test the system",
      action: "Go to Jobs → New Job"
    },
    {
      title: "Upload Your Logo",
      description: "Add your company logo to appear on all quotes and documents",
      action: "Go to Settings → Business"
    },
    {
      title: "Set Up Basic Products",
      description: "Add your most common window treatments and pricing",
      action: "Go to Settings → Products"
    },
    {
      title: "Configure Pricing Rules",
      description: "Set up your markup percentages and pricing grids",
      action: "Go to Settings → Pricing"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-brand-primary to-brand-accent text-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8" />
            <div>
              <CardTitle className="text-2xl">Welcome to InterioApp! 🎉</CardTitle>
              <CardDescription className="text-white/90">
                Let's get your window covering business set up in just a few steps
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Setup Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="bg-white/20" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-brand-primary" />
            Quick Start Guide
          </CardTitle>
          <CardDescription>
            Follow these steps to create your first quote and get familiar with the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {quickStartTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-brand-primary">{tip.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{tip.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {tip.action}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Setup Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Checklist</CardTitle>
          <CardDescription>
            Complete these steps to get your business fully configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {onboardingSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    step.completed ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="flex-shrink-0">
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <IconComponent className="h-5 w-5 text-brand-primary" />
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                  {step.required && (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Chat Assistant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-brand-primary" />
            AI Setup Assistant
          </CardTitle>
          <CardDescription>
            Need help? Our AI assistant can guide you through any setup process
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showChat ? (
            <Button 
              onClick={() => setShowChat(true)}
              className="w-full bg-brand-primary hover:bg-brand-accent"
            >
              <Bot className="h-4 w-4 mr-2" />
              Start Chat with Setup Assistant
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="h-64 border rounded-lg p-4 bg-gray-50 overflow-y-auto">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Bot className="h-6 w-6 text-brand-primary flex-shrink-0 mt-1" />
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm">
                        Hi! I'm here to help you set up your window covering business. 
                        What would you like to start with?
                      </p>
                      <div className="mt-2 space-x-2">
                        <Button size="sm" variant="outline">Company Setup</Button>
                        <Button size="sm" variant="outline">Add Products</Button>
                        <Button size="sm" variant="outline">Pricing Setup</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Ask me anything about setting up your business..." />
                <Button>Send</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
