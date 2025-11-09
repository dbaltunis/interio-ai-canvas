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
import { useHasPermission } from "@/hooks/usePermissions";
import { 
  Search, BookOpen, Home, Briefcase, Users, Package, 
  Calendar, Settings, Shield, Zap, BarChart3, ShoppingCart,
  FileText, MessageSquare, Wrench, DollarSign, Globe,
  ChevronRight, ExternalLink, Lock
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
          content: "InterioApp is a professional business management platform specifically designed for interior designers, curtain installers, and window treatment specialists. It combines project management, client relationship management (CRM), inventory tracking, and business automation into one integrated system.\n\nKey Features:\n• Complete project lifecycle management from quote to installation\n• Advanced CRM with lead scoring and automated follow-ups\n• Comprehensive inventory management for fabrics, hardware, and materials\n• Automated quote generation and client communications\n• Team collaboration and role-based permissions\n• Financial tracking and analytics\n• Online store integration for e-commerce" 
        },
        { 
          id: "dashboard", 
          title: "Understanding Your Dashboard", 
          content: "The Dashboard is your command center. Access it from the top navigation bar or by clicking 'Dashboard' in the main menu.\n\nDashboard Components:\n\n1. Quick Stats Cards:\n   • Total Projects (active quotes and jobs)\n   • Active Clients (with recent activity)\n   • Revenue metrics (current month vs. previous)\n   • Pending Tasks and Appointments\n\n2. Recent Activity Feed:\n   Shows your latest project updates, client interactions, and system events in chronological order.\n\n3. Quick Actions:\n   • New Quote - Create a new quote for a client\n   • New Client - Add a new client to your CRM\n   • View Calendar - Access your appointments\n   • Inventory - Check stock levels\n\n4. Upcoming Appointments:\n   Displays your next 5 appointments with client names and times.\n\n5. Task List:\n   Shows pending tasks with priority indicators and due dates.\n\nThe dashboard automatically refreshes to show real-time data." 
        },
        { 
          id: "first-steps", 
          title: "Initial Setup Workflow", 
          content: "Complete these steps to get your InterioApp system ready:\n\nStep 1: Configure Your Business Profile (5 minutes)\n• Navigate to Settings (gear icon in top navigation)\n• Under 'Business Settings', enter:\n  - Company name and logo\n  - Contact information (address, phone, email)\n  - Tax settings (GST/VAT rates)\n  - Default measurement units (metric/imperial)\n  - Currency and timezone\n\nStep 2: Set Up User Roles & Permissions (10 minutes)\n• Go to Settings > Team & Permissions\n• Review the default roles: Owner, Admin, Manager, Staff\n• Customize permissions for each role if needed\n• Invite team members via email\n• Assign roles to team members\n\nStep 3: Create Your First Client (3 minutes)\n• Click 'Clients' in the main navigation\n• Click '+ New Client' button\n• Choose client type: B2B (business) or B2C (consumer)\n• Enter required information:\n  - Name/Company name\n  - Contact details (email, phone)\n  - Address\n  - Lead source (how they found you)\n• Set initial funnel stage (defaults to 'Lead')\n• Add any notes or tags\n\nStep 4: Add Inventory Items (15-30 minutes)\n• Navigate to 'Inventory' tab\n• Start with essential categories:\n\n  Fabrics:\n  - Click 'Fabrics' tab\n  - Click '+ Add Fabric'\n  - Enter: SKU, name, supplier, cost/sell price\n  - Add fabric specifications (width, repeat, composition)\n  - Upload swatch image\n  - Set stock levels and reorder points\n\n  Hardware:\n  - Click 'Hardware' tab\n  - Add tracks, poles, brackets, accessories\n  - Include pricing and stock information\n\n  Templates:\n  - Review pre-loaded treatment templates\n  - Customize default templates for your business\n  - Set pricing formulas and fullness ratios\n\nStep 5: Configure Job Statuses (5 minutes)\n• Go to Settings > Job Statuses\n• Review default statuses: Quote, Measuring Scheduled, Quoted, Approved, In Production, Installed, Completed\n• Add custom statuses if needed\n• Set color codes for visual identification\n• Configure automation triggers (optional)\n\nStep 6: Create Your First Quote (10 minutes)\n• Navigate to 'Projects' tab\n• Click '+ New Quote'\n• Select the client you created\n• Add project details:\n  - Job name/reference\n  - Job site address (can differ from client address)\n  - Project type (residential/commercial)\n• Add treatments:\n  - Click 'Add Treatment'\n  - Select template or create custom\n  - Enter measurements (width x drop)\n  - Choose fabric and hardware from inventory\n  - System auto-calculates pricing\n• Review totals and margins\n• Click 'Save Quote'\n• Send to client via email or generate PDF\n\nYou're now ready to use InterioApp! Explore additional features as needed." 
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
          content: "InterioApp uses a two-phase workflow:\n\nPhase 1: QUOTE (Estimate/Proposal)\n• Navigate to Projects tab\n• Click '+ New Quote' button\n• Enter client details (or select existing client)\n• Add project information:\n  - Job reference/name\n  - Job site address (defaults to client address)\n  - Project type (residential/commercial)\n  - Status (defaults to 'Quote')\n\n• Add Treatments:\n  1. Click 'Add Treatment' in treatments section\n  2. Choose from:\n     - Template: Select pre-configured treatment\n     - Custom: Create from scratch\n  3. Enter measurements:\n     - Width (in meters or feet)\n     - Drop/Height\n     - Number of panels (for multi-panel treatments)\n  4. Select materials:\n     - Fabric: Choose from inventory (auto-calculates meterage)\n     - Hardware: Add tracks, poles, accessories\n     - Trimmings: Optional tiebacks, valances, etc.\n  5. System automatically calculates:\n     - Fabric requirements based on fullness ratio\n     - Cut drops and waste allowance\n     - Total cost and sell price\n     - Profit margin percentage\n\n• Review and Adjust:\n  - View total quote value\n  - Check profit margins\n  - Apply discounts if needed\n  - Add notes for client or internal use\n\n• Save Options:\n  - Save Draft: Keep working later\n  - Save and Email: Generates PDF and sends to client\n  - Save and Print: Create PDF for printing\n\nPhase 2: CONVERT TO PROJECT\nOnce client approves quote:\n• Open the quote\n• Click 'Convert to Project' button\n• This action:\n  - Creates a new project record\n  - Links to original quote\n  - Changes status to 'Approved'\n  - Enables production tracking\n  - Reserves inventory items\n  - Creates installation tasks\n\n• Project Management Features:\n  - Track production status\n  - Schedule installation\n  - Allocate materials from inventory\n  - Assign team members\n  - Log time and progress\n  - Update client on progress\n  - Mark as completed when installed" 
        },
        { 
          id: "job-templates", 
          title: "Treatment Templates", 
          content: "Templates speed up quote creation by pre-configuring common treatments.\n\nAccessing Templates:\n• Navigate to Inventory > Templates tab\n• View pre-loaded industry-standard templates\n• Covers all major treatment types\n\nPre-loaded Template Categories:\n\nRoller Blinds:\n• Standard light filtering\n• Blockout\n• Sunscreen (UV protection)\n• Dual (blockout + sunscreen)\n• External screens (weather resistant)\n• Insect screens\n\nRoman Blinds:\n• Flat fold\n• Cascade style\n• Hobbled\n\nVenetian Blinds:\n• Aluminum 25mm\n• Wood 50mm\n• Faux wood\n\nVertical Blinds:\n• Fabric vanes\n• PVC slats\n\nPanel Glides:\n• Standard\n• Blockout\n• Sheer\n\nShutters:\n• Plantation (basswood, PVC, aluminum)\n• Solid panel\n\nCellular/Honeycomb Shades:\n• Single cell\n• Double cell\n• Top-down bottom-up\n• Motorized\n\nCustomizing Templates:\n1. Select a template to edit\n2. Click 'Edit Template'\n3. Modify:\n   - Default fabric type\n   - Fullness ratio\n   - Heading style\n   - Manufacturing method\n   - Pricing formulas\n   - Labor rates\n4. Save as custom template\n5. Set as default for your business\n\nCreating New Templates:\n1. Click '+ New Template'\n2. Configure all parameters:\n   - Treatment category\n   - Measurement requirements\n   - Calculation formulas\n   - Default materials\n   - Pricing structure\n3. Test with sample measurements\n4. Save and activate\n\nTemplates automatically:\n• Calculate fabric meterage\n• Apply fullness ratios\n• Add seam allowances\n• Calculate hardware quantities\n• Price based on your markup rules" 
        },
        { 
          id: "pricing", 
          title: "Pricing & Quote Generation", 
          content: "InterioApp uses intelligent pricing with automatic calculations.\n\nPricing Components:\n\n1. Material Costs:\n   • Fabric: Cost per meter × quantity + waste allowance\n   • Hardware: Fixed or per-meter pricing\n   • Trimmings: Per-item pricing\n   • System tracks actual supplier costs\n\n2. Markup & Margins:\n   • Set in Settings > Business Settings > Pricing\n   • Default markup percentages:\n     - Fabrics: Configurable (typically 40-100%)\n     - Hardware: Configurable (typically 30-50%)\n     - Labor: Configurable (typically 30-50%)\n   • Category-specific markups override defaults\n\n3. Labor Pricing:\n   • Per treatment type (varies by complexity)\n   • Configurable hourly rates\n   • Automatic calculation based on treatment type\n   • Includes making, installation, or both\n\n4. Quote Adjustments:\n   • Apply percentage discounts\n   • Fixed amount discounts\n   • Custom line item adjustments\n   • Bulk order discounts\n\nAutomatic Calculations:\n• Fabric meterage based on:\n  - Window width × fullness ratio\n  - Drop height + hems/headings\n  - Pattern repeat matching\n  - Wastage allowance\n\n• Hardware quantities:\n  - Track length = window width + returns\n  - Bracket spacing (typically every 1m)\n  - End caps, connectors, etc.\n\nQuote Generation Process:\n1. System calculates all costs automatically\n2. Review calculations in quote builder\n3. Adjust prices or discounts if needed\n4. Preview quote document:\n   - Professional branded template\n   - Itemized pricing\n   - Terms and conditions\n   - Validity period\n   - Payment terms\n\n5. Delivery options:\n   • Email to client (PDF attached)\n   • Download PDF for printing\n   • Share via link\n   • Print directly\n\nQuote Versions:\n• Create multiple versions for same job\n• Compare options (e.g., budget vs. premium)\n• Client can select preferred option\n• Previous versions saved for reference\n\nPrice Books:\n• Create tiered pricing (retail, trade, wholesale)\n• Apply different margins by client type\n• Special pricing for regular customers\n• Seasonal promotions and discounts" 
        },
        { 
          id: "status-tracking", 
          title: "Job Status Workflow", 
          content: "Track jobs through their complete lifecycle using status stages.\n\nDefault Job Statuses:\n\n1. Quote (Initial Stage)\n   • Draft quote created\n   • Being prepared for client\n   • Not yet sent\n\n2. Quoted (Sent to Client)\n   • Quote sent to client\n   • Awaiting client decision\n   • Can set follow-up reminders\n\n3. Measuring Scheduled\n   • Client interested\n   • Appointment booked for measurements\n   • Pre-quote or confirmation measurements\n\n4. Approved (Client Accepted)\n   • Client approved quote\n   • Ready to convert to project\n   • Deposits collected\n\n5. In Production\n   • Materials ordered/allocated\n   • Manufacturing underway\n   • Making curtains/blinds\n\n6. Ready for Installation\n   • Items completed\n   • Quality checked\n   • Scheduled for installation\n\n7. Installing\n   • Team on-site\n   • Installation in progress\n   • May take multiple days\n\n8. Installed (Completed)\n   • Installation finished\n   • Client sign-off\n   • Final payment due\n\n9. Completed (Closed)\n   • Final payment received\n   • All work done\n   • Job archived\n\nCustom Statuses:\n• Add your own stages\n• Settings > Job Statuses > Add Status\n• Configure:\n  - Status name\n  - Color code\n  - Description\n  - Sort order\n  - Active/inactive\n\nStatus Automation:\n• Trigger actions on status change:\n  - Send email to client\n  - Create task for team\n  - Update inventory\n  - Send notifications\n  - Schedule follow-ups\n\nBulk Status Updates:\n• Select multiple jobs\n• Change status simultaneously\n• Add notes to all selected\n• Assign to team member\n\nStatus Reporting:\n• View jobs by status\n• Track average time in each stage\n• Identify bottlenecks\n• Monitor conversion rates (quote → project)\n\nStatus Visibility:\n• Color-coded badges on job cards\n• Filter jobs by status\n• Dashboard shows status distribution\n• Status history tracked for each job" 
        },
        { 
          id: "measurements", 
          title: "Measurement & Calculation Tools", 
          content: "Accurate measurements are critical for quotes. InterioApp provides tools to ensure precision.\n\nMeasurement Units:\n• Set default in Settings > Business Settings\n• Options: Metric (meters/cm) or Imperial (feet/inches)\n• System converts automatically if needed\n• Mixed mode available for international projects\n\nWindow Measurement Guide:\n\nFor Inside Mount (Recess):\n1. Measure width at three points:\n   - Top, middle, bottom of window recess\n   - Use smallest measurement\n2. Measure drop at three points:\n   - Left, center, right of window recess\n   - Use smallest measurement\n3. Check for:\n   - Recess depth (minimum required for treatment type)\n   - Obstructions (window handles, locks)\n   - Square corners (measure diagonals)\n\nFor Outside Mount (Face Fix):\n1. Measure window opening\n2. Add overlap:\n   - Standard: 10-15cm each side\n   - Light blockage: 15-20cm each side\n3. Measure from top of architrave\n4. Add drop below sill:\n   - Standard: 10-15cm\n   - Floor length: measure to floor less 1cm\n\nMeasurement Recording:\n• Create measurement sheets per job\n• Template includes:\n  - Room name/number\n  - Window identifier\n  - Width × Drop\n  - Mount type (inside/outside)\n  - Special notes\n  - Photo upload\n• Digital measurement sheets save automatically\n\nFabric Calculations:\nSystem automatically calculates:\n\n1. Finished Width:\n   Window width × fullness ratio\n   Example: 2m window × 2.5 fullness = 5m finished width\n\n2. Cut Width:\n   Finished width + seam allowances\n   Accounts for hem allowances\n\n3. Cut Drops:\n   Drop + top heading + bottom hem + allowances\n   Pattern repeat matching if applicable\n\n4. Total Meterage:\n   (Cut width ÷ fabric width) × cut drop\n   Rounds up to nearest 0.1m\n   Adds wastage allowance\n\nPattern Repeat:\n• Enter repeat size in fabric specifications\n• System automatically:\n  - Calculates drops needed per repeat\n  - Adds extra meterage for matching\n  - Positions patterns correctly\n• Minimizes waste while ensuring perfect match\n\nCalculation Overrides:\n• Manually adjust if needed\n• Add notes explaining variance\n• System shows comparison to auto-calc\n• Useful for special situations\n\nMeasurement Wizard:\n• Step-by-step guided process\n• Prompts for all required measurements\n• Built-in validation checks\n• Prevents common measurement errors\n• Photo upload at each step" 
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
          content: "InterioApp includes a complete CRM system for managing client relationships.\n\nClient Types:\n\n1. B2C (Business to Consumer):\n   • Individual consumers\n   • Residential projects\n   • Homeowners and renters\n   • Fields: Name, email, phone, address\n\n2. B2B (Business to Business):\n   • Trade customers\n   • Businesses and organizations\n   • Interior designers, builders, property managers\n   • Additional fields: Company name, contact person, ABN/tax ID\n\nCreating Client Records:\n1. Navigate to Clients tab\n2. Click '+ New Client'\n3. Select client type (B2C/B2B)\n4. Enter required information:\n   • Basic Contact Info:\n     - Name (or Company name for B2B)\n     - Contact person (B2B only)\n     - Email address\n     - Phone number\n     - Mobile number\n   • Address Information:\n     - Street address\n     - Suburb/City\n     - State/Province\n     - Postcode\n     - Country\n   • Lead Information:\n     - How they found you (referral, Google, social media, etc.)\n     - Initial funnel stage\n     - Lead score (auto-calculated)\n   • Additional Details:\n     - Tags (for categorization)\n     - Notes (internal only)\n     - Preferences\n     - Custom fields\n\nClient Profile View:\nEach client profile includes:\n\n1. Overview Tab:\n   • Contact information (click-to-call, click-to-email)\n   • Client type badge\n   • Lead score and stage\n   • Quick stats: Total projects, revenue, last contact\n   • Quick actions: New quote, send email, schedule appointment\n\n2. Projects Tab:\n   • All quotes and projects for this client\n   • Status of each job\n   • Total value\n   • Filter by status or date\n   • Quick access to job details\n\n3. Activity Tab:\n   • Complete activity timeline\n   • Types of activities:\n     - Emails sent/received\n     - Phone calls logged\n     - Meetings and appointments\n     - Quotes created/sent\n     - Projects completed\n     - Payments received\n     - Notes added\n   • Chronological order (newest first)\n   • Filter by activity type\n   • Search within activities\n\n4. Emails Tab:\n   • All email correspondence\n   • Sent and received emails\n   • Email status (sent, delivered, opened)\n   • Attachments and documents\n   • Quick reply functionality\n\n5. Documents Tab:\n   • Uploaded files and attachments\n   • Generated quotes and invoices\n   • Signed contracts\n   • Installation photos\n   • Measurement sheets\n   • File preview and download\n\n6. Measurements Tab:\n   • Site measurement records\n   • Multiple windows per property\n   • Measurement photos\n   • Notes and specifications\n   • Export to PDF\n\nClient Intelligence:\n• Automatic lead scoring based on:\n  - Contact completeness\n  - Engagement level\n  - Project value potential\n  - Response time\n  - Number of interactions\n• Hot leads highlighted\n• Follow-up reminders auto-created\n• Behavior tracking" 
        },
        { 
          id: "communication", 
          title: "Client Communication", 
          content: "Manage all client communications from within InterioApp.\n\nEmail System:\n\nSending Emails:\n1. From Client Profile:\n   • Click 'Send Email' button\n   • Pre-fills client email address\n2. From Quote/Project:\n   • Click 'Email Quote' or 'Email Invoice'\n   • Auto-attaches relevant PDF\n3. Bulk Emailing:\n   • Select multiple clients\n   • Send group emails\n   • Personalization tokens (e.g., {client_name})\n\nEmail Features:\n• Professional email templates:\n  - Quote cover email\n  - Appointment confirmation\n  - Project updates\n  - Installation reminder\n  - Thank you / follow-up\n  - Payment reminder\n• Customizable templates\n• Your branding (logo, colors)\n• Email tracking:\n  - Delivery confirmation\n  - Open tracking (when client opens)\n  - Link click tracking\n  - Attachment view tracking\n• Attachment support (PDFs, images)\n• CC and BCC recipients\n• Email scheduling (send later)\n\nEmail Status Tracking:\n• Pending: Queued for sending\n• Sent: Successfully delivered\n• Delivered: Confirmed delivery\n• Opened: Client opened email\n• Clicked: Client clicked links\n• Failed: Delivery failed\n• Bounced: Email address invalid\n\nCommunication History:\n• All communications logged automatically\n• Searchable by keyword\n• Filter by type (email, call, meeting)\n• Export communication records\n• Add manual notes for phone calls\n\nPhone Call Logging:\n1. Click 'Log Call' in client profile\n2. Select call type:\n   • Outbound\n   • Inbound\n   • Missed\n3. Enter call notes\n4. Set follow-up reminder if needed\n5. Duration recorded\n\nAppointment Management:\n• Schedule from client profile\n• Types:\n  - Initial consultation\n  - Measurement visit\n  - Sample viewing\n  - Installation\n  - Follow-up inspection\n• Auto-email reminders\n• Calendar integration\n• Location tracking\n• Add team members\n\nAutomated Communications:\n• Quote sent confirmation\n• Appointment reminders (24hr and 1hr before)\n• Status update notifications\n• Payment reminders\n• Review requests\n• Birthday messages\n• Seasonal promotions\n\nCommunication Preferences:\n• Per-client settings:\n  - Preferred contact method\n  - Best time to contact\n  - Language preference\n  - Marketing opt-in/out\n• Respects do-not-contact flags\n• GDPR/privacy compliance\n\nTemplate Customization:\n1. Go to Settings > Communication Templates\n2. Edit existing templates or create new\n3. Use merge fields:\n   {client_name}\n   {company_name}\n   {quote_number}\n   {project_name}\n   {amount}\n   {due_date}\n4. Preview before sending\n5. Save as personal or company template" 
        },
        { 
          id: "funnel-management", 
          title: "Sales Funnel & Lead Stages", 
          content: "Track clients through your sales funnel with automated stage progression.\n\nFunnel Stages:\n\n1. Lead (Initial Contact)\n   • New inquiry received\n   • Contact information collected\n   • Not yet qualified\n   • Actions:\n     - Schedule initial consultation\n     - Send welcome email\n     - Research client needs\n\n2. Contacted (First Touch)\n   • Initial contact made\n   • Qualifying conversation completed\n   • Interest level determined\n   • Actions:\n     - Schedule measurement visit\n     - Send information pack\n     - Provide initial estimate\n\n3. Measuring Scheduled\n   • Appointment booked\n   • Site visit arranged\n   • Measurement date confirmed\n   • Actions:\n     - Send appointment confirmation\n     - Prepare measurement sheet\n     - Review property details\n\n4. Quoted (Proposal Sent)\n   • Formal quote provided\n   • Awaiting client decision\n   • Negotiation may be ongoing\n   • Actions:\n     - Follow up after 48hrs\n     - Answer questions\n     - Adjust quote if needed\n\n5. Negotiating\n   • Price discussion\n   • Terms being finalized\n   • Client comparing options\n   • Actions:\n     - Provide alternatives\n     - Justify value\n     - Close deal\n\n6. Approved (Won)\n   • Client accepted quote\n   • Deposit received\n   • Project starting\n   • Actions:\n     - Convert to project\n     - Order materials\n     - Schedule production\n\n7. In Progress\n   • Active project underway\n   • Manufacturing/installation\n   • Regular updates to client\n   • Actions:\n     - Update progress\n     - Send photos\n     - Coordinate installation\n\n8. Completed (Delivered)\n   • Project finished\n   • Client satisfied\n   • Final payment received\n   • Actions:\n     - Request review\n     - Ask for referrals\n     - Add to portfolio\n\n9. Lost (Closed Lost)\n   • Client declined\n   • Went with competitor\n   • Budget issues\n   • Actions:\n     - Request feedback\n     - Tag for future follow-up\n     - Learn from loss\n\nAutomatic Stage Progression:\n• Email sent → 'Contacted'\n• Appointment created → 'Measuring Scheduled'\n• Quote generated → 'Quoted'\n• Quote approved → 'Approved'\n• Project created → 'In Progress'\n• Project completed → 'Completed'\n\nManual Stage Updates:\n• Click stage indicator in client profile\n• Select new stage from dropdown\n• Add note explaining change\n• Stage history tracked\n\nFunnel Analytics:\n• Conversion rates per stage\n• Average time in each stage\n• Drop-off analysis\n• Win/loss ratios\n• Revenue by funnel stage\n• Stage velocity metrics\n\nFollow-up Automation:\n• Auto-schedule follow-ups:\n  - Lead: Follow up in 1 day\n  - Contacted: Follow up in 3 days\n  - Quoted: Follow up in 2 days\n  - Negotiating: Follow up in 1 day\n• Reminders appear in task list\n• Email templates for each stage\n• Customizable timing rules" 
        },
      ]
    },
    {
      id: "inventory",
      title: "Inventory Library",
      icon: Package,
      subsections: [
        { 
          id: "fabrics", 
          title: "Fabric Management", 
          content: "Comprehensive fabric inventory tracking system.\n\nAccessing Fabrics:\n• Navigate to Inventory tab\n• Click 'Fabrics' sub-tab\n• View all fabric inventory\n\nFabric Categories:\n• Curtain Fabrics\n• Sheer Fabrics\n• Blockout Fabrics\n• Lining Fabrics\n• Upholstery Fabrics\n• Outdoor Fabrics\n• Blind Fabrics (roller, roman)\n\nAdding New Fabrics:\n1. Click '+ Add Fabric'\n2. Enter Basic Information:\n   • SKU/Product Code (unique identifier)\n   • Fabric Name\n   • Collection/Range name\n   • Supplier\n   • Color/Pattern name\n\n3. Specifications:\n   • Width (typically 137cm, 300cm, etc.)\n   • Composition (e.g., 100% Polyester, Linen blend)\n   • Weight (grams per square meter)\n   • Pattern Repeat:\n     - Vertical repeat (cm)\n     - Horizontal repeat (cm)\n     - Pattern match type (straight, half-drop)\n   • Care Instructions\n   • Fire rating (if applicable)\n\n4. Pricing:\n   • Cost Price (per meter, what you pay supplier)\n   • Selling Price (per meter, what you charge)\n   • Markup % (auto-calculated)\n   • Minimum Order Quantity (MOQ)\n   • Lead Time (days)\n\n5. Stock Management:\n   • Current Stock Level (meters)\n   • Reorder Point (when to reorder)\n   • Reorder Quantity (how much to order)\n   • Location (warehouse location/bin)\n\n6. Visual & Documentation:\n   • Upload fabric swatch image\n   • Upload pattern/texture photo\n   • Attach supplier data sheets\n   • Add color codes (RAL, Pantone, etc.)\n\n7. Additional Settings:\n   • Active/Inactive status\n   • Featured (show in online store)\n   • Available for online quote calculator\n   • Tags (for filtering)\n   • Custom notes\n\nFabric Search & Filter:\n• Search by SKU, name, or supplier\n• Filter by:\n  - Category\n  - Supplier\n  - Color family\n  - Width\n  - In stock / Out of stock\n  - Price range\n• Sort by: Name, Price, Stock level, Supplier\n\nStock Tracking:\n• Automatic deduction when:\n  - Quote converts to project\n  - Materials allocated to job\n  - Manual stock adjustment\n• Stock history:\n  - All transactions logged\n  - Source (job number, adjustment reason)\n  - Quantity change\n  - Date/time stamp\n  - User who made change\n\nLow Stock Alerts:\n• System monitors stock levels\n• Alert when stock reaches reorder point\n• Email notifications\n• Reorder list in dashboard\n• Quick reorder from inventory screen\n\nBulk Operations:\n• Import fabrics from CSV/Excel\n• Export inventory to spreadsheet\n• Bulk price updates\n• Bulk status changes\n• Mass photo uploads\n\nFabric Usage Reports:\n• Most used fabrics\n• Least popular items\n• Stock value by supplier\n• Aging inventory (slow-moving)\n• Profitability by fabric\n• Meterage usage over time" 
        },
        { 
          id: "hardware", 
          title: "Hardware & Accessories", 
          content: "Manage curtain tracks, poles, blinds hardware, and accessories.\n\nHardware Categories:\n\n1. Curtain Tracks:\n   • Aluminum tracks\n   • PVC tracks\n   • Wave tracks\n   • Corded/uncorded\n   • Motorized track systems\n\n2. Curtain Poles & Rods:\n   • Wooden poles\n   • Metal poles (chrome, brass, black)\n   • Tension rods\n   • Bay window poles\n   • Traverse rods\n\n3. Brackets & Fittings:\n   • Wall brackets\n   • Ceiling brackets\n   • Center support brackets\n   • End caps and finials\n   • Brackets by weight capacity\n\n4. Blind Components:\n   • Roller blind mechanisms\n   • Roman blind systems\n   • Venetian blind headrails\n   • Vertical blind tracks\n   • Panel glide systems\n\n5. Curtain Accessories:\n   • Hooks and rings\n   • Gliders and carriers\n   • Tiebacks (fabric, rope, magnetic)\n   • Hold backs\n   • Weights and chains\n\n6. Installation Hardware:\n   • Screws and anchors\n   • Wall plugs\n   • Mounting plates\n   • Adhesive strips\n\n7. Motorization:\n   • Motors (battery, wired, solar)\n   • Remote controls\n   • Smart home integration\n   • Controllers and switches\n\nAdding Hardware Items:\n1. Navigate to Inventory > Hardware\n2. Click '+ Add Hardware'\n3. Enter Details:\n   • SKU/Product code\n   • Product name and description\n   • Category/Type\n   • Brand/Manufacturer\n   • Supplier\n\n4. Specifications:\n   • Dimensions (length, diameter, etc.)\n   • Color/Finish\n   • Material\n   • Weight capacity (if applicable)\n   • Compatible systems\n\n5. Pricing:\n   • Unit type (per item, per meter, per set)\n   • Cost price\n   • Sell price\n   • Quantity breaks (volume discounts)\n\n6. Stock:\n   • Quantity on hand\n   • Reorder level\n   • Location\n\n7. Images:\n   • Product photo\n   • Installation guide images\n   • Technical drawings\n\nHardware Ordering:\n• Quick reorder from stock screen\n• Generate purchase orders\n• Track deliveries\n• Receive stock (update quantities)\n• Partial deliveries handled\n\nCross-Selling Suggestions:\n• System suggests compatible items\n• E.g., select track → suggests brackets, gliders\n• Ensures all components ordered\n• Reduces installation delays\n\nInstallation Guides:\n• Attach PDF installation instructions\n• Link to video tutorials\n• Specification sheets\n• Available from hardware details" 
        },
        { 
          id: "templates", 
          title: "Treatment Templates", 
          content: "Pre-configured templates for common window treatments.\n\nTemplate System Overview:\nTemplates define:\n• Default measurements and calculations\n• Material requirements\n• Pricing formulas\n• Manufacturing specifications\n• Labor requirements\n\nAccessing Templates:\n• Navigate to Inventory > Templates\n• View all treatment types\n• Pre-loaded with industry standards\n\nTemplate Components:\n\n1. Basic Information:\n   • Template name\n   • Treatment category\n   • Curtain type\n   • Heading style\n   • Description\n\n2. Measurement Settings:\n   • Required dimensions\n   • Width measurement method\n   • Drop measurement method\n   • Allowances (hems, headings)\n\n3. Fabric Calculations:\n   • Fullness ratio (1.5x, 2x, 2.5x, etc.)\n   • Fabric direction (vertical, horizontal)\n   • Fabric width utilization\n   • Seam allowances\n   • Pattern repeat handling\n   • Cut drop calculations\n\n4. Hardware Requirements:\n   • Track/pole type\n   • Brackets per meter\n   • Accessories needed\n   • Installation components\n\n5. Pricing Structure:\n   • Pricing method:\n     - Per meter\n     - Per square meter\n     - Per panel\n     - Fixed price\n   • Labor pricing:\n     - Making charges\n     - Installation charges\n     - Per item or hourly\n\n6. Manufacturing:\n   • Manufacturing type (hand/machine)\n   • Production time estimate\n   • Special requirements\n   • Quality check points\n\nUsing Templates in Quotes:\n1. In quote builder, click 'Add Treatment'\n2. Select 'From Template'\n3. Choose template from list\n4. Enter window measurements\n5. System auto-calculates:\n   • Fabric meterage\n   • Hardware quantities\n   • Total pricing\n6. Customize if needed\n7. Add to quote\n\nCustomizing Templates:\n1. Open template for editing\n2. Modify any parameter\n3. Test with sample measurements\n4. Save changes or 'Save As' new template\n5. Set as active/inactive\n\nCreating Custom Templates:\n1. Click '+ New Template'\n2. Select treatment category\n3. Define all parameters\n4. Set calculation formulas\n5. Enter default pricing\n6. Test thoroughly\n7. Activate for use\n\nTemplate Categories:\n• Curtains (pinch pleat, eyelet, tab top, etc.)\n• Sheers\n• Blinds (roller, roman, venetian, vertical)\n• Panel glides\n• Shutters\n• Awnings\n• Specialty treatments\n\nSharing Templates:\n• Export templates\n• Import from suppliers\n• Share within team\n• Company-wide standards" 
        },
        { 
          id: "vendors", 
          title: "Supplier & Vendor Management", 
          content: "Maintain relationships with your suppliers and vendors.\n\nAdding Suppliers:\n1. Navigate to Inventory > Vendors\n2. Click '+ Add Vendor'\n3. Enter Information:\n   • Company name\n   • Contact person\n   • Email and phone\n   • Website\n   • Physical address\n   • Tax ID / ABN\n\n4. Business Terms:\n   • Payment terms (Net 30, Net 60, COD, etc.)\n   • Minimum order value\n   • Delivery charges\n   • Freight terms\n   • Account number with supplier\n\n5. Delivery Information:\n   • Standard lead times\n   • Cut-off times for orders\n   • Delivery days\n   • Express options\n   • Delivery areas\n\n6. Product Categories:\n   • What they supply (fabrics, hardware, etc.)\n   • Primary supplier (yes/no)\n   • Quality rating\n   • Preferred supplier\n\nSupplier Portal Integration:\n• Some suppliers offer API integration\n• Connect to supplier systems:\n  - Real-time stock availability\n  - Auto-updated pricing\n  - Electronic order submission\n  - Delivery tracking\n  - Invoice downloads\n\nOrdering from Suppliers:\n\nManual Purchase Orders:\n1. Navigate to Ordering Hub\n2. Select supplier\n3. Add items to order:\n   • Browse supplier catalog\n   • Enter quantities\n   • System shows:\n     - Unit prices\n     - Total cost\n     - Required for jobs\n4. Review order\n5. Submit:\n   • Email to supplier\n   • Print PO\n   • Export to their system\n\nAutomatic Reordering:\n• System suggests items to reorder\n• Based on:\n  - Stock below reorder point\n  - Materials needed for active jobs\n  - Historical usage patterns\n• One-click reorder\n• Groups by supplier automatically\n\nReceiving Stock:\n1. Order delivered\n2. Open purchase order\n3. Mark items as received:\n   • Full delivery or partial\n   • Enter received quantities\n   • Note any discrepancies\n4. System updates:\n   • Inventory quantities\n   • Purchase order status\n   • Job availability\n   • Reorder alerts\n\nSupplier Performance:\nTrack and compare suppliers:\n• Delivery reliability\n• Order accuracy\n• Lead time consistency\n• Quality issues\n• Pricing competitiveness\n• Response time\n• Overall rating\n\nSupplier Documents:\n• Store important documents:\n  - Price lists\n  - Product catalogs\n  - Fabric swatch cards\n  - Technical specifications\n  - Terms and conditions\n  - Insurance certificates\n  - Quality assurance docs\n\nCommunication History:\n• All supplier communications logged\n• Email correspondence\n• Phone call notes\n• Meeting records\n• Issues and resolutions\n\nPreferred Suppliers:\n• Mark suppliers as preferred\n• System prioritizes in selection\n• Quick access to top suppliers\n• Better pricing and terms" 
        },
        { 
          id: "stock-tracking", 
          title: "Stock Tracking & Inventory Control", 
          content: "Real-time inventory management and stock control.\n\nStock Tracking Features:\n\n1. Real-time Updates:\n   • Stock levels update automatically when:\n     - Materials allocated to jobs\n     - Purchase orders received\n     - Stock adjustments made\n     - Returns processed\n   • Accurate stock counts at all times\n\n2. Stock Locations:\n   • Multiple warehouse locations\n   • Bin/shelf locations within warehouse\n   • Van/vehicle stock\n   • Offsite storage\n   • Track location of each item\n\n3. Stock Movements:\n   All movements logged:\n   • Date and time\n   • Item and quantity\n   • Movement type:\n     - Received (from supplier)\n     - Allocated (to job)\n     - Returned (from job)\n     - Adjusted (count correction)\n     - Transferred (between locations)\n     - Consumed (used/installed)\n     - Damaged/Disposed\n   • Source/destination\n   • User who performed action\n   • Reference (PO number, job number)\n\n4. Low Stock Alerts:\n   • Configure reorder points per item\n   • Alerts appear:\n     - Dashboard widget\n     - Email notifications\n     - Mobile notifications\n   • Suggested reorder quantities\n   • One-click reorder\n\n5. Stock Valuation:\n   • Total stock value\n   • Value by category\n   • Value by supplier\n   • Cost vs. retail value\n   • Profit potential\n\n6. Stock Allocation:\n   When quote converts to project:\n   • System checks stock availability\n   • Allocates materials to job\n   • Reserves stock (not available for other jobs)\n   • Updates available quantities\n   • Creates picking list\n\n7. Stock Adjustments:\n   For corrections:\n   1. Select item\n   2. Click 'Adjust Stock'\n   3. Enter:\n      - New quantity OR\n      - Adjustment amount (+/-)\n   4. Select reason:\n      - Physical count correction\n      - Damaged goods\n      - Sample used\n      - Theft/loss\n      - Other (with note)\n   5. Save adjustment\n   6. Audit trail created\n\n8. Stocktake Process:\n   • Generate stocktake sheet\n   • Print or use mobile app\n   • Count physical stock\n   • Enter actual quantities\n   • System compares to records\n   • Shows discrepancies\n   • Adjust and explain variances\n\n9. Stock Reports:\n   • Current stock levels\n   • Stock movements (date range)\n   • Stock valuation\n   • Aging inventory\n   • Fast/slow moving items\n   • Reorder requirements\n   • Stock accuracy\n   • Shrinkage report\n\n10. Batch/Lot Tracking:\n    • Track fabric by batch/dye lot\n    • Ensure color consistency\n    • Match lots for large orders\n    • Trace quality issues\n\nMinimum Stock Levels:\n• Set per item\n• Based on:\n  - Lead time\n  - Usage rate\n  - Safety stock\n• Automatic alerts\n• Prevent stockouts\n\nMaximum Stock Levels:\n• Avoid overstock\n• Reduce capital tied up\n• Minimize storage costs\n• Alert if ordering too much\n\nStock Transfer:\nBetween locations:\n1. Select items to transfer\n2. Choose destination\n3. Create transfer order\n4. Physical move\n5. Confirm receipt\n6. Stock updated both locations\n\nReturns Management:\n• Return materials from jobs\n• Reason codes\n• Condition assessment\n• Restock or dispose\n• Update stock quantities\n• Credit to job if applicable" 
        },
        { 
          id: "import-export", 
          title: "Bulk Import & Export", 
          content: "Efficiently manage large amounts of inventory data.\n\nImporting Inventory:\n\n1. Prepare Import File:\n   • Use CSV or Excel format\n   • Download template from system:\n     - Inventory > Import > Download Template\n   • Required columns:\n     - SKU (unique)\n     - Name\n     - Category\n     - Supplier\n     - Cost price\n     - Sell price\n   • Optional columns:\n     - Description\n     - Specifications\n     - Stock quantity\n     - Reorder point\n     - Dimensions\n     - Images (file paths)\n     - Tags\n     - Custom fields\n\n2. Import Process:\n   • Navigate to Inventory > Import\n   • Click 'Choose File'\n   • Select your CSV/Excel file\n   • Map columns:\n     - System auto-detects if using template\n     - Manually map if different format\n   • Preview import:\n     - See first 10 rows\n     - Check for errors\n     - Validation warnings shown\n   • Choose import mode:\n     - Create new items only\n     - Update existing items\n     - Create and update (upsert)\n   • Start import\n   • Progress bar shows status\n   • Import summary:\n     - Items created\n     - Items updated\n     - Errors/warnings\n     - Failed rows with reasons\n\n3. Import Validation:\n   System checks:\n   • Required fields present\n   • Data types correct\n   • SKUs unique (for new items)\n   • Prices are numbers\n   • Categories exist\n   • Suppliers exist\n   • Stock quantities non-negative\n\n4. Error Handling:\n   • Rows with errors skipped\n   • Error report generated\n   • Fix errors in spreadsheet\n   • Re-import failed rows only\n\nExporting Inventory:\n\n1. Export Options:\n   • Full inventory\n   • Filtered selection\n   • Current view\n   • Selected items only\n\n2. Export Formats:\n   • CSV (for Excel/Google Sheets)\n   • Excel (.xlsx)\n   • PDF (for printing)\n   • JSON (for developers)\n\n3. Export Process:\n   • Navigate to Inventory\n   • Apply filters if needed\n   • Click 'Export' button\n   • Choose format\n   • Select fields to include:\n     - All fields\n     - Standard fields\n     - Custom selection\n   • Include images:\n     - Image URLs\n     - Download images as ZIP\n   • Click 'Download'\n\n4. Scheduled Exports:\n   • Auto-export on schedule:\n     - Daily, weekly, monthly\n   • Email to recipients\n   • FTP upload\n   • Sync with accounting software\n\nSupplier Data Import:\n• Many suppliers provide data feeds\n• Import supplier catalogs:\n  - Pricing updates\n  - New products\n  - Stock availability\n  - Specifications\n• Auto-update pricing\n• Add new items automatically\n• Sync with supplier systems\n\nBulk Updates:\n• Export current inventory\n• Modify in spreadsheet:\n  - Update prices\n  - Change categories\n  - Update stock\n  - Add images\n• Re-import to update\n• Faster than individual updates\n\nBackup & Restore:\n• Regular exports as backup\n• Restore from export file\n• Disaster recovery\n• Data migration\n• Testing environments\n\nIntegration:\n• Import from:\n  - Accounting software\n  - Previous systems\n  - Supplier catalogs\n  - E-commerce platforms\n• Export to:\n  - Accounting systems\n  - Online stores\n  - Price lists\n  - Marketing materials" 
        },
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
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-white/20 text-white">
                v1.0
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
                          <CardDescription className="text-white/80 whitespace-pre-line leading-relaxed text-base">
                            {subsection.content}
                          </CardDescription>
                          
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
