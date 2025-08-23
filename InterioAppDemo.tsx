/**
 * InterioApp Standalone Demo Component
 * 
 * This is a complete demo version of the InterioApp that can be copied to any website.
 * It includes all the exact styling, components, and functionality but with dummy data.
 * 
 * Installation:
 * 1. Copy this file to your project
 * 2. Import and use: <InterioAppDemo />
 * 3. Customize brandText, logoUrl, and contactUrl props as needed
 * 
 * Usage:
 * <InterioAppDemo 
 *   brandText="Your Company"
 *   logoUrl="https://yourlogo.com/logo.png"
 *   contactUrl="https://yoursite.com/contact"
 * />
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FolderOpen, 
  Package, 
  Calendar,
  Menu,
  X,
  MessageCircle,
  Plus,
  TrendingUp,
  DollarSign,
  Search,
  Filter,
  Mail,
  Send,
  Home,
  Settings,
  BarChart3,
  Edit,
  Trash2,
  Eye,
  Copy,
  Building,
  Phone,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Download,
  Share,
  Target,
  Zap,
  ShoppingBag,
  UserPlus,
  CalendarDays,
  TrendingDown,
  Activity,
  PieChart,
  BarChart,
  MousePointer
} from 'lucide-react';

interface InterioAppDemoProps {
  brandText?: string;
  logoUrl?: string;
  contactUrl?: string;
  className?: string;
}

// Dummy data generators
const generateDummyClients = () => [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    company: 'Modern Living Co.',
    address: '123 Oak Street, Springfield, IL 62701',
    status: 'active',
    projects: 3,
    totalValue: 15750,
    lastContact: '2024-01-15',
    nextAppointment: '2024-01-25'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@techcorp.com',
    phone: '(555) 987-6543',
    company: 'TechCorp Office',
    address: '456 Pine Avenue, Chicago, IL 60601',
    status: 'lead',
    projects: 1,
    totalValue: 8900,
    lastContact: '2024-01-12',
    nextAppointment: '2024-01-20'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@homestyle.com',
    phone: '(555) 456-7890',
    company: 'HomeStyle Design',
    address: '789 Maple Drive, Austin, TX 78701',
    status: 'completed',
    projects: 5,
    totalValue: 32400,
    lastContact: '2024-01-10',
    nextAppointment: null
  }
];

const generateDummyJobs = () => [
  {
    id: '1',
    name: 'Modern Office Renovation',
    client: 'TechCorp Office',
    status: 'in-progress',
    value: 12500,
    deadline: '2024-02-15',
    progress: 65,
    treatments: 8,
    windows: 12
  },
  {
    id: '2',
    name: 'Luxury Home Blinds',
    client: 'Sarah Johnson',
    status: 'planning',
    value: 8750,
    deadline: '2024-02-28',
    progress: 25,
    treatments: 6,
    windows: 9
  },
  {
    id: '3',
    name: 'Restaurant Window Coverings',
    client: 'Downtown Bistro',
    status: 'quoted',
    value: 15200,
    deadline: '2024-03-10',
    progress: 10,
    treatments: 12,
    windows: 18
  }
];

const generateDummyProducts = () => [
  {
    id: '1',
    name: 'Premium Wooden Blinds',
    category: 'Blinds',
    price: 189.99,
    stock: 24,
    description: 'High-quality wooden blinds with premium finish',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop'
  },
  {
    id: '2',
    name: 'Blackout Roller Shades',
    category: 'Shades',
    price: 129.99,
    stock: 18,
    description: 'Complete light blocking roller shades',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop'
  },
  {
    id: '3',
    name: 'Custom Curtain Panels',
    category: 'Curtains',
    price: 299.99,
    stock: 12,
    description: 'Made-to-measure curtain panels',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop'
  }
];

const generateDummyAppointments = () => [
  {
    id: '1',
    title: 'Client Consultation - Sarah Johnson',
    date: '2024-01-25',
    time: '10:00 AM',
    type: 'consultation',
    client: 'Sarah Johnson',
    status: 'confirmed'
  },
  {
    id: '2',
    title: 'Installation - TechCorp Office',
    date: '2024-01-26',
    time: '2:00 PM',
    type: 'installation',
    client: 'Michael Chen',
    status: 'pending'
  },
  {
    id: '3',
    title: 'Measurement - Downtown Bistro',
    date: '2024-01-28',
    time: '9:00 AM',
    type: 'measurement',
    client: 'Restaurant Manager',
    status: 'confirmed'
  }
];

const generateDummyEmails = () => [
  {
    id: '1',
    subject: 'Quote Approved - Modern Office Renovation',
    recipient: 'michael.chen@techcorp.com',
    status: 'sent',
    date: '2024-01-15',
    type: 'quote'
  },
  {
    id: '2',
    subject: 'Installation Reminder - Luxury Home Blinds',
    recipient: 'sarah.johnson@email.com',
    status: 'delivered',
    date: '2024-01-14',
    type: 'reminder'
  },
  {
    id: '3',
    subject: 'Thank You - Project Completion',
    recipient: 'emily.r@homestyle.com',
    status: 'opened',
    date: '2024-01-12',
    type: 'follow-up'
  }
];

export const InterioAppDemo: React.FC<InterioAppDemoProps> = ({
  brandText = "InterioApp",
  logoUrl,
  contactUrl = "#",
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dummy data
  const clients = generateDummyClients();
  const jobs = generateDummyJobs();
  const products = generateDummyProducts();
  const appointments = generateDummyAppointments();
  const emails = generateDummyEmails();

  const navItems = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "projects", label: "Jobs", icon: FolderOpen },
    { id: "clients", label: "CRM", icon: Users },
    { id: "quotes", label: "Emails", icon: FileText },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "inventory", label: "Library", icon: Package },
  ];

  // Embedded CSS styles
  const demoStyles = `
    .interio-demo {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --primary: 200 25% 34%;
      --primary-foreground: 189 20% 60%;
      --secondary: 189 20% 60%;
      --background: 0 0% 100%;
      --foreground: 200 25% 34%;
      --muted: 210 40% 98%;
      --muted-foreground: 200 25% 34%;
      --border: 189 20% 60%;
      --card: 0 0% 100%;
      --card-foreground: 200 25% 34%;
      --destructive: 0 84.2% 60.2%;
      --radius: 0.75rem;
    }
    
    .demo-card {
      background: white;
      border: 1px solid hsl(var(--border));
      border-radius: var(--radius);
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }
    
    .demo-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: calc(var(--radius) - 2px);
      font-weight: 500;
      transition: all 0.2s;
      cursor: pointer;
      text-decoration: none;
    }
    
    .demo-button-primary {
      background: hsl(var(--primary));
      color: white;
      padding: 0.5rem 1rem;
      border: none;
    }
    
    .demo-button-primary:hover {
      background: hsl(var(--primary) / 0.9);
    }
    
    .demo-button-ghost {
      background: transparent;
      color: hsl(var(--foreground));
      padding: 0.5rem 1rem;
      border: none;
    }
    
    .demo-button-ghost:hover {
      background: hsl(var(--muted));
    }
    
    .demo-button-outline {
      background: transparent;
      color: hsl(var(--foreground));
      padding: 0.5rem 1rem;
      border: 1px solid hsl(var(--border));
    }
    
    .demo-button-outline:hover {
      background: hsl(var(--muted));
    }
    
    .demo-input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid hsl(var(--border));
      border-radius: calc(var(--radius) - 2px);
      background: white;
      font-size: 0.875rem;
    }
    
    .demo-input:focus {
      outline: 2px solid hsl(var(--primary));
      outline-offset: 2px;
    }
    
    .demo-badge {
      display: inline-flex;
      align-items: center;
      border-radius: 9999px;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .demo-badge-success {
      background: #dcfce7;
      color: #166534;
    }
    
    .demo-badge-warning {
      background: #fef3c7;
      color: #92400e;
    }
    
    .demo-badge-error {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .demo-badge-info {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .demo-animate-fade-in {
      animation: demo-fade-in 0.3s ease-out;
    }
    
    @keyframes demo-fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .demo-grid {
      display: grid;
      gap: 1.5rem;
    }
    
    .demo-grid-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .demo-grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .demo-grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .demo-grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    
    @media (max-width: 768px) {
      .demo-grid-2, .demo-grid-3, .demo-grid-4 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      .demo-grid-3, .demo-grid-4 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    
    .demo-cta-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #3b82f6;
      color: white;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-weight: 600;
      z-index: 10;
      animation: demo-pulse 2s infinite;
    }
    
    @keyframes demo-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    .demo-tooltip {
      position: relative;
    }
    
    .demo-tooltip:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: #1f2937;
      color: white;
      padding: 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      white-space: nowrap;
      z-index: 50;
    }
  `;

  // Header Component
  const DemoHeader = () => (
    <header style={{ background: 'white', borderBottom: '1px solid hsl(var(--border))', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {logoUrl ? (
              <img src={logoUrl} alt={brandText} style={{ height: '2rem', width: 'auto' }} />
            ) : (
              <div style={{ 
                background: 'hsl(var(--primary))', 
                color: 'white', 
                padding: '0.5rem', 
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                fontSize: '1.25rem'
              }}>
                {brandText.charAt(0)}
              </div>
            )}
            <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'hsl(var(--foreground))' }}>
              {brandText}
            </span>
            <span className="demo-cta-badge">DEMO</span>
          </div>
          
          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <nav style={{ display: 'none', gap: '0.25rem', '@media (min-width: 768px)': { display: 'flex' } }} className="demo-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`demo-button ${isActive ? 'demo-button-primary' : 'demo-button-ghost'}`}
                    style={{ fontSize: '0.875rem', gap: '0.5rem' }}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            
            {/* Mobile menu button */}
            <button
              className="demo-button demo-button-ghost md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'none', '@media (max-width: 767px)': { display: 'flex' } }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <a 
              href={contactUrl}
              className="demo-button demo-button-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div style={{ background: 'white', borderTop: '1px solid hsl(var(--border))', padding: '1rem' }} className="md:hidden">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`demo-button ${isActive ? 'demo-button-primary' : 'demo-button-ghost'}`}
                  style={{ justifyContent: 'flex-start', gap: '0.75rem', width: '100%', fontSize: '0.875rem' }}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );

  // Dashboard Component
  const DemoDashboard = () => (
    <div style={{ padding: '1.5rem', minHeight: '100vh', background: '#fafafa' }} className="demo-animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>
          Dashboard
        </h1>
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>
          Welcome back! Here's what's happening with your business.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="demo-grid demo-grid-4" style={{ marginBottom: '2rem' }}>
        <div className="demo-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: 'hsl(var(--muted-foreground))' }}>Total Clients</h3>
            <Users size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>24</div>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Active clients</p>
        </div>

        <div className="demo-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: 'hsl(var(--muted-foreground))' }}>Pending Quotes</h3>
            <FileText size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>8</div>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Awaiting response</p>
        </div>

        <div className="demo-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: 'hsl(var(--muted-foreground))' }}>Low Stock Items</h3>
            <Package size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>3</div>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Need reordering</p>
        </div>

        <div className="demo-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: 'hsl(var(--muted-foreground))' }}>Total Revenue</h3>
            <DollarSign size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>$48,250</div>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>This month</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="demo-grid demo-grid-2">
        <div className="demo-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <Calendar size={20} style={{ marginRight: '0.5rem', color: 'hsl(var(--primary))' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>Upcoming Appointments</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {appointments.slice(0, 3).map((appointment) => (
              <div key={appointment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'hsl(var(--muted))', borderRadius: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: '500', fontSize: '0.875rem', color: 'hsl(var(--foreground))' }}>{appointment.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{appointment.date} at {appointment.time}</div>
                </div>
                <span className={`demo-badge demo-badge-${appointment.status === 'confirmed' ? 'success' : 'warning'}`}>
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="demo-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <TrendingUp size={20} style={{ marginRight: '0.5rem', color: 'hsl(var(--primary))' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>Quick Stats</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Conversion Rate</span>
              <span style={{ fontWeight: '500', color: 'hsl(var(--foreground))' }}>73%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Average Order Value</span>
              <span style={{ fontWeight: '500', color: 'hsl(var(--foreground))' }}>$2,150</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Customer Satisfaction</span>
              <span style={{ fontWeight: '500', color: 'hsl(var(--foreground))' }}>4.8/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Jobs Component
  const DemoJobs = () => (
    <div style={{ padding: '1.5rem', minHeight: '100vh', background: '#fafafa' }} className="demo-animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>Jobs</h1>
          <span className="demo-badge demo-badge-info">{jobs.length} jobs</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
            <input
              type="text"
              placeholder="Search jobs..."
              className="demo-input"
              style={{ paddingLeft: '2.5rem', width: '250px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="demo-button demo-button-primary" style={{ gap: '0.5rem' }}>
            <Plus size={16} />
            New Job
            <span className="demo-cta-badge" style={{ position: 'relative', top: 'auto', right: 'auto', marginLeft: '0.5rem' }}>Try It!</span>
          </button>
        </div>
      </div>

      <div className="demo-grid demo-grid-1">
        {jobs.map((job) => (
          <div key={job.id} className="demo-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'hsl(var(--foreground))', marginBottom: '0.25rem' }}>
                  {job.name}
                </h3>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>{job.client}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="demo-button demo-button-outline" style={{ padding: '0.5rem' }}>
                  <Eye size={16} />
                </button>
                <button className="demo-button demo-button-outline" style={{ padding: '0.5rem' }}>
                  <Edit size={16} />
                </button>
              </div>
            </div>
            
            <div className="demo-grid demo-grid-4" style={{ marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}>Value</div>
                <div style={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>${job.value.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}>Progress</div>
                <div style={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>{job.progress}%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}>Windows</div>
                <div style={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>{job.windows}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}>Status</div>
                <span className={`demo-badge demo-badge-${
                  job.status === 'completed' ? 'success' : 
                  job.status === 'in-progress' ? 'info' : 
                  job.status === 'quoted' ? 'warning' : 'info'
                }`}>
                  {job.status}
                </span>
              </div>
            </div>
            
            <div style={{ width: '100%', height: '8px', background: 'hsl(var(--muted))', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${job.progress}%`, 
                  height: '100%', 
                  background: 'hsl(var(--primary))',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // CRM Component
  const DemoCRM = () => (
    <div style={{ padding: '1.5rem', minHeight: '100vh', background: '#fafafa' }} className="demo-animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>Client Management</h1>
          <span className="demo-badge demo-badge-info">{clients.length} clients</span>
        </div>
        <button className="demo-button demo-button-primary" style={{ gap: '0.5rem' }}>
          <UserPlus size={16} />
          Add Client
        </button>
      </div>

      <div className="demo-grid demo-grid-1" style={{ gap: '1rem' }}>
        {clients.map((client) => (
          <div key={client.id} className="demo-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    background: 'hsl(var(--primary))', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.25rem'
                  }}>
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'hsl(var(--foreground))', marginBottom: '0.25rem' }}>
                      {client.name}
                    </h3>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>{client.company}</p>
                  </div>
                  <span className={`demo-badge demo-badge-${
                    client.status === 'active' ? 'success' : 
                    client.status === 'lead' ? 'warning' : 'info'
                  }`}>
                    {client.status}
                  </span>
                </div>
                
                <div className="demo-grid demo-grid-3" style={{ marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Phone size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
                      <span style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground))' }}>{client.phone}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}>Total Value</div>
                    <div style={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>${client.totalValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}>Projects</div>
                    <div style={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>{client.projects}</div>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="demo-button demo-button-outline" style={{ padding: '0.5rem' }}>
                  <Mail size={16} />
                </button>
                <button className="demo-button demo-button-outline" style={{ padding: '0.5rem' }}>
                  <Edit size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Email Management Component
  const DemoEmails = () => (
    <div style={{ padding: '1.5rem', minHeight: '100vh', background: '#fafafa' }} className="demo-animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>Email Management</h1>
          <span className="demo-badge demo-badge-info">{emails.length} emails</span>
        </div>
        <button className="demo-button demo-button-primary" style={{ gap: '0.5rem' }}>
          <Send size={16} />
          Compose Email
        </button>
      </div>

      <div className="demo-grid demo-grid-1">
        {emails.map((email) => (
          <div key={email.id} className="demo-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'hsl(var(--foreground))', marginBottom: '0.5rem' }}>
                  {email.subject}
                </h3>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  To: {email.recipient}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>{email.date}</span>
                  <span className={`demo-badge demo-badge-${
                    email.status === 'sent' ? 'info' : 
                    email.status === 'delivered' ? 'success' : 
                    email.status === 'opened' ? 'success' : 'warning'
                  }`}>
                    {email.status}
                  </span>
                  <span className="demo-badge demo-badge-info" style={{ fontSize: '0.75rem' }}>
                    {email.type}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="demo-button demo-button-outline" style={{ padding: '0.5rem' }}>
                  <Eye size={16} />
                </button>
                <button className="demo-button demo-button-outline" style={{ padding: '0.5rem' }}>
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Calendar Component
  const DemoCalendar = () => (
    <div style={{ padding: '1.5rem', minHeight: '100vh', background: '#fafafa' }} className="demo-animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>Calendar</h1>
          <span className="demo-badge demo-badge-info">{appointments.length} appointments</span>
        </div>
        <button className="demo-button demo-button-primary" style={{ gap: '0.5rem' }}>
          <Plus size={16} />
          New Appointment
        </button>
      </div>

      <div className="demo-grid demo-grid-1">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="demo-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'hsl(var(--foreground))', marginBottom: '0.5rem' }}>
                  {appointment.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarDays size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
                    <span style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground))' }}>{appointment.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
                    <span style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground))' }}>{appointment.time}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`demo-badge demo-badge-${appointment.status === 'confirmed' ? 'success' : 'warning'}`}>
                    {appointment.status}
                  </span>
                  <span className="demo-badge demo-badge-info" style={{ fontSize: '0.75rem' }}>
                    {appointment.type}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="demo-button demo-button-outline" style={{ padding: '0.5rem' }}>
                  <Edit size={16} />
                </button>
                <button className="demo-button demo-button-outline" style={{ padding: '0.5rem' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Library Component
  const DemoLibrary = () => (
    <div style={{ padding: '1.5rem', minHeight: '100vh', background: '#fafafa' }} className="demo-animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>Product Library</h1>
          <span className="demo-badge demo-badge-info">{products.length} products</span>
        </div>
        <button className="demo-button demo-button-primary" style={{ gap: '0.5rem' }}>
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="demo-grid demo-grid-3">
        {products.map((product) => (
          <div key={product.id} className="demo-card" style={{ padding: '0', overflow: 'hidden' }}>
            <img 
              src={product.image} 
              alt={product.name}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'hsl(var(--foreground))', marginBottom: '0.25rem' }}>
                    {product.name}
                  </h3>
                  <span className="demo-badge demo-badge-info" style={{ fontSize: '0.75rem' }}>
                    {product.category}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>
                    ${product.price}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                    Stock: {product.stock}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
                {product.description}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="demo-button demo-button-outline" style={{ flex: 1, fontSize: '0.875rem' }}>
                  View Details
                </button>
                <button className="demo-button demo-button-primary" style={{ flex: 1, fontSize: '0.875rem' }}>
                  Add to Quote
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DemoDashboard />;
      case "projects":
        return <DemoJobs />;
      case "clients":
        return <DemoCRM />;
      case "quotes":
        return <DemoEmails />;
      case "calendar":
        return <DemoCalendar />;
      case "inventory":
        return <DemoLibrary />;
      default:
        return <DemoDashboard />;
    }
  };

  return (
    <div className={`interio-demo ${className}`} style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <style>{demoStyles}</style>
      <DemoHeader />
      {renderActiveComponent()}
      
      {/* Demo Footer */}
      <div style={{ 
        background: 'hsl(var(--primary))', 
        color: 'white', 
        padding: '2rem 1.5rem',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Ready to Get Started?
        </h2>
        <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
          This is just a demo. Click below to learn more about the full InterioApp experience.
        </p>
        <a 
          href={contactUrl}
          className="demo-button"
          style={{ 
            background: 'white', 
            color: 'hsl(var(--primary))', 
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MousePointer size={20} />
          Get Full Access
        </a>
      </div>
    </div>
  );
};

export default InterioAppDemo;