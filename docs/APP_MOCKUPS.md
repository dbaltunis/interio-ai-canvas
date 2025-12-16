# InterioApp - Interactive App Mockups

Ready-to-use mockup components that simulate the actual app interface with animated tooltips highlighting key features.

---

## Overview

Each mockup component:
- Displays a realistic preview of the app screen
- Includes animated floating tooltips
- Uses the same design tokens as the app
- Is responsive and works on all screen sizes
- Can be customized with different tooltip positions and content

---

## 1. Dashboard Mockup

The main dashboard showing KPIs, revenue charts, and quick actions.

```tsx
// src/components/website-kit/mockups/DashboardMockup.tsx
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign,
  Calendar,
  FileText
} from 'lucide-react';
import { TooltipPointer } from '../TooltipPointer';
import { cn } from '@/lib/utils';

export const DashboardMockup = ({ className }: { className?: string }) => {
  return (
    <div className={cn(
      "relative bg-card rounded-2xl border border-border overflow-hidden shadow-2xl",
      className
    )}>
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/50" />
          <div className="w-3 h-3 rounded-full bg-warning/50" />
          <div className="w-3 h-3 rounded-full bg-success/50" />
        </div>
        <span className="text-xs text-muted-foreground">Dashboard — InterioApp</span>
      </div>
      
      <div className="p-6">
        {/* Welcome header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">Good morning, Sarah 👋</h2>
          <p className="text-sm text-muted-foreground">Here's what's happening today</p>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative p-4 bg-background rounded-xl border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-foreground">$45,230</p>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +12.5%
            </p>
            
            {/* Tooltip */}
            <TooltipPointer
              label="Real-time KPIs"
              description="Track your business metrics"
              position="top-left"
              number={1}
              className="hidden md:block"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-background rounded-xl border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Active Jobs</span>
            </div>
            <p className="text-2xl font-bold text-foreground">24</p>
            <p className="text-xs text-muted-foreground mt-1">8 due this week</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-background rounded-xl border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">New Leads</span>
            </div>
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground mt-1">3 hot leads</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="p-4 bg-background rounded-xl border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Quotes Sent</span>
            </div>
            <p className="text-2xl font-bold text-foreground">8</p>
            <p className="text-xs text-success mt-1">$32,400 value</p>
          </motion.div>
        </div>
        
        {/* Chart area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="relative bg-background rounded-xl border border-border p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">Revenue Overview</h3>
            <select className="text-xs bg-card border border-border rounded px-2 py-1 text-muted-foreground">
              <option>Last 30 days</option>
            </select>
          </div>
          
          {/* Simplified chart visualization */}
          <div className="h-32 flex items-end justify-between gap-2">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/20 rounded-t transition-all hover:bg-primary/40"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          
          <TooltipPointer
            label="Visual analytics"
            description="Beautiful charts and reports"
            position="right"
            number={2}
            className="hidden md:block"
          />
        </motion.div>
        
        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="relative flex gap-3"
        >
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
            <Briefcase className="w-4 h-4" />
            New Job
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground">
            <Users className="w-4 h-4" />
            Add Client
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground">
            <Calendar className="w-4 h-4" />
            Schedule
          </button>
          
          <TooltipPointer
            label="Quick actions"
            description="One-click to get started"
            position="bottom-left"
            number={3}
            className="hidden md:block"
          />
        </motion.div>
      </div>
      
      {/* Decorative gradient */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
```

---

## 2. Clients Mockup

Client management interface showing list and details.

```tsx
// src/components/website-kit/mockups/ClientsMockup.tsx
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  Phone, 
  Mail, 
  MapPin,
  MoreHorizontal
} from 'lucide-react';
import { TooltipPointer } from '../TooltipPointer';
import { cn } from '@/lib/utils';

const mockClients = [
  { 
    name: 'Sarah Johnson', 
    company: 'Home Designs Co', 
    email: 'sarah@homedesigns.com',
    phone: '+1 555 0123',
    status: 'hot',
    value: '$12,500',
    avatar: 'SJ'
  },
  { 
    name: 'Michael Chen', 
    company: 'Chen Interiors', 
    email: 'michael@chenint.com',
    phone: '+1 555 0456',
    status: 'warm',
    value: '$8,200',
    avatar: 'MC'
  },
  { 
    name: 'Emily Watson', 
    company: '', 
    email: 'emily.w@email.com',
    phone: '+1 555 0789',
    status: 'new',
    value: '$3,400',
    avatar: 'EW'
  },
];

export const ClientsMockup = ({ className }: { className?: string }) => {
  return (
    <div className={cn(
      "relative bg-card rounded-2xl border border-border overflow-hidden shadow-2xl",
      className
    )}>
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/50" />
          <div className="w-3 h-3 rounded-full bg-warning/50" />
          <div className="w-3 h-3 rounded-full bg-success/50" />
        </div>
        <span className="text-xs text-muted-foreground">Clients — InterioApp</span>
      </div>
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Clients</h2>
            <p className="text-sm text-muted-foreground">47 total clients</p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
            + Add Client
          </button>
        </div>
        
        {/* Search and filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative flex gap-3 mb-6"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          <TooltipPointer
            label="Smart search"
            description="Find clients instantly"
            position="top-right"
            number={1}
            className="hidden md:block"
          />
        </motion.div>
        
        {/* Client list */}
        <div className="space-y-3">
          {mockClients.map((client, index) => (
            <motion.div
              key={client.email}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative flex items-center gap-4 p-4 bg-background rounded-xl border border-border",
                "hover:border-primary/30 transition-colors cursor-pointer"
              )}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
                {client.avatar}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">{client.name}</p>
                  {client.status === 'hot' && (
                    <span className="px-2 py-0.5 bg-destructive/20 text-destructive text-xs rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Hot
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {client.company || client.email}
                </p>
              </div>
              
              {/* Value */}
              <div className="text-right">
                <p className="font-medium text-foreground">{client.value}</p>
                <p className="text-xs text-muted-foreground">Total value</p>
              </div>
              
              {/* Actions */}
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
              
              {/* Tooltip for first item */}
              {index === 0 && (
                <TooltipPointer
                  label="Lead scoring"
                  description="Prioritize hot leads"
                  position="right"
                  number={2}
                  className="hidden md:block"
                />
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Selected client detail panel preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="relative mt-6 p-4 bg-background rounded-xl border border-primary/30"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
              SJ
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Sarah Johnson</h3>
              <p className="text-sm text-muted-foreground">Home Designs Co</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>+1 555 0123</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>sarah@home...</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Melbourne</span>
            </div>
          </div>
          
          <TooltipPointer
            label="Client 360° view"
            description="All info in one place"
            position="bottom-right"
            number={3}
            className="hidden md:block"
          />
        </motion.div>
      </div>
    </div>
  );
};
```

---

## 3. Jobs/Projects Mockup

Kanban-style job management board.

```tsx
// src/components/website-kit/mockups/JobsMockup.tsx
import { motion } from 'framer-motion';
import { 
  Plus,
  Calendar,
  User,
  MoreHorizontal
} from 'lucide-react';
import { TooltipPointer } from '../TooltipPointer';
import { cn } from '@/lib/utils';

const columns = [
  {
    title: 'Quote',
    color: 'bg-blue-500',
    jobs: [
      { id: 1, title: 'Living Room Curtains', client: 'Sarah J.', value: '$2,400', due: 'Dec 18' },
      { id: 2, title: 'Office Blinds', client: 'Michael C.', value: '$1,800', due: 'Dec 20' },
    ]
  },
  {
    title: 'Approved',
    color: 'bg-green-500',
    jobs: [
      { id: 3, title: 'Master Bedroom', client: 'Emily W.', value: '$3,200', due: 'Dec 22' },
    ]
  },
  {
    title: 'In Progress',
    color: 'bg-yellow-500',
    jobs: [
      { id: 4, title: 'Kitchen Shutters', client: 'David L.', value: '$4,500', due: 'Dec 15' },
      { id: 5, title: 'Study Room', client: 'Lisa M.', value: '$1,200', due: 'Dec 16' },
    ]
  },
  {
    title: 'Install',
    color: 'bg-purple-500',
    jobs: [
      { id: 6, title: 'Bathroom Blinds', client: 'James K.', value: '$800', due: 'Today' },
    ]
  },
];

export const JobsMockup = ({ className }: { className?: string }) => {
  return (
    <div className={cn(
      "relative bg-card rounded-2xl border border-border overflow-hidden shadow-2xl",
      className
    )}>
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/50" />
          <div className="w-3 h-3 rounded-full bg-warning/50" />
          <div className="w-3 h-3 rounded-full bg-success/50" />
        </div>
        <span className="text-xs text-muted-foreground">Jobs — InterioApp</span>
      </div>
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Jobs Board</h2>
            <p className="text-sm text-muted-foreground">12 active jobs</p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
            + New Job
          </button>
        </div>
        
        {/* Kanban Board */}
        <div className="relative flex gap-4 overflow-x-auto pb-4">
          {columns.map((column, colIndex) => (
            <motion.div
              key={column.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: colIndex * 0.1 }}
              className="relative flex-shrink-0 w-56"
            >
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-2 h-2 rounded-full", column.color)} />
                <span className="text-sm font-medium text-foreground">{column.title}</span>
                <span className="text-xs text-muted-foreground">({column.jobs.length})</span>
              </div>
              
              {/* Jobs */}
              <div className="space-y-2">
                {column.jobs.map((job, jobIndex) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: colIndex * 0.1 + jobIndex * 0.05 }}
                    className="p-3 bg-background rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">{job.title}</p>
                      <button className="p-1 hover:bg-muted rounded">
                        <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <User className="w-3 h-3" />
                      <span>{job.client}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">{job.value}</span>
                      <span className={cn(
                        "flex items-center gap-1 text-xs",
                        job.due === 'Today' ? 'text-destructive' : 'text-muted-foreground'
                      )}>
                        <Calendar className="w-3 h-3" />
                        {job.due}
                      </span>
                    </div>
                  </motion.div>
                ))}
                
                {/* Add job button */}
                <button className="w-full p-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                  <Plus className="w-4 h-4 mx-auto" />
                </button>
              </div>
              
              {/* Tooltips */}
              {colIndex === 0 && (
                <TooltipPointer
                  label="Drag & drop"
                  description="Move jobs between stages"
                  position="top-right"
                  number={1}
                  className="hidden md:block"
                />
              )}
              
              {colIndex === 2 && (
                <TooltipPointer
                  label="Visual pipeline"
                  description="See all jobs at a glance"
                  position="bottom-left"
                  number={2}
                  className="hidden md:block"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 4. Measurement Worksheet Mockup

The killer feature - interactive measurement and pricing calculator.

```tsx
// src/components/website-kit/mockups/MeasurementMockup.tsx
import { motion } from 'framer-motion';
import { 
  Ruler,
  Palette,
  Calculator,
  ChevronDown
} from 'lucide-react';
import { TooltipPointer } from '../TooltipPointer';
import { cn } from '@/lib/utils';

export const MeasurementMockup = ({ className }: { className?: string }) => {
  return (
    <div className={cn(
      "relative bg-card rounded-2xl border border-border overflow-hidden shadow-2xl",
      className
    )}>
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/50" />
          <div className="w-3 h-3 rounded-full bg-warning/50" />
          <div className="w-3 h-3 rounded-full bg-success/50" />
        </div>
        <span className="text-xs text-muted-foreground">Measurement Worksheet — InterioApp</span>
      </div>
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Living Room - Window 1</h2>
            <p className="text-sm text-muted-foreground">Sarah Johnson • Quote #Q-0234</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">$2,450</p>
            <p className="text-xs text-muted-foreground">Calculated price</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Measurements */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-primary" />
                Measurements
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-background rounded-lg border border-border">
                  <label className="text-xs text-muted-foreground">Width</label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-semibold text-foreground">2400</span>
                    <span className="text-xs text-muted-foreground">mm</span>
                  </div>
                </div>
                <div className="p-3 bg-background rounded-lg border border-border">
                  <label className="text-xs text-muted-foreground">Drop</label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-semibold text-foreground">2700</span>
                    <span className="text-xs text-muted-foreground">mm</span>
                  </div>
                </div>
              </div>
              
              <TooltipPointer
                label="Auto-calculations"
                description="Enter measurements, get instant pricing"
                position="right"
                number={1}
                className="hidden md:block"
              />
            </motion.div>
            
            {/* Treatment Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-sm font-medium text-foreground mb-3">Treatment Type</h3>
              <div className="p-3 bg-background rounded-lg border border-primary/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    <span className="text-lg">🪟</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">S-Fold Curtain</p>
                    <p className="text-xs text-muted-foreground">Double width • Lined</p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </motion.div>
            
            {/* Fabric Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Fabric
              </h3>
              <div className="p-3 bg-background rounded-lg border border-border flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-gradient-to-br from-amber-200 to-amber-300" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Luxe Linen</p>
                  <p className="text-xs text-muted-foreground">Natural • $89/m</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
              
              <TooltipPointer
                label="Fabric library"
                description="Browse your entire inventory"
                position="left"
                number={2}
                className="hidden md:block"
              />
            </motion.div>
          </div>
          
          {/* Right: Price Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              Price Breakdown
            </h3>
            
            <div className="p-4 bg-background rounded-lg border border-border space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fabric (12.4m)</span>
                <span className="text-foreground">$1,103.60</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lining (12.4m)</span>
                <span className="text-foreground">$310.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Making</span>
                <span className="text-foreground">$620.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Track & Install</span>
                <span className="text-foreground">$280.00</span>
              </div>
              
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">$2,313.60</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (10%)</span>
                  <span className="text-foreground">$231.36</span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-border flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-primary text-lg">$2,544.96</span>
              </div>
            </div>
            
            <TooltipPointer
              label="Transparent pricing"
              description="Show clients exactly how it's calculated"
              position="bottom-right"
              number={3}
              className="hidden md:block"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
```

---

## 5. Quotes Mockup

Professional quote document preview.

```tsx
// src/components/website-kit/mockups/QuotesMockup.tsx
import { motion } from 'framer-motion';
import { 
  Download,
  Mail,
  Check,
  FileText
} from 'lucide-react';
import { TooltipPointer } from '../TooltipPointer';
import { cn } from '@/lib/utils';

export const QuotesMockup = ({ className }: { className?: string }) => {
  return (
    <div className={cn(
      "relative bg-card rounded-2xl border border-border overflow-hidden shadow-2xl",
      className
    )}>
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/50" />
          <div className="w-3 h-3 rounded-full bg-warning/50" />
          <div className="w-3 h-3 rounded-full bg-success/50" />
        </div>
        <span className="text-xs text-muted-foreground">Quote Preview — InterioApp</span>
      </div>
      
      <div className="p-6">
        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative flex gap-2 mb-6"
        >
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
            <Mail className="w-4 h-4" />
            Send to Client
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          
          <TooltipPointer
            label="One-click send"
            description="Email quotes directly to clients"
            position="top-right"
            number={1}
            className="hidden md:block"
          />
        </motion.div>
        
        {/* Quote document preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Quote header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-3">
                  <span className="text-primary-foreground font-bold text-lg">YB</span>
                </div>
                <h3 className="font-bold text-gray-900">Your Business Name</h3>
                <p className="text-sm text-gray-500">Melbourne, Australia</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Quote #Q-0234</p>
                <p className="text-sm text-gray-500">Dec 15, 2024</p>
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                  <FileText className="w-3 h-3" />
                  Pending
                </span>
              </div>
            </div>
          </div>
          
          {/* Client info */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-500">Quote for</p>
            <p className="font-medium text-gray-900">Sarah Johnson</p>
            <p className="text-sm text-gray-500">Home Designs Co</p>
          </div>
          
          {/* Line items preview */}
          <div className="p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-2 text-gray-500 font-medium">Item</th>
                  <th className="text-right pb-2 text-gray-500 font-medium">Qty</th>
                  <th className="text-right pb-2 text-gray-500 font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-gray-900">S-Fold Curtain - Living Room</td>
                  <td className="py-3 text-right text-gray-600">1</td>
                  <td className="py-3 text-right text-gray-900">$2,544.96</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-gray-900">Roller Blind - Kitchen</td>
                  <td className="py-3 text-right text-gray-600">2</td>
                  <td className="py-3 text-right text-gray-900">$680.00</td>
                </tr>
              </tbody>
            </table>
            
            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>$2,931.78</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>GST (10%)</span>
                <span>$293.18</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 mt-2 text-lg">
                <span>Total</span>
                <span>$3,224.96</span>
              </div>
            </div>
          </div>
          
          {/* Accept button preview */}
          <div className="px-6 pb-6">
            <button className="w-full py-3 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Accept Quote
            </button>
          </div>
          
          <TooltipPointer
            label="Professional documents"
            description="Branded PDFs that win business"
            position="bottom-left"
            number={2}
            className="hidden md:block"
          />
        </motion.div>
      </div>
    </div>
  );
};
```

---

## 6. Calendar Mockup

Scheduling and appointment management.

```tsx
// src/components/website-kit/mockups/CalendarMockup.tsx
import { motion } from 'framer-motion';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User
} from 'lucide-react';
import { TooltipPointer } from '../TooltipPointer';
import { cn } from '@/lib/utils';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const hours = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM'];

const appointments = [
  { day: 0, hour: 0, duration: 2, title: 'Site Visit', client: 'Sarah J.', color: 'bg-blue-500' },
  { day: 1, hour: 2, duration: 1, title: 'Measure', client: 'Michael C.', color: 'bg-green-500' },
  { day: 2, hour: 1, duration: 2, title: 'Install', client: 'Emily W.', color: 'bg-purple-500' },
  { day: 3, hour: 3, duration: 1, title: 'Quote Review', client: 'David L.', color: 'bg-yellow-500' },
  { day: 4, hour: 0, duration: 3, title: 'Full Install', client: 'Lisa M.', color: 'bg-pink-500' },
];

export const CalendarMockup = ({ className }: { className?: string }) => {
  return (
    <div className={cn(
      "relative bg-card rounded-2xl border border-border overflow-hidden shadow-2xl",
      className
    )}>
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/50" />
          <div className="w-3 h-3 rounded-full bg-warning/50" />
          <div className="w-3 h-3 rounded-full bg-success/50" />
        </div>
        <span className="text-xs text-muted-foreground">Calendar — InterioApp</span>
      </div>
      
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="text-lg font-semibold text-foreground">December 2024</h2>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" />
            New Appointment
          </button>
          
          <TooltipPointer
            label="Quick scheduling"
            description="Book appointments in seconds"
            position="top-left"
            number={1}
            className="hidden md:block"
          />
        </motion.div>
        
        {/* Calendar grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          {/* Day headers */}
          <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-border">
            <div className="p-2" />
            {days.map((day, i) => (
              <div key={day} className="p-2 text-center border-l border-border">
                <p className="text-xs text-muted-foreground">{day}</p>
                <p className="text-lg font-semibold text-foreground">{16 + i}</p>
              </div>
            ))}
          </div>
          
          {/* Time grid */}
          <div className="relative grid grid-cols-[60px_repeat(5,1fr)]">
            {hours.map((hour, hourIndex) => (
              <div key={hour} className="contents">
                <div className="p-2 text-xs text-muted-foreground text-right pr-3 h-16">
                  {hour}
                </div>
                {days.map((_, dayIndex) => (
                  <div key={dayIndex} className="h-16 border-l border-b border-border relative">
                    {/* Render appointments */}
                    {appointments
                      .filter(apt => apt.day === dayIndex && apt.hour === hourIndex)
                      .map((apt, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + (apt.day * 0.05) }}
                          className={cn(
                            "absolute inset-x-1 top-1 rounded-md p-1.5 text-white text-xs overflow-hidden",
                            apt.color
                          )}
                          style={{ height: `${apt.duration * 64 - 8}px` }}
                        >
                          <p className="font-medium truncate">{apt.title}</p>
                          <p className="opacity-80 truncate">{apt.client}</p>
                        </motion.div>
                      ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          <TooltipPointer
            label="Visual schedule"
            description="See your week at a glance"
            position="right"
            number={2}
            className="hidden md:block"
          />
        </motion.div>
        
        {/* Upcoming appointment card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="relative mt-6 p-4 bg-background rounded-xl border border-border"
        >
          <h3 className="text-sm font-medium text-foreground mb-3">Next Appointment</h3>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Site Visit - Sarah Johnson</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  9:00 AM - 11:00 AM
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  123 Main St
                </span>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium">
              View Details
            </button>
          </div>
          
          <TooltipPointer
            label="Never miss a meeting"
            description="Automatic reminders"
            position="bottom-right"
            number={3}
            className="hidden md:block"
          />
        </motion.div>
      </div>
    </div>
  );
};
```

---

## Usage in Your Website

Import and use these mockups in your feature showcases:

```tsx
import { DashboardMockup } from '@/components/website-kit/mockups/DashboardMockup';
import { ClientsMockup } from '@/components/website-kit/mockups/ClientsMockup';
import { JobsMockup } from '@/components/website-kit/mockups/JobsMockup';
import { MeasurementMockup } from '@/components/website-kit/mockups/MeasurementMockup';
import { QuotesMockup } from '@/components/website-kit/mockups/QuotesMockup';
import { CalendarMockup } from '@/components/website-kit/mockups/CalendarMockup';

// In your feature section:
<FeatureShowcase
  title="Smart Dashboard"
  description="See your entire business at a glance"
  mockup={<DashboardMockup />}
  imagePosition="right"
/>
```
