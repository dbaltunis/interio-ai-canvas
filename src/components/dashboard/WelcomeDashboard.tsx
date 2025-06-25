
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  Building, 
  Users, 
  Package, 
  DollarSign, 
  FileText, 
  Settings,
  Plus,
  Calculator,
  Calendar
} from "lucide-react";
import { OnboardingAssistant } from "@/components/ai/OnboardingAssistant";
import { useState } from "react";

export const WelcomeDashboard = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);

  const quickActions = [
    {
      title: "Create Your First Quote",
      description: "Start with a simple curtain or blind quote",
      icon: Calculator,
      action: "/jobs/new",
      color: "bg-blue-500"
    },
    {
      title: "Add Products",
      description: "Set up your product catalog",
      icon: Package,
      action: "/settings?tab=products",
      color: "bg-green-500"
    },
    {
      title: "Schedule Appointment",
      description: "Book a consultation or installation",
      icon: Calendar,
      action: "/calendar",
      color: "bg-purple-500"
    },
    {
      title: "Business Settings",
      description: "Configure your company information",
      icon: Settings,
      action: "/settings",
      color: "bg-orange-500"
    }
  ];

  const gettingStartedSteps = [
    {
      title: "Set up company information",
      description: "Add your logo, contact details, and business settings",
      completed: false,
      action: "/settings?tab=business"
    },
    {
      title: "Add your products",
      description: "Create your catalog of window treatments and hardware",
      completed: false,
      action: "/settings?tab=products"
    },
    {
      title: "Configure pricing",
      description: "Set up your pricing grids and markup rules",
      completed: false,
      action: "/settings?tab=pricing"
    },
    {
      title: "Create your first quote",
      description: "Test the system with a sample project",
      completed: false,
      action: "/jobs/new"
    }
  ];

  if (showOnboarding) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary">Welcome to InterioApp!</h1>
            <p className="text-brand-neutral">
              Let's get your window covering business set up and ready to go
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowOnboarding(false)}
          >
            Skip Setup
          </Button>
        </div>
        <OnboardingAssistant />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Dashboard</h1>
          <p className="text-brand-neutral">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <Button onClick={() => setShowOnboarding(true)} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Setup Guide
        </Button>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-brand-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{action.title}</h3>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started Checklist</CardTitle>
          <CardDescription>
            Complete these steps to set up your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gettingStartedSteps.map((step, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-600 text-white' : 'border-2 border-gray-300'
                }`}>
                  {step.completed ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sample Data Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Sample Data Notice</CardTitle>
          <CardDescription className="text-orange-700">
            You're currently viewing sample data to help you understand the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-orange-700 mb-4">
            All the clients, projects, and quotes you see are examples. Once you start adding your own data, 
            these examples will be replaced with your real business information.
          </p>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Real Client
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
