import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Code, Database, Settings, Users, FileText } from "lucide-react";

const DocumentationPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Application Documentation
        </h1>
        <p className="text-muted-foreground">
          Comprehensive guides and references for using this application
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Getting Started
            </CardTitle>
            <CardDescription>
              Learn the basics of navigating and using the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Dashboard Overview</AccordionTrigger>
                <AccordionContent>
                  The dashboard provides a quick overview of your projects, clients, and recent activities. 
                  You can access different sections using the navigation menu at the top.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Navigation</AccordionTrigger>
                <AccordionContent>
                  Use the top navigation bar to switch between Dashboard, Projects, Clients, Library, and other sections.
                  On mobile devices, the navigation is accessible via the bottom bar.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Projects Management
            </CardTitle>
            <CardDescription>
              How to create, manage, and track your projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Creating a Project</AccordionTrigger>
                <AccordionContent>
                  Navigate to the Projects tab and click "New Project". Fill in the project details including
                  client information, deadlines, and specifications.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Project Workflow</AccordionTrigger>
                <AccordionContent>
                  Projects move through different stages: Inquiry, Quote Sent, In Production, Ready for Delivery, and Delivered.
                  Update the status as you progress to keep everything organized.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Library & Inventory
            </CardTitle>
            <CardDescription>
              Managing materials, fabrics, and resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Adding Materials</AccordionTrigger>
                <AccordionContent>
                  Go to Library/Inventory to add new fabrics, trims, and other materials. Track quantities,
                  costs, and suppliers for better inventory management.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Using Materials in Projects</AccordionTrigger>
                <AccordionContent>
                  When creating a project, you can select materials from your library. The system will
                  automatically calculate costs and track inventory usage.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings & Configuration
            </CardTitle>
            <CardDescription>
              Customize your application experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Profile Settings</AccordionTrigger>
                <AccordionContent>
                  Update your profile information, business details, and contact preferences in the Settings section.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Theme & Display</AccordionTrigger>
                <AccordionContent>
                  Choose between light and dark themes, and customize the display to match your preferences.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Support</h3>
            <p className="text-sm text-muted-foreground">
              If you encounter any issues or have questions, use the bug report button (bottom right) to report bugs and view all issues.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Tips & Tricks</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Use keyboard shortcuts for faster navigation</li>
              <li>Set up recurring tasks for regular maintenance</li>
              <li>Utilize filters and search to find information quickly</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentationPage;
