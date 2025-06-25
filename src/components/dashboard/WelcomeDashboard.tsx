
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
import { useNavigate } from "react-router-dom";

export const WelcomeDashboard = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const navigate = useNavigate();

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
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">Welcome to InterioApp! 🎉</h1>
            <p className="text-brand-neutral mt-2">
              Let's get your window covering business set up and ready to go
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowOnboarding(false)}
            className="self-start sm:self-auto"
          >
            Skip Setup
          </Button>
        </div>

        {/* Progress Card */}
        <Card className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Building className="h-8 w-8" />
              <div>
                <h2 className="text-xl font-semibold">Setup Progress</h2>
                <p className="text-white/90">Let's get your window covering business set up in just a few steps</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Setup Progress</span>
                <span className="text-sm font-medium">0% Complete</span>
              </div>
              <Progress value={0} className="h-2 bg-white/20" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Start Guide */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Card 
                    key={index} 
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                    onClick={() => navigate(action.action)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-medium text-sm mb-1">{action.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{action.description}</p>
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
              Complete these steps to set up your business for success
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gettingStartedSteps.map((step, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(step.action)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.completed ? 'bg-green-600 text-white' : 'border-2 border-gray-300 text-gray-600'
                  }`}>
                    {step.completed ? '✓' : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{step.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sample Data Notice */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 text-lg">Sample Data Notice</CardTitle>
            <CardDescription className="text-orange-700">
              You're currently viewing sample data to help you understand the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700 mb-4">
              All the clients, projects, and quotes you see are examples. Once you start adding your own data, 
              these examples will be replaced with your real business information.
            </p>
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => navigate("/clients")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Real Client
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Regular Dashboard Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">Dashboard</h1>
          <p className="text-brand-neutral mt-1">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <Button onClick={() => setShowOnboarding(true)} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Setup Guide
        </Button>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
              onClick={() => navigate(action.action)}
            >
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
    </div>
  );
};
