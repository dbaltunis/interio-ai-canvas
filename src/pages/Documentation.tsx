import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScreenshotUploader } from "@/components/documentation/ScreenshotUploader";
import { ScreenshotDisplay } from "@/components/documentation/ScreenshotDisplay";
import { MarkdownContent } from "@/components/documentation/MarkdownContent";
import { useHasPermission } from "@/hooks/usePermissions";
import { APP_VERSION } from "@/constants/version";
import { 
  Search, BookOpen, Home, Briefcase, Users, Package, 
  Calendar, Settings, Shield, Zap, BarChart3, ShoppingCart,
  FileText, MessageSquare, Wrench, DollarSign, Globe,
  ChevronRight, ExternalLink, Lock, Truck, Mail, Phone,
  Key, Calculator, Webhook, Code
} from "lucide-react";

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("getting-started");
  const [adminMode, setAdminMode] = useState(false);
  
  // Check if user is admin/owner for screenshot management
  const isAdmin = useHasPermission('manage_settings');

  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: BookOpen,
      subsections: [
        { 
          id: "overview", 
          title: "What is InterioApp?", 
          content: "InterioApp is a comprehensive business management platform built specifically for window treatment professionals, interior designers, and custom furnishing specialists. Trusted by 600+ businesses worldwide, it provides enterprise-grade features with an intuitive interface.\n\n**Core Capabilities:**\n• **Multi-Tenant SaaS Architecture** - Secure, isolated data per account with team collaboration\n• **Real-Time Pricing Engine** - Industry-leading calculation algorithms for fabric, labor, and materials\n• **Supplier Integration Ecosystem** - Direct connections to TWC, Shopify, and more\n• **Complete Project Lifecycle** - From lead capture to installation and invoicing\n\n**Key Modules:**\n• Jobs & Quotes - Professional quote generation with automated calculations\n• Client CRM - Lead scoring, funnel management, and communication tracking\n• Product Library - Fabrics, hardware, and treatment templates with pricing\n• Calendar & Scheduling - Appointments with Google Calendar sync\n• Team & Permissions - Role-based access control for secure collaboration\n• Analytics & Reporting - Business intelligence and performance tracking\n• Online Store - Shopify integration for e-commerce\n• Supplier Ordering - Direct order submission to suppliers like TWC" 
        },
        { 
          id: "dashboard", 
          title: "Understanding Your Dashboard", 
          content: "The Dashboard provides a real-time overview of your business performance with customizable KPI widgets.\n\n**KPI Cards (Configurable per user):**\n• Active Projects - Current jobs in progress\n• Monthly Revenue - Sales performance vs. targets\n• Pending Quotes - Awaiting client response\n• Upcoming Appointments - Next 7 days\n• Conversion Rate - Quote to project ratio\n• Team Performance - Leaderboard and metrics\n\n**Dashboard Widgets:**\n• Recent Activity Feed - Live updates on projects, clients, and team actions\n• Quick Actions - Create quote, add client, schedule appointment\n• Calendar Preview - Today's and upcoming appointments\n• Task List - Pending actions with priority indicators\n• Revenue Charts - Visual performance tracking\n\n**Target Tracking:**\n• Set daily, weekly, monthly, quarterly, or yearly targets\n• Visual progress bars with color-coded status\n• Per-user targets for team performance management\n• Dealer performance widget for team comparisons\n\n**Customization:**\n• Drag-and-drop widget arrangement\n• Admin can configure KPIs visible per user/role\n• Dashboard preferences saved to your account\n• Reset to defaults option available" 
        },
        { 
          id: "first-steps", 
          title: "Initial Setup Workflow", 
          content: "Complete these steps to configure your InterioApp account:\n\n**Step 1: Business Profile (5 minutes)**\nSettings → Business Settings:\n• Company name, logo, and trading name\n• Contact details and address\n• Tax settings (GST/VAT rates)\n• Default currency and timezone\n• Measurement units (metric/imperial)\n\n**Step 2: Team & Permissions (10 minutes)**\nSettings → Team & Permissions:\n• Review default roles: Owner, Admin, Manager, Staff\n• Invite team members via email\n• Assign roles and customize permissions\n• Configure KPI visibility per role\n\n**Step 3: Product Library Setup (15-30 minutes)**\nLibrary tab:\n• Import fabrics from suppliers (TWC integration available)\n• Add hardware and accessories\n• Configure treatment templates with pricing\n• Set up collections and tags for organization\n• Link vendors for supplier ordering\n\n**Step 4: Job Statuses (5 minutes)**\nSettings → Job Statuses:\n• Review default workflow stages\n• Add custom statuses if needed\n• Configure automation triggers\n• Set color codes for visual identification\n\n**Step 5: Integrations (10 minutes)**\nSettings → Integrations:\n• Connect Google Calendar for appointment sync\n• Set up SendGrid for email delivery\n• Configure Twilio for SMS/WhatsApp\n• Connect Shopify for online store\n• Link TWC for supplier ordering\n\n**Step 6: Create First Quote (10 minutes)**\nProjects → New Quote:\n• Select or create client\n• Add project details and measurements\n• Choose treatment templates\n• System auto-calculates fabric and pricing\n• Send to client via email or PDF" 
        },
      ]
    },
    {
      id: "jobs",
      title: "Jobs & Projects",
      icon: Briefcase,
      subsections: [
        { 
          id: "job-creation", 
          title: "Creating Quotes and Projects", 
          content: "InterioApp uses a streamlined two-phase workflow:\n\n**Phase 1: QUOTE (Estimate/Proposal)**\n\n1. Navigate to Projects → New Quote\n2. Select or create client\n3. Enter project details:\n   • Job reference/name\n   • Site address (defaults to client address)\n   • Project type (residential/commercial)\n\n4. Add Treatments:\n   • Select from treatment templates\n   • Enter window measurements (width × drop)\n   • System auto-calculates:\n     - Fabric meterage with fullness ratios\n     - Hardware quantities\n     - Labor costs\n     - Total pricing with margins\n\n5. Review and send:\n   • Preview professional PDF quote\n   • Email directly to client\n   • Track quote status\n\n**Phase 2: CONVERT TO PROJECT**\n\nOnce client approves:\n• Click 'Convert to Project' button\n• Status changes to 'Approved'\n• Enables production tracking\n• Reserves inventory items\n• Creates installation tasks\n• Activates supplier ordering\n\n**Project Management:**\n• Track production status through stages\n• Schedule installations\n• Allocate materials from inventory\n• Submit orders to suppliers (TWC, etc.)\n• Generate work orders for workroom\n• Mark complete and invoice" 
        },
        { 
          id: "supplier-ordering", 
          title: "Supplier Ordering System", 
          content: "Order materials directly from integrated suppliers through the Job interface.\n\n**Accessing Supplier Ordering:**\nOpen any approved project → Click 'Supplier Ordering' dropdown in the job header (between Contact and Status)\n\n**Supported Suppliers:**\n• TWC (The Window Company) - Full API integration\n• Inventory-linked vendors - For manually tracked suppliers\n\n**Order Workflow:**\n\n1. **Automatic Detection:**\n   • System scans quote items for supplier products\n   • TWC products identified by twc_item_number\n   • Other vendors detected by inventory links\n\n2. **Order Submission:**\n   • Select supplier from dropdown\n   • Review auto-populated order details:\n     - Products and quantities\n     - Measurements and specifications\n     - Color/material selections\n   • Confirm and submit order\n\n3. **Order Tracking:**\n   • Order status tracked in quote's supplier_orders\n   • Badges show: 'Send Order' vs 'Ordered ✓'\n   • Confirmation email sent automatically\n   • In-app notification on submission\n\n**Status Requirements:**\nDropdown is disabled in 'Draft' or 'Pending' status. Activates when job status is:\n• Approved\n• Accepted\n• Any 'locked' or 'progress_only' status\n\n**Production vs Testing Mode:**\n• Test-mode suppliers show 'Testing Mode' warning\n• Only production-mode integrations process real orders\n• Configure mode in Settings → Integrations" 
        },
        { 
          id: "measurements", 
          title: "Measurement & Calculation Tools", 
          content: "Precise measurement tools ensure accurate quotes and orders.\n\n**Measurement Units:**\nSet default in Settings → Business Settings:\n• Metric (meters/cm)\n• Imperial (feet/inches)\n• Auto-conversion available\n\n**Window Measurement Guide:**\n\n*Inside Mount (Recess):*\n• Measure width at 3 points (top, middle, bottom)\n• Measure drop at 3 points (left, center, right)\n• Use smallest measurements\n• Check recess depth for treatment clearance\n\n*Outside Mount (Face Fix):*\n• Measure window opening\n• Add overlap (10-20cm each side)\n• Measure from architrave top\n• Add drop below sill (10-15cm or to floor)\n\n**Automatic Fabric Calculations:**\n\nSystem calculates based on treatment template:\n\n1. **Finished Width:**\n   Window width × fullness ratio\n   Example: 2m × 2.5 = 5m finished\n\n2. **Cut Drops:**\n   Drop + header + bottom hem + allowances\n   Pattern repeat matching included\n\n3. **Total Meterage:**\n   Based on fabric orientation (vertical/horizontal)\n   Includes seam allowances\n   Adds wastage percentage\n\n**Fabric Orientation:**\n• Vertical (standard): Fabric runs top-to-bottom\n• Horizontal (railroaded): Fabric runs side-to-side\n\nOrientation affects piece calculations and total meterage. See Calculation Algorithms section for details." 
        },
        { 
          id: "sharing-work-orders", 
          title: "Sharing Work Orders", 
          content: "Share work orders securely with workrooms, installers, or suppliers via unique public links.\n\n**Creating a Share Link:**\n1. Open project → Navigate to Workshop tab\n2. Click 'Share' button in header\n3. Configure share link:\n   • Name (optional): e.g., 'For Curtain Maker'\n   • Document Type: Work Order, Installation Sheet, Fitting Sheet\n   • Orientation: Portrait (tall) or Landscape (wide)\n   • Items: Select specific rooms/windows or all\n4. Click 'Create Link' to generate secure URL\n5. Copy and send to recipient\n\n**Item-Level Selection:**\n• Expand room groups to see individual windows\n• Check/uncheck specific items\n• Perfect for sending partial orders to different suppliers\n\n**Link Features:**\n• Secure token-based URLs (no login required)\n• Real-time data updates visible to viewers\n• Portrait or Landscape layouts\n• Links work for anonymous and logged-in users\n\n**Managing Links:**\n• View all active links in Share panel\n• Deactivate links when no longer needed\n• Expired links stop working automatically\n• Create multiple links for different recipients\n\n**Best Practices:**\n• Use descriptive names for each link\n• Re-sync project data before creating links\n• Deactivate links when job completes\n• Review shared content before sending" 
        },
        { 
          id: "status-tracking", 
          title: "Job Status Workflow", 
          content: "Track jobs through their complete lifecycle with configurable status stages.\n\n**Default Statuses:**\n\n1. **Quote** - Draft being prepared\n2. **Quoted** - Sent to client, awaiting response\n3. **Measuring Scheduled** - Site visit booked\n4. **Approved** - Client accepted, ready for production\n5. **In Production** - Materials ordered, manufacturing underway\n6. **Ready for Installation** - Items complete, scheduled\n7. **Installing** - Team on-site\n8. **Installed** - Complete, awaiting final payment\n9. **Completed** - Closed and archived\n\n**Status Properties:**\n• Color coding for visual identification\n• Locked states prevent accidental changes\n• Progress-only states for forward movement\n• Automation triggers on status change\n\n**Custom Statuses:**\nSettings → Job Statuses:\n• Add custom stages\n• Set sort order\n• Configure colors\n• Define automation rules\n\n**Supplier Ordering Activation:**\nSupplier ordering dropdown activates when status has:\n• 'locked' property = true\n• 'progress_only' property = true\n• Status is 'Approved' or later in workflow" 
        },
      ]
    },
    {
      id: "clients",
      title: "Client Management",
      icon: Users,
      subsections: [
        { 
          id: "client-profiles", 
          title: "Client Profiles & CRM", 
          content: "Complete CRM system for managing client relationships.\n\n**Client Types:**\n• B2C (Consumer) - Individual homeowners\n• B2B (Business) - Trade customers, designers, builders\n\n**Creating Client Records:**\n1. Clients → New Client\n2. Select client type\n3. Enter information:\n   • Name/Company name\n   • Contact person (B2B)\n   • Email, phone, mobile\n   • Address details\n   • Lead source\n   • Tags for categorization\n\n**Profile Tabs:**\n\n*Overview:*\n• Contact information (click-to-call/email)\n• Lead score and funnel stage\n• Quick stats: Total projects, revenue, last contact\n• Lifetime value calculation\n\n*Projects:*\n• All quotes and jobs for this client\n• Status and value of each\n• Quick access to details\n\n*Activity:*\n• Complete timeline of interactions\n• Emails, calls, meetings, quotes\n• Notes and follow-ups\n\n*Documents:*\n• Uploaded files and attachments\n• Generated quotes and invoices\n• Measurement sheets\n\n**Dynamic Tags:**\n• Add custom tags to clients\n• Filter by tags in client list\n• Tags auto-populate from your data\n• Use for segmentation and organization" 
        },
        { 
          id: "communication", 
          title: "Client Communication", 
          content: "Manage all client communications from within InterioApp.\n\n**Email Integration:**\nRequires SendGrid setup in Settings → Integrations\n\n• Send emails from client profile or job\n• Professional branded templates\n• Auto-attach PDFs (quotes, invoices)\n• Email tracking (delivery, opens, clicks)\n• Template library with personalization\n\n**SMS Messaging:**\nRequires Twilio setup\n\n• Text messages to clients\n• Appointment reminders\n• Status notifications\n• Bulk SMS capabilities\n\n**WhatsApp:**\nRequires Twilio WhatsApp setup\n\n• BYOA (Bring Your Own Account)\n• Template-based messages\n• Business messaging compliance\n• Account-owner inheritance for teams\n\n**Communication History:**\n• All communications logged automatically\n• Searchable by keyword\n• Filter by type (email, call, SMS)\n• Manual call logging available\n\n**Automated Communications:**\n• Quote sent confirmations\n• Appointment reminders (24hr, 1hr)\n• Status update notifications\n• Payment reminders\n• Review requests\n\nSee Communication Channels section for detailed setup guides." 
        },
        { 
          id: "funnel-management", 
          title: "Sales Funnel & Lead Stages", 
          content: "Track clients through your sales pipeline with automated progression.\n\n**Funnel Stages:**\n\n1. **Lead** - New inquiry, not qualified\n2. **Contacted** - Initial conversation complete\n3. **Measuring Scheduled** - Appointment booked\n4. **Quoted** - Proposal sent, awaiting decision\n5. **Negotiating** - Price/terms discussion\n6. **Approved** - Won, converting to project\n7. **In Progress** - Active project\n8. **Completed** - Delivered and paid\n9. **Lost** - Declined or went elsewhere\n\n**Automatic Stage Progression:**\n• Email sent → 'Contacted'\n• Appointment created → 'Measuring Scheduled'\n• Quote generated → 'Quoted'\n• Quote approved → 'Approved'\n\n**Lead Scoring:**\nAutomatic scoring based on:\n• Contact completeness\n• Engagement level\n• Project value potential\n• Response time\n• Number of interactions\n\n**Follow-up Automation:**\n• Auto-schedule follow-ups per stage\n• Reminders in task list\n• Email templates for each stage\n• Customizable timing rules\n\n**Funnel Analytics:**\n• Conversion rates per stage\n• Average time in each stage\n• Win/loss ratios\n• Revenue by funnel stage" 
        },
      ]
    },
    {
      id: "library",
      title: "Product Library",
      icon: Package,
      subsections: [
        { 
          id: "fabrics", 
          title: "Fabric Management", 
          content: "Comprehensive fabric inventory with pricing and stock tracking.\n\n**Accessing Fabrics:**\nLibrary tab → Fabrics\n\n**Adding Fabrics:**\n1. Click '+ Add Fabric'\n2. Enter details:\n   • SKU/Product Code\n   • Name and collection\n   • Vendor (select from vendors list)\n   • Color/pattern name\n\n3. Specifications:\n   • Width (137cm, 300cm, etc.)\n   • Composition (polyester, linen, etc.)\n   • Pattern repeat (vertical/horizontal)\n   • Fabric orientation (vertical/horizontal)\n   • Weight and fire rating\n\n4. Pricing:\n   • Cost price (what you pay)\n   • Sell price (what you charge)\n   • Price group assignment\n   • Pricing method (per meter, per sqm, fixed)\n\n5. Stock (if tracking enabled):\n   • Current stock level\n   • Reorder point\n   • Low stock alerts\n\n**Collections & Tags:**\n• Organize fabrics into collections\n• Add tags for filtering (blockout, sheer, wide_width)\n• Bulk actions for organization\n• Search by tags in quote builder\n\n**Vendor Linking:**\n• Link to formal vendor records\n• Orphan suppliers show ⚠ warning\n• Create vendor records for clean data\n\n**TWC Import:**\nFor TWC-connected accounts:\n• Auto-import fabrics from TWC catalog\n• SKU-based categorization\n• Price group assignment\n• Collection organization" 
        },
        { 
          id: "hardware", 
          title: "Hardware & Accessories", 
          content: "Manage tracks, poles, brackets, and installation hardware.\n\n**Hardware Categories:**\n• Curtain Tracks (aluminum, PVC, wave, motorized)\n• Curtain Poles (wooden, metal, tension)\n• Brackets (wall, ceiling, center support)\n• Blind Components (roller, roman, venetian)\n• Accessories (hooks, rings, tiebacks)\n• Installation Hardware (screws, anchors)\n• Motorization (motors, remotes, controllers)\n\n**Adding Hardware:**\n1. Library → Hardware → Add Hardware\n2. Enter:\n   • SKU and name\n   • Category/type\n   • Vendor\n   • Specifications\n   • Pricing (per item, per meter, per set)\n   • Stock quantities\n\n**Cross-Selling:**\n• System suggests compatible items\n• Select track → suggests brackets, gliders\n• Ensures complete component ordering" 
        },
        { 
          id: "templates", 
          title: "Treatment Templates", 
          content: "Pre-configured templates speed up quote creation.\n\n**Template Components:**\n\n1. **Basic Information:**\n   • Template name\n   • Treatment category (curtains, blinds, shutters)\n   • Heading style\n   • Description\n\n2. **Calculation Settings:**\n   • Fullness ratio (1.5x, 2x, 2.5x)\n   • Fabric orientation\n   • Seam and hem allowances\n   • Pattern repeat handling\n\n3. **Options Configuration:**\n   • Drag-and-drop ordering\n   • Value visibility filtering\n   • Required vs optional options\n   • TWC-linked options show blue badge\n\n4. **Pricing Structure:**\n   • Per meter, per sqm, per panel, fixed\n   • Labor charges (making, installation)\n   • Markup percentages\n\n**Using Templates:**\n1. In quote builder → Add Treatment\n2. Select template\n3. Enter window measurements\n4. System auto-calculates everything\n5. Customize if needed\n\n**TWC Template Import:**\nFor TWC-connected accounts:\n• Import treatments directly from TWC\n• Headings auto-created with fullness ratios\n• Options and materials linked\n• One-click import in template manager" 
        },
        { 
          id: "collections", 
          title: "Collections & Organization", 
          content: "Organize products with collections and tags for efficient management.\n\n**Collections:**\n\n*Creating Collections:*\n1. Library → Collections tab\n2. Click 'Create Collection'\n3. Enter name and description\n4. Optionally link to vendor\n5. Add items manually or via bulk actions\n\n*TWC Auto-Sync:*\n• Collections auto-created from TWC product descriptions\n• E.g., 'Straight Drop - SKYE' creates 'SKYE' collection\n• Maintains industry-standard library hierarchy\n\n*Using Collections:*\n• Filter library by collection\n• Quick access to related products\n• View item counts per collection\n\n**Tags:**\n\n*Adding Tags:*\n• Edit any inventory item\n• Add multiple tags in tags field\n• Tags are comma-separated\n\n*Popular Tags:*\n• blockout, sheer, wide_width\n• light_filtering, textured\n• indoor, outdoor\n• Custom tags for your needs\n\n*Tag Search:*\n• Search box includes tag matching\n• Quick-select popular tags\n• Filter by multiple tags\n\n**Bulk Actions:**\n• Select multiple items in grid\n• Floating toolbar appears\n• Create new collection from selection\n• Add to existing collection\n• Bulk add tags" 
        },
        { 
          id: "vendors", 
          title: "Vendor Management", 
          content: "Maintain supplier relationships and ordering information.\n\n**Adding Vendors:**\nLibrary → Vendors → Add Vendor\n\n• Company name and contact person\n• Email, phone, website\n• Address and tax ID\n• Payment terms (Net 30, COD, etc.)\n• Lead times and delivery info\n• Product categories supplied\n\n**Vendor vs Supplier Field:**\n• **Vendor** (preferred): Formal record in vendors table\n• **Supplier** (legacy): Text field from imports\n\nOrphan suppliers (text only) show ⚠ in filters. Create vendor records for clean data management.\n\n**Supplier Integration:**\nFor TWC and other integrated suppliers:\n• API credentials in Settings → Integrations\n• Product import and sync\n• Direct order submission\n• Order tracking and notifications\n\n**Purchase Orders:**\n• Generate POs for non-integrated vendors\n• Email or print for ordering\n• Track deliveries and receipt\n• Update stock on delivery" 
        },
      ]
    },
    {
      id: "calendar",
      title: "Calendar & Scheduling",
      icon: Calendar,
      subsections: [
        { 
          id: "calendar-view", 
          title: "Calendar Management", 
          content: "Comprehensive calendar for appointments, installations, and team schedules.\n\n**Calendar Views:**\n• Month View - Full month overview\n• Week View - 7-day with time slots\n• Day View - Single day detailed\n• Agenda View - Upcoming list\n\n**Color Coding:**\n• Initial Consultation (blue)\n• Measurement Visit (green)\n• Sample Viewing (purple)\n• Installation (orange)\n• Follow-up (yellow)\n• Internal Meeting (gray)\n\n**Filtering:**\n• By appointment type\n• By team member\n• By client\n• By location\n\n**Navigation:**\n• Today button for quick return\n• Previous/Next arrows\n• Month/Year picker\n• Jump to specific date" 
        },
        { 
          id: "google-calendar", 
          title: "Google Calendar Sync", 
          content: "Sync appointments with Google Calendar for seamless scheduling.\n\n**Setup:**\n1. Settings → Integrations → Google Calendar\n2. Click 'Connect Google Calendar'\n3. Authorize InterioApp access\n4. Select calendar to sync\n\n**Important Note:**\nYou may see an 'unverified app' warning during OAuth. This is normal:\n• Click 'Advanced'\n• Click 'Go to InterioApp (unsafe)'\n• This is safe - it's because InterioApp hasn't completed Google verification\n\n**Sync Features:**\n• Bidirectional sync (both ways)\n• New appointments appear in Google Calendar\n• Changes sync automatically\n• Google Meet link generation\n• Privacy: Calendar ID hidden for team members\n\n**Sync Behavior:**\n• Real-time sync for new appointments\n• Manual sync button available\n• Conflicts detected automatically\n• Delete syncs both ways" 
        },
        { 
          id: "appointments", 
          title: "Creating Appointments", 
          content: "Schedule consultations, measurements, installations, and follow-ups.\n\n**Creating Appointments:**\n1. Calendar → Click date/time or '+ New'\n2. Enter details:\n   • Type (consultation, measurement, installation)\n   • Client (search or create new)\n   • Date and time\n   • Duration\n   • Location (office, client address, video call)\n   • Team members to assign\n   • Notes and preparation items\n\n**Video Meetings:**\n• Select 'Video Call' location\n• System generates Google Meet link\n• Link included in confirmations\n• One-click join from appointment\n\n**Reminders:**\n• Automatic email reminders\n• 24 hours and 1 hour before\n• SMS reminders (if Twilio configured)\n• Client confirmation requests\n\n**Recurring Appointments:**\n• Daily, weekly, monthly patterns\n• Set end date or occurrence count\n• Edit series or single instance" 
        },
      ]
    },
    {
      id: "team",
      title: "Team & Permissions",
      icon: Shield,
      subsections: [
        { 
          id: "roles", 
          title: "User Roles & Access", 
          content: "Role-based permission system controls access and capabilities.\n\n**Built-in Roles:**\n\n1. **Owner** (Full Control)\n   • Complete access to everything\n   • Only one per account\n   • Cannot be removed\n   • Billing and subscription management\n\n2. **Admin** (Management)\n   • Nearly full access\n   • User management\n   • Cannot access billing\n   • Cannot delete account\n\n3. **Manager** (Operations)\n   • Day-to-day operations\n   • Full project management\n   • View cost prices\n   • Team scheduling\n\n4. **Staff** (Team Member)\n   • View and update jobs\n   • Client interactions\n   • Cannot see cost prices (by default)\n   • Limited settings access\n\n5. **System Owner** (Super-Admin)\n   • Multi-account management\n   • System-wide settings\n   • Cross-account access\n   • For SaaS administrators\n\n**Role Hierarchy:**\nOwner > Admin > Manager > Staff\nHigher roles can manage lower roles." 
        },
        { 
          id: "permissions", 
          title: "Permission Management", 
          content: "Fine-tune access with granular permissions per user.\n\n**Permission Categories:**\n\n*Jobs & Projects:*\n• view_jobs, create_jobs, edit_jobs, delete_jobs\n• view_own_jobs vs view_all_jobs\n• view_job_costs (sensitive)\n• approve_quotes, convert_to_project\n\n*Workroom & Materials:*\n• view_workroom, manage_workroom\n• view_materials, manage_materials\n\n*Library:*\n• view_inventory, manage_inventory\n• view_costs (sensitive)\n\n*Financial:*\n• view_pricing, edit_pricing\n• view_profit_margins (sensitive)\n• view_markups (sensitive)\n\n*Team:*\n• view_team_performance (sensitive)\n• manage_users, manage_roles\n\n*KPI Visibility:*\n• view_primary_kpis\n• view_revenue_kpis (sensitive)\n• view_email_kpis\n\n**Custom Permissions:**\nSettings → Team → Select user → Customize Permissions\n• Check/uncheck individual permissions\n• Override role defaults\n• Audit log tracks changes\n\n**Permission Merging:**\nCustom permissions ADD to role-based permissions, they don't replace them. Users always retain their role's baseline permissions." 
        },
        { 
          id: "team-members", 
          title: "Team Management", 
          content: "Invite and manage team members with proper access controls.\n\n**Inviting Team Members:**\n1. Settings → Team → Invite Member\n2. Enter email address\n3. Select role\n4. Send invitation\n5. User receives email with setup link\n\n**Account Linking:**\n• New members automatically linked to parent account\n• Inherit account settings and templates\n• Shared access to clients and projects\n• Individual permission customization\n\n**Sub-User Features:**\n• Team members see owner's clients and projects\n• Communication settings inherited from owner\n• Twilio/SendGrid credentials shared\n• Calendar sync per user\n\n**Managing Members:**\n• View all team members in list\n• Change roles anytime\n• Customize permissions\n• Deactivate or remove users\n• View activity and login history" 
        },
      ]
    },
    {
      id: "supplier-integrations",
      title: "Supplier Integrations",
      icon: Truck,
      subsections: [
        { 
          id: "twc-integration", 
          title: "TWC (The Window Company)", 
          content: "Full API integration for product import and order submission.\n\n**Setup:**\n1. Settings → Integrations → TWC\n2. Enter API credentials:\n   • API URL\n   • Username\n   • Password\n3. Choose mode: Production or Testing\n4. Save and test connection\n\n**Product Import:**\n• Import fabrics, headings, and options\n• SKU-based categorization\n• Collections auto-created\n• Price groups assigned\n• One-click import or sync\n\n**Automatic Organization:**\n• 700-820 SKU range → Awning Fabrics\n• AWN-/AW- prefixes → Awning Fabrics\n• Collection names parsed from descriptions\n• Materials linked to templates\n\n**Order Submission:**\n1. Create and approve quote with TWC products\n2. Job header → Supplier Ordering → TWC\n3. Review auto-populated order:\n   • Products and quantities\n   • Measurements and specs\n   • Color/material selections\n4. Submit order via API\n5. Confirmation email sent\n6. Order tracked in project\n\n**URL Normalization:**\nThe system automatically handles various URL formats:\n• Ensures HTTPS\n• Strips trailing slashes\n• Removes duplicate path segments\n• Appends correct API endpoint" 
        },
        { 
          id: "shopify-integration", 
          title: "Shopify Integration", 
          content: "Connect your Shopify store for e-commerce capabilities.\n\n**Two Options:**\n\n*Connect Existing Store:*\n• Link your live Shopify store\n• Two-way product synchronization\n• Customer data sync to clients\n• Order management\n• Inventory updates\n• Changes affect live store immediately\n\n*Create New Store:*\n• Development store created (free)\n• Build and test without costs\n• Claim store when ready to sell\n• 30-day free trial on claim\n• Requires paid Shopify plan after\n\n**Setup:**\n1. Library → Online Store\n2. Click 'Connect to Shopify' or 'Create Store'\n3. Authorize access\n4. Configure sync settings\n\n**What Syncs:**\n• Products → Shopify products\n• Inventory levels (bidirectional)\n• Orders → InterioApp jobs\n• Customers → Clients\n• Fulfillment status\n• Images and descriptions\n\n**Product Visibility:**\n• Mark items as 'Featured'\n• Set online/offline status\n• Control which items appear in store\n• Price and stock sync automatically" 
        },
      ]
    },
    {
      id: "communication",
      title: "Communication Channels",
      icon: Mail,
      subsections: [
        { 
          id: "sendgrid-email", 
          title: "SendGrid Email Integration", 
          content: "Professional email delivery with tracking and templates.\n\n**Setup:**\n1. Settings → Integrations → Email\n2. Enter SendGrid API key\n3. Configure sender details\n4. Set up webhook for tracking\n\n**Features:**\n• Transactional emails (quotes, confirmations)\n• Marketing campaigns\n• Branded templates with your logo\n• Email tracking (delivery, opens, clicks)\n• Bounce and spam handling\n\n**Email Templates:**\n• Quote delivery\n• Appointment confirmation\n• Status updates\n• Payment reminders\n• Custom templates\n\n**Tracking Status:**\n• Pending - Queued for sending\n• Sent - Delivered to server\n• Delivered - Reached inbox\n• Opened - Client opened email\n• Clicked - Client clicked links\n• Bounced - Delivery failed\n\n**Webhook Setup:**\nSettings → Integrations → SendGrid → Setup Webhook\n• Enables real-time status updates\n• Tracks opens and clicks\n• Handles bounces automatically\n\n**Signature & Footer:**\n• Toggle auto-signature on/off\n• Toggle footer on/off\n• Custom signature content\n• Business info in footer" 
        },
        { 
          id: "whatsapp-sms", 
          title: "WhatsApp & SMS (Twilio)", 
          content: "Send SMS and WhatsApp messages to clients.\n\n**Twilio Setup:**\n1. Settings → Integrations → WhatsApp/SMS\n2. Enter Twilio credentials:\n   • Account SID\n   • Auth Token\n   • Phone number (for SMS)\n   • WhatsApp number (separate)\n3. Verify configuration\n4. Test messages\n\n**WhatsApp Business:**\n• BYOA (Bring Your Own Account)\n• Template-based messaging\n• Business messaging compliance\n• Verified status required\n\n**Team Inheritance:**\nSub-users automatically inherit owner's Twilio credentials:\n• No separate setup needed\n• Shared from parent account\n• Consistent sender identity\n\n**Use Cases:**\n• Appointment reminders\n• Status notifications\n• Quick client updates\n• Payment reminders\n• Bulk announcements\n\n**Status Indicators:**\n• Active - Configured & Verified\n• Pending - Configured, not verified\n• Optional - Not configured" 
        },
      ]
    },
    {
      id: "api-access",
      title: "API & Developer Access",
      icon: Code,
      subsections: [
        { 
          id: "api-overview", 
          title: "API Overview & Credentials", 
          content: "InterioApp provides API access for custom integrations and automation.\n\n**InterioApp API Credentials:**\n\nUse these credentials for API integration:\n\n• **Supabase URL:** https://ldgrcodffsalkevafbkb.supabase.co\n• **Anon Key (publishable):** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZ3Jjb2RmZnNhbGtldmFmYmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2OTAyMDEsImV4cCI6MjA2NjI2NjIwMX0.d9jbWQB2byOUGPkBp7lLjqE1tKkR4KtDcgaTiU42r_I\n• **Edge Functions Base:** https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/\n\n**Example API Request:**\n```\nfetch('https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/receive-external-lead', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json',\n    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'\n  },\n  body: JSON.stringify({\n    name: 'John Doe',\n    email: 'john@example.com',\n    phone: '0412345678',\n    source: 'website'\n  })\n})\n```\n\n**Architecture:**\n• RESTful API via Supabase Edge Functions\n• JWT-based authentication\n• HTTPS required for all requests\n• JSON request/response format\n\n**Authentication Methods:**\n\n1. **Anonymous API Key:**\n   • Use the Anon Key above in `apikey` header\n   • For public endpoints like lead capture\n   • No user context required\n\n2. **User JWT Token:**\n   • For authenticated user actions\n   • Passed via `Authorization: Bearer <token>` header\n   • Inherits user's permissions\n   • Obtain from Supabase auth session\n\n**Rate Limiting:**\n• Standard: 100 requests/minute\n• Burst: 10 requests/second\n• Headers indicate remaining quota" 
        },
        { 
          id: "endpoints", 
          title: "Available Endpoints", 
          content: "Key API endpoints for integration.\n\n**Lead Capture:**\n`POST /receive-external-lead`\n• Accept leads from external sources\n• No authentication required\n• Creates client record and notification\n\n**Booking:**\n`POST /create-booking`\n• Public appointment booking\n• Used by booking widgets\n• Creates appointment and client\n\n**Webhooks (Incoming):**\n\n`POST /shopify-webhook-order`\n• Receives Shopify order notifications\n• Creates job from order\n• Updates inventory\n\n`POST /sendgrid-webhook`\n• Email event tracking\n• Updates email status\n• Handles bounces\n\n`POST /shopify-webhooks`\n• General Shopify events\n• Product and customer sync\n\n**Authenticated Endpoints:**\n(Require Authorization header)\n\n• `/send-email` - Send emails\n• `/send-whatsapp` - Send WhatsApp messages\n• `/sync-to-google-calendar` - Calendar sync\n• `/twc-submit-order` - Submit TWC orders\n• `/shopify-sync-products` - Sync products" 
        },
        { 
          id: "webhooks", 
          title: "Webhook Configuration", 
          content: "Configure incoming webhooks for external integrations.\n\n**Shopify Webhooks:**\nAutomatically configured when Shopify connected:\n• orders/create - New order notification\n• orders/updated - Order changes\n• products/update - Product changes\n• customers/create - New customer\n\n**SendGrid Webhooks:**\nSetup via Settings → Integrations → SendGrid:\n• Delivery events\n• Open tracking\n• Click tracking\n• Bounce/spam reports\n\n**Custom Webhooks (Coming Soon):**\nOutgoing webhooks for your systems:\n• client.created\n• job.status_changed\n• appointment.created\n• inventory.low_stock\n\n**Security:**\n• HTTPS required\n• Signature verification\n• IP whitelisting option\n• Request logging for debugging" 
        },
      ]
    },
    {
      id: "storefront-api",
      title: "Storefront Integration API",
      icon: Globe,
      subsections: [
        { 
          id: "storefront-getting-started", 
          title: "Getting Started with Storefront API", 
          content: "Connect your custom storefront or external website to InterioApp for fabric catalog, pricing, and lead capture.\n\n**What You Can Do:**\n• Fetch your fabric catalog with pricing\n• Get product configuration options (headings, linings)\n• Calculate price estimates for customer configurators\n• Submit leads directly to your InterioApp account\n• Integrate with Shopify for checkout and payments\n\n**Prerequisites:**\n• Active InterioApp account\n• Storefront API key (auto-generated)\n• Account ID (found in Settings)\n\n**API Base URL:**\n`https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/`\n\n**Authentication:**\nAll storefront endpoints require two parameters:\n• `account_id` - Your InterioApp account UUID\n• `api_key` - Your storefront API key\n\n**Finding Your Credentials:**\n1. Navigate to Settings → Integrations → API Access\n2. Copy your Account ID\n3. Copy or regenerate your Storefront API Key\n\n**Rate Limiting:**\n• 100 requests per minute per account\n• 10 requests per second burst limit" 
        },
        { 
          id: "storefront-catalog-api", 
          title: "Fabric Catalog API", 
          content: "Fetch your fabric and product catalog for storefront display.\n\n**Endpoint:**\n`GET /storefront-catalog`\n\n**Query Parameters:**\n| Parameter | Type | Required | Description |\n|-----------|------|----------|-------------|\n| account_id | UUID | Yes | Your InterioApp account ID |\n| api_key | string | Yes | Your storefront API key |\n| category | string | No | Filter by category (fabric, heading, lining) |\n| subcategory | string | No | Filter by subcategory |\n| collection | string | No | Filter by collection name |\n| search | string | No | Search by name, SKU, or color |\n| limit | number | No | Results per page (default: 50, max: 100) |\n| offset | number | No | Pagination offset (default: 0) |\n\n**Example Request:**\n```javascript\nconst response = await fetch(\n  'https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/storefront-catalog' +\n  '?account_id=YOUR_ACCOUNT_ID' +\n  '&api_key=YOUR_API_KEY' +\n  '&category=fabric' +\n  '&limit=20'\n);\nconst { success, data, pagination } = await response.json();\n```\n\n**Response Fields:**\n| Field | Type | Description |\n|-------|------|-------------|\n| id | UUID | Unique fabric identifier |\n| name | string | Display name |\n| sku | string | Product code/SKU |\n| collection | string | Collection name |\n| color | string | Color name |\n| width_cm | number | Fabric width in cm |\n| composition | string | Material composition |\n| image_url | string | Product image URL |\n| price_per_meter | number | Selling price per meter |\n| currency | string | Price currency (EUR, USD, etc.) |\n| in_stock | boolean | Stock availability |\n\n**Pagination Response:**\n```json\n{\n  \"success\": true,\n  \"data\": [...],\n  \"pagination\": {\n    \"total\": 1361,\n    \"limit\": 20,\n    \"offset\": 0,\n    \"has_more\": true\n  }\n}\n```\n\n**Security Note:** Cost prices are never exposed through this API." 
        },
        { 
          id: "storefront-lead-api", 
          title: "Lead Capture API", 
          content: "Submit leads from your storefront directly to your InterioApp account.\n\n**Endpoint:**\n`POST /storefront-lead`\n\n**Request Body:**\n```json\n{\n  \"account_id\": \"YOUR_ACCOUNT_ID\",\n  \"api_key\": \"YOUR_API_KEY\",\n  \"name\": \"Jonas Jonaitis\",\n  \"email\": \"jonas@example.lt\",\n  \"phone\": \"+37061234567\",\n  \"message\": \"Interested in blackout curtains for bedroom\",\n  \"product_interest\": \"Naktinė užuolaida\",\n  \"source\": \"gustindecor.com\",\n  \"configuration_data\": {\n    \"width_mm\": 2000,\n    \"drop_mm\": 2400,\n    \"fabric\": \"Premium Velvet\"\n  }\n}\n```\n\n**Required Fields:**\n| Field | Type | Description |\n|-------|------|-------------|\n| account_id | UUID | Your InterioApp account ID |\n| api_key | string | Your storefront API key |\n| name | string | Customer name |\n| email | string | Customer email (validated) |\n\n**Optional Fields:**\n| Field | Type | Description |\n|-------|------|-------------|\n| phone | string | Customer phone number |\n| message | string | Customer message/notes |\n| product_interest | string | Product they're interested in |\n| source | string | Lead source identifier (e.g., website name) |\n| configuration_data | object | Product configuration from calculator |\n\n**Success Response (200):**\n```json\n{\n  \"success\": true,\n  \"lead_id\": \"abc123-uuid...\",\n  \"is_new_lead\": true,\n  \"message\": \"Lead created successfully\"\n}\n```\n\n**What Happens:**\n• Creates client in your InterioApp account\n• If email exists, adds inquiry to existing client\n• Logs activity with configuration data\n• Sends notification to account owner\n• Tags client with product interest\n\n**Error Responses:**\n• 400 - Missing required fields or invalid email\n• 401 - Invalid API key\n• 404 - Account not found" 
        },
        { 
          id: "storefront-options-api", 
          title: "Product Options API", 
          content: "Fetch product configuration options for your calculator UI.\n\n**Endpoint:**\n`GET /storefront-options`\n\n**Query Parameters:**\n| Parameter | Type | Required | Description |\n|-----------|------|----------|-------------|\n| account_id | UUID | Yes | Your InterioApp account ID |\n| api_key | string | Yes | Your storefront API key |\n| treatment_type | string | No | Filter by type: curtains, blinds, shutters |\n| template_id | UUID | No | Get options for specific template |\n\n**Example Request:**\n```javascript\nconst response = await fetch(\n  'https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/storefront-options' +\n  '?account_id=YOUR_ACCOUNT_ID' +\n  '&api_key=YOUR_API_KEY' +\n  '&treatment_type=curtains'\n);\nconst { templates, options, inventory_options } = await response.json();\n```\n\n**Response Structure:**\n```json\n{\n  \"success\": true,\n  \"templates\": [\n    {\n      \"id\": \"uuid\",\n      \"name\": \"Wave Heading Curtain\",\n      \"treatment_type\": \"curtains\",\n      \"fullness_ratio\": 2.5,\n      \"image_url\": \"https://...\"\n    }\n  ],\n  \"options\": [\n    {\n      \"key\": \"lining_type\",\n      \"label\": \"Lining\",\n      \"required\": true,\n      \"values\": [\n        { \"code\": \"unlined\", \"label\": \"Unlined\", \"price_modifier\": 0 },\n        { \"code\": \"blackout\", \"label\": \"Blackout\", \"price_modifier\": 15 }\n      ]\n    }\n  ],\n  \"inventory_options\": {\n    \"heading\": [\n      { \"id\": \"uuid\", \"name\": \"Wave 80mm\", \"price\": 12.50 }\n    ],\n    \"lining\": [\n      { \"id\": \"uuid\", \"name\": \"Blackout White\", \"price\": 8.00 }\n    ]\n  },\n  \"currency\": \"EUR\"\n}\n```\n\n**Use Cases:**\n• Populate dropdown menus in calculator\n• Show heading style options with images\n• Display lining types with prices\n• Build step-by-step configurator" 
        },
        { 
          id: "storefront-estimate-api", 
          title: "Price Estimate API", 
          content: "Calculate price estimates for your storefront configurator.\n\n**Endpoint:**\n`POST /storefront-estimate`\n\n**Request Body:**\n```json\n{\n  \"account_id\": \"YOUR_ACCOUNT_ID\",\n  \"api_key\": \"YOUR_API_KEY\",\n  \"fabric_id\": \"fabric-uuid\",\n  \"template_id\": \"template-uuid\",\n  \"width_mm\": 2000,\n  \"drop_mm\": 2400,\n  \"quantity\": 1,\n  \"options\": {\n    \"lining_type\": \"blackout\",\n    \"heading_type\": \"wave\"\n  }\n}\n```\n\n**Required Fields:**\n| Field | Type | Description |\n|-------|------|-------------|\n| account_id | UUID | Your InterioApp account ID |\n| api_key | string | Your storefront API key |\n| width_mm | number | Window width in millimeters |\n| drop_mm | number | Window drop in millimeters |\n\n**Optional Fields:**\n| Field | Type | Description |\n|-------|------|-------------|\n| fabric_id | UUID | Selected fabric ID |\n| template_id | UUID | Treatment template ID |\n| quantity | number | Number of units (default: 1) |\n| options | object | Selected options (lining, heading, etc.) |\n\n**Response:**\n```json\n{\n  \"success\": true,\n  \"estimate\": {\n    \"fabric_name\": \"Premium Velvet Ivory\",\n    \"fabric_meters\": 12.5,\n    \"fabric_cost\": 562.50,\n    \"making_cost\": 85.00,\n    \"options_cost\": 45.00,\n    \"options_breakdown\": {\n      \"lining_type\": 30.00,\n      \"heading_type\": 15.00\n    },\n    \"subtotal\": 692.50,\n    \"tax_rate\": 21,\n    \"tax_amount\": 145.43,\n    \"total\": 837.93,\n    \"currency\": \"EUR\",\n    \"quantity\": 1,\n    \"dimensions\": {\n      \"width_mm\": 2000,\n      \"drop_mm\": 2400\n    },\n    \"note\": \"This is an estimate. Final price may vary based on site measurements.\"\n  }\n}\n```\n\n**Calculation Logic:**\n• Uses your account's pricing configuration\n• Applies fullness ratios from templates\n• Includes pattern repeat calculations\n• Adds configured option prices\n• Applies tax rate if configured" 
        },
        { 
          id: "storefront-shopify-flow", 
          title: "Shopify Integration Flow", 
          content: "How orders flow from Shopify to InterioApp.\n\n**Integration Architecture:**\n```\nCustomer → Shopify Store → Webhook → InterioApp\n                  ↑\n          Storefront API\n              (Catalog)\n```\n\n**Order Webhook Flow:**\n1. Customer completes checkout on Shopify\n2. Shopify sends `orders/create` webhook\n3. InterioApp receives and processes:\n   • Creates/updates client record\n   • Creates project with order details\n   • Updates inventory if tracked\n   • Sends notification\n\n**Connecting Your Shopify Store:**\n1. Navigate to Settings → Integrations → Shopify\n2. Enter your Shopify store URL\n3. Authorize InterioApp access\n4. Webhooks auto-register\n\n**What Syncs:**\n• Orders → Projects/Jobs\n• Customers → Clients\n• Inventory levels (bidirectional)\n\n**Custom Storefront + Shopify:**\nFor custom storefronts, you can:\n1. Use InterioApp APIs for catalog and pricing\n2. Send customer to Shopify for checkout\n3. Receive order back via webhook\n\n**Example Checkout Link:**\n```\nhttps://your-store.myshopify.com/cart/add?id=VARIANT_ID&quantity=1\n```\n\nAdd product variant IDs from Shopify to complete the checkout flow." 
        },
        { 
          id: "storefront-error-codes", 
          title: "Error Codes & Troubleshooting", 
          content: "Standard error responses and how to handle them.\n\n**Error Response Format:**\n```json\n{\n  \"success\": false,\n  \"error\": \"Error message here\"\n}\n```\n\n**HTTP Status Codes:**\n\n| Code | Meaning | Common Causes |\n|------|---------|---------------|\n| 400 | Bad Request | Missing required fields, invalid data format |\n| 401 | Unauthorized | Invalid API key |\n| 404 | Not Found | Account, fabric, or resource not found |\n| 405 | Method Not Allowed | Wrong HTTP method (GET vs POST) |\n| 429 | Too Many Requests | Rate limit exceeded |\n| 500 | Server Error | Internal error, contact support |\n\n**Common Issues:**\n\n*Invalid API Key:*\n• Check key is copied correctly (no extra spaces)\n• Regenerate key if compromised\n• Ensure account_id matches the key\n\n*Account Not Found:*\n• Verify account_id is correct UUID\n• Check account is active\n\n*Fabric/Product Not Found:*\n• Verify ID exists in your library\n• Check product is marked as active\n\n**Debugging Tips:**\n• Check response body for specific error message\n• Verify all required parameters are included\n• Test with simple requests first\n• Check browser console for CORS issues\n\n**CORS Configuration:**\nAll storefront endpoints include CORS headers for browser requests.\nNo additional configuration needed." 
        },
      ]
    },
    {
      id: "algorithms",
      title: "Calculation Algorithms",
      icon: Calculator,
      subsections: [
        { 
          id: "fabric-calculations", 
          title: "Fabric Calculation Engine", 
          content: "Industry-standard algorithms for precise fabric calculations.\n\n**Calculation Philosophy:**\nAll calculations originate from a centralized engine (`calculationFormulas.ts`) ensuring 100% consistency across quotes, work orders, and invoices.\n\n**Single Source of Truth:**\n• Calculate once in the engine\n• Pass results to all display components\n• Never recalculate in display logic\n• Prevents '2+2=5' errors\n\n**Fabric Orientation:**\n\n*Vertical (Standard):*\nFabric runs top-to-bottom (normal orientation)\n• Widths calculated from rail width × fullness\n• Pieces needed = widths ÷ fabric width\n• Total meterage = pieces × drop length\n\n*Horizontal (Railroaded):*\nFabric runs side-to-side (rotated 90°)\n• Pieces calculated from drop ÷ fabric width\n• Each piece spans full width\n• Total meterage = pieces × total width\n\n**Included in Calculations:**\n• Window dimensions\n• Fullness ratios (from heading/template)\n• Header and bottom hems\n• Side hem allowances\n• Return dimensions (left/right)\n• Seam allowances (critical!)\n• Pattern repeat matching\n• Wastage percentage\n\n**Display Format:**\n• Vertical: 'X.XXm × $XX.XX/m'\n• Horizontal: 'X.XXm × Y pieces = Z.ZZm × $XX.XX/m'" 
        },
        { 
          id: "pricing-engine", 
          title: "Pricing Engine", 
          content: "Multi-tier markup system with smart price resolution.\n\n**Markup Hierarchy:**\n```\n1. Grid-Specific Markup (highest priority)\n   ↓ if not set\n2. Category/Subcategory Markup\n   ↓ if not set  \n3. Global Default Markup\n   ↓ minimum floor\n4. Minimum Markup Floor\n```\n\n**Smart Markup Detection:**\nIf an inventory item already has an implied markup (difference between cost and sell price), additional category markups are skipped to prevent double-charging.\n\n**Pricing Methods:**\n\n1. **Per Running Meter/Yard**\n   Linear pricing for narrow-width fabrics\n   Cost × meterage × markup\n\n2. **Per Square Meter/Foot**\n   Area-based for wide-width fabrics\n   Cost × area × markup\n\n3. **Fixed Price**\n   Flat rate regardless of size\n   Used for standard products\n\n**Discount Application:**\nDiscounts apply to retail price (after markup), not cost price.\n\n**Real-Time Calculations:**\n• GP% updates live as you change values\n• Margin warnings below threshold\n• Cost vs sell breakdown visible\n• Profit calculation per line item" 
        },
      ]
    },
    {
      id: "analytics",
      title: "Analytics & Reporting",
      icon: BarChart3,
      subsections: [
        { 
          id: "dashboard-analytics", 
          title: "Dashboard Analytics", 
          content: "Real-time business intelligence on your dashboard.\n\n**KPI Cards:**\n• Active Projects - Current jobs in progress\n• Monthly Revenue - Sales with target comparison\n• Quote Conversion - Rate and count\n• Pending Tasks - Action items\n• Upcoming Appointments - Next 7 days\n\n**Target Tracking:**\nSet targets per user:\n• Daily, Weekly, Monthly, Quarterly, Yearly\n• Visual progress bars\n• Color-coded status:\n  - 🔴 Red: <50% of target\n  - 🟡 Yellow: 50-80%\n  - 🟢 Green: >80%\n\n**Team Performance Widget:**\n• Leaderboard view\n• Quote count and revenue per dealer\n• Conversion rate comparison\n• Requires 'view_team_performance' permission\n\n**Revenue Charts:**\n• Daily/Weekly/Monthly trends\n• Compare to previous periods\n• Revenue by source/channel\n• Profit margin tracking" 
        },
        { 
          id: "reports", 
          title: "Reports & Exports", 
          content: "Generate reports for business analysis.\n\n**Available Reports:**\n\n*Sales Reports:*\n• Revenue by period\n• Sales by client\n• Sales by product category\n• Quote conversion analysis\n\n*Client Reports:*\n• Client list with lifetime value\n• Funnel stage distribution\n• Lead source analysis\n• Engagement metrics\n\n*Inventory Reports:*\n• Stock levels\n• Low stock alerts\n• Stock valuation\n• Movement history\n\n*Team Reports:*\n• Performance by user\n• Activity logs\n• Time tracking\n• Task completion\n\n**Export Options:**\n• CSV for spreadsheets\n• PDF for printing\n• Email scheduled reports\n\n**Date Filtering:**\n• Preset ranges (today, week, month, year)\n• Custom date range\n• Compare to previous period" 
        },
      ]
    },
    {
      id: "settings",
      title: "Settings & Configuration",
      icon: Settings,
      subsections: [
        { 
          id: "business-settings", 
          title: "Business Profile", 
          content: "Settings → Business Settings\n\n**Company Profile:**\n• Company name and trading name\n• Logo (appears on quotes, emails)\n• Business address\n• Phone and email\n• Website URL\n• Tax ID / ABN / VAT\n• Business hours\n\n**Pricing Configuration:**\n• Default markup percentages\n• Minimum margin thresholds\n• Rounding rules\n• Category-specific markups\n\n**Measurement Units:**\n• Metric (meters, cm)\n• Imperial (feet, inches)\n• Auto-conversion available\n\n**Tax Settings:**\n• GST/VAT rate\n• Tax inclusive/exclusive\n• Tax registration number" 
        },
        { 
          id: "job-statuses", 
          title: "Job Status Configuration", 
          content: "Settings → Job Statuses\n\nCustomize your workflow stages:\n\n**Default Statuses:**\nPre-configured workflow from Quote to Completed\n\n**Adding Custom Statuses:**\n1. Click 'Add Status'\n2. Enter name and description\n3. Select color\n4. Set sort order\n5. Configure properties:\n   • Locked (prevent changes)\n   • Progress Only (forward movement)\n   • Triggers (automation)\n\n**Automation Triggers:**\n• Send email on status change\n• Create task\n• Update inventory\n• Notify team member\n• Schedule follow-up" 
        },
        { 
          id: "integrations-config", 
          title: "Integration Settings", 
          content: "Settings → Integrations\n\n**Available Integrations:**\n\n*Communication:*\n• SendGrid (Email)\n• Twilio (SMS/WhatsApp)\n\n*Calendar:*\n• Google Calendar\n\n*E-commerce:*\n• Shopify\n\n*Suppliers:*\n• TWC (The Window Company)\n\n*Payments:*\n• Stripe Connect\n\n**Configuration Process:**\n1. Click integration name\n2. Enter API credentials\n3. Configure options\n4. Test connection\n5. Activate\n\n**Secrets Management:**\nAPI keys and credentials stored securely:\n• Encrypted at rest\n• Never exposed in code\n• Access logged for audit" 
        },
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
                <p className="text-sm text-white/60">Complete Business Management Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-primary/50 text-primary">
                v{APP_VERSION}
              </Badge>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="admin-mode" className="text-sm text-white/70">
                    Edit Mode
                  </Label>
                  <Switch
                    id="admin-mode"
                    checked={adminMode}
                    onCheckedChange={setAdminMode}
                  />
                </div>
              )}
            </div>
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
                          <Icon className={`h-4 w-4 mr-2 ${
                            activeSection === section.id ? "text-primary" : "text-white/90"
                          }`} />
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
                        <div className="flex items-start justify-between mb-2 gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 bg-primary/20 rounded-lg mt-1 flex-shrink-0">
                              <ChevronRight className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-white text-xl mb-3 font-semibold">{subsection.title}</CardTitle>
                            </div>
                          </div>
                          {adminMode && isAdmin && (
                            <div className="flex-shrink-0 mt-1">
                              <ScreenshotUploader
                                sectionId={currentSection.id}
                                subsectionId={subsection.id}
                              />
                            </div>
                          )}
                        </div>
                        <div className="pl-14">
                          <MarkdownContent content={subsection.content} />
                          
                          {/* Screenshot Display */}
                          <ScreenshotDisplay
                            sectionId={currentSection.id}
                            subsectionId={subsection.id}
                            adminMode={adminMode && isAdmin === true}
                          />
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
