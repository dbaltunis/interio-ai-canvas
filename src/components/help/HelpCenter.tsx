import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Search, 
  Store, 
  Package, 
  FileText, 
  Calendar,
  Settings,
  HelpCircle,
  ExternalLink,
  Video,
  MessageSquare
} from "lucide-react";
import { useState } from "react";

const documentationSections = [
  {
    title: "Online Store",
    icon: Store,
    description: "Complete guide to managing your e-commerce store",
    link: "/docs/online-store.md",
    topics: [
      "Store setup and templates",
      "Product filtering and management",
      "Page editor and customization",
      "SEO and analytics",
      "Customer inquiry handling"
    ]
  },
  {
    title: "Inventory Management",
    icon: Package,
    description: "Organize and track your product catalog",
    topics: [
      "Adding products",
      "Categories and organization",
      "Stock management",
      "Product images and descriptions"
    ]
  },
  {
    title: "Quotes & Pricing",
    icon: FileText,
    description: "Create professional quotes and manage pricing",
    topics: [
      "Building quotes",
      "Custom templates",
      "Pricing strategies",
      "Sending to clients"
    ]
  },
  {
    title: "Calendar & Appointments",
    icon: Calendar,
    description: "Schedule and manage client appointments",
    topics: [
      "Booking appointments",
      "Calendar sync",
      "Reminders",
      "Client management"
    ]
  },
  {
    title: "Settings & Customization",
    icon: Settings,
    description: "Configure your account and preferences",
    topics: [
      "Business settings",
      "Brand customization",
      "Integrations",
      "Team management"
    ]
  }
];

const quickLinks = [
  { title: "Getting Started Guide", icon: BookOpen, href: "#" },
  { title: "Video Tutorials", icon: Video, href: "#" },
  { title: "FAQ", icon: HelpCircle, href: "#" },
  { title: "Community Forum", icon: MessageSquare, href: "#" },
];

export const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Help Center</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find answers, learn best practices, and get the most out of InterioApp
        </p>
        
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Card key={link.title} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <link.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{link.title}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Topics</TabsTrigger>
          <TabsTrigger value="store">Online Store</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {documentationSections.map((section) => (
              <Card key={section.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <section.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {section.title}
                        {section.link && (
                          <a 
                            href={section.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-auto"
                          >
                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </a>
                        )}
                      </CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.topics.map((topic) => (
                      <li key={topic} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="store">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    Online Store Documentation
                    <a 
                      href="/docs/online-store.md" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-auto"
                    >
                      <Button variant="outline" size="sm">
                        View Full Guide <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </CardTitle>
                  <CardDescription>
                    Everything you need to know about managing your online store
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Quick Topics</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Getting Started",
                    "Product Management",
                    "Page Editor",
                    "Store Settings",
                    "Product Filtering",
                    "Customer Inquiries",
                    "SEO & Analytics",
                    "Best Practices"
                  ].map((topic) => (
                    <div key={topic} className="p-3 rounded-lg border hover:border-primary hover:bg-accent/50 transition-colors cursor-pointer">
                      <p className="text-sm font-medium">{topic}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Learn how to organize and track your products</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes">
          <Card>
            <CardHeader>
              <CardTitle>Quotes & Pricing</CardTitle>
              <CardDescription>Create professional quotes and manage pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
          <CardDescription>
            Can't find what you're looking for? Get in touch with our support team
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
          <Button variant="outline">
            <Video className="h-4 w-4 mr-2" />
            Watch Tutorials
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
