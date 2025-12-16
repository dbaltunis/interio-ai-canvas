# InterioApp Website Pages

Complete page templates for the interioapp.com marketing website.

---

## Page Structure Overview

```
/                    → HomePage (Hero + Features + Social Proof + CTA)
/features            → FeaturesPage (Detailed feature showcases)
/pricing             → PricingPage (Plan comparison)
/how-it-works        → HowItWorksPage (Step-by-step guide)
/contact             → ContactPage (Demo request form)
/login               → Redirect to app.interioapp.com
```

---

## 1. HomePage

### Structure

```
┌─────────────────────────────────────────────────────────────┐
│  NAVIGATION                                                  │
│  Logo | Features | Pricing | How It Works | Login | [Demo]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HERO SECTION                                                │
│                                                              │
│  "Window Covering Software                                   │
│   That Actually Works"                                       │
│                                                              │
│  Professional quoting, scheduling, and                       │
│  project management for blinds & curtains                    │
│                                                              │
│  [Start Free Trial]  [Book a Demo]                          │
│                                                              │
│  ┌─────────────────────────────────────────┐                │
│  │  [Interactive Dashboard Mockup]          │                │
│  │   with floating tooltips                 │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FEATURES GRID                                               │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Clients  │  │  Jobs    │  │ Measure  │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Quotes   │  │ Calendar │  │ Email    │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SOCIAL PROOF                                                │
│                                                              │
│  "Trusted by 200+ window covering businesses"                │
│                                                              │
│  [Logo] [Logo] [Logo] [Logo] [Logo]                         │
│                                                              │
│  ┌─────────────────────────────────────────┐                │
│  │ "InterioApp transformed how we manage    │                │
│  │  our projects. Quoting takes minutes."   │                │
│  │                                          │                │
│  │  - Sarah M., Melbourne Blinds Co         │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HOW IT WORKS                                                │
│                                                              │
│  [Set Up] → [Measure] → [Quote] → [Install]                 │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CTA SECTION                                                 │
│                                                              │
│  "Ready to streamline your business?"                        │
│                                                              │
│  [Start Your Free 14-Day Trial]                             │
│                                                              │
│  No credit card required · Cancel anytime                    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  FOOTER                                                      │
│  Logo | Links | Social | Copyright                           │
└─────────────────────────────────────────────────────────────┘
```

### HomePage Component Code

```tsx
// src/pages/HomePage.tsx
import { HeroSection } from '@/components/website/sections/HeroSection';
import { FeaturesGrid } from '@/components/website/sections/FeaturesGrid';
import { SocialProof } from '@/components/website/sections/SocialProof';
import { HowItWorks } from '@/components/website/sections/HowItWorks';
import { CTASection } from '@/components/website/sections/CTASection';
import { Navbar } from '@/components/website/Navbar';
import { Footer } from '@/components/website/Footer';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesGrid />
        <SocialProof />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};
```

---

## 2. FeaturesPage

### Structure

Each feature gets a full-width showcase section alternating layout (image left/right).

```tsx
// src/pages/FeaturesPage.tsx
import { FeatureShowcase } from '@/components/website/sections/FeatureShowcase';
import { DashboardMockup } from '@/components/website/mockups/DashboardMockup';
import { ClientsMockup } from '@/components/website/mockups/ClientsMockup';
import { JobsMockup } from '@/components/website/mockups/JobsMockup';
import { MeasurementMockup } from '@/components/website/mockups/MeasurementMockup';
import { QuotesMockup } from '@/components/website/mockups/QuotesMockup';
import { CalendarMockup } from '@/components/website/mockups/CalendarMockup';

const features = [
  {
    id: 'dashboard',
    title: 'Business Dashboard',
    subtitle: 'See your business at a glance',
    description: 'Track revenue, jobs, and team performance with real-time KPIs and beautiful visualizations.',
    bullets: [
      'Revenue tracking and forecasting',
      'Team performance metrics',
      'Job pipeline overview',
      'Customizable widgets',
    ],
    mockup: <DashboardMockup />,
    imagePosition: 'right' as const,
  },
  {
    id: 'clients',
    title: 'Client Management',
    subtitle: 'Know your customers',
    description: 'Track every lead and customer from first contact to completed installation.',
    bullets: [
      'Lead scoring and tracking',
      'Contact history timeline',
      'Project association',
      'Communication log',
    ],
    mockup: <ClientsMockup />,
    imagePosition: 'left' as const,
  },
  {
    id: 'jobs',
    title: 'Job Management',
    subtitle: 'From quote to install',
    description: 'Manage your entire project pipeline with visual stages and automated workflows.',
    bullets: [
      'Kanban-style job board',
      'Custom workflow stages',
      'Team assignments',
      'Status notifications',
    ],
    mockup: <JobsMockup />,
    imagePosition: 'right' as const,
  },
  {
    id: 'measurements',
    title: 'Measurement Worksheets',
    subtitle: 'Professional quotes in minutes',
    description: 'Our intelligent measurement system calculates pricing automatically based on your templates.',
    bullets: [
      'Visual room diagrams',
      'Auto-calculated pricing',
      'Treatment templates',
      'Fabric selection',
    ],
    mockup: <MeasurementMockup />,
    imagePosition: 'left' as const,
  },
  {
    id: 'quotes',
    title: 'Professional Quotes',
    subtitle: 'Win more business',
    description: 'Generate beautiful, branded quotes that impress clients and close deals faster.',
    bullets: [
      'Branded PDF documents',
      'Itemized pricing',
      'Terms and conditions',
      'E-signature ready',
    ],
    mockup: <QuotesMockup />,
    imagePosition: 'right' as const,
  },
  {
    id: 'calendar',
    title: 'Scheduling & Calendar',
    subtitle: 'Never miss an appointment',
    description: 'Sync with Google Calendar, schedule site visits, and manage your team\'s availability.',
    bullets: [
      'Google Calendar sync',
      'Team scheduling',
      'Client notifications',
      'Booking links',
    ],
    mockup: <CalendarMockup />,
    imagePosition: 'left' as const,
  },
];

export const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Page Header */}
        <section className="py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need to Run Your Business
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From first contact to final installation, InterioApp handles it all.
          </p>
        </section>
        
        {/* Feature Showcases */}
        {features.map((feature) => (
          <FeatureShowcase key={feature.id} {...feature} />
        ))}
        
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};
```

---

## 3. PricingPage

### Structure

```
┌─────────────────────────────────────────────────────────────┐
│  PRICING HEADER                                              │
│                                                              │
│  "Simple, Transparent Pricing"                               │
│  Start free, upgrade when you're ready                       │
│                                                              │
│  [Monthly] [Annual - Save 20%]                               │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PRICING CARDS                                               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   STARTER    │  │   PRO ⭐     │  │  BUSINESS    │      │
│  │              │  │  (Popular)   │  │              │      │
│  │   $49/mo     │  │   $99/mo     │  │   $199/mo    │      │
│  │              │  │              │  │              │      │
│  │  • Feature   │  │  • Feature   │  │  • Feature   │      │
│  │  • Feature   │  │  • Feature   │  │  • Feature   │      │
│  │  • Feature   │  │  • Feature   │  │  • Feature   │      │
│  │              │  │              │  │              │      │
│  │ [Start Free] │  │ [Start Free] │  │ [Contact Us] │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FEATURE COMPARISON TABLE                                    │
│                                                              │
│  Feature          │ Starter │ Pro │ Business                │
│  ─────────────────┼─────────┼─────┼──────────               │
│  Jobs/month       │   25    │ 100 │ Unlimited               │
│  Team members     │    1    │  5  │ Unlimited               │
│  ...              │   ...   │ ... │   ...                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FAQ SECTION                                                 │
│                                                              │
│  [Accordion of common questions]                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### PricingPage Component Code

```tsx
// src/pages/PricingPage.tsx
import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for solo installers',
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      '25 jobs per month',
      '1 team member',
      'Client management',
      'Job tracking',
      'Basic quotes',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'For growing businesses',
    monthlyPrice: 99,
    annualPrice: 79,
    features: [
      '100 jobs per month',
      '5 team members',
      'Everything in Starter',
      'Advanced measurement worksheets',
      'Pricing templates',
      'Calendar integration',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Business',
    description: 'For established companies',
    monthlyPrice: 199,
    annualPrice: 159,
    features: [
      'Unlimited jobs',
      'Unlimited team members',
      'Everything in Pro',
      'Multi-location support',
      'Custom integrations',
      'Dedicated account manager',
      'Training & onboarding',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export const PricingPage = () => {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        {/* Header */}
        <section className="text-center py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Start free, upgrade when you're ready
          </p>
          
          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-card rounded-lg border border-border">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                !annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              Annual <span className="text-xs opacity-80">Save 20%</span>
            </button>
          </div>
        </section>
        
        {/* Pricing Cards */}
        <section className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative bg-card rounded-2xl border p-6",
                plan.popular 
                  ? "border-primary shadow-lg shadow-primary/10" 
                  : "border-border"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-foreground">
                  ${annual ? plan.annualPrice : plan.monthlyPrice}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full" 
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
};
```

---

## 4. ContactPage / Demo Request

### Lead Capture Form

```tsx
// src/pages/ContactPage.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Mail, Phone, MapPin } from 'lucide-react';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    treatments: [] as string[],
  });

  const treatmentOptions = [
    'Curtains & Drapes',
    'Roller Blinds',
    'Venetian Blinds',
    'Shutters',
    'Awnings',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left: Form */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Book a Demo
              </h1>
              <p className="text-muted-foreground mb-8">
                See how InterioApp can transform your window covering business. 
                Fill out the form and we'll be in touch within 24 hours.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Your Name *
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@company.com"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Company Name
                    </label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Your Business Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    What treatments do you sell? (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {treatmentOptions.map((treatment) => (
                      <button
                        key={treatment}
                        type="button"
                        onClick={() => {
                          const newTreatments = formData.treatments.includes(treatment)
                            ? formData.treatments.filter((t) => t !== treatment)
                            : [...formData.treatments, treatment];
                          setFormData({ ...formData, treatments: newTreatments });
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm border transition-colors",
                          formData.treatments.includes(treatment)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {treatment}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tell us about your business
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How many jobs do you handle per month? What's your biggest challenge?"
                    rows={4}
                  />
                </div>
                
                <Button type="submit" size="lg" className="w-full md:w-auto">
                  Request Demo
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  By submitting this form, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            </div>
            
            {/* Right: Contact Info */}
            <div className="lg:pl-8">
              <div className="bg-card rounded-2xl border border-border p-8">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Get in Touch
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <a href="mailto:hello@interioapp.com" className="text-muted-foreground hover:text-primary transition-colors">
                        hello@interioapp.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <a href="tel:+61400000000" className="text-muted-foreground hover:text-primary transition-colors">
                        +61 400 000 000
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Location</p>
                      <p className="text-muted-foreground">
                        Melbourne, Australia
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Office Hours</p>
                      <p className="text-muted-foreground">
                        Mon - Fri: 9am - 5pm AEST
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Testimonial */}
              <div className="mt-8 bg-card rounded-2xl border border-border p-8">
                <blockquote className="text-foreground italic mb-4">
                  "The demo was incredibly helpful. The team understood 
                  our specific needs and showed us exactly how InterioApp 
                  could help."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20" />
                  <div>
                    <p className="font-medium text-foreground">Michael R.</p>
                    <p className="text-sm text-muted-foreground">Custom Blinds Sydney</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
```

---

## Navigation Component

```tsx
// src/components/website/Navbar.tsx
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'How It Works', href: '/how-it-works' },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">I</span>
            </div>
            <span className="font-semibold text-foreground">InterioApp</span>
          </a>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          
          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <a href="https://app.interioapp.com/login">Login</a>
            </Button>
            <Button asChild>
              <a href="/contact">Book Demo</a>
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <a href="https://app.interioapp.com/login">Login</a>
              </Button>
              <Button className="w-full" asChild>
                <a href="/contact">Book Demo</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
```

---

## Footer Component

```tsx
// src/components/website/Footer.tsx
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Integrations', href: '/integrations' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/api' },
    { label: 'Status', href: '/status' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">I</span>
              </div>
              <span className="font-semibold text-foreground">InterioApp</span>
            </a>
            <p className="text-sm text-muted-foreground mb-4">
              Window covering software that actually works.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4 capitalize">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} InterioApp. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ in Melbourne, Australia
          </p>
        </div>
      </div>
    </footer>
  );
};
```
