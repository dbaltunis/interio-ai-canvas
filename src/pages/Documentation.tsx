import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Search, BookOpen, Home, Briefcase, Users, Package, 
  Calendar, Settings, Shield, Zap, BarChart3, ShoppingCart,
  FileText, MessageSquare, Wrench, DollarSign, Globe,
  ChevronRight, ExternalLink
} from "lucide-react";

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("getting-started");

  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: BookOpen,
      subsections: [
        { id: "overview", title: "Application Overview", content: "InteriorApp is a comprehensive business management platform designed specifically for interior design professionals, curtain installers, and window treatment specialists." },
        { id: "dashboard", title: "Dashboard Navigation", content: "The dashboard provides a centralized view of your business metrics, recent activity, and quick access to key features. Navigate using the top navigation bar or sidebar menu." },
        { id: "first-steps", title: "First Steps Guide", content: "1. Set up your business profile in Settings\n2. Add your first client\n3. Create inventory items\n4. Set up your pricing structure\n5. Create your first job" },
      ]
    },
    {
      id: "jobs",
      title: "Jobs & Projects",
      icon: Briefcase,
      subsections: [
        { id: "job-creation", title: "Creating Jobs", content: "Create new jobs from Dashboard > New Job. Choose between Quote or Project type. Fill in client details, room measurements, and treatment specifications." },
        { id: "job-templates", title: "Job Templates", content: "Use pre-configured treatment templates for faster job creation. Templates include fabric calculations, hardware requirements, and labor estimates." },
        { id: "pricing", title: "Pricing & Quotes", content: "Automatic pricing calculations based on:\n- Material costs and markup percentages\n- Labor rates and installation time\n- Custom pricing rules per treatment type\n- Quantity discounts and bulk pricing" },
        { id: "status-tracking", title: "Job Status & Workflow", content: "Track job progress through customizable status stages:\n- Quote → Approved → In Progress → Installed → Completed\nSet default statuses and create custom workflows for your business." },
        { id: "measurements", title: "Measurement Tools", content: "Built-in measurement wizard for accurate window treatment calculations. Supports multiple measurement systems (metric/imperial) and auto-calculates fabric requirements." },
      ]
    },
    {
      id: "clients",
      title: "Client Management",
      icon: Users,
      subsections: [
        { id: "client-profiles", title: "Client Profiles", content: "Manage client information including:\n- Contact details and addresses\n- Project history and spending\n- Communication preferences\n- Custom notes and tags" },
        { id: "communication", title: "Client Communication", content: "Send quotes, invoices, and updates via email. Track communication history and schedule follow-ups." },
        { id: "access-requests", title: "Client Access & Permissions", content: "Grant clients access to view their projects and quotes. Control visibility of pricing and internal notes." },
      ]
    },
    {
      id: "inventory",
      title: "Inventory Library",
      icon: Package,
      subsections: [
        { id: "fabrics", title: "Fabric Management", content: "Track fabric inventory including:\n- SKU, supplier, and pricing information\n- Width, repeat, and composition details\n- Stock levels and reorder points\n- Images and color swatches" },
        { id: "hardware", title: "Hardware & Tracks", content: "Manage curtain tracks, poles, brackets, and accessories. Track stock levels and supplier information." },
        { id: "wallcoverings", title: "Wallcoverings", content: "Catalog wallpaper and wall covering products with pricing, stock levels, and specifications." },
        { id: "vendors", title: "Vendor Management", content: "Maintain vendor database with:\n- Contact information\n- Product catalogs\n- Pricing agreements\n- Lead times and delivery details" },
        { id: "stock-tracking", title: "Stock Tracking", content: "Monitor inventory levels in real-time. Set automatic reorder alerts when stock falls below threshold levels." },
        { id: "import-export", title: "Import/Export Tools", content: "Bulk import inventory from spreadsheets. Export current stock levels and pricing for reporting." },
      ]
    },
    {
      id: "online-store",
      title: "Online Store",
      icon: ShoppingCart,
      subsections: [
        { id: "store-setup", title: "Store Setup", content: "Launch your own online store to showcase products:\n1. Choose from 5 professional templates\n2. Customize branding and colors\n3. Add products from your inventory\n4. Publish and share your store URL" },
        { id: "templates", title: "Store Templates", content: "Available templates:\n- Modern Minimalist\n- Classic Elegance\n- Bold Showcase\n- Professional Business\n- Portfolio Style" },
        { id: "product-management", title: "Product Visibility", content: "Control which inventory items appear on your store. Mark products as featured to highlight them on the homepage." },
        { id: "inquiries", title: "Quote Requests", content: "Customers can submit quote requests directly from your store. Manage inquiries from the Store Dashboard." },
      ]
    },
    {
      id: "calendar",
      title: "Calendar & Appointments",
      icon: Calendar,
      subsections: [
        { id: "calendar-view", title: "Calendar Management", content: "View and manage appointments in daily, weekly, or monthly views. Color-code appointments by type or status." },
        { id: "scheduling", title: "Appointment Scheduling", content: "Create appointments with:\n- Client selection\n- Date, time, and duration\n- Location (office, client site, video call)\n- Team member assignments\n- Automated reminders" },
        { id: "booking-links", title: "Public Booking Links", content: "Create shareable booking links for clients to self-schedule appointments. Set availability windows and buffer times." },
        { id: "notifications", title: "Appointment Notifications", content: "Automated email and SMS reminders sent to clients before appointments. Customizable notification timing." },
        { id: "video-meetings", title: "Video Conferencing", content: "Integrate Google Meet links directly into appointments for virtual consultations." },
      ]
    },
    {
      id: "team",
      title: "Team & Permissions",
      icon: Shield,
      subsections: [
        { id: "roles", title: "User Roles", content: "Built-in role system:\n- Owner: Full access to all features\n- Admin: Manage users and settings\n- Manager: Create and edit jobs\n- Staff: View-only access to assigned jobs\n- Custom: Define specific permissions" },
        { id: "permissions", title: "Permission Management", content: "Granular permission controls for:\n- View/Edit jobs and quotes\n- Manage inventory\n- Access client information\n- View vendor costs and profit margins\n- Export data and reports" },
        { id: "collaboration", title: "Team Collaboration", content: "Share jobs with team members. Assign tasks and track completion. Internal messaging and notifications." },
      ]
    },
    {
      id: "integrations",
      title: "Integrations & APIs",
      icon: Globe,
      subsections: [
        { id: "shopify", title: "Shopify Integration", content: "Connect your Shopify store to sync:\n- Products and inventory levels\n- Orders and customer data\n- Automated order creation in InteriorApp\n- Real-time stock updates\n\nSetup:\n1. Navigate to Library > Shopify\n2. Click 'Connect Shopify Store'\n3. Authorize access to your Shopify account\n4. Configure sync settings" },
        { id: "erp", title: "ERP Integration", content: "Integration with enterprise resource planning systems for:\n- Automated invoice generation\n- Purchase order management\n- Financial reporting sync\n- Inventory synchronization" },
        { id: "api-access", title: "InteriorApp API", content: "RESTful API for custom integrations:\n\nBase URL: https://api.interiorapp.com/v1\n\nAuthentication:\n- API Key required in header: Authorization: Bearer YOUR_API_KEY\n- Generate API keys in Settings > Integrations\n\nKey Endpoints:\n- GET /jobs - List all jobs\n- POST /jobs - Create new job\n- GET /inventory - Fetch inventory items\n- POST /clients - Create client record\n\nRate Limits: 1000 requests/hour" },
        { id: "webhooks", title: "Webhook Events", content: "Subscribe to real-time events:\n- job.created\n- job.status_changed\n- client.created\n- inventory.low_stock\n- order.received\n\nConfigure webhook URLs in Settings > Integrations > Webhooks" },
      ]
    },
    {
      id: "business-settings",
      title: "Business Settings",
      icon: Settings,
      subsections: [
        { id: "company-profile", title: "Company Profile", content: "Configure business details:\n- Company name, logo, and branding\n- Business address and contact info\n- Tax ID and registration numbers\n- Email and phone for customer communications" },
        { id: "pricing-rules", title: "Pricing & Markup", content: "Set pricing strategies:\n- Default markup percentages by category\n- Material markup: 40% (configurable)\n- Labor markup: 30% (configurable)\n- Minimum profit margin: 20%\n- Category-specific markups for fabrics, hardware, installation" },
        { id: "measurement-units", title: "Measurement Units", content: "Choose measurement system:\n- Metric (meters, centimeters)\n- Imperial (feet, inches)\n- Mixed mode for international projects\n\nUnit conversion handled automatically in calculations." },
        { id: "tax-settings", title: "Tax Configuration", content: "Configure tax settings:\n- GST/VAT rate configuration\n- Tax-inclusive vs tax-exclusive pricing\n- Multiple tax rates for different regions\n- Tax exemption handling" },
        { id: "features", title: "Feature Toggles", content: "Enable/disable optional features:\n- Order batching for supplier orders\n- Leftover fabric tracking\n- Multi-location inventory\n- Automated material extraction from quotes\n- Custom branding on documents" },
      ]
    },
    {
      id: "automation",
      title: "Automation & Workflows",
      icon: Zap,
      subsections: [
        { id: "workflows", title: "Automated Workflows", content: "Create automation rules:\n- Send quote when status changes to 'Quoted'\n- Create task when job approved\n- Send reminder emails before appointments\n- Update inventory on job completion\n- Notify team when quote requested" },
        { id: "email-templates", title: "Email Templates", content: "Customize automated email templates for:\n- Quote delivery\n- Invoice reminders\n- Appointment confirmations\n- Order status updates\n- Welcome messages for new clients" },
        { id: "notifications", title: "Notification Settings", content: "Configure notification preferences:\n- Email notifications for key events\n- In-app notifications\n- SMS alerts (optional)\n- Desktop push notifications\n- Notification frequency controls" },
      ]
    },
    {
      id: "reporting",
      title: "Reports & Analytics",
      icon: BarChart3,
      subsections: [
        { id: "sales-reports", title: "Sales Reports", content: "Track business performance:\n- Revenue by period (daily, weekly, monthly)\n- Average job value\n- Conversion rates (quote to project)\n- Top clients by revenue\n- Product category performance" },
        { id: "inventory-reports", title: "Inventory Analytics", content: "Monitor inventory health:\n- Stock levels and reorder alerts\n- Slow-moving inventory\n- Stock value reports\n- Supplier performance analysis\n- Usage trends by product" },
        { id: "job-analytics", title: "Job Analytics", content: "Analyze job performance:\n- Jobs by status and completion time\n- Bottleneck identification\n- Team productivity metrics\n- Profit margin analysis\n- Material waste tracking" },
        { id: "custom-reports", title: "Custom Reports", content: "Create custom reports with filters:\n- Date ranges\n- Client segments\n- Product categories\n- Team members\n- Geographic regions\n\nExport reports to PDF, Excel, or CSV." },
      ]
    },
    {
      id: "purchasing",
      title: "Purchasing & Orders",
      icon: DollarSign,
      subsections: [
        { id: "batch-ordering", title: "Batch Ordering", content: "Create supplier orders from multiple jobs:\n1. Review material queue across all jobs\n2. Group by supplier automatically\n3. Generate purchase orders\n4. Track delivery status\n5. Receive stock and update inventory" },
        { id: "suppliers", title: "Supplier Management", content: "Manage supplier relationships:\n- Contact information and terms\n- Lead times and MOQs\n- Price lists and catalogs\n- Order history\n- Performance tracking" },
        { id: "po-tracking", title: "Purchase Order Tracking", content: "Track PO lifecycle:\n- Draft → Sent → Acknowledged → In Transit → Received\n- Partial delivery handling\n- Payment status tracking\n- Automated reminder emails" },
      ]
    },
    {
      id: "documents",
      title: "Documents & Templates",
      icon: FileText,
      subsections: [
        { id: "quote-templates", title: "Quote Templates", content: "Professional quote templates with:\n- Your branding and logo\n- Itemized pricing breakdown\n- Terms and conditions\n- Digital signature capture\n- PDF generation and email delivery" },
        { id: "invoice-templates", title: "Invoice Templates", content: "Create invoices with:\n- Progressive invoicing (deposit, progress, final)\n- Payment terms and due dates\n- Multiple payment methods\n- Automatic payment tracking\n- Overdue reminders" },
        { id: "custom-forms", title: "Custom Forms", content: "Create custom forms for:\n- Client intake questionnaires\n- Measurement sheets\n- Installation checklists\n- Satisfaction surveys\n- Change order requests" },
      ]
    },
  ];

  const filteredSections = sections.map(section => ({
    ...section,
    subsections: section.subsections.filter(sub =>
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.subsections.length > 0);

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Documentation</h1>
                <p className="text-sm text-white/60">Complete guide to using InteriorApp</p>
              </div>
            </div>
            <Badge variant="outline" className="border-white/20 text-white">
              v1.0
            </Badge>
          </div>
          
          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-white/10"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-white/[0.08] border-white/20 sticky top-32">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base font-bold">Contents</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <div className="space-y-1">
                    {filteredSections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <Button
                          key={section.id}
                          variant={activeSection === section.id ? "secondary" : "ghost"}
                          className={`w-full justify-start text-left ${
                            activeSection === section.id
                              ? "bg-primary/20 text-white border border-primary/30"
                              : "text-white/80 hover:text-white hover:bg-white/10"
                          }`}
                          onClick={() => setActiveSection(section.id)}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">{section.title}</span>
                          {section.subsections.length > 0 && (
                            <Badge variant="outline" className="ml-auto border-white/30 text-white/70 text-xs">
                              {section.subsections.length}
                            </Badge>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {currentSection && (
              <div className="space-y-6">
                {/* Section Header */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = currentSection.icon;
                        return <Icon className="h-8 w-8 text-primary" />;
                      })()}
                      <div>
                        <CardTitle className="text-white text-2xl font-bold">{currentSection.title}</CardTitle>
                        <CardDescription className="text-white/70">
                          {currentSection.subsections.length} articles in this section
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Subsections */}
                <div className="space-y-4">
                  {currentSection.subsections.map((subsection, index) => (
                    <Card key={subsection.id} className="bg-white/[0.08] border-white/20 hover:bg-white/[0.12] transition-colors">
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-primary/20 rounded-lg mt-1 flex-shrink-0">
                            <ChevronRight className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-white text-xl mb-3 font-semibold">{subsection.title}</CardTitle>
                            <CardDescription className="text-white/80 whitespace-pre-line leading-relaxed text-base">
                              {subsection.content}
                            </CardDescription>
                            
                            {/* Placeholder for screenshot */}
                            <div className="mt-6 p-12 bg-white/[0.03] border border-white/20 rounded-lg flex items-center justify-center">
                              <div className="text-center text-white/50">
                                <FileText className="h-16 w-16 mx-auto mb-3 opacity-60" />
                                <p className="text-sm font-medium">Screenshot placeholder</p>
                                <p className="text-xs mt-2 text-white/40">Screenshots will be added in future updates</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {filteredSections.length === 0 && (
              <Card className="bg-white/[0.08] border-white/20">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-white/30 mb-4" />
                  <p className="text-white font-medium">No results found for "{searchQuery}"</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-white/30 text-white hover:bg-white/20"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear search
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
